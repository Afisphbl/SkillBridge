"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiMessageSquare,
  FiSearch,
  FiXCircle,
} from "react-icons/fi";
import OrderStatusBadge from "@/components/Orders/OrderStatusBadge";
import { getCurrentUser } from "@/services/supabase/auth";
import {
  updateOrder,
  getOrdersWithFilters,
} from "@/services/supabase/orderServices";
import { supabase } from "@/services/supabase/client";
import { getServicesByIds } from "@/services/supabase/servicesApi";
import { getUserById, getUsersByIds } from "@/services/supabase/userApi";
import { formatPrice } from "@/utils/format";

type OrderRecord = {
  id: string;
  order_number?: string | null;
  buyer_id: string;
  seller_id: string;
  service_id: string;
  status?: string | null;
  price?: number | null;
  platform_fee?: number | null;
  seller_earnings?: number | null;
  delivery_date?: string | null;
  delivered_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  created_at?: string | null;
};

type EnrichedOrder = OrderRecord & {
  serviceName: string;
  buyerName: string;
  sellerName: string;
};

type UserRole = "buyer" | "seller" | "both";

type StatusTab = "all" | "pending" | "delivered" | "completed" | "cancelled";

const ORDER_TABS: Array<{ key: StatusTab; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "delivered", label: "Delivered" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const PAGE_SIZE = 8;

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function dedupeOrders(records: OrderRecord[]) {
  const map = new Map<string, OrderRecord>();

  for (const record of records) {
    map.set(record.id, record);
  }

  return Array.from(map.values()).sort((a, b) => {
    const left = new Date(a.created_at || 0).getTime();
    const right = new Date(b.created_at || 0).getTime();
    return right - left;
  });
}

function normalizeStatus(status?: string | null) {
  return (status || "pending").toLowerCase();
}

export default function OrdersPageClient() {
  const [orders, setOrders] = useState<EnrichedOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<EnrichedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [role, setRole] = useState<UserRole>("buyer");
  const [currentUserId, setCurrentUserId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const enrichOrders = useCallback(async (rows: OrderRecord[]) => {
    const serviceIds = Array.from(
      new Set(rows.map((order) => order.service_id)),
    );
    const participantIds = Array.from(
      new Set(rows.flatMap((order) => [order.buyer_id, order.seller_id])),
    );

    const [{ services }, { users }] = await Promise.all([
      getServicesByIds(serviceIds),
      getUsersByIds(participantIds),
    ]);

    const serviceMap = new Map(
      (services || []).map((service: { id: string; title?: string }) => [
        service.id,
        service.title || "Unknown service",
      ]),
    );

    const userMap = new Map(
      (users || []).map(
        (user: { id: string; full_name?: string; email?: string }) => [
          user.id,
          user.full_name || user.email || "Unknown user",
        ],
      ),
    );

    return rows.map((row) => ({
      ...row,
      serviceName: serviceMap.get(row.service_id) || "Unknown service",
      buyerName: userMap.get(row.buyer_id) || "Unknown buyer",
      sellerName: userMap.get(row.seller_id) || "Unknown seller",
    }));
  }, []);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { user, error: authError } = await getCurrentUser();

      if (authError || !user?.id) {
        throw new Error("Please login to view orders.");
      }

      setCurrentUserId(user.id);

      const { data: profile, error: profileError } = await getUserById(user.id);
      if (profileError) {
        throw new Error(profileError.message || "Unable to load profile.");
      }

      const resolvedRole =
        profile?.role === "seller" || profile?.role === "both"
          ? (profile.role as UserRole)
          : "buyer";
      setRole(resolvedRole);

      const fetchBuyerOrders = () =>
        getOrdersWithFilters({ buyer_id: user.id, page: 1, limit: 300 });
      const fetchSellerOrders = () =>
        getOrdersWithFilters({ seller_id: user.id, page: 1, limit: 300 });

      let orderRows: OrderRecord[] = [];

      if (resolvedRole === "buyer") {
        const buyerResult = await fetchBuyerOrders();
        if (!buyerResult.success) {
          throw new Error(
            buyerResult.error?.message || "Failed to load orders.",
          );
        }
        orderRows = (buyerResult.orders || []) as OrderRecord[];
      } else if (resolvedRole === "seller") {
        const sellerResult = await fetchSellerOrders();
        if (!sellerResult.success) {
          throw new Error(
            sellerResult.error?.message || "Failed to load orders.",
          );
        }
        orderRows = (sellerResult.orders || []) as OrderRecord[];
      } else {
        const [buyerResult, sellerResult] = await Promise.all([
          fetchBuyerOrders(),
          fetchSellerOrders(),
        ]);

        if (!buyerResult.success || !sellerResult.success) {
          throw new Error("Failed to load orders.");
        }

        orderRows = dedupeOrders([
          ...((buyerResult.orders || []) as OrderRecord[]),
          ...((sellerResult.orders || []) as OrderRecord[]),
        ]);
      }

      const enriched = await enrichOrders(dedupeOrders(orderRows));
      setOrders(enriched);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message || "Failed to load orders");
      } else {
        setErrorMessage("Failed to load orders");
      }
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [enrichOrders]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase.channel(`orders-live-${currentUserId}`);
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `buyer_id=eq.${currentUserId}`,
      },
      () => void fetchOrders(),
    );
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `seller_id=eq.${currentUserId}`,
      },
      () => void fetchOrders(),
    );
    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, fetchOrders]);

  useEffect(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const next = orders.filter((order) => {
      const statusMatch =
        activeTab === "all" || normalizeStatus(order.status) === activeTab;
      if (!statusMatch) return false;

      if (!normalizedSearch) return true;

      const searchable = [
        order.order_number || "",
        order.serviceName,
        order.buyerName,
        order.sellerName,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedSearch);
    });

    setFilteredOrders(next);
    setCurrentPage(1);
  }, [activeTab, orders, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pagedOrders = useMemo(() => {
    const from = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(from, from + PAGE_SIZE);
  }, [currentPage, filteredOrders]);

  const stats = useMemo(() => {
    const countBy = (value: StatusTab) =>
      orders.filter((order) => normalizeStatus(order.status) === value).length;

    return {
      total: orders.length,
      pending: countBy("pending"),
      completed: countBy("completed"),
      cancelled: countBy("cancelled"),
    };
  }, [orders]);

  const cancelOrder = async (orderId: string) => {
    const confirmed = window.confirm("Cancel this order?");
    if (!confirmed) return;

    const { success, error } = await updateOrder(orderId, {
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: "Cancelled from orders page",
      updated_at: new Date().toISOString(),
    });

    if (!success) {
      toast.error(error?.message || "Unable to cancel order.");
      return;
    }

    toast.success("Order cancelled successfully.");
    void fetchOrders();
  };

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-6 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.7)]">
        <h1 className="text-3xl font-black tracking-tight text-(--text-primary)">
          Orders
        </h1>
        <p className="mt-2 text-sm text-(--text-secondary)">
          Manage and track all your orders
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={stats.total}
          icon={<FiClock className="size-5" />}
          tone="primary"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pending}
          icon={<FiAlertCircle className="size-5" />}
          tone="warning"
        />
        <StatCard
          title="Completed Orders"
          value={stats.completed}
          icon={<FiCheckCircle className="size-5" />}
          tone="success"
        />
        <StatCard
          title="Cancelled Orders"
          value={stats.cancelled}
          icon={<FiXCircle className="size-5" />}
          tone="danger"
        />
      </div>

      <div className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.7)] sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {ORDER_TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex h-9 items-center rounded-full px-3 text-sm font-semibold ${
                    active
                      ? "bg-(--btn-bg-primary) text-(--btn-text-primary)"
                      : "bg-(--bg-secondary) text-(--text-secondary) hover:bg-(--hover-bg)"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-96">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-(--text-muted)" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search order, service, buyer, seller"
              className="h-10 w-full rounded-xl border border-(--border-color) bg-(--bg-card) pl-9 pr-3 text-sm text-(--text-primary) outline-none focus:border-(--border-focus)"
            />
          </div>
        </div>
      </div>

      {isLoading ? <OrdersLoadingState /> : null}

      {!isLoading && errorMessage ? (
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
      ) : null}

      {!isLoading && !errorMessage && filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-(--border-color) bg-(--bg-card) p-10 text-center shadow-[0_10px_30px_-24px_rgba(15,23,42,0.7)]">
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-(--bg-secondary)">
            <FiClock className="size-7 text-(--text-muted)" />
          </div>
          <h2 className="text-lg font-bold text-(--text-primary)">
            No orders found
          </h2>
          <p className="mt-2 text-sm text-(--text-secondary)">
            Try changing your tab or search query.
          </p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && filteredOrders.length > 0 ? (
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
                      <td className="px-4 py-3">
                        {formatDate(order.created_at)}
                      </td>
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
                            disabled={
                              normalizeStatus(order.status) !== "pending"
                            }
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
                onClick={() =>
                  setCurrentPage((value) => Math.max(1, value - 1))
                }
                className="inline-flex h-9 items-center rounded-lg border border-(--border-color) bg-(--bg-card) px-3 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg) disabled:cursor-not-allowed disabled:opacity-60"
              >
                Previous
              </button>

              <span className="inline-flex h-9 items-center rounded-lg bg-(--bg-secondary) px-3 text-sm font-semibold text-(--text-primary)">
                {currentPage}/{totalPages}
              </span>

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
      ) : null}

      <p className="text-xs text-(--text-muted)">
        Role view:{" "}
        {role === "seller"
          ? "Seller orders"
          : role === "both"
            ? "Buyer and Seller orders"
            : "Buyer orders"}
      </p>
    </section>
  );
}

function OrdersLoadingState() {
  return (
    <div className="space-y-3 rounded-3xl border border-(--border-color) bg-(--bg-card) p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.7)]">
      {Array.from({ length: 6 }).map((_value, index) => (
        <div
          key={index}
          className="h-12 animate-pulse rounded-xl bg-(--bg-secondary)"
        />
      ))}
    </div>
  );
}

type StatCardTone = "primary" | "warning" | "success" | "danger";

function StatCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  tone: StatCardTone;
}) {
  const toneClasses: Record<StatCardTone, string> = {
    primary:
      "bg-[color:color-mix(in_oklab,var(--color-primary)_12%,white)] text-(--color-primary)",
    warning: "bg-(--badge-warning-bg) text-(--color-warning)",
    success: "bg-(--badge-success-bg) text-(--color-success)",
    danger: "bg-(--badge-danger-bg) text-(--color-danger)",
  };

  return (
    <div className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.7)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
            {title}
          </p>
          <p className="mt-2 text-3xl font-black text-(--text-primary)">
            {value}
          </p>
        </div>
        <span
          className={`inline-flex size-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}
