"use client";

import { useOrdersStore } from "@/hooks/orders/store";
import { normalizeStatus } from "@/hooks/orders/types";

export default function SellerOrdersHeader() {
  const orders = useOrdersStore((snapshot) => snapshot.orders);

  const stats = {
    total: orders.length,
    active: orders.filter((o) => ["pending", "in_progress", "delivered", "revision_requested"].includes(normalizeStatus(o.status))).length,
    completed: orders.filter((o) => normalizeStatus(o.status) === "completed").length,
    cancelled: orders.filter((o) => normalizeStatus(o.status) === "cancelled").length,
  };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="Total Orders"
        value={stats.total}
        color="bg-blue-500"
      />
      <StatCard
        label="Active Orders"
        value={stats.active}
        color="bg-amber-500"
      />
      <StatCard
        label="Completed"
        value={stats.completed}
        color="bg-green-500"
      />
      <StatCard
        label="Cancelled"
        value={stats.cancelled}
        color="bg-red-500"
      />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-(--text-muted)">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-black text-(--text-primary)">
          {value}
        </span>
        <div className={`size-2 rounded-full ${color}`} />
      </div>
    </div>
  );
}
