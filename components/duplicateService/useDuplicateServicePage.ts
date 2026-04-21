"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { getSession } from "@/services/supabase/auth";
import { updateServiceImages } from "@/services/supabase/serviceImageDb";
import {
  duplicateServiceGalleryImages,
  duplicateServiceImage,
  uploadGalleryImages,
  uploadThumbnail,
} from "@/services/supabase/serviceImagesStorage";
import { getServiceById, createService } from "@/services/supabase/servicesApi";
import type {
  ServiceFormData,
  ServiceFormErrors,
} from "@/components/createService/types";

type ServiceRecord = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[] | null;
  price: number;
  delivery_time: number;
  status: "draft" | "active" | "paused";
  thumbnail_url: string | null;
  gallery_urls: unknown;
};

const MAX_GALLERY = 5;

const INITIAL_FORM_DATA: ServiceFormData = {
  title: "",
  description: "",
  category: "",
  subcategory: "",
  tags: [],
  price: "",
  delivery_time: "",
  status: "draft",
};

function normalizeGalleryUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is string => typeof item === "string");
}

function validateForm(data: ServiceFormData): ServiceFormErrors {
  const errors: ServiceFormErrors = {};

  if (!data.title.trim()) {
    errors.title = "Title is required";
  }

  if (!data.description.trim()) {
    errors.description = "Description is required";
  }

  if (!data.category.trim()) {
    errors.category = "Category is required";
  }

  const price = Number(data.price);
  if (!Number.isFinite(price) || price <= 0) {
    errors.price = "Price must be greater than 0";
  }

  const deliveryTime = Number(data.delivery_time);
  if (!Number.isFinite(deliveryTime) || deliveryTime < 1) {
    errors.delivery_time = "Delivery time must be at least 1 day";
  }

  return errors;
}

