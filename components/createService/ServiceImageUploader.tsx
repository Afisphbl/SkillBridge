import GalleryUploader from "./GalleryUploader";
import ThumbnailUploader from "./ThumbnailUploader";

export default function ServiceImageUploader({
  thumbnailFile,
  thumbnailPreview,
  thumbnailError,
  galleryFiles,
  galleryPreviews,
  thumbnailTitle,
  galleryCurrentCount,
  maxGallery,
  onThumbnailChange,
  onThumbnailRemove,
  onGalleryAdd,
  onGalleryRemove,
}: {
  thumbnailFile: File | null;
  thumbnailPreview: string;
  thumbnailError?: string;
  galleryFiles: File[];
  galleryPreviews: string[];
  thumbnailTitle?: string;
  galleryCurrentCount?: number;
  maxGallery?: number;
  onThumbnailChange: (file: File | null) => void;
  onThumbnailRemove: () => void;
  onGalleryAdd: (files: File[]) => void;
  onGalleryRemove: (index: number) => void;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-(--text-primary)">Images</h2>

      <ThumbnailUploader
        file={thumbnailFile}
        previewUrl={thumbnailPreview}
        error={thumbnailError}
        title={thumbnailTitle}
        onChange={onThumbnailChange}
        onRemove={onThumbnailRemove}
      />

      <GalleryUploader
        files={galleryFiles}
        previewUrls={galleryPreviews}
        currentCount={galleryCurrentCount}
        maxGallery={maxGallery}
        onAdd={onGalleryAdd}
        onRemove={onGalleryRemove}
      />
    </section>
  );
}
