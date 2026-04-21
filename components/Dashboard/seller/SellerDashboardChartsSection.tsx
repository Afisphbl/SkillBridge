"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/utils/format";
import { CHART_COLORS } from "@/hooks/dashboard/buyerDashboardUtils";
import { useSellerDashboardContext } from "./SellerDashboardProvider";
import { EmptyState, SectionHeader, SectionShell } from "./shared";

const TOOLTIP_STYLE = {
  background: "var(--bg-card)",
  border: "1px solid var(--border-color)",
  borderRadius: 12,
  fontSize: 12,
};

const STATUS_COLORS: Record<string, string> = {
  Pending: "var(--color-warning)",
  "In Progress": "var(--color-info)",
  Completed: "var(--color-success)",
  Cancelled: "var(--color-danger)",
};

export default function SellerDashboardChartsSection() {
  const { charts } = useSellerDashboardContext();
  const { earningsOverTime, ordersByStatus, revenueByService } = charts;

  return (
    <SectionShell>
      <SectionHeader
        title="Analytics"
        subtitle="Revenue trends, order workload, and service performance at a glance"
      />

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Chart 1 — Earnings Overview (Line) */}
        <article className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-4">
          <h3 className="text-sm font-bold text-(--text-primary)">
            Earnings Overview
          </h3>
          <p className="mt-0.5 text-xs text-(--text-muted)">Monthly revenue from completed orders</p>
          <div className="mt-4 h-64">
            {earningsOverTime.length === 0 ? (
              <EmptyState title="No earnings data yet" description="Complete orders to see your revenue trend." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={earningsOverTime} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                  <YAxis
                    stroke="var(--text-muted)"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    formatter={(v) => [formatPrice(v), "Earnings"]}
                    contentStyle={TOOLTIP_STYLE}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--color-primary)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "var(--color-primary)" }}
                    activeDot={{ r: 6 }}
                    isAnimationActive
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        {/* Chart 2 — Orders by Status (Bar) */}
        <article className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-4">
          <h3 className="text-sm font-bold text-(--text-primary)">
            Orders by Status
          </h3>
          <p className="mt-0.5 text-xs text-(--text-muted)">Current workload breakdown</p>
          <div className="mt-4 h-64">
            {ordersByStatus.every((d) => d.count === 0) ? (
              <EmptyState title="No orders yet" description="Your order breakdown will appear here." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersByStatus} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
                  <XAxis dataKey="status" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(v) => [v, "Orders"]}
                    contentStyle={TOOLTIP_STYLE}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} isAnimationActive>
                    {ordersByStatus.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] ?? "var(--color-primary)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        {/* Chart 3 — Revenue by Service (Pie) — full width */}
        <article className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-4 xl:col-span-2">
          <h3 className="text-sm font-bold text-(--text-primary)">
            Revenue Distribution by Service
          </h3>
          <p className="mt-0.5 text-xs text-(--text-muted)">Which services generate the most income</p>
          <div className="mt-4 h-64">
            {revenueByService.length === 0 ? (
              <EmptyState title="No revenue data yet" description="Complete orders to see revenue by service." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByService}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    isAnimationActive
                  >
                    {revenueByService.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [formatPrice(v), "Revenue"]}
                    contentStyle={TOOLTIP_STYLE}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
      </div>
    </SectionShell>
  );
}
