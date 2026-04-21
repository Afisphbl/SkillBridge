"use client";

import {
  FiCheckCircle,
  FiClock,
  FiMessageCircle,
  FiSmile,
} from "react-icons/fi";
import { useSellerDashboardContext } from "./SellerDashboardProvider";
import { SectionHeader, SectionShell } from "./shared";

type MetricCardProps = {
  label: string;
  description: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trackColor: string;
};

function MetricCard({ label, description, value, icon: Icon, color, trackColor }: MetricCardProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <article className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
            {label}
          </p>
          <p className="mt-1 text-2xl font-black text-(--text-primary)">
            {clamped}%
          </p>
          <p className="mt-1 text-xs text-(--text-secondary)">{description}</p>
        </div>
        <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${color}`}>
          <Icon className="size-5 text-white" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className={`h-2 w-full overflow-hidden rounded-full ${trackColor}`}>
          <div
            className={`h-full rounded-full transition-all duration-700 ${color}`}
            style={{ width: `${clamped}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-(--text-muted)">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </article>
  );
}

export default function SellerDashboardPerformanceSection() {
  const { performance } = useSellerDashboardContext();

  const metrics: MetricCardProps[] = [
    {
      label: "Response Rate",
      description: "Messages replied to by you",
      value: performance.responseRate,
      icon: FiMessageCircle,
      color: "bg-blue-500",
      trackColor: "bg-blue-100/60",
    },
    {
      label: "Completion Rate",
      description: "Orders completed vs total",
      value: performance.completionRate,
      icon: FiCheckCircle,
      color: "bg-emerald-500",
      trackColor: "bg-emerald-100/60",
    },
    {
      label: "On-Time Delivery",
      description: "Orders delivered by deadline",
      value: performance.onTimeDelivery,
      icon: FiClock,
      color: "bg-violet-500",
      trackColor: "bg-violet-100/60",
    },
    {
      label: "Customer Satisfaction",
      description: "Based on average review rating",
      value: performance.customerSatisfaction,
      icon: FiSmile,
      color: "bg-amber-500",
      trackColor: "bg-amber-100/60",
    },
  ];

  return (
    <SectionShell>
      <SectionHeader
        title="Performance Metrics"
        subtitle="Key indicators that buyers see when evaluating your profile"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>
    </SectionShell>
  );
}
