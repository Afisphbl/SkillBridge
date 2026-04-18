"use client";

import { useEffect } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import Loader from "@/components/UI/Loader";

type DeleteAccountModalProps = {
  open: boolean;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteAccountModal({
  open,
  deleting,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-70 grid place-items-center bg-(--modal-overlay) px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
      aria-describedby="delete-account-description"
      onClick={onClose}
    >
      <div
        className="modal-pop w-full rounded-2xl border border-(--border-color) bg-(--modal-bg) p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-3 inline-flex size-11 items-center justify-center rounded-full bg-red-100 text-red-700">
          <FiAlertTriangle className="size-5" />
        </div>

        <h3
          id="delete-account-title"
          className="text-center text-lg font-bold text-(--text-primary)"
        >
          Delete Account
        </h3>
        <p
          id="delete-account-description"
          className="mt-2 text-center text-sm text-(--text-secondary)"
        >
          This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="inline-flex min-w-24 items-center justify-center rounded-lg border border-(--border-color) bg-(--btn-bg-secondary) px-4 py-2 text-sm font-semibold text-(--btn-text-secondary) hover:bg-(--btn-bg-secondary-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus) disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex min-w-24 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deleting ? (
              <>
                <Loader className="border-white/35 border-t-white" /> Deleting
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
