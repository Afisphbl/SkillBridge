"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { getSession } from "@/services/supabase/auth";
import { updateServiceImages } from "@/services/supabase/serviceImageDb";
import {
  uploadGalleryImages,
  uploadThumbnail,
} from "@/services/supabase/serviceImagesStorage";
import { createService } from "@/services/supabase/servicesApi";
import type { ServiceFormData, ServiceFormErrors, SubmitMode } from "./types";

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

type RetryContext = {
  serviceId: string;
  sellerId: string;
  mode: SubmitMode;
  thumbnailFileCopy: File;
  galleryFileCopies: File[];
};

function cloneBrowserFile(file: File) {
  return new File([file], file.name, {
    type: file.type,
    lastModified: file.lastModified,
  });
}

function validateForm(
  data: ServiceFormData,
  hasThumbnail: boolean,
): ServiceFormErrors {
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

  if (!hasThumbnail) {
    errors.thumbnail = "Thumbnail is required";
  }

  return errors;
}

export function useCreateServicePage() {
  const router = useRouter();
  const { session, loadingSession } = useAuth();

  const [formData, setFormData] = useState<ServiceFormData>(INITIAL_FORM_DATA);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<ServiceFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Working...");
  const [retryContext, setRetryContext] = useState<RetryContext | null>(null);

  const thumbnailPreview = useMemo(
    () => (thumbnailFile ? URL.createObjectURL(thumbnailFile) : ""),
    [thumbnailFile],
  );

  const galleryPreviews = useMemo(
    () => galleryFiles.map((file) => URL.createObjectURL(file)),
    [galleryFiles],
  );

  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  useEffect(() => {
    return () => {
      galleryPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [galleryPreviews]);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setThumbnailFile(null);
    setGalleryFiles([]);
    setErrors({});
  }, []);

  const runImagePipeline = useCallback(
    async ({
      serviceId,
      sellerId,
      mode,
      thumbnailFileCopy,
      galleryFileCopies,
    }: {
      serviceId: string;
      sellerId: string;
      mode: SubmitMode;
      thumbnailFileCopy?: File;
      galleryFileCopies?: File[];
    }) => {
      const thumbnailFileForUpload = thumbnailFileCopy ?? thumbnailFile;
      const galleryFilesForUpload = galleryFileCopies ?? galleryFiles;

      if (!thumbnailFileForUpload) {
        throw new Error("Thumbnail is required");
      }

      setLoadingLabel("Uploading thumbnail...");
      const { path: thumbnailPath, error: thumbnailError } =
        await uploadThumbnail(thumbnailFileForUpload, sellerId, serviceId);

      if (thumbnailError || !thumbnailPath) {
        throw new Error("Image upload failed");
      }

      setLoadingLabel("Uploading gallery...");
      const galleryUploadResult = galleryFilesForUpload.length
        ? await uploadGalleryImages(galleryFilesForUpload, sellerId, serviceId)
        : { paths: [], error: null };

      if (galleryUploadResult.error) {
        throw new Error(galleryUploadResult.error);
      }

      const galleryPaths = galleryUploadResult.paths;

      if (
        galleryFilesForUpload.length &&
        galleryPaths.length !== galleryFilesForUpload.length
      ) {
        throw new Error("Image upload failed");
      }

      if (!serviceId) {
        throw new Error("Missing service ID");
      }

      if (!thumbnailPath) {
        throw new Error("Image upload failed");
      }

      if (!Array.isArray(galleryPaths)) {
        throw new Error("Image upload failed");
      }

      setLoadingLabel("Finalizing service...");
      console.log("Updating service images:");
      console.log("serviceId:", serviceId);
      console.log("thumbnail:", thumbnailPath);
      console.log("gallery:", galleryPaths);

      const { error: updateError } = await updateServiceImages(
        serviceId,
        thumbnailPath,
        galleryPaths,
      );

      if (updateError) {
        throw new Error("Failed to save image references");
      }

      setRetryContext(null);

      if (mode === "publish") {
        toast.success("Service created successfully");
        router.push("/seller/services");
        return;
      }

      toast.success("Draft saved successfully");
      resetForm();
    },
    [galleryFiles, resetForm, router, thumbnailFile],
  );

  const submit = useCallback(
    async (mode: SubmitMode) => {
      if (loading) return;

      let sellerId = session?.user?.id ?? null;
      let createdServiceId: string | null = null;

      setLoading(true);
      setLoadingLabel("Checking your account session...");

      try {
        if (!sellerId) {
          const { data, error } = await getSession();

          if (error) {
            throw new Error("Checking your account session. Please try again.");
          }

          sellerId = data.session?.user?.id ?? null;
        }

        if (loadingSession && !sellerId) {
          throw new Error("Checking your account session. Please try again.");
        }

        if (!sellerId) {
          throw new Error("You must be signed in as a seller");
        }

        const nextErrors = validateForm(formData, Boolean(thumbnailFile));
        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
          toast.error("Please complete all required fields before continuing");
          return;
        }

        setLoadingLabel("Creating service...");

        const payload = {
          seller_id: sellerId,
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category.trim(),
          subcategory: formData.subcategory.trim(),
          tags: formData.tags,
          price: Number(formData.price),
          delivery_time: Number(formData.delivery_time),
          status:
            mode === "draft"
              ? "draft"
              : formData.status === "paused"
                ? "paused"
                : "active",
        };

        const { service, error } = await createService(payload);

        if (error || !service?.id) {
          throw new Error("Failed to create service");
        }

        createdServiceId = String(service.id);

        await runImagePipeline({
          serviceId: createdServiceId,
          sellerId,
          mode,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Network error. Please try again.";

        if (message === "Image upload failed") {
          toast.error("Image upload failed");
        } else if (message === "Failed to save image references") {
          toast.error("Failed to save image references");
        } else if (message === "Failed to create service") {
          toast.error("Failed to create service");
        } else {
          toast.error(message || "Network error. Please try again.");
        }

        if (createdServiceId && sellerId && thumbnailFile) {
          setRetryContext({
            serviceId: createdServiceId,
            sellerId,
            mode,
            thumbnailFileCopy: cloneBrowserFile(thumbnailFile),
            galleryFileCopies: galleryFiles.map((file) =>
              cloneBrowserFile(file),
            ),
          });
        }
      } finally {
        setLoading(false);
        setLoadingLabel("Working...");
      }
    },
    [
      formData,
      galleryFiles,
      loading,
      loadingSession,
      runImagePipeline,
      session?.user?.id,
      thumbnailFile,
    ],
  );

  const retryUpload = useCallback(async () => {
    if (!retryContext || loading) return;

    setLoading(true);
    try {
      await runImagePipeline(retryContext);
    } catch {
      toast.error("Image upload failed");
    } finally {
      setLoading(false);
      setLoadingLabel("Working...");
    }
  }, [loading, retryContext, runImagePipeline]);

  const handleFormChange = useCallback((next: Partial<ServiceFormData>) => {
    setFormData((current) => ({ ...current, ...next }));
    setErrors((current) => ({ ...current, general: undefined }));
  }, []);

  const handleThumbnailChange = useCallback((file: File | null) => {
    setThumbnailFile(file);
    setErrors((current) => ({ ...current, thumbnail: undefined }));
  }, []);

  const handleThumbnailRemove = useCallback(() => {
    setThumbnailFile(null);
  }, []);

  const handleGalleryAdd = useCallback((files: File[]) => {
    setGalleryFiles((current) => {
      const remaining = MAX_GALLERY - current.length;
      return [...current, ...files.slice(0, remaining)];
    });
  }, []);

  const handleGalleryRemove = useCallback((index: number) => {
    setGalleryFiles((current) => current.filter((_, i) => i !== index));
  }, []);

  return {
    formData,
    errors,
    loading,
    loadingLabel,
    thumbnailFile,
    thumbnailPreview,
    galleryFiles,
    galleryPreviews,
    showRetry: Boolean(retryContext),
    submit,
    retryUpload,
    handleFormChange,
    handleThumbnailChange,
    handleThumbnailRemove,
    handleGalleryAdd,
    handleGalleryRemove,
  };
}
