"use client";

import { useEffect } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import Loader from "@/components/UI/Loader";

type DeleteServiceModalProps = {
  open: boolean;
  loading: boolean;
  title?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteServiceModal({
  open,
  loading,
  title,
  onClose,
  onConfirm,
}: DeleteServiceModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [loading, onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-70 grid place-items-center bg-(--modal-overlay) px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-service-title"
      aria-describedby="delete-service-description"
      onClick={onClose}
    >
      <div
        className="modal-pop w-md max-w-full rounded-2xl border border-(--border-color) bg-(--modal-bg) p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-red-100 text-red-700">
          <FiAlertTriangle className="size-5" />
        </div>

        <h3
          id="delete-service-title"
          className="text-lg font-black text-(--text-primary)"
        >
          Delete Service
        </h3>
        <p
          id="delete-service-description"
          className="mt-2 text-sm text-(--text-secondary)"
        >
          Are you sure you want to delete this service
          {title ? `, ${title}` : ""}? This action cannot be undone.
        </p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-10 items-center rounded-lg border border-(--border-color) bg-(--btn-bg-secondary) px-4 text-sm font-semibold text-(--btn-text-secondary) disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader className="border-white/40 border-t-white" /> Deleting
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
