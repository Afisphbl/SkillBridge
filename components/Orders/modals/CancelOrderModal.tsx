"use client";

import { useState, useEffect } from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import Loader from "@/components/UI/Loader";

type CancelOrderModalProps = {
  open: boolean;
  loading: boolean;
  orderNumber?: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export default function CancelOrderModal({
  open,
  loading,
  orderNumber,
  onClose,
  onConfirm,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [loading, onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-70 grid place-items-center bg-(--modal-overlay) px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-pop w-full max-w-md rounded-3xl border border-(--border-color) bg-(--bg-card) p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <FiAlertTriangle className="size-5" />
          </div>
          <button
            type="button"
            title="Close cancel modal"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-(--text-muted) hover:bg-(--hover-bg)"
          >
            <FiX className="size-5" />
          </button>
        </div>

        <h3 className="mt-4 text-xl font-bold text-(--text-primary)">
          Cancel Order {orderNumber}
        </h3>
        <p className="mt-2 text-sm text-(--text-secondary)">
          Are you sure you want to cancel this order? This action will notify
          the buyer and may affect your seller rating.
        </p>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-(--text-primary)">
            Cancellation Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
            placeholder="Please explain why you are cancelling this order..."
            className="mt-2 h-32 w-full resize-none rounded-xl border border-(--border-color) bg-(--bg-secondary) p-3 text-sm focus:border-(--input-border-focus) focus:outline-none"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-11 rounded-xl border border-(--border-color) px-6 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={loading || !reason.trim()}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader className="border-white/40 border-t-white" />
            ) : (
              "Confirm Cancel"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
