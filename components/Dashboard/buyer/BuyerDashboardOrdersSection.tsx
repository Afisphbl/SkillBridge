import Link from "next/link";
import {
  ORDER_FILTERS,
  formatDate,
  formatRelativeTime,
  toNumber,
} from "@/hooks/dashboard/buyerDashboardUtils";
import { formatPrice } from "@/utils/format";
import { cn } from "@/utils/helpers";
import { useBuyerDashboardContext } from "./BuyerDashboardProvider";
import { EmptyState, SectionHeader, SectionShell } from "./shared";

function useBuyerDashboardOrdersSection() {
  const {
    filteredOrders,
    handleOrderAction,
    ordersFilter,
    pagedOrders,
    profileMap,
    servicesMap,
    setOrdersFilter,
    setOrdersPage,
  } = useBuyerDashboardContext();

  return {
    filteredOrders,
    handleOrderAction,
    ordersFilter,
    pagedOrders,
    profileMap,
    servicesMap,
    setOrdersFilter,
    setOrdersPage,
  };
}

export default function BuyerDashboardOrdersSection() {
  const {
    filteredOrders,
    handleOrderAction,
    ordersFilter,
    pagedOrders,
    profileMap,
    servicesMap,
    setOrdersFilter,
    setOrdersPage,
  } = useBuyerDashboardOrdersSection();

  return (
    <SectionShell>
      <SectionHeader
        title="Orders Management"
        subtitle="Track active, pending, completed, and cancelled purchases"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {ORDER_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setOrdersFilter(status)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold capitalize",
              ordersFilter === status
                ? "border-(--color-primary) bg-(--color-primary) text-(--text-inverse)"
                : "border-(--border-color) text-(--text-secondary)",
            )}
          >
            {status}
          </button>
        ))}
      </div>

      {pagedOrders.length === 0 ? (
        <EmptyState
          title="You have not placed any orders yet."
          description="Start exploring services to get started."
        />
      ) : (
        <div className="space-y-3">
          {pagedOrders.map((order) => {
            const service = servicesMap.get(order.service_id);
            const seller = profileMap[order.seller_id];
            const progress = Math.max(
              5,
              Math.min(
                100,
                order.normalizedStatus === "completed"
                  ? 100
                  : order.normalizedStatus === "cancelled"
                    ? 100
                    : toNumber(
                        order.progress,
                        order.normalizedStatus === "active" ? 60 : 25,
                      ),
              ),
            );

            return (
              <article
                key={order.id}
                className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-(--text-muted)">
                      Order ID: {order.order_number || order.id.slice(0, 8)}
                    </p>
                    <h3 className="mt-1 text-base font-bold text-(--text-primary)">
                      {service?.title || "Service"}
                    </h3>
                    <p className="text-sm text-(--text-secondary)">
                      Seller:{" "}
                      {seller?.full_name || seller?.email || "Freelancer"}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold capitalize",
                      order.normalizedStatus === "completed" &&
                        "bg-(--badge-success-bg) text-(--color-success)",
                      order.normalizedStatus === "pending" &&
                        "bg-(--badge-warning-bg) text-(--color-warning)",
                      order.normalizedStatus === "cancelled" &&
                        "bg-(--badge-danger-bg) text-(--color-danger)",
                      order.normalizedStatus === "active" &&
                        "bg-(--bg-secondary) text-(--text-secondary)",
                    )}
                  >
                    {order.status || order.normalizedStatus}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-(--text-secondary) sm:grid-cols-4">
                  <p>Delivery: {formatDate(order.delivery_date)}</p>
                  <p>Price: {formatPrice(order.price)}</p>
                  <p>
                    Updated:{" "}
                    {formatRelativeTime(order.updated_at || order.created_at)}
                  </p>
                  <p>Progress: {progress}%</p>
                </div>

                <progress
                  value={progress}
                  max={100}
                  className="mt-3 h-2 w-full overflow-hidden rounded-full bg-(--bg-secondary) [&::-webkit-progress-bar]:bg-(--bg-secondary) [&::-webkit-progress-value]:bg-(--color-primary) [&::-moz-progress-bar]:bg-(--color-primary)"
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/orders/${order.id}`}
                    className="rounded-lg border border-(--border-color) px-3 py-1.5 text-xs font-semibold text-(--text-primary)"
                  >
                    View order details
                  </Link>
                  <Link
                    href={`/messages?m=${order.id}`}
                    className="rounded-lg border border-(--border-color) px-3 py-1.5 text-xs font-semibold text-(--text-primary)"
                  >
                    Message seller
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      void handleOrderAction(order.id, "cancelled")
                    }
                    className="rounded-lg border border-(--border-color) px-3 py-1.5 text-xs font-semibold text-(--color-danger)"
                  >
                    Cancel order
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void handleOrderAction(order.id, "revision_requested")
                    }
                    className="rounded-lg border border-(--border-color) px-3 py-1.5 text-xs font-semibold text-(--text-primary)"
                  >
                    Request revision
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void handleOrderAction(order.id, "completed")
                    }
                    className="rounded-lg bg-(--btn-bg-primary) px-3 py-1.5 text-xs font-semibold text-(--btn-text-primary)"
                  >
                    Mark completed
                  </button>
                  <Link
                    href={`/services/${order.service_id}`}
                    className="rounded-lg border border-(--border-color) px-3 py-1.5 text-xs font-semibold text-(--text-primary)"
                  >
                    Leave review
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {filteredOrders.length > pagedOrders.length ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setOrdersPage((prev) => prev + 1)}
            className="rounded-lg border border-(--border-color) px-4 py-2 text-sm font-semibold text-(--text-primary)"
          >
            Load more orders
          </button>
        </div>
      ) : null}
    </SectionShell>
  );
}
