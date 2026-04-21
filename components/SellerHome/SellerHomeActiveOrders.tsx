"use client";

import Link from "next/link";
import { FiExternalLink, FiPackage } from "react-icons/fi";
import OrderStatusBadge from "@/components/Orders/OrderStatusBadge";
import { formatPrice, formatDate } from "@/utils/format";
import { useSellerDashboardContext } from "@/components/Dashboard/seller/SellerDashboardProvider";
import { EmptyState, SectionHeader, SectionShell } from "@/components/Dashboard/seller/shared";

export default function SellerHomeActiveOrders() {
  const { normalizedOrders, profilesMap, services } = useSellerDashboardContext();

  const activeOrders = normalizedOrders
    .filter((o) =>
      o._status === "pending" ||
      o._status === "in_progress" ||
      o._status === "revision_requested" ||
      o._status === "delivered",
    )
    .slice(0, 8)
    .map((o) => ({
      ...o,
      buyerName:
        profilesMap[o.buyer_id]?.full_name ||
        profilesMap[o.buyer_id]?.email ||
        `Buyer ${o.buyer_id.slice(0, 6)}`,
      serviceTitle:
        services.find((s) => s.id === o.service_id)?.title ?? "Service",
    }));

  return (
    <SectionShell>
      <SectionHeader
        title="Active Orders"
        subtitle="Orders currently in progress that need your attention"
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

      {activeOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--bg-secondary) p-8 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-(--bg-card)">
            <FiPackage className="size-5 text-(--text-muted)" />
          </div>
          <p className="mt-3 text-sm font-semibold text-(--text-primary)">
            No active orders yet
          </p>
          <p className="mt-1 text-xs text-(--text-secondary)">
            New orders will appear here once buyers place them.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-(--border-color) md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-(--border-color) bg-(--bg-secondary)">
                  <tr className="text-xs font-black uppercase tracking-wide text-(--text-muted)">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Buyer</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Deadline</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-color)">
                  {activeOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="text-sm text-(--text-secondary) transition hover:bg-(--table-row-hover)"
                    >
                      <td className="px-4 py-3 font-bold text-(--text-primary)">
                        {order.order_number ?? `#${order.id.slice(0, 8)}`}
                      </td>
                      <td className="px-4 py-3">{order.buyerName}</td>
                      <td className="max-w-[160px] truncate px-4 py-3">
                        {order.serviceTitle}
                      </td>
                      <td className="px-4 py-3 font-semibold text-(--text-primary)">
                        {formatPrice(order.price ?? 0)}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {formatDate(order.delivery_date) || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href="/seller/orders"
                          className="inline-flex h-8 items-center rounded-lg border border-(--border-color) px-3 text-xs font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
                        >
                          View Order
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
            {activeOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-(--text-muted)">
                      {order.order_number ?? `#${order.id.slice(0, 8)}`}
                    </p>
                    <p className="mt-1 truncate text-sm font-bold text-(--text-primary)">
                      {order.serviceTitle}
                    </p>
                    <p className="text-xs text-(--text-secondary)">{order.buyerName}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-(--text-primary)">
                      {formatPrice(order.price ?? 0)}
                    </span>
                    {order.delivery_date && (
                      <p className="text-xs text-(--text-muted)">
                        Due {formatDate(order.delivery_date)}
                      </p>
                    )}
                  </div>
                  <Link
                    href="/seller/orders"
                    className="inline-flex h-8 items-center rounded-lg border border-(--border-color) px-3 text-xs font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
                  >
                    View Order
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
