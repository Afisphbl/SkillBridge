"use client";

import Link from "next/link";
import { FiMessageSquare } from "react-icons/fi";
import OrderStatusBadge from "@/components/Orders/OrderStatusBadge";
import { useOrdersActions } from "@/hooks/orders/useOrdersData";
import { useOrdersFilters } from "@/hooks/orders/useOrdersFilters";
import { useOrdersPagination } from "@/hooks/orders/useOrdersPagination";
import { useOrdersStore } from "@/hooks/orders/store";
import { formatDate, normalizeStatus } from "@/hooks/orders/types";
import { formatPrice } from "@/utils/format";
import OrdersLoadingState from "./OrdersLoadingState";

export default function OrdersContent() {
  const isLoading = useOrdersStore((snapshot) => snapshot.isLoading);
  const errorMessage = useOrdersStore((snapshot) => snapshot.errorMessage);
  const { filteredOrders } = useOrdersFilters();
  const { pagedOrders, currentPage, totalPages, setCurrentPage } =
    useOrdersPagination();
  const { fetchOrders, cancelOrder } = useOrdersActions();

  if (isLoading) {
    return <OrdersLoadingState />;
  }

  if (errorMessage) {
    return (
      <div className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-10 text-center shadow-[0_10px_30px_-24px_rgba(15,23,42,0.7)]">
        <p className="text-base font-semibold text-(--color-danger)">
          Failed to load orders
        </p>
        <p className="mt-2 text-sm text-(--text-secondary)">{errorMessage}</p>
        <button
          type="button"
          onClick={() => void fetchOrders()}
          className="mt-5 inline-flex h-10 items-center rounded-xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover)"
        >
          Retry
        </button>
      </div>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-(--border-color) bg-(--bg-card) p-10 text-center shadow-[0_10px_30px_-24px_rgba(15,23,42,0.7)]">
        <div className="mx-auto mb-5 flex h-24 w-32 items-center justify-center rounded-2xl border border-(--border-color) bg-(--bg-secondary)">
          <svg
            viewBox="0 0 160 100"
            aria-hidden="true"
            className="h-16 w-24 text-(--text-muted)"
          >
            <rect
              x="10"
              y="18"
              width="140"
              height="64"
              rx="10"
              fill="currentColor"
              opacity="0.1"
            />
            <rect
              x="24"
              y="30"
              width="60"
              height="8"
              rx="4"
              fill="currentColor"
              opacity="0.35"
            />
            <rect
              x="24"
              y="45"
              width="110"
              height="6"
              rx="3"
              fill="currentColor"
              opacity="0.25"
            />
            <circle cx="122" cy="33" r="10" fill="currentColor" opacity="0.2" />
            <path
              d="M118 33h8M122 29v8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-(--text-primary)">
          No orders found
        </h2>
        <p className="mt-2 text-sm text-(--text-secondary)">
          Try changing your tab or search query.
        </p>
      </div>
    );
  }

  const pageNumbers = Array.from(
    { length: totalPages },
    (_value, index) => index + 1,
  );

  return (
    <>
      <div className="hidden overflow-hidden rounded border border-(--border-color) bg-(--bg-card) shadow-[0_10px_30px_-24px_rgba(15,23,42,0.7)] md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-(--table-border)">
            <thead className="bg-(--table-header-bg)">
              <tr className="text-left text-xs font-bold uppercase tracking-wide text-(--text-muted)">
                <th className="px-4 py-3">Order Number</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Seller</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Delivery Date</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--table-border)">
              {pagedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="text-sm text-(--text-secondary) hover:bg-(--table-row-hover)"
                >
                  <td className="px-4 py-3 font-semibold text-(--text-primary)">
                    {order.order_number || `Order ${order.id.slice(0, 8)}`}
                  </td>
                  <td className="px-4 py-3">{order.serviceName}</td>
                  <td className="px-4 py-3">{order.buyerName}</td>
                  <td className="px-4 py-3">{order.sellerName}</td>
                  <td className="px-4 py-3 font-semibold text-(--text-primary)">
                    {formatPrice(order.price || 0)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(order.delivery_date)}
                  </td>
                  <td className="px-4 py-3">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex h-8 items-center rounded-lg border border-(--border-color) px-3 text-xs font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/messages?orderId=${order.id}`}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-(--border-color) px-3 text-xs font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
                      >
                        <FiMessageSquare className="size-3.5" />
                        Open Chat
                      </Link>
                      <button
                        type="button"
                        onClick={() => void cancelOrder(order.id)}
                        disabled={normalizeStatus(order.status) !== "pending"}
                        className="inline-flex h-8 items-center rounded-lg bg-(--badge-danger-bg) px-3 text-xs font-semibold text-(--color-danger) ring-1 ring-(--border-color) hover:bg-[color-mix(in_oklab,var(--color-danger)_16%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancel Order
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {pagedOrders.map((order) => (
          <article
            key={order.id}
            className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.7)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-(--text-muted)">
                  Order Number
                </p>
                <p className="text-sm font-bold text-(--text-primary)">
                  {order.order_number || `Order ${order.id.slice(0, 8)}`}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="mt-4 space-y-1">
              <p className="text-sm font-semibold text-(--text-primary)">
                {order.serviceName}
              </p>
              <p className="text-sm text-(--text-secondary)">
                {formatPrice(order.price || 0)} • Delivery{" "}
                {formatDate(order.delivery_date)}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Link
                href={`/orders/${order.id}`}
                className="inline-flex h-9 items-center rounded-lg border border-(--border-color) px-3 text-xs font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
              >
                View Details
              </Link>
            </div>
          </article>
        ))}
      </div>

      <nav className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--border-color) bg-(--bg-card) px-4 py-3">
        <p className="text-sm font-medium text-(--text-secondary)">
          {pagedOrders.length}/{filteredOrders.length} orders
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
            className="inline-flex h-9 items-center rounded-lg border border-(--border-color) bg-(--bg-card) px-3 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg) disabled:cursor-not-allowed disabled:opacity-60"
          >
            Previous
          </button>

          <span className="inline-flex h-9 items-center rounded-lg bg-(--bg-secondary) px-3 text-sm font-semibold text-(--text-primary)">
            {currentPage}/{totalPages}
          </span>

          <div className="hidden items-center gap-1 lg:flex">
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setCurrentPage(pageNumber)}
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold ${
                  currentPage === pageNumber
                    ? "border-(--btn-bg-primary) bg-(--btn-bg-primary) text-(--btn-text-primary)"
                    : "border-(--border-color) bg-(--bg-card) text-(--text-secondary) hover:bg-(--hover-bg)"
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() =>
              setCurrentPage((value) => Math.min(totalPages, value + 1))
            }
            className="inline-flex h-9 items-center rounded-lg border border-(--border-color) bg-(--bg-card) px-3 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg) disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </nav>
    </>
  );
}
