"use client";

import Button from "@/components/UI/Button";
import Loader from "@/components/UI/Loader";
import ServiceForm from "@/components/createService/ServiceForm";
import ServiceImageUploader from "@/components/createService/ServiceImageUploader";
import StickyActionBar from "@/components/createService/StickyActionBar";
import { useEditServicePage } from "./useEditServicePage";

export default function EditServicePage({ serviceId }: { serviceId: string }) {
  const {
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
  } = useEditServicePage(serviceId);

  if (loadingService) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader className="border-cyan-800/50 border-t-cyan-800" />
      </div>
    );
  }

  if (!serviceData) {
    return null;
  }

  return (
    <section className="space-y-5 pb-18 md:pb-0">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
            Seller Workspace
          </p>
          <h1 className="mt-1 text-2xl font-bold text-(--text-primary)">
            Edit Service
          </h1>
        </div>

        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Button
            type="button"
            onClick={() => void saveChanges()}
            loading={saving}
            disabled={saving}
            className="w-full rounded-xl sm:w-auto"
          >
            Save Changes
          </Button>
        </div>
      </header>

      {errors.general ? (
        <p className="text-sm text-(--color-danger)">{errors.general}</p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ServiceForm
          formData={formData}
          errors={errors}
          onChange={handleFormChange}
        />

        <ServiceImageUploader
          thumbnailFile={thumbnailFile}
          thumbnailPreview={thumbnailPreview}
          thumbnailError={errors.thumbnail}
          thumbnailTitle="Thumbnail"
          galleryFiles={galleryFiles}
          galleryPreviews={galleryPreviews}
          galleryCurrentCount={galleryPreviews.length}
          onThumbnailChange={handleThumbnailChange}
          onThumbnailRemove={handleThumbnailRemove}
          onGalleryAdd={handleGalleryAdd}
          onGalleryRemove={handleGalleryRemove}
        />
      </div>

      <StickyActionBar
        loading={saving}
        loadingLabel="Saving changes..."
        onSubmit={() => undefined}
        singleActionLabel="Save Changes"
        onSingleAction={() => void saveChanges()}
      />
    </section>
  );
}
