"use client";

import Image from "next/image";
import { useMemo } from "react";
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
  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  return (
    <div className="flex flex-col items-center gap-2">
      <label
        htmlFor="avatar"
        className="group relative flex size-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-slate-400 bg-slate-100"
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
          <FaCamera className="size-6 text-slate-400" />
        )}
        <span className="absolute inset-0 bg-slate-900/0 transition group-hover:bg-slate-900/15" />
      </label>

      <input
        id="avatar"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0])}
      />

      <p className="text-xs text-slate-500">Upload Avatar</p>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
