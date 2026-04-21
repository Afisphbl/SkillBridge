"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiPlus, FiRefreshCcw } from "react-icons/fi";
import Button from "@/components/UI/Button";
import { useAuth } from "@/hooks/useAuth";
import { getSession } from "@/services/supabase/auth";
import { createService } from "@/services/supabase/servicesApi";
import { updateServiceImages } from "@/services/supabase/serviceImageDb";
import {
  uploadGalleryImages,
  uploadThumbnail,
} from "@/services/supabase/serviceImagesStorage";
import ServiceForm from "./ServiceForm";
import ServiceImageUploader from "./ServiceImageUploader";
import StickyActionBar from "./StickyActionBar";
import type { ServiceFormData, ServiceFormErrors, SubmitMode } from "./types";

const MAX_GALLERY = 5;

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

export default function CreateServicePage() {
  const router = useRouter();
  const { session, loadingSession } = useAuth();

  const [formData, setFormData] = useState<ServiceFormData>({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    tags: [],
    price: "",
    delivery_time: "",
    status: "draft",
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<ServiceFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Working...");
  const [retryContext, setRetryContext] = useState<{
    serviceId: string;
    sellerId: string;
    mode: SubmitMode;
  } | null>(null);

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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      subcategory: "",
      tags: [],
      price: "",
      delivery_time: "",
      status: "draft",
    });
    setThumbnailFile(null);
    setGalleryFiles([]);
    setErrors({});
  };

  const runImagePipeline = async ({
    serviceId,
    sellerId,
    mode,
  }: {
    serviceId: string;
    sellerId: string;
    mode: SubmitMode;
  }) => {
    if (!thumbnailFile) {
      throw new Error("Thumbnail is required");
    }

    setLoadingLabel("Uploading thumbnail...");
    const { path: thumbnailPath, error: thumbnailError } =
      await uploadThumbnail(thumbnailFile, sellerId, serviceId);

    if (thumbnailError || !thumbnailPath) {
      throw new Error("Image upload failed");
    }

    setLoadingLabel("Uploading gallery...");
    const galleryUploadResult = galleryFiles.length
      ? await uploadGalleryImages(galleryFiles, sellerId, serviceId)
      : { paths: [], error: null };

    if (galleryUploadResult.error) {
      throw new Error(galleryUploadResult.error);
    }

    const galleryPaths = galleryUploadResult.paths;

    if (galleryFiles.length && galleryPaths.length !== galleryFiles.length) {
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
  };

  const submit = async (mode: SubmitMode) => {
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

      if (message === "Image upload failed" && createdServiceId && sellerId) {
        setRetryContext({ serviceId: createdServiceId, sellerId, mode });
      }
    } finally {
      setLoading(false);
      setLoadingLabel("Working...");
    }
  };

  const retryUpload = async () => {
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
  };

  return (
    <section className="space-y-5 pb-18 md:pb-0">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
            Seller Workspace
          </p>
          <h1 className="mt-1 text-2xl font-bold text-(--text-primary)">
            Create New Service
          </h1>
        </div>

        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Button
            type="button"
            onClick={() => void submit("draft")}
            loading={loading}
            disabled={loading}
            className="w-full rounded-xl bg-(--btn-bg-secondary) text-(--btn-text-secondary) hover:bg-(--btn-bg-secondary-hover) sm:w-auto"
          >
            Save Draft
          </Button>
          <Button
            type="button"
            onClick={() => void submit("publish")}
            loading={loading}
            disabled={loading}
            className="w-full rounded-xl sm:w-auto"
          >
            <FiPlus className="mr-2 size-4" />
            Publish Service
          </Button>
        </div>
      </header>

      {retryContext ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <p>Image upload failed.</p>
          <button
            type="button"
            onClick={() => void retryUpload()}
            className="mt-2 inline-flex items-center gap-1 rounded-md border border-amber-300 px-3 py-1.5 text-xs font-semibold hover:bg-amber-100"
          >
            <FiRefreshCcw className="size-3" />
            Retry Upload
          </button>
        </section>
      ) : null}

      {errors.general ? (
        <p className="text-sm text-(--color-danger)">{errors.general}</p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ServiceForm
          formData={formData}
          errors={errors}
          onChange={(next) => {
            setFormData((current) => ({ ...current, ...next }));
            setErrors((current) => ({ ...current, general: undefined }));
          }}
        />

        <ServiceImageUploader
          thumbnailFile={thumbnailFile}
          thumbnailPreview={thumbnailPreview}
          thumbnailError={errors.thumbnail}
          galleryFiles={galleryFiles}
          galleryPreviews={galleryPreviews}
          onThumbnailChange={(file) => {
            setThumbnailFile(file);
            setErrors((current) => ({ ...current, thumbnail: undefined }));
          }}
          onThumbnailRemove={() => setThumbnailFile(null)}
          onGalleryAdd={(files) => {
            setGalleryFiles((current) => {
              const remaining = MAX_GALLERY - current.length;
              return [...current, ...files.slice(0, remaining)];
            });
          }}
          onGalleryRemove={(index) => {
            setGalleryFiles((current) => current.filter((_, i) => i !== index));
          }}
        />
      </div>

      <StickyActionBar
        loading={loading}
        loadingLabel={loadingLabel}
        onSubmit={(mode) => void submit(mode)}
      />
    </section>
  );
}
