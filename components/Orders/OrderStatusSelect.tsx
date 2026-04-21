"use client";

import { useState } from "react";
import Loader from "@/components/UI/Loader";

export type AllowedOrderStatus =
  | "accepted"
  | "in_progress"
  | "delivered"
  | "completed"
  | "cancelled";

type StatusOption = {
  value: AllowedOrderStatus;
  label: string;
};

/**
 * Returns the next valid status transitions for a given current status.
 * pending -> accepted | cancelled
 * accepted -> in_progress | cancelled
 * in_progress -> delivered | cancelled
 * delivered -> completed
 * revision_requested -> delivered | cancelled
 * completed / cancelled -> terminal (no options)
 */
function getNextOptions(currentStatus: string): StatusOption[] {
  const s = (currentStatus || "pending").toLowerCase();

  if (s === "pending") {
    return [
      { value: "accepted", label: "Accept Order" },
      { value: "cancelled", label: "Cancel Order" },
    ];
  }
  if (s === "accepted") {
    return [
      { value: "in_progress", label: "Start Work" },
      { value: "cancelled", label: "Cancel Order" },
    ];
  }
  if (s === "in_progress") {
    return [
      { value: "delivered", label: "Mark as Delivered" },
      { value: "cancelled", label: "Cancel Order" },
    ];
  }
  if (s === "delivered") {
    return [{ value: "completed", label: "Mark as Completed" }];
  }
  if (s === "revision_requested") {
    return [
      { value: "delivered", label: "Re-deliver Work" },
      { value: "cancelled", label: "Cancel Order" },
    ];
  }
  // completed / cancelled — terminal
  return [];
}

/** Statuses that require a confirmation dialog before proceeding */
const CONFIRM_STATUSES = new Set<AllowedOrderStatus>(["completed", "cancelled"]);

const CONFIRM_MESSAGES: Record<string, string> = {
  completed: "Are you sure you want to mark this order as completed? This cannot be undone.",
  cancelled: "Are you sure you want to cancel this order? This cannot be undone.",
};

type OrderStatusSelectProps = {
  orderId: string;
  currentStatus: string;
  isSeller: boolean;
  onChange: (orderId: string, status: AllowedOrderStatus) => Promise<{ success: boolean }>;
};

export default function OrderStatusSelect({
  orderId,
  currentStatus,
  isSeller,
  onChange,
}: OrderStatusSelectProps) {
  const [updating, setUpdating] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<AllowedOrderStatus | null>(null);

  const options = getNextOptions(currentStatus);
  const isTerminal = options.length === 0;

  // Not the seller — render nothing (permission guard)
  if (!isSeller) return null;

  // Terminal state — no actions available
  if (isTerminal) return null;

  const handleSelect = (value: AllowedOrderStatus) => {
    if (updating) return;

    if (CONFIRM_STATUSES.has(value)) {
      setPendingStatus(value);
      return;
    }

    void commit(value);
  };

  const commit = async (status: AllowedOrderStatus) => {
    setUpdating(true);
    setPendingStatus(null);
    await onChange(orderId, status);
    setUpdating(false);
  };

  return (
    <>
      <div className="relative inline-flex items-center">
        <select
          title="Update order status"
          disabled={updating}
          defaultValue=""
          onChange={(e) => {
            const val = e.target.value as AllowedOrderStatus;
            // Reset to placeholder after selection so the dropdown always shows the prompt
            e.target.value = "";
            handleSelect(val);
          }}
          className={`h-8 appearance-none rounded-lg border border-(--border-color) bg-(--bg-card) pl-3 pr-8 text-xs font-bold text-(--text-secondary) transition-opacity hover:bg-(--hover-bg) focus:border-(--btn-bg-primary) focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <option value="" disabled>
            {updating ? "Updating…" : "Update Status ▾"}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {updating && (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
            <Loader className="size-3 border-[1.5px] border-(--text-muted)/30 border-t-(--text-secondary)" />
          </span>
        )}
      </div>

      {/* Inline confirmation dialog for critical status changes */}
      {pendingStatus !== null && (
        <ConfirmStatusDialog
          status={pendingStatus}
          message={CONFIRM_MESSAGES[pendingStatus] ?? "Are you sure?"}
          onConfirm={() => void commit(pendingStatus)}
          onCancel={() => setPendingStatus(null)}
        />
      )}
    </>
  );
}

type ConfirmStatusDialogProps = {
  status: AllowedOrderStatus;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmStatusDialog({
  status,
  message,
  onConfirm,
  onCancel,
}: ConfirmStatusDialogProps) {
  const isDanger = status === "cancelled";

  return (
    <div
      className="fixed inset-0 z-70 grid place-items-center bg-(--modal-overlay) px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="modal-pop w-full max-w-sm rounded-3xl border border-(--border-color) bg-(--bg-card) p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-(--text-primary)">
          {status === "cancelled" ? "Cancel Order" : "Complete Order"}
        </h3>
        <p className="mt-2 text-sm text-(--text-secondary)">{message}</p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-xl border border-(--border-color) px-5 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-10 rounded-xl px-5 text-sm font-bold text-white shadow-lg ${
              isDanger
                ? "bg-red-600 shadow-red-600/20 hover:bg-red-700"
                : "bg-(--btn-bg-primary) shadow-(--btn-bg-primary)/20 hover:bg-(--btn-bg-primary-hover)"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
