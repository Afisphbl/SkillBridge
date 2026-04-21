"use client";

import Link from "next/link";
import { FiExternalLink } from "react-icons/fi";
import OrderStatusBadge from "@/components/Orders/OrderStatusBadge";
import { formatPrice, formatDate } from "@/utils/format";
import { useSellerDashboardContext } from "./SellerDashboardProvider";
import { EmptyState, SectionHeader, SectionShell } from "./shared";

export default function SellerDashboardOrdersSection() {
  const { recentOrders } = useSellerDashboardContext();

  return (
    <SectionShell>
      <SectionHeader
        title="Recent Orders"
        subtitle="Your latest 10 orders across all services"
        action={
          <Link
            href="/seller/orders"
            className="inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) px-3 py-2 text-xs font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
          >
            View all
            <FiExternalLink className="size-3.5" />
          </Link>
        }
      />

      {recentOrders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Orders from buyers will appear here once you start receiving them."
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-(--border-color) md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-(--border-color) bg-(--bg-secondary)">
                  <tr className="text-xs font-black uppercase tracking-wide text-(--text-muted)">
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Buyer</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-color)">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="text-sm text-(--text-secondary) transition hover:bg-(--table-row-hover)"
                    >
                      <td className="px-4 py-3 font-bold text-(--text-primary)">
                        {order.order_number ?? `#${order.id.slice(0, 8)}`}
                      </td>
                      <td className="px-4 py-3">{order.buyerName}</td>
                      <td className="max-w-[180px] truncate px-4 py-3">
                        {order.serviceTitle}
                      </td>
                      <td className="px-4 py-3 font-semibold text-(--text-primary)">
                        {formatPrice(order.price ?? 0)}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/seller/orders`}
                          className="inline-flex h-8 items-center rounded-lg border border-(--border-color) px-3 text-xs font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {recentOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-(--text-muted)">
                      {order.order_number ?? `#${order.id.slice(0, 8)}`}
                    </p>
                    <p className="mt-1 text-sm font-bold text-(--text-primary)">
                      {order.serviceTitle}
                    </p>
                    <p className="text-xs text-(--text-secondary)">{order.buyerName}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-(--text-primary)">
                    {formatPrice(order.price ?? 0)}
                  </span>
                  <Link
                    href={`/seller/orders`}
                    className="inline-flex h-8 items-center rounded-lg border border-(--border-color) px-3 text-xs font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
                  >
                    View
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </SectionShell>
  );
}
