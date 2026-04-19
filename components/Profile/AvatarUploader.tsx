"use client";

import { useRef, type ChangeEvent, type RefObject } from "react";
import Image from "next/image";
import {
  FiCheckCircle,
  FiTrash2,
  FiUpload,
  FiUser,
  FiXCircle,
} from "react-icons/fi";
import Loader from "@/components/UI/Loader";

type AvatarUploaderProps = {
  avatarUrl: string | null;
  uploading: boolean;
  uploadError: string | null;
  uploadSuccess: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  externalInputRef?: RefObject<HTMLInputElement | null>;
};

export default function AvatarUploader({
  avatarUrl,
  uploading,
  uploadError,
  uploadSuccess,
  onUpload,
  onRemove,
  externalInputRef,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const activeInputRef = externalInputRef ?? inputRef;

  const openPicker = () => {
    if (uploading) return;
    activeInputRef.current?.click();
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
    event.target.value = "";
  };

  return (
    <section className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-(--card-shadow) sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-(--text-primary)">
            Profile Image
          </h2>
          <p className="mt-1 text-sm text-(--text-muted)">
            Upload a clear headshot for better trust with clients.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-4 rounded-xl border border-dashed border-(--border-color) bg-(--bg-secondary) px-4 py-5">
        <div className="group relative size-28 overflow-hidden rounded-full border-2 border-(--border-color) bg-(--bg-card) shadow-sm transition-transform duration-200 hover:scale-[1.02]">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Current profile image"
              fill
              unoptimized
              loading="eager"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-(--text-muted)">
              <FiUser className="size-10" />
            </div>
          )}
          <button
            type="button"
            onClick={openPicker}
            className="absolute inset-0 grid place-items-center bg-slate-900/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100"
            aria-label={
              avatarUrl ? "Replace avatar image" : "Upload avatar image"
            }
          >
            <FiUpload className="size-5 text-white" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={openPicker}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-(--btn-bg-primary) px-3 py-2 text-sm font-semibold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus) disabled:cursor-not-allowed disabled:opacity-70"
          >
            {uploading ? (
              <>
                <Loader className="border-white/35 border-t-white" />
                Uploading
              </>
            ) : avatarUrl ? (
              <>
                <FiUpload className="size-4" /> Replace
              </>
            ) : (
              <>
                <FiUpload className="size-4" /> Upload
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onRemove}
            disabled={!avatarUrl || uploading}
            className="inline-flex items-center gap-2 rounded-lg border border-(--border-color) bg-(--btn-bg-secondary) px-3 py-2 text-sm font-semibold text-(--btn-text-secondary) hover:bg-(--btn-bg-secondary-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus) disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiTrash2 className="size-4" /> Remove
          </button>
        </div>

        <input
          ref={activeInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          title="Upload avatar image"
          aria-label="Upload avatar image"
          onChange={handleFileSelect}
        />

        {uploadSuccess ? (
          <p className="inline-flex items-center gap-1 text-xs font-medium text-(--color-success)">
            <FiCheckCircle className="size-4" /> Avatar change staged. Save
            profile to apply.
          </p>
        ) : null}

        {uploadError ? (
          <p className="inline-flex items-center gap-1 text-xs font-medium text-(--color-danger)">
            <FiXCircle className="size-4" /> {uploadError}
          </p>
        ) : null}
      </div>
    </section>
  );
}
