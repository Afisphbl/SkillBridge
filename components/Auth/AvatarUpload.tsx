"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import { FaCamera } from "react-icons/fa";

type AvatarUploadProps = {
  file?: File;
  error?: string;
  onChange: (file?: File) => void;
};

export default function AvatarUpload({
  file,
  error,
  onChange,
}: AvatarUploadProps) {
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="flex flex-col items-center gap-2">
      <label
        htmlFor="avatar"
        className="group relative flex size-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-(--border-hover) bg-(--bg-secondary)"
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Avatar preview"
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <FaCamera className="size-6 text-(--text-disabled)" />
        )}
        <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
      </label>

      <input
        id="avatar"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0])}
      />

      <p className="text-xs text-(--text-muted)">Upload Avatar</p>
      {error && <p className="text-xs text-(--color-danger)">{error}</p>}
    </div>
  );
}
