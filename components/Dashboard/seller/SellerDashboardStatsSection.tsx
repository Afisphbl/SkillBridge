"use client";

import {
  FiCheckCircle,
  FiDollarSign,
  FiPackage,
  FiStar,
  FiTrendingDown,
  FiTrendingUp,
} from "react-icons/fi";
import { formatPrice } from "@/utils/format";
import { useSellerDashboardContext } from "./SellerDashboardProvider";

type StatCardProps = {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: number | null;
  trendLabel?: string;
  accent: string;
};

function StatCard({ label, value, icon: Icon, trend, trendLabel, accent }: StatCardProps) {
  const isPositive = (trend ?? 0) >= 0;

  return (
    <article className="relative overflow-hidden rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-sm">
      {/* Accent strip */}
      <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${accent}`} />

      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
            {label}
          </p>
          <p className="mt-2 text-2xl font-black text-(--text-primary) sm:text-3xl">
            {value}
          </p>

          {trend !== null && trend !== undefined && (
            <div
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                isPositive
                  ? "bg-(--badge-success-bg) text-(--color-success)"
                  : "bg-(--badge-danger-bg) text-(--color-danger)"
              }`}
            >
              {isPositive ? (
                <FiTrendingUp className="size-3" />
              ) : (
                <FiTrendingDown className="size-3" />
              )}
              {isPositive ? "+" : ""}
              {trend}% {trendLabel}
            </div>
          )}
        </div>

        <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${accent} bg-opacity-15`}>
          <Icon className="size-5 text-(--text-primary)" />
        </div>
      </div>
    </article>
  );
}

export default function SellerDashboardStatsSection() {
  const { stats } = useSellerDashboardContext();

  const cards: StatCardProps[] = [
    {
      label: "Total Earnings",
      value: formatPrice(stats.totalEarnings),
      icon: FiDollarSign,
      trend: stats.earningsTrend,
      trendLabel: "this month",
      accent: "bg-emerald-500",
    },
    {
      label: "Active Orders",
      value: String(stats.activeOrders),
      icon: FiPackage,
      trend: null,
      accent: "bg-blue-500",
    },
    {
      label: "Completed Orders",
      value: String(stats.completedOrders),
      icon: FiCheckCircle,
      trend: null,
      accent: "bg-violet-500",
    },
    {
      label: "Average Rating",
      value: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)} / 5` : "—",
      icon: FiStar,
      trend: null,
      accent: "bg-amber-500",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
