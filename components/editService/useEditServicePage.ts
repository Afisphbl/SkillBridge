"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { getSession } from "@/services/supabase/auth";
import { supabase } from "@/services/supabase/client";
import { updateServiceImages } from "@/services/supabase/serviceImageDb";
import {
  uploadGalleryImages,
  uploadThumbnail,
} from "@/services/supabase/serviceImagesStorage";
import { getServiceById, updateService } from "@/services/supabase/servicesApi";
import type { ServiceFormData, ServiceFormErrors } from "@/components/createService/types";

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
const SERVICE_IMAGES_BUCKET = "serviceImages";

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

function toStoragePath(pathOrUrl: unknown) {
  if (typeof pathOrUrl !== "string") return "";

  const trimmed = pathOrUrl.trim();
  if (!trimmed) return "";

  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^\/+/, "");
  }

  try {
    const parsed = new URL(trimmed);
    const marker = `/object/public/${SERVICE_IMAGES_BUCKET}/`;
    const markerIndex = parsed.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return "";
    }

    return decodeURIComponent(
      parsed.pathname.slice(markerIndex + marker.length).replace(/^\/+/, ""),
    );
  } catch {
    return "";
  }
}

async function removeStoragePaths(paths: string[]) {
  const normalized = Array.from(
    new Set(paths.map((value) => toStoragePath(value)).filter(Boolean)),
  );
  if (!normalized.length) return;

  await supabase.storage.from(SERVICE_IMAGES_BUCKET).remove(normalized);
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

export function useEditServicePage(serviceId: string) {
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
      const normalizedGallery = normalizeGalleryUrls(normalizedService.gallery_urls);

      setServiceData(normalizedService);
      setFormData({
        title: normalizedService.title ?? "",
        description: normalizedService.description ?? "",
        category: normalizedService.category ?? "",
        subcategory: normalizedService.subcategory ?? "",
        tags: normalizedService.tags ?? [],
        price: String(normalizedService.price ?? ""),
        delivery_time: String(normalizedService.delivery_time ?? ""),
        status: normalizedService.status ?? "draft",
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
        setGalleryFiles((current) => current.filter((_, i) => i !== newFileIndex));
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
      toast.error("Failed to update service");
      return;
    }

    setSaving(true);

    try {
      let nextThumbnailUrl = thumbnailUrl;
      let nextGalleryUrls = [...galleryUrls];
      const hasImageChanges = thumbnailChanged || galleryChanged;

      if (hasImageChanges) {
        const originalThumbnailPath = toStoragePath(serviceData.thumbnail_url);
        const originalGalleryPaths = normalizeGalleryUrls(
          serviceData.gallery_urls,
        ).map(toStoragePath);
        let uploadedThumbnailPath = "";
        let uploadedGalleryPaths: string[] = [];

        if (thumbnailChanged && thumbnailFile) {
          const { path, error } = await uploadThumbnail(
            thumbnailFile,
            sellerId,
            serviceData.id,
          );

          if (error || !path) {
            throw new Error("Image upload failed");
          }

          nextThumbnailUrl = path;
          uploadedThumbnailPath = toStoragePath(path);
        }

        if (galleryFiles.length) {
          const { paths, error } = await uploadGalleryImages(
            galleryFiles,
            sellerId,
            serviceData.id,
          );

          if (error) {
            throw new Error("Image upload failed");
          }

          nextGalleryUrls = [...nextGalleryUrls, ...paths];
          uploadedGalleryPaths = paths.map(toStoragePath).filter(Boolean);
        }

        try {
          const { error: imageUpdateError } = await updateServiceImages(
            serviceData.id,
            nextThumbnailUrl,
            nextGalleryUrls,
          );

          if (imageUpdateError) {
            throw new Error("Failed to update service");
          }
        } catch (error) {
          await removeStoragePaths([uploadedThumbnailPath, ...uploadedGalleryPaths]);
          throw error;
        }

        const nextThumbnailPath = toStoragePath(nextThumbnailUrl);
        const nextGalleryPathSet = new Set(
          nextGalleryUrls.map(toStoragePath).filter(Boolean),
        );
        const nextPathSet = new Set([
          nextThumbnailPath,
          ...Array.from(nextGalleryPathSet),
        ]);

        const removedPaths = [
          originalThumbnailPath,
          ...originalGalleryPaths,
        ].filter((path) => Boolean(path) && !nextPathSet.has(path));

        await removeStoragePaths(removedPaths);
      }

      const { error: updateError } = await updateService(serviceData.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        subcategory: formData.subcategory.trim(),
        tags: formData.tags,
        price: Number(formData.price),
        delivery_time: Number(formData.delivery_time),
        status: formData.status,
        updated_at: new Date().toISOString(),
      });

      if (updateError) {
        throw new Error("Failed to update service");
      }

      toast.success("Service updated successfully");
      router.push("/seller/services");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update service";

      if (message === "Image upload failed") {
        toast.error("Image upload failed");
      } else {
        toast.error("Failed to update service");
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
