"use client";

import ServiceForm from "./ServiceForm";
import ServiceImageUploader from "./ServiceImageUploader";
import StickyActionBar from "./StickyActionBar";
import CreateServiceHeader from "./CreateServiceHeader";
import CreateServiceRetryNotice from "./CreateServiceRetryNotice";
import { useCreateServicePage } from "./useCreateServicePage";

export default function CreateServicePage() {
  const {
    formData,
    errors,
    loading,
    loadingLabel,
    thumbnailFile,
    thumbnailPreview,
    galleryFiles,
    galleryPreviews,
    showRetry,
    submit,
    retryUpload,
    handleFormChange,
    handleThumbnailChange,
    handleThumbnailRemove,
    handleGalleryAdd,
    handleGalleryRemove,
  } = useCreateServicePage();

  return (
    <section className="space-y-5 pb-18 md:pb-0">
      <CreateServiceHeader
        loading={loading}
        onSubmit={(mode) => void submit(mode)}
      />

      {showRetry ? (
        <CreateServiceRetryNotice
          loading={loading}
          onRetry={() => void retryUpload()}
        />
      ) : null}

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
          galleryFiles={galleryFiles}
          galleryPreviews={galleryPreviews}
          onThumbnailChange={handleThumbnailChange}
          onThumbnailRemove={handleThumbnailRemove}
          onGalleryAdd={handleGalleryAdd}
          onGalleryRemove={handleGalleryRemove}
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
