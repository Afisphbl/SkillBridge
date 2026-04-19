type OrderStatus = "pending" | "delivered" | "completed" | "cancelled";

type OrderStatusBadgeProps = {
  status?: string | null;
};

function normalizeStatus(status?: string | null): OrderStatus {
  const lowered = (status || "pending").toLowerCase();

  if (lowered === "delivered") return "delivered";
  if (lowered === "completed") return "completed";
  if (lowered === "cancelled") return "cancelled";
  return "pending";
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const normalizedStatus = normalizeStatus(status);

  const styles = {
    pending:
      "bg-(--badge-warning-bg) text-[color:var(--color-warning)] ring-[color:color-mix(in_oklab,var(--color-warning)_45%,transparent)]",
    delivered:
      "bg-[color:color-mix(in_oklab,var(--color-info)_16%,transparent)] text-[color:var(--color-info)] ring-[color:color-mix(in_oklab,var(--color-info)_38%,transparent)]",
    completed:
      "bg-(--badge-success-bg) text-[color:var(--color-success)] ring-[color:color-mix(in_oklab,var(--color-success)_38%,transparent)]",
    cancelled:
      "bg-(--badge-danger-bg) text-[color:var(--color-danger)] ring-[color:color-mix(in_oklab,var(--color-danger)_38%,transparent)]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${styles[normalizedStatus]}`}
    >
      {normalizedStatus}
    </span>
  );
}
