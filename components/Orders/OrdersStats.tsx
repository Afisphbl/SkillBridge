import type { ReactNode } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";
import { useOrdersStats } from "@/hooks/orders/useOrdersStats";

type StatCardTone = "primary" | "warning" | "success" | "danger";

export default function OrdersStats() {
  const stats = useOrdersStats();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Orders"
        value={stats.total}
        icon={<FiClock className="size-5" />}
        tone="primary"
      />
      <StatCard
        title="Pending Orders"
        value={stats.pending}
        icon={<FiAlertCircle className="size-5" />}
        tone="warning"
      />
      <StatCard
        title="Completed Orders"
        value={stats.completed}
        icon={<FiCheckCircle className="size-5" />}
        tone="success"
      />
      <StatCard
        title="Cancelled Orders"
        value={stats.cancelled}
        icon={<FiXCircle className="size-5" />}
        tone="danger"
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  tone: StatCardTone;
}) {
  const toneClasses: Record<StatCardTone, string> = {
    primary:
      "bg-[color:color-mix(in_oklab,var(--color-primary)_12%,white)] text-(--color-primary)",
    warning: "bg-(--badge-warning-bg) text-(--color-warning)",
    success: "bg-(--badge-success-bg) text-(--color-success)",
    danger: "bg-(--badge-danger-bg) text-(--color-danger)",
  };

  return (
    <div className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.7)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
            {title}
          </p>
          <p className="mt-2 text-3xl font-black text-(--text-primary)">
            {value}
          </p>
        </div>
        <span
          className={`inline-flex size-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}
