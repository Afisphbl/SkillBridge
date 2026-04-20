import { formatDate } from "@/hooks/dashboard/buyerDashboardUtils";
import { formatPrice } from "@/utils/format";
import { useBuyerDashboardContext } from "./BuyerDashboardProvider";
import { SectionHeader, SectionShell } from "./shared";

function useBuyerDashboardPaymentsSection() {
  const { analytics, pagedPayments, paymentRows, setPaymentsPage } =
    useBuyerDashboardContext();

  const totalSpending = paymentRows.reduce((sum, item) => sum + item.amount, 0);
  const monthlySpending = analytics.spendingOverTime.at(-1)?.amount || 0;
  const pendingPayments = paymentRows.filter((item) =>
    item.status.includes("pending"),
  ).length;
  const refundHistory = paymentRows.filter((item) =>
    item.status.includes("refund"),
  ).length;

  return {
    monthlySpending,
    pagedPayments,
    paymentRows,
    pendingPayments,
    refundHistory,
    setPaymentsPage,
    totalSpending,
  };
}

export default function BuyerDashboardPaymentsSection() {
  const {
    monthlySpending,
    pagedPayments,
    paymentRows,
    pendingPayments,
    refundHistory,
    setPaymentsPage,
    totalSpending,
  } = useBuyerDashboardPaymentsSection();

  return (
    <SectionShell>
      <SectionHeader
        title="Spending & Payments"
        subtitle="Track transactions, status, and monthly cost movement"
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
            Total spending
          </p>
          <p className="mt-2 text-xl font-black text-(--text-primary)">
            {formatPrice(totalSpending)}
          </p>
        </article>
        <article className="rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
            Monthly spending
          </p>
          <p className="mt-2 text-xl font-black text-(--text-primary)">
            {formatPrice(monthlySpending)}
          </p>
        </article>
        <article className="rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
            Pending payments
          </p>
          <p className="mt-2 text-xl font-black text-(--text-primary)">
            {pendingPayments}
          </p>
        </article>
        <article className="rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
            Refund history
          </p>
          <p className="mt-2 text-xl font-black text-(--text-primary)">
            {refundHistory}
          </p>
        </article>
      </div>

      <div className="overflow-hidden rounded-2xl border border-(--border-color)">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-(--table-border)">
            <thead className="bg-(--table-header-bg)">
              <tr>
                {[
                  "Transaction",
                  "Order",
                  "Method",
                  "Status",
                  "Date",
                  "Amount",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-(--text-muted)"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--table-border) bg-(--bg-card)">
              {pagedPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-sm text-(--text-secondary)"
                  >
                    No payment history yet.
                  </td>
                </tr>
              ) : (
                pagedPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-(--table-row-hover)">
                    <td className="px-3 py-2 text-sm text-(--text-secondary)">
                      {payment.id.slice(0, 8)}
                    </td>
                    <td className="px-3 py-2 text-sm text-(--text-secondary)">
                      {payment.orderId.slice(0, 8)}
                    </td>
                    <td className="px-3 py-2 text-sm text-(--text-secondary)">
                      {payment.method}
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-(--bg-secondary) px-2 py-0.5 text-xs font-semibold capitalize text-(--text-secondary)">
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-(--text-secondary)">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-3 py-2 text-sm font-semibold text-(--text-primary)">
                      {formatPrice(payment.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {paymentRows.length > pagedPayments.length ? (
        <button
          type="button"
          onClick={() => setPaymentsPage((prev) => prev + 1)}
          className="mt-4 rounded-lg border border-(--border-color) px-4 py-2 text-sm font-semibold text-(--text-primary)"
        >
          Load more transactions
        </button>
      ) : null}
    </SectionShell>
  );
}
