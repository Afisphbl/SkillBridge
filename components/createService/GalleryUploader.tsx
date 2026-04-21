"use client";

import Image from "next/image";
import { FiImage, FiX } from "react-icons/fi";
import { ACCEPTED_IMAGE_TYPES } from "@/utils/constants";

const MAX_GALLERY = 5;

export default function GalleryUploader({
  files,
  previewUrls,
  onAdd,
  onRemove,
}: {
  files: File[];
  previewUrls: string[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}) {
  const accept = ACCEPTED_IMAGE_TYPES.join(",");
  const remaining = Math.max(0, MAX_GALLERY - files.length);

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-(--text-secondary)">
        Gallery Images ({files.length}/{MAX_GALLERY})
      </h3>

      <label className="block cursor-pointer rounded-xl border border-dashed border-(--border-color) bg-(--bg-secondary) p-3 hover:border-(--border-hover)">
        <input
          type="file"
          accept={accept}
          multiple
          className="hidden"
          disabled={remaining <= 0}
          onChange={(event) => {
            const selected = Array.from(event.target.files || []).slice(
              0,
              remaining,
            );
            if (selected.length) onAdd(selected);
            event.currentTarget.value = "";
          }}
        />

        <div className="grid place-items-center rounded-lg border border-(--border-color) bg-(--bg-card) p-4">
          <div className="text-center text-(--text-muted)">
            <FiImage className="mx-auto mb-1 size-5" />
            <p className="text-xs font-semibold">
              {remaining > 0
                ? `Add up to ${remaining} more images`
                : "Gallery limit reached"}
            </p>
          </div>
        </div>
      </label>

      {previewUrls.length ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {previewUrls.map((previewUrl, index) => (
            <div
              key={`${previewUrl}-${index}`}
              className="relative overflow-hidden rounded-lg border border-(--border-color)"
            >
              <div className="relative aspect-square">
                <Image
                  src={previewUrl}
                  alt={`Gallery preview ${index + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/75"
                aria-label={`Remove gallery image ${index + 1}`}
              >
                <FiX className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
