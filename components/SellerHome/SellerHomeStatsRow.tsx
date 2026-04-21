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
import { useSellerDashboardContext } from "@/components/Dashboard/seller/SellerDashboardProvider";

type CardProps = {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ElementType;
  accent: string;
  trend?: number | null;
};

function StatCard({ label, value, subtext, icon: Icon, accent, trend }: CardProps) {
  const isPositive = (trend ?? 0) >= 0;

  return (
    <article className="relative overflow-hidden rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-sm">
      <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${accent}`} />

      <div className="flex items-start justify-between gap-2 pl-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
            {label}
          </p>
          <p className="mt-2 text-2xl font-black text-(--text-primary) sm:text-3xl">
            {value}
          </p>
          {subtext && (
            <p className="mt-1 text-xs text-(--text-muted)">{subtext}</p>
          )}
          {trend !== null && trend !== undefined && (
            <div
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                isPositive
                  ? "bg-(--badge-success-bg) text-(--color-success)"
                  : "bg-(--badge-danger-bg) text-(--color-danger)"
              }`}
            >
              {isPositive ? <FiTrendingUp className="size-3" /> : <FiTrendingDown className="size-3" />}
              {isPositive ? "+" : ""}{trend}% this month
            </div>
          )}
        </div>
        <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${accent}/15`}>
          <Icon className="size-5 text-(--text-primary)" />
        </div>
      </div>
    </article>
  );
}

export default function SellerHomeStatsRow() {
  const { stats } = useSellerDashboardContext();

  const cards: CardProps[] = [
    {
      label: "Total Earnings",
      value: formatPrice(stats.totalEarnings),
      subtext: "This month",
      icon: FiDollarSign,
      accent: "bg-emerald-500",
      trend: stats.earningsTrend,
    },
    {
      label: "Active Orders",
      value: String(stats.activeOrders),
      icon: FiPackage,
      accent: "bg-blue-500",
    },
    {
      label: "Completed Orders",
      value: String(stats.completedOrders),
      icon: FiCheckCircle,
      accent: "bg-violet-500",
    },
    {
      label: "Rating",
      value: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)} ★` : "—",
      subtext: stats.avgRating > 0 ? "Based on reviews" : "No reviews yet",
      icon: FiStar,
      accent: "bg-amber-500",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <StatCard key={c.label} {...c} />
      ))}
    </div>
  );
}
