"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { updateOrder } from "@/services/supabase/orderServices";

type OrderDetailActionsProps = {
  orderId: string;
  status?: string | null;
};

export default function OrderDetailActions({
  orderId,
  status,
}: OrderDetailActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const normalizedStatus = (status || "pending").toLowerCase();

  const runAction = async (
    updates: Record<string, string | null>,
    message: string,
  ) => {
    setIsSubmitting(true);
    try {
      const { success, error } = await updateOrder(orderId, {
        ...updates,
        updated_at: new Date().toISOString(),
      });

      if (!success) {
        throw new Error(error?.message || "Action failed.");
      }

      toast.success(message);
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (normalizedStatus === "completed") {
    return (
      <span className="inline-flex items-center rounded-full bg-(--badge-success-bg) px-3 py-1 text-xs font-semibold text-(--color-success) ring-1 ring-(--border-color)">
        Completed
      </span>
    );
  }

  if (normalizedStatus === "cancelled") {
    return (
      <span className="inline-flex items-center rounded-full bg-(--badge-danger-bg) px-3 py-1 text-xs font-semibold text-(--color-danger) ring-1 ring-(--border-color)">
        Cancelled
      </span>
    );
  }

  if (normalizedStatus === "delivered") {
    return (
      <button
        type="button"
        disabled={isSubmitting}
        onClick={() =>
          runAction(
            {
              status: "completed",
              completed_at: new Date().toISOString(),
            },
            "Order marked as completed.",
          )
        }
        className="inline-flex h-10 items-center rounded-xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover) disabled:cursor-not-allowed disabled:opacity-60"
      >
        Mark as Completed
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={isSubmitting}
      onClick={() =>
        runAction(
          {
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            cancellation_reason: "Cancelled by user",
          },
          "Order cancelled successfully.",
        )
      }
      className="inline-flex h-10 items-center rounded-xl bg-(--badge-danger-bg) px-4 text-sm font-semibold text-(--color-danger) ring-1 ring-(--border-color) hover:bg-[color-mix(in_oklab,var(--color-danger)_16%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      Cancel Order
    </button>
  );
}
