import {
  FiAlertCircle,
  FiCheck,
  FiClock,
  FiDollarSign,
  FiPackage,
  FiStar,
} from "react-icons/fi";
import { formatRelativeTime } from "@/hooks/dashboard/buyerDashboardUtils";
import { formatPrice } from "@/utils/format";
import { useBuyerDashboardContext } from "./BuyerDashboardProvider";
import {
  EmptyState,
  OverviewUnreadBadge,
  SectionHeader,
  SectionShell,
} from "./shared";

function useBuyerDashboardOverviewSection() {
  const { recentActivity, stats } = useBuyerDashboardContext();

  const overviewCards = [
    { label: "Total orders", value: stats.totalOrders, icon: FiPackage },
    { label: "Active orders", value: stats.activeOrders, icon: FiClock },
    {
      label: "Completed orders",
      value: stats.completedOrders,
      icon: FiCheck,
    },
    {
      label: "Pending deliveries",
      value: stats.pendingOrders,
      icon: FiAlertCircle,
    },
    {
      label: "Total spent",
      value: formatPrice(stats.totalSpent),
      icon: FiDollarSign,
    },
    {
      label: "Average rating given",
      value: `${stats.avgRating.toFixed(1)} / 5`,
      icon: FiStar,
    },
  ];

  return { overviewCards, recentActivity };
}

export default function BuyerDashboardOverviewSection() {
  const { overviewCards, recentActivity } = useBuyerDashboardOverviewSection();

  return (
    <SectionShell>
      <SectionHeader
        title="Overview"
        subtitle="High-level snapshot of your purchasing activity"
        action={<OverviewUnreadBadge />}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {overviewCards.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.label}
              className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-black text-(--text-primary)">
                {item.value}
              </p>
              <Icon className="mt-3 size-4 text-(--color-primary)" />
            </article>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-4">
        <h3 className="text-sm font-bold text-(--text-primary)">
          Recent activity
        </h3>
        <div className="mt-3 space-y-2">
          {recentActivity.length > 0 ? (
            recentActivity.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-(--bg-card) px-3 py-2"
              >
                <p className="text-sm text-(--text-secondary)">{entry.text}</p>
                <span className="text-xs font-semibold text-(--text-muted)">
                  {formatRelativeTime(entry.time)}
                </span>
              </div>
            ))
          ) : (
            <EmptyState
              title="No activity yet"
              description="You have not placed any orders yet. Start exploring services to get started."
            />
          )}
        </div>
      </div>
    </SectionShell>
  );
}
