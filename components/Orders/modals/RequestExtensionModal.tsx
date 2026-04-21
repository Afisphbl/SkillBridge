"use client";

import { useEffect, useState } from "react";
import { FiCalendar, FiClock, FiX } from "react-icons/fi";
import Loader from "@/components/UI/Loader";

type RequestExtensionModalProps = {
  open: boolean;
  loading: boolean;
  orderNumber?: string;
  currentDeadline?: string | null;
  onClose: () => void;
  onConfirm: (payload: { deliveryDate: string; note: string }) => void;
};

export default function RequestExtensionModal({
  open,
  loading,
  orderNumber,
  currentDeadline,
  onClose,
  onConfirm,
}: RequestExtensionModalProps) {
  const [deliveryDate, setDeliveryDate] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;

    const parsed = currentDeadline ? new Date(currentDeadline) : null;
    if (parsed && !Number.isNaN(parsed.getTime())) {
      setDeliveryDate(parsed.toISOString().slice(0, 10));
    } else {
      setDeliveryDate("");
    }

    setNote("");
  }, [currentDeadline, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-70 grid place-items-center bg-(--modal-overlay) px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={!loading ? onClose : undefined}
    >
      <div
        className="modal-pop w-full max-w-lg rounded-3xl border border-(--border-color) bg-(--bg-card) p-0 shadow-2xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-(--border-color) p-6 bg-(--bg-secondary)">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <FiClock className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-(--text-primary)">
                Request Extension
              </h3>
              <p className="text-xs font-semibold text-(--text-muted)">
                {orderNumber || "Order"}
              </p>
            </div>
          </div>
          <button
            type="button"
            title="Close extension modal"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-(--text-muted) hover:bg-(--hover-bg) disabled:opacity-50"
          >
            <FiX className="size-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <label className="flex flex-col gap-2 text-sm font-semibold text-(--text-primary)">
            New delivery deadline
            <div className="relative">
              <FiCalendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-(--text-muted)" />
              <input
                type="date"
                value={deliveryDate}
                onChange={(event) => setDeliveryDate(event.target.value)}
                disabled={loading}
                className="h-11 w-full rounded-xl border border-(--border-color) bg-(--bg-card) pl-10 pr-3 text-sm font-medium text-(--text-primary)"
              />
            </div>
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-(--text-primary)">
            Message to buyer
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              disabled={loading}
              placeholder="Explain why you need additional time and what will be delivered next."
              className="h-32 w-full resize-none rounded-xl border border-(--border-color) bg-(--bg-secondary) p-3 text-sm text-(--text-primary) focus:border-(--input-border-focus) focus:outline-none"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-(--border-color) bg-(--bg-secondary) p-6">
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
            disabled={loading || !deliveryDate || !note.trim()}
            onClick={() => onConfirm({ deliveryDate, note })}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader className="border-white/40 border-t-white" />
            ) : (
              "Send Request"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
