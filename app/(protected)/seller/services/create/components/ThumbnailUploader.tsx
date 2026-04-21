"use client";

import Image from "next/image";
import { FiImage, FiX } from "react-icons/fi";
import { ACCEPTED_IMAGE_TYPES } from "@/utils/constants";

export default function ThumbnailUploader({
  file,
  previewUrl,
  error,
  onChange,
  onRemove,
}: {
  file: File | null;
  previewUrl: string;
  error?: string;
  onChange: (file: File | null) => void;
  onRemove: () => void;
}) {
  const accept = ACCEPTED_IMAGE_TYPES.join(",");

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-(--text-secondary)">
          Thumbnail (required)
        </h3>
        {file ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 rounded-md border border-(--border-color) px-2 py-1 text-xs font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
          >
            <FiX className="size-3" />
            Remove
          </button>
        ) : null}
      </div>

      <label className="block cursor-pointer rounded-xl border border-dashed border-(--border-color) bg-(--bg-secondary) p-3 hover:border-(--border-hover)">
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />

        {previewUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={previewUrl}
              alt="Thumbnail preview"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        ) : (
          <div className="grid aspect-video place-items-center rounded-lg border border-(--border-color) bg-(--bg-card)">
            <div className="text-center text-(--text-muted)">
              <FiImage className="mx-auto mb-1 size-5" />
              <p className="text-xs font-semibold">Click to upload thumbnail</p>
            </div>
          </div>
        )}
      </label>

      {error ? <p className="text-xs text-(--color-danger)">{error}</p> : null}
    </section>
  );
}
