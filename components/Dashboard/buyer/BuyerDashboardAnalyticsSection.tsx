import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/hooks/dashboard/buyerDashboardUtils";
import { formatPrice } from "@/utils/format";
import { useBuyerDashboardContext } from "./BuyerDashboardProvider";
import { SectionHeader, SectionShell } from "./shared";

function useBuyerDashboardAnalyticsSection() {
  const { analytics, categories } = useBuyerDashboardContext();
  return { analytics, categories };
}

export default function BuyerDashboardAnalyticsSection() {
  const { analytics, categories } = useBuyerDashboardAnalyticsSection();

  return (
    <SectionShell>
      <SectionHeader
        title="Analytics"
        subtitle="Interactive buyer insights from your order and payment history"
      />

      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
        Categories synced: {categories.length}
      </p>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-4">
          <h3 className="text-sm font-bold text-(--text-primary)">
            Spending over time
          </h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.spendingOverTime}>
                <CartesianGrid
                  stroke="var(--border-color)"
                  strokeDasharray="3 3"
                />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip
                  formatter={(value) => formatPrice(value)}
                  contentStyle={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-4">
          <h3 className="text-sm font-bold text-(--text-primary)">
            Orders by status
          </h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.ordersByStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={88}
                  isAnimationActive
                  paddingAngle={3}
                >
                  {analytics.ordersByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-4 xl:col-span-2">
          <h3 className="text-sm font-bold text-(--text-primary)">
            Top purchased categories
          </h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.topCategories}>
                <CartesianGrid
                  stroke="var(--border-color)"
                  strokeDasharray="3 3"
                />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: 12,
                  }}
                />
                <Bar
                  dataKey="orders"
                  fill="var(--color-info)"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
            Average order value
          </p>
          <p className="mt-2 text-2xl font-black text-(--text-primary)">
            {formatPrice(analytics.averageOrderValue)}
          </p>
        </div>
        <div className="rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
            Repeat purchase rate
          </p>
          <p className="mt-2 text-2xl font-black text-(--text-primary)">
            {analytics.repeatPurchaseRate}%
          </p>
        </div>
      </div>
    </SectionShell>
  );
}
