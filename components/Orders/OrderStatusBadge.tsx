type OrderStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "delivered"
  | "completed"
  | "cancelled"
  | "revision_requested";

type OrderStatusBadgeProps = {
  status?: string | null;
};

function normalizeStatus(status?: string | null): OrderStatus {
  const lowered = (status || "pending").toLowerCase();

  if (lowered === "accepted") return "accepted";
  if (lowered === "delivered") return "delivered";
  if (lowered.includes("progress")) return "in_progress";
  if (lowered.includes("revision")) return "revision_requested";
  if (lowered === "completed") return "completed";
  if (lowered === "cancelled") return "cancelled";
  return "pending";
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const normalizedStatus = normalizeStatus(status);

  const styles: Record<OrderStatus, string> = {
    pending:
      "bg-(--badge-warning-bg) text-[color:var(--color-warning)] ring-[color:color-mix(in_oklab,var(--color-warning)_45%,transparent)]",
    accepted: "bg-green-100/60 text-green-700 ring-green-500/35",
    in_progress: "bg-blue-100/50 text-blue-600 ring-blue-500/30",
    delivered:
      "bg-[color:color-mix(in_oklab,var(--color-info)_16%,transparent)] text-[color:var(--color-info)] ring-[color:color-mix(in_oklab,var(--color-info)_38%,transparent)]",
    revision_requested: "bg-amber-100/50 text-amber-600 ring-amber-500/30",
    completed:
      "bg-(--badge-success-bg) text-[color:var(--color-success)] ring-[color:color-mix(in_oklab,var(--color-success)_38%,transparent)]",
    cancelled:
      "bg-(--badge-danger-bg) text-[color:var(--color-danger)] ring-[color:color-mix(in_oklab,var(--color-danger)_38%,transparent)]",
  };

  const label = normalizedStatus.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ${styles[normalizedStatus]}`}
    >
      {label}
    </span>
  );
}
