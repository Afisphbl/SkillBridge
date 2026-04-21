import GalleryUploader from "./GalleryUploader";
import ThumbnailUploader from "./ThumbnailUploader";

export default function ServiceImageUploader({
  thumbnailFile,
  thumbnailPreview,
  thumbnailError,
  galleryFiles,
  galleryPreviews,
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
        onChange={onThumbnailChange}
        onRemove={onThumbnailRemove}
      />

      <GalleryUploader
        files={galleryFiles}
        previewUrls={galleryPreviews}
        onAdd={onGalleryAdd}
        onRemove={onGalleryRemove}
      />
    </section>
  );
}
