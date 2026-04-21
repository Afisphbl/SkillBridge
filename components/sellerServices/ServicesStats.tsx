import {
  FiBarChart2,
  FiCheckCircle,
  FiPauseCircle,
  FiShoppingBag,
} from "react-icons/fi";
import type { ServiceStats } from "./types";

export default function ServicesStats({ stats }: { stats: ServiceStats }) {
  const items = [
    {
      key: "total",
      label: "Total Services",
      value: String(stats.total),
      icon: FiBarChart2,
      iconClass: "text-sky-700 bg-sky-100",
    },
    {
      key: "active",
      label: "Active Services",
      value: String(stats.active),
      icon: FiCheckCircle,
      iconClass: "text-emerald-700 bg-emerald-100",
    },
    {
      key: "paused",
      label: "Paused Services",
      value: String(stats.paused),
      icon: FiPauseCircle,
      iconClass: "text-amber-700 bg-amber-100",
    },
    {
      key: "orders",
      label: "Total Orders",
      value: String(stats.totalOrders),
      icon: FiShoppingBag,
      iconClass: "text-indigo-700 bg-indigo-100",
    },
  ];

  return (
    <section
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Service stats"
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.key}
            className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-(--text-secondary)">
                {item.label}
              </p>
              <span
                className={`inline-flex size-9 items-center justify-center rounded-full ${item.iconClass}`}
              >
                <Icon className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-(--text-primary)">
              {item.value}
            </p>
          </article>
        );
      })}
    </section>
  );
}