export function useDuplicateServicePage(serviceId: string) {
  const router = useRouter();
  const { session, loadingSession } = useAuth();

  const [serviceData, setServiceData] = useState<ServiceRecord | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(INITIAL_FORM_DATA);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [thumbnailChanged, setThumbnailChanged] = useState(false);
  const [galleryChanged, setGalleryChanged] = useState(false);
  const [errors, setErrors] = useState<ServiceFormErrors>({});
  const [loadingService, setLoadingService] = useState(true);
  const [saving, setSaving] = useState(false);

  const thumbnailPreview = useMemo(() => {
    if (thumbnailFile) {
      return URL.createObjectURL(thumbnailFile);
    }

    return thumbnailUrl;
  }, [thumbnailFile, thumbnailUrl]);

  const newGalleryPreviews = useMemo(
    () => galleryFiles.map((file) => URL.createObjectURL(file)),
    [galleryFiles],
  );

  const galleryPreviews = useMemo(
    () => [...galleryUrls, ...newGalleryPreviews],
    [galleryUrls, newGalleryPreviews],
  );

  useEffect(() => {
    return () => {
      if (thumbnailFile && thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailFile, thumbnailPreview]);

  useEffect(() => {
    return () => {
      newGalleryPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [newGalleryPreviews]);

  useEffect(() => {
    let cancelled = false;

    const loadService = async () => {
      setLoadingService(true);

      let sellerId = session?.user?.id ?? null;
      if (!sellerId) {
        const { data } = await getSession();
        sellerId = data.session?.user?.id ?? null;
      }

      if (!sellerId) {
        if (!cancelled) {
          toast.error("Failed to load service");
          router.replace("/seller/services");
          setLoadingService(false);
        }
        return;
      }

      const { service, error } = await getServiceById(serviceId);

      if (cancelled) return;

      if (error || !service) {
        toast.error("Failed to load service");
        router.replace("/seller/services");
        setLoadingService(false);
        return;
      }

      if (service.seller_id !== sellerId) {
        toast.error("Failed to load service");
        router.replace("/seller/services");
        setLoadingService(false);
        return;
      }

      const normalizedService = service as ServiceRecord;
      const normalizedGallery = normalizeGalleryUrls(
        normalizedService.gallery_urls,
      );

      setServiceData(normalizedService);
      setFormData({
        title: `${normalizedService.title ?? ""} (Copy)`,
        description: normalizedService.description ?? "",
        category: normalizedService.category ?? "",
        subcategory: normalizedService.subcategory ?? "",
        tags: normalizedService.tags ?? [],
        price: String(normalizedService.price ?? ""),
        delivery_time: String(normalizedService.delivery_time ?? ""),
        status: "draft",
      });
      setThumbnailUrl(normalizedService.thumbnail_url ?? "");
      setGalleryUrls(normalizedGallery);
      setThumbnailFile(null);
      setGalleryFiles([]);
      setThumbnailChanged(false);
      setGalleryChanged(false);
      setErrors({});
      setLoadingService(false);
    };

    if (!loadingSession) {
      void loadService();
    }

    return () => {
      cancelled = true;
    };
  }, [loadingSession, router, serviceId, session?.user?.id]);

  const handleFormChange = useCallback((next: Partial<ServiceFormData>) => {
    setFormData((current) => ({ ...current, ...next }));
    setErrors((current) => ({ ...current, general: undefined }));
  }, []);

  const handleThumbnailChange = useCallback((file: File | null) => {
    setThumbnailFile(file);
    setThumbnailChanged(true);
    setErrors((current) => ({ ...current, thumbnail: undefined }));
  }, []);

  const handleThumbnailRemove = useCallback(() => {
    setThumbnailFile(null);
    setThumbnailUrl("");
    setThumbnailChanged(true);
  }, []);

  const handleGalleryAdd = useCallback(
    (files: File[]) => {
      setGalleryFiles((current) => {
        const totalCurrent = galleryUrls.length + current.length;
        const remaining = MAX_GALLERY - totalCurrent;
        if (remaining <= 0) {
          return current;
        }

        return [...current, ...files.slice(0, remaining)];
      });
      setGalleryChanged(true);
    },
    [galleryUrls.length],
  );

  const handleGalleryRemove = useCallback(
    (index: number) => {
      if (index < galleryUrls.length) {
        setGalleryUrls((current) => current.filter((_, i) => i !== index));
      } else {
        const newFileIndex = index - galleryUrls.length;
        setGalleryFiles((current) =>
          current.filter((_, i) => i !== newFileIndex),
        );
      }

      setGalleryChanged(true);
    },
    [galleryUrls.length],
  );

  const saveChanges = useCallback(async () => {
    if (saving || !serviceData) return;

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    let sellerId = session?.user?.id ?? null;

    if (!sellerId) {
      const { data } = await getSession();
      sellerId = data.session?.user?.id ?? null;
    }

    if (!sellerId || sellerId !== serviceData.seller_id) {
      toast.error("Failed to duplicate service");
      return;
    }

    setSaving(true);

    try {
      // 1. Core Service Creation
      const { service: createdService, error: createError } =
        await createService({
          seller_id: sellerId,
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category.trim(),
          subcategory: formData.subcategory.trim(),
          tags: formData.tags,
          price: Number(formData.price),
          delivery_time: Number(formData.delivery_time),
          status: "draft",
          thumbnail_url: null,
          gallery_urls: [],
        });

      if (createError || !createdService?.id) {
        throw new Error("Failed to duplicate service");
      }

      const newServiceId = createdService.id;

      // 2. Always assign this duplicate its own thumbnail + gallery files.
      let nextThumbnailUrl = "";
      let nextGalleryUrls: string[] = [];

      if (thumbnailChanged) {
        if (thumbnailFile) {
          const { path, error } = await uploadThumbnail(
            thumbnailFile,
            sellerId,
            newServiceId,
          );

          if (error || !path) {
            throw new Error(
              `Image processing failed: ${
                error?.message || "thumbnail upload failed"
              }`,
            );
          }

          nextThumbnailUrl = path;
        }
      } else if (thumbnailUrl) {
        const { path, error } = await duplicateServiceImage(
          thumbnailUrl,
          sellerId,
          newServiceId,
          "thumbnail",
        );

        if (error || !path) {
          throw new Error(
            `Image processing failed: ${error || "thumbnail copy failed"}`,
          );
        }

        nextThumbnailUrl = path;
      }

      if (galleryUrls.length) {
        const { paths, error } = await duplicateServiceGalleryImages(
          galleryUrls,
          sellerId,
          newServiceId,
        );

        if (error) {
          throw new Error(`Image processing failed: ${error}`);
        }

        nextGalleryUrls = paths;
      }

      if (galleryFiles.length) {
        const { paths, error } = await uploadGalleryImages(
          galleryFiles,
          sellerId,
          newServiceId,
        );

        if (error) {
          throw new Error(`Image processing failed: ${error}`);
        }

        nextGalleryUrls = [...nextGalleryUrls, ...paths];
      }

      const { error: imageUpdateError } = await updateServiceImages(
        newServiceId,
        nextThumbnailUrl,
        nextGalleryUrls,
      );

      if (imageUpdateError) {
        throw new Error(
          `Image processing failed: ${
            imageUpdateError.message || "failed to update service images"
          }`,
        );
      }

      toast.success("Service duplicated successfully");
      router.push("/seller/services");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to duplicate service";

      if (message.startsWith("Image processing failed:")) {
        toast.error(message);
      } else {
        toast.error("Failed to duplicate service");
      }
    } finally {
      setSaving(false);
    }
  }, [
    formData,
    galleryChanged,
    galleryFiles,
    galleryUrls,
    router,
    saving,
    serviceData,
    session?.user?.id,
    thumbnailChanged,
    thumbnailFile,
    thumbnailUrl,
  ]);

  return {
    serviceData,
    formData,
    errors,
    loadingService,
    saving,
    thumbnailFile,
    galleryFiles,
    thumbnailPreview,
    galleryPreviews,
    handleFormChange,
    handleThumbnailChange,
    handleThumbnailRemove,
    handleGalleryAdd,
    handleGalleryRemove,
    saveChanges,
  };
}
