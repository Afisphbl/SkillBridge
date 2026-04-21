"use client";

import { FiCheckCircle, FiX } from "react-icons/fi";
import Loader from "@/components/UI/Loader";

type AcceptOrderModalProps = {
  open: boolean;
  loading: boolean;
  orderNumber?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function AcceptOrderModal({
  open,
  loading,
  orderNumber,
  onClose,
  onConfirm,
}: AcceptOrderModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-70 grid place-items-center bg-(--modal-overlay) px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={!loading ? onClose : undefined}
    >
      <div
        className="modal-pop w-full max-w-md rounded-3xl border border-(--border-color) bg-(--bg-card) p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex size-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
            <FiCheckCircle className="size-5" />
          </div>
          <button
            type="button"
            title="Close accept modal"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-(--text-muted) hover:bg-(--hover-bg) disabled:opacity-50"
          >
            <FiX className="size-5" />
          </button>
        </div>

        <h3 className="mt-4 text-xl font-bold text-(--text-primary)">
          Accept Order
        </h3>
        <p className="mt-2 text-sm text-(--text-secondary)">
          Are you sure you want to accept this order?
        </p>
        {orderNumber ? (
          <p className="mt-1 text-xs font-semibold text-(--text-muted)">
            {orderNumber}
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-11 rounded-xl border border-(--border-color) px-6 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg) disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-green-600 px-6 text-sm font-bold text-white shadow-lg shadow-green-600/20 hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader className="border-white/40 border-t-white" />
                Accepting...
              </>
            ) : (
              "Accept"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
