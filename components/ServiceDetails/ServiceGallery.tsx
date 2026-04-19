"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";

type ServiceGalleryProps = {
  title: string;
  thumbnail?: string;
  galleryImages?: unknown;
};

function normalizeImages(thumbnail?: string, galleryImages?: unknown) {
  const thumb = typeof thumbnail === "string" ? thumbnail.trim() : "";
  const gallery: string[] = [];

  if (Array.isArray(galleryImages)) {
    for (const item of galleryImages) {
      if (typeof item === "string" && item.trim()) gallery.push(item.trim());
    }
  }

  if (typeof galleryImages === "string" && galleryImages.trim()) {
    for (const item of galleryImages.split(",")) {
      const cleaned = item.trim();
      if (cleaned) gallery.push(cleaned);
    }
  }

  if (thumb) {
    return Array.from(new Set([thumb, ...gallery]));
  }

  if (gallery.length > 0) {
    return Array.from(new Set(gallery));
  }

  return ["/SkillBridge.png"];
}

export default function ServiceGallery({
  title,
  thumbnail,
  galleryImages,
}: ServiceGalleryProps) {
  const images = useMemo(
    () => normalizeImages(thumbnail, galleryImages),
    [galleryImages, thumbnail],
  );

  const [selectedImage, setSelectedImage] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const currentImage = images.includes(selectedImage)
    ? selectedImage
    : (images[0] ?? "/SkillBridge.png");

  return (
    <section className="space-y-3 rounded-2xl border border-(--border-color) bg-(--bg-card) p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative block h-72 w-full overflow-hidden rounded-xl bg-(--bg-secondary) md:h-96"
        >
          <Image
            src={currentImage}
            alt={title}
            fill
            unoptimized
            loading="eager"
            className="object-cover transition duration-300 hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 70vw"
          />
        </button>

        {images.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((image, index) => {
              const active = image === currentImage;

              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={
                    active
                      ? "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-(--color-primary) opacity-100 ring-2 ring-(--color-primary)"
                      : "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-(--border-color) opacity-80 transition hover:scale-105 hover:opacity-100"
                  }
                >
                  <Image
                    src={image}
                    alt={`${title} ${index + 1}`}
                    fill
                    unoptimized
                    loading="eager"
                    className="object-cover"
                    sizes="96px"
                  />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-60 bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Close image preview"
          >
            <FiX className="size-5" />
          </button>

          <div className="relative mx-auto mt-12 h-[80vh] w-full max-w-5xl overflow-hidden rounded-xl bg-black/20">
            <Image
              src={currentImage}
              alt={title}
              fill
              unoptimized
              loading="eager"
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
