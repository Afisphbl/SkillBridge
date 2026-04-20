"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FiAlertCircle,
  FiArrowRight,
  FiBell,
  FiCheck,
  FiClock,
  FiDollarSign,
  FiMessageSquare,
  FiPackage,
  FiRefreshCcw,
  FiSearch,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";
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
import { getCurrentUser } from "@/services/supabase/auth";
import { supabase } from "@/services/supabase/client";
import {
  deleteNotification,
  deleteReview,
  getBuyerDashboardSnapshot,
  markNotificationAsRead,
  removeFavorite,
  type BuyerDashboardSnapshot,
  type BuyerMessage,
  type BuyerNotification,
  type ServiceRecord,
  updateOrderStatus,
} from "@/services/supabase/buyerDashboardApi";
import { formatPrice } from "@/utils/format";
import { cn } from "@/utils/helpers";

type OrderStatus = "all" | "active" | "pending" | "completed" | "cancelled";

const ORDER_PAGE_SIZE = 6;
const MESSAGE_PAGE_SIZE = 5;
const FAVORITE_PAGE_SIZE = 6;
const NOTIFICATION_PAGE_SIZE = 6;
const REVIEW_PAGE_SIZE = 5;
const PAYMENT_PAGE_SIZE = 8;

const CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-danger)",
  "var(--color-info)",
];

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatDate(value?: string | null) {
  const date = toDate(value);
  if (!date) return "-";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  const date = toDate(value);
  if (!date) return "-";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(value?: string | null) {
  const date = toDate(value);
  if (!date) return "now";

  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
}

function normalizeOrderStatus(status?: string | null): OrderStatus {
  const value = (status || "").toLowerCase();

  if (value.includes("cancel")) return "cancelled";
  if (value.includes("complete") || value.includes("deliver"))
    return "completed";
  if (value.includes("pending")) return "pending";
  if (value) return "active";

  return "pending";
}

function getServiceImage(service?: ServiceRecord) {
  return service?.image_url || service?.thumbnail || "/SkillBridge.png";
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--bg-secondary) p-6 text-center">
      <p className="text-sm font-semibold text-(--text-primary)">{title}</p>
      <p className="mt-1 text-sm text-(--text-secondary)">{description}</p>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-black tracking-tight text-(--text-primary)">
          {title}
        </h2>
        <p className="mt-1 text-sm text-(--text-secondary)">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function SectionShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-5 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.7)] md:p-6">
      {children}
    </section>
  );
}

function LoadingShell() {
  return (
    <section className="space-y-4">
      <div className="h-32 animate-pulse rounded-3xl bg-(--bg-secondary)" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-32 animate-pulse rounded-3xl bg-(--bg-secondary)" />
        <div className="h-32 animate-pulse rounded-3xl bg-(--bg-secondary)" />
        <div className="h-32 animate-pulse rounded-3xl bg-(--bg-secondary)" />
      </div>
      <div className="h-64 animate-pulse rounded-3xl bg-(--bg-secondary)" />
    </section>
  );
}

export default function BuyerDashboardClient() {
  const [userId, setUserId] = useState("");
  const [snapshot, setSnapshot] = useState<BuyerDashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [ordersPage, setOrdersPage] = useState(1);
  const [messagesPage, setMessagesPage] = useState(1);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [notificationsPage, setNotificationsPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [ordersFilter, setOrdersFilter] = useState<OrderStatus>("all");

  const resetPagination = useCallback(() => {
    setOrdersPage(1);
    setMessagesPage(1);
    setFavoritesPage(1);
    setNotificationsPage(1);
    setReviewsPage(1);
    setPaymentsPage(1);
  }, []);

  const loadDashboard = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setErrorMessage("");

      try {
        const { user, error: authError } = await getCurrentUser();

        if (authError || !user?.id) {
          throw new Error("Please login to access your buyer dashboard.");
        }

        const result = await getBuyerDashboardSnapshot(user.id);
        if (result.error || !result.data) {
          throw new Error(result.error || "Failed to load dashboard.");
        }

        setUserId(user.id);
        setSnapshot(result.data);
        resetPagination();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load dashboard.";
        setErrorMessage(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [resetPagination],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDashboard(false);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadDashboard]);

  useEffect(() => {
    if (!userId) return;

    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const triggerRefresh = () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      refreshTimer = setTimeout(() => {
        void loadDashboard(true);
      }, 400);
    };

    const channel = supabase.channel(`buyer-dashboard-${userId}`);

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `buyer_id=eq.${userId}`,
      },
      triggerRefresh,
    );
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
        filter: `receiver_id=eq.${userId}`,
      },
      triggerRefresh,
    );
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
        filter: `sender_id=eq.${userId}`,
      },
      triggerRefresh,
    );
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications" },
      triggerRefresh,
    );
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "payments" },
      triggerRefresh,
    );

    channel.subscribe();

    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      void supabase.removeChannel(channel);
    };
  }, [loadDashboard, userId]);

  const profileMap = useMemo(
    () => snapshot?.profilesMap ?? {},
    [snapshot?.profilesMap],
  );
  const services = useMemo(
    () => snapshot?.services ?? [],
    [snapshot?.services],
  );
  const servicesMap = useMemo(() => {
    return new Map(services.map((service) => [service.id, service]));
  }, [services]);

  const orders = useMemo(() => snapshot?.orders ?? [], [snapshot?.orders]);
  const payments = useMemo(
    () => snapshot?.payments ?? [],
    [snapshot?.payments],
  );
  const messages = useMemo(
    () => snapshot?.messages ?? [],
    [snapshot?.messages],
  );
  const reviews = useMemo(() => snapshot?.reviews ?? [], [snapshot?.reviews]);
  const notifications = useMemo(
    () => snapshot?.notifications ?? [],
    [snapshot?.notifications],
  );
  const favorites = useMemo(
    () => snapshot?.favorites ?? [],
    [snapshot?.favorites],
  );
  const categories = useMemo(
    () => snapshot?.categories ?? [],
    [snapshot?.categories],
  );

  const normalizedOrders = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      normalizedStatus: normalizeOrderStatus(order.status),
    }));
  }, [orders]);

  const stats = useMemo(() => {
    const totalOrders = normalizedOrders.length;
    const activeOrders = normalizedOrders.filter(
      (order) => order.normalizedStatus === "active",
    ).length;
    const pendingOrders = normalizedOrders.filter(
      (order) => order.normalizedStatus === "pending",
    ).length;
    const completedOrders = normalizedOrders.filter(
      (order) => order.normalizedStatus === "completed",
    ).length;

    const totalSpent = payments.reduce(
      (acc, item) => acc + toNumber(item.amount, 0),
      0,
    );
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((acc, item) => acc + toNumber(item.rating, 0), 0) /
          reviews.length
        : 0;

    return {
      totalOrders,
      activeOrders,
      pendingOrders,
      completedOrders,
      totalSpent,
      avgRating,
    };
  }, [normalizedOrders, payments, reviews]);

  const recentActivity = useMemo(() => {
    const orderEvents = normalizedOrders.slice(0, 3).map((order) => ({
      id: `order-${order.id}`,
      text: `Order ${order.order_number || order.id.slice(0, 7)} updated to ${order.status || "pending"}`,
      time: order.updated_at || order.created_at || null,
      type: "order",
    }));

    const paymentEvents = payments.slice(0, 3).map((payment) => ({
      id: `payment-${payment.id}`,
      text: `Payment ${formatPrice(payment.amount)} marked ${payment.status || "processed"}`,
      time: payment.created_at || null,
      type: "payment",
    }));

    const reviewEvents = reviews.slice(0, 2).map((review) => ({
      id: `review-${review.id}`,
      text: `You rated ${toNumber(review.rating, 0)} stars on a recent service`,
      time: review.created_at || null,
      type: "review",
    }));

    return [...orderEvents, ...paymentEvents, ...reviewEvents]
      .sort((left, right) => {
        const leftTime = toDate(left.time)?.getTime() || 0;
        const rightTime = toDate(right.time)?.getTime() || 0;
        return rightTime - leftTime;
      })
      .slice(0, 6);
  }, [normalizedOrders, payments, reviews]);

  const filteredOrders = useMemo(() => {
    if (ordersFilter === "all") return normalizedOrders;
    return normalizedOrders.filter(
      (order) => order.normalizedStatus === ordersFilter,
    );
  }, [normalizedOrders, ordersFilter]);

  const pagedOrders = filteredOrders.slice(0, ordersPage * ORDER_PAGE_SIZE);

  const messagesPreview = useMemo(() => {
    if (!userId)
      return [] as Array<{
        peerId: string;
        orderId: string;
        peerName: string;
        peerAvatar?: string | null;
        lastMessage: string;
        timestamp: string | null;
        unreadCount: number;
        online: boolean;
      }>;

    const groups = new Map<string, BuyerMessage[]>();

    for (const message of messages) {
      const peerId =
        message.sender_id === userId ? message.receiver_id : message.sender_id;
      const key = `${peerId}-${message.order_id || "no-order"}`;
      const prev = groups.get(key) || [];
      prev.push(message);
      groups.set(key, prev);
    }

    return Array.from(groups.entries())
      .map(([key, rows]) => {
        const sorted = [...rows].sort((a, b) => {
          const aTs = toDate(a.created_at)?.getTime() || 0;
          const bTs = toDate(b.created_at)?.getTime() || 0;
          return bTs - aTs;
        });

        const latest = sorted[0];
        const [peerId, orderId] = key.split("-");
        const profile = profileMap[peerId];

        return {
          peerId,
          orderId,
          peerName:
            profile?.full_name ||
            profile?.email ||
            `Freelancer ${peerId.slice(0, 6)}`,
          peerAvatar: profile?.avatar,
          lastMessage: latest.message || "No message content",
          timestamp: latest.created_at || null,
          unreadCount: rows.filter(
            (entry) => entry.receiver_id === userId && entry.is_read === false,
          ).length,
          online: rows.some(
            (entry) => entry.sender_id === peerId && entry.is_read === false,
          ),
        };
      })
      .sort((left, right) => {
        const leftTime = toDate(left.timestamp)?.getTime() || 0;
        const rightTime = toDate(right.timestamp)?.getTime() || 0;
        return rightTime - leftTime;
      });
  }, [messages, profileMap, userId]);

  const pagedMessages = messagesPreview.slice(
    0,
    messagesPage * MESSAGE_PAGE_SIZE,
  );

  const favoriteCards = useMemo(() => {
    return favorites
      .map((favorite) => {
        const serviceId = favorite.service_id || "";
        const service = servicesMap.get(serviceId);
        if (!service) return null;

        const sellerProfile = service.seller_id
          ? profileMap[service.seller_id]
          : undefined;

        return {
          favoriteId: favorite.id,
          serviceId,
          title: service.title || "Untitled service",
          sellerName:
            sellerProfile?.full_name ||
            sellerProfile?.email ||
            "Unknown freelancer",
          price: toNumber(service.price, 0),
          rating: toNumber(service.rating, 0),
          category: service.category || "General",
          image: getServiceImage(service),
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [favorites, profileMap, servicesMap]);

  const pagedFavorites = favoriteCards.slice(
    0,
    favoritesPage * FAVORITE_PAGE_SIZE,
  );

  const pagedNotifications = notifications.slice(
    0,
    notificationsPage * NOTIFICATION_PAGE_SIZE,
  );

  const reviewCards = useMemo(() => {
    return reviews.map((review) => {
      const service = review.service_id
        ? servicesMap.get(review.service_id)
        : undefined;
      const seller = review.seller_id
        ? profileMap[review.seller_id]
        : undefined;

      return {
        id: review.id,
        serviceId: review.service_id || "",
        serviceName: service?.title || "Service",
        sellerName: seller?.full_name || seller?.email || "Freelancer",
        rating: toNumber(review.rating, 0),
        text: review.review || review.comment || "No written feedback.",
        date: review.created_at || null,
      };
    });
  }, [profileMap, reviews, servicesMap]);

  const pagedReviews = reviewCards.slice(0, reviewsPage * REVIEW_PAGE_SIZE);

  const paymentRows = useMemo(() => {
    return payments.map((payment) => ({
      id: payment.id,
      orderId: payment.order_id || "-",
      method: payment.payment_method || payment.method || "Card",
      status: (payment.status || "completed").toLowerCase(),
      date: payment.created_at || null,
      amount: toNumber(payment.amount, 0),
    }));
  }, [payments]);

  const pagedPayments = paymentRows.slice(0, paymentsPage * PAYMENT_PAGE_SIZE);

  const analytics = useMemo(() => {
    const knownCategories = new Set(
      categories
        .map((entry) => entry.name || entry.title || entry.slug || "")
        .filter(Boolean),
    );

    const monthlySpendingMap = new Map<string, number>();
    for (const payment of payments) {
      const dt = toDate(payment.created_at);
      if (!dt) continue;

      const key = dt.toLocaleDateString(undefined, {
        month: "short",
        year: "2-digit",
      });
      monthlySpendingMap.set(
        key,
        (monthlySpendingMap.get(key) || 0) + toNumber(payment.amount, 0),
      );
    }

    const spendingOverTime = Array.from(monthlySpendingMap.entries()).map(
      ([month, amount]) => ({ month, amount: Math.round(amount) }),
    );

    const statusCountMap = new Map<string, number>();
    for (const order of normalizedOrders) {
      statusCountMap.set(
        order.normalizedStatus,
        (statusCountMap.get(order.normalizedStatus) || 0) + 1,
      );
    }

    const ordersByStatus = Array.from(statusCountMap.entries()).map(
      ([name, value]) => ({
        name,
        value,
      }),
    );

    const categoryMap = new Map<string, number>();
    for (const order of normalizedOrders) {
      const rawCategory =
        servicesMap.get(order.service_id)?.category || "General";
      const category = knownCategories.has(rawCategory)
        ? rawCategory
        : rawCategory;
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    }

    const topCategories = Array.from(categoryMap.entries())
      .map(([name, orders]) => ({ name, orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 6);

    const averageOrderValue =
      normalizedOrders.length > 0
        ? normalizedOrders.reduce(
            (acc, item) => acc + toNumber(item.price, 0),
            0,
          ) / normalizedOrders.length
        : 0;

    const serviceFrequency = new Map<string, number>();
    for (const order of normalizedOrders) {
      serviceFrequency.set(
        order.service_id,
        (serviceFrequency.get(order.service_id) || 0) + 1,
      );
    }

    const repeatOrders = Array.from(serviceFrequency.values()).reduce(
      (acc, count) => acc + (count > 1 ? count - 1 : 0),
      0,
    );
    const repeatPurchaseRate =
      normalizedOrders.length > 0
        ? Math.round((repeatOrders / normalizedOrders.length) * 100)
        : 0;

    return {
      spendingOverTime,
      ordersByStatus,
      topCategories,
      averageOrderValue,
      repeatPurchaseRate,
    };
  }, [categories, normalizedOrders, payments, servicesMap]);

  const recentlyViewed = useMemo(() => {
    const serviceIds = Array.from(
      new Set(
        normalizedOrders.map((order) => order.service_id).filter(Boolean),
      ),
    ).slice(0, 6);

    return serviceIds
      .map((serviceId) => {
        const service = servicesMap.get(serviceId);
        if (!service) return null;

        const seller = service.seller_id
          ? profileMap[service.seller_id]
          : undefined;

        return {
          serviceId,
          image: getServiceImage(service),
          title: service.title || "Service",
          sellerName: seller?.full_name || seller?.email || "Freelancer",
          rating: toNumber(service.rating, 0),
          price: toNumber(service.price, 0),
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [normalizedOrders, profileMap, servicesMap]);

  const unreadNotifications = notifications.filter(
    (item) => item.is_read === false,
  ).length;

  const unreadMessages = messages.filter(
    (item) => item.receiver_id === userId && item.is_read === false,
  ).length;

  const roleBlocked = snapshot?.role === "seller";

  const handleOrderAction = useCallback(
    async (
      orderId: string,
      status: "cancelled" | "completed" | "revision_requested",
    ) => {
      const { error } = await updateOrderStatus(orderId, status);
      if (!error) {
        void loadDashboard(true);
      }
    },
    [loadDashboard],
  );

  const handleRemoveFavorite = useCallback(
    async (favoriteId: string) => {
      const { error } = await removeFavorite(favoriteId);
      if (!error) {
        void loadDashboard(true);
      }
    },
    [loadDashboard],
  );

  const handleMarkRead = useCallback(
    async (notificationId: string) => {
      const { error } = await markNotificationAsRead(notificationId);
      if (!error) {
        void loadDashboard(true);
      }
    },
    [loadDashboard],
  );

  const handleDeleteNotification = useCallback(
    async (notificationId: string) => {
      const { error } = await deleteNotification(notificationId);
      if (!error) {
        void loadDashboard(true);
      }
    },
    [loadDashboard],
  );

  const handleDeleteReview = useCallback(
    async (reviewId: string) => {
      const { error } = await deleteReview(reviewId);
      if (!error) {
        void loadDashboard(true);
      }
    },
    [loadDashboard],
  );

  if (loading) {
    return <LoadingShell />;
  }

  if (errorMessage) {
    return (
      <SectionShell>
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <FiAlertCircle className="size-8 text-(--color-danger)" />
          <h1 className="text-xl font-bold text-(--text-primary)">
            Service unavailable
          </h1>
          <p className="max-w-xl text-sm text-(--text-secondary)">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={() => void loadDashboard(false)}
            className="inline-flex items-center gap-2 rounded-lg bg-(--btn-bg-primary) px-4 py-2 text-sm font-semibold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover)"
          >
            <FiRefreshCcw className="size-4" /> Retry
          </button>
        </div>
      </SectionShell>
    );
  }

  if (roleBlocked) {
    return (
      <SectionShell>
        <div className="space-y-3 py-4 text-center">
          <h1 className="text-2xl font-black text-(--text-primary)">
            Buyer Dashboard Access Required
          </h1>
          <p className="text-(--text-secondary)">
            Your account is seller-only. Switch to a buyer or dual-role account
            to manage purchases.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Link
              href="/settings"
              className="rounded-lg bg-(--btn-bg-primary) px-4 py-2 text-sm font-semibold text-(--btn-text-primary)"
            >
              Open settings
            </Link>
            <Link
              href="/services"
              className="rounded-lg border border-(--border-color) px-4 py-2 text-sm font-semibold text-(--text-primary)"
            >
              Browse services
            </Link>
          </div>
        </div>
      </SectionShell>
    );
  }

  return (
    <section className="space-y-6 pb-4">
      <SectionShell>
        <div className="relative overflow-hidden rounded-2xl border border-(--border-color) bg-linear-to-br from-[color:var(--bg-card)] via-[color:var(--bg-secondary)] to-[color:var(--bg-card)] p-6">
          <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-(--color-primary)/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 -bottom-12 size-40 rounded-full bg-(--color-success)/10 blur-3xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-(--bg-card) px-3 py-1 text-xs font-semibold text-(--text-secondary)">
                <FiTrendingUp className="size-3.5" />
                Buyer Command Center
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-(--text-primary)">
                Buyer Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-(--text-secondary)">
                Manage orders, spending, conversations, and reorders from one
                real-time workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadDashboard(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-(--border-color) bg-(--bg-card) px-3 py-2 text-sm font-semibold text-(--text-primary) hover:bg-(--hover-bg)"
            >
              <FiRefreshCcw
                className={cn("size-4", refreshing && "animate-spin")}
              />
              {refreshing ? "Refreshing" : "Refresh"}
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/services"
              className="rounded-xl border border-(--border-color) bg-(--bg-card) px-4 py-3 text-sm font-semibold text-(--text-primary) hover:bg-(--hover-bg)"
            >
              Browse Services
            </Link>
            <Link
              href="/orders"
              className="rounded-xl border border-(--border-color) bg-(--bg-card) px-4 py-3 text-sm font-semibold text-(--text-primary) hover:bg-(--hover-bg)"
            >
              View Orders
            </Link>
            <Link
              href="/messages"
              className="rounded-xl border border-(--border-color) bg-(--bg-card) px-4 py-3 text-sm font-semibold text-(--text-primary) hover:bg-(--hover-bg)"
            >
              Contact Freelancer
            </Link>
            <Link
              href="/services"
              className="rounded-xl border border-(--border-color) bg-(--bg-card) px-4 py-3 text-sm font-semibold text-(--text-primary) hover:bg-(--hover-bg)"
            >
              Reorder Service
            </Link>
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <SectionHeader
          title="Overview"
          subtitle="High-level snapshot of your purchasing activity"
          action={
            <div className="inline-flex items-center gap-2 rounded-full bg-(--bg-secondary) px-3 py-1 text-xs font-semibold text-(--text-secondary)">
              <FiBell className="size-3.5" />
              {unreadNotifications} unread notifications
            </div>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Total orders",
              value: stats.totalOrders,
              icon: FiPackage,
            },
            {
              label: "Active orders",
              value: stats.activeOrders,
              icon: FiClock,
            },
            {
              label: "Completed orders",
              value: stats.completedOrders,
              icon: FiCheck,
            },
            {
              label: "Pending deliveries",
              value: stats.pendingOrders,
              icon: FiAlertCircle,
            },
            {
              label: "Total spent",
              value: formatPrice(stats.totalSpent),
              icon: FiDollarSign,
            },
            {
              label: "Average rating given",
              value: `${stats.avgRating.toFixed(1)} / 5`,
              icon: FiStar,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.label}
                className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-black text-(--text-primary)">
                  {item.value}
                </p>
                <Icon className="mt-3 size-4 text-(--color-primary)" />
              </article>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-4">
          <h3 className="text-sm font-bold text-(--text-primary)">
            Recent activity
          </h3>
          <div className="mt-3 space-y-2">
            {recentActivity.length > 0 ? (
              recentActivity.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-(--bg-card) px-3 py-2"
                >
                  <p className="text-sm text-(--text-secondary)">
                    {entry.text}
                  </p>
                  <span className="text-xs font-semibold text-(--text-muted)">
                    {formatRelativeTime(entry.time)}
                  </span>
                </div>
              ))
            ) : (
              <EmptyState
                title="No activity yet"
                description="You have not placed any orders yet. Start exploring services to get started."
              />
            )}
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <SectionHeader
          title="Orders Management"
          subtitle="Track active, pending, completed, and cancelled purchases"
        />

        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              "all",
              "active",
              "pending",
              "completed",
              "cancelled",
            ] as OrderStatus[]
          ).map((status) => (
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

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-(--bg-secondary)">
                    <span
                      className="block h-full rounded-full bg-(--color-primary) transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

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

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionShell>
          <SectionHeader
            title="Messages Preview"
            subtitle="Recent freelancer conversations"
            action={
              <Link
                href="/messages"
                className="inline-flex items-center gap-1 text-sm font-semibold text-(--color-primary)"
              >
                Open inbox <FiArrowRight className="size-4" />
              </Link>
            }
          />

          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-(--bg-secondary) px-3 py-1 text-xs font-semibold text-(--text-secondary)">
            <FiMessageSquare className="size-3.5" />
            {unreadMessages} unread messages
          </div>

          {pagedMessages.length === 0 ? (
            <EmptyState
              title="No messages yet"
              description="No messages exist yet. Start an order conversation to chat with freelancers."
            />
          ) : (
            <div className="space-y-3">
              {pagedMessages.map((thread) => (
                <article
                  key={`${thread.peerId}-${thread.orderId}`}
                  className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative size-11 overflow-hidden rounded-full bg-(--bg-secondary)">
                      {thread.peerAvatar ? (
                        <Image
                          src={thread.peerAvatar}
                          alt={thread.peerName}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <span className="grid h-full place-items-center text-xs font-bold text-(--text-secondary)">
                          {thread.peerName.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <span
                        className={cn(
                          "absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-(--bg-card)",
                          thread.online
                            ? "bg-(--color-success)"
                            : "bg-(--text-muted)",
                        )}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-(--text-primary)">
                          {thread.peerName}
                        </p>
                        <span className="text-xs text-(--text-muted)">
                          {formatRelativeTime(thread.timestamp)}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-sm text-(--text-secondary)">
                        {thread.lastMessage}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Link
                          href={`/messages?m=${thread.orderId}`}
                          className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--text-primary)"
                        >
                          Open conversation
                        </Link>
                        <Link
                          href={`/orders/${thread.orderId}`}
                          className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--text-primary)"
                        >
                          View order
                        </Link>
                        {thread.unreadCount > 0 ? (
                          <span className="rounded-full bg-(--color-primary) px-2 py-0.5 text-[11px] font-semibold text-(--text-inverse)">
                            {thread.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {messagesPreview.length > pagedMessages.length ? (
            <button
              type="button"
              onClick={() => setMessagesPage((prev) => prev + 1)}
              className="mt-4 rounded-lg border border-(--border-color) px-4 py-2 text-sm font-semibold text-(--text-primary)"
            >
              Load more conversations
            </button>
          ) : null}
        </SectionShell>

        <SectionShell>
          <SectionHeader
            title="Saved Services"
            subtitle="Favorites you can quickly revisit and order"
            action={
              <Link
                href="/services"
                className="inline-flex items-center gap-1 text-sm font-semibold text-(--color-primary)"
              >
                Discover more <FiSearch className="size-4" />
              </Link>
            }
          />

          {pagedFavorites.length === 0 ? (
            <EmptyState
              title="No favorites saved"
              description="No favorites exist yet. Save services while browsing to access them quickly here."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {pagedFavorites.map((favorite) => (
                <article
                  key={favorite.favoriteId}
                  className="overflow-hidden rounded-2xl border border-(--border-color) bg-(--bg-card)"
                >
                  <div className="relative h-28 w-full">
                    <Image
                      src={favorite.image}
                      alt={favorite.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-1 text-sm font-bold text-(--text-primary)">
                      {favorite.title}
                    </p>
                    <p className="mt-1 text-xs text-(--text-secondary)">
                      {favorite.sellerName}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-(--text-muted)">
                      <span>{favorite.category}</span>
                      <span>{formatPrice(favorite.price)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={`/services/${favorite.serviceId}`}
                        className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--text-primary)"
                      >
                        View service
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          void handleRemoveFavorite(favorite.favoriteId)
                        }
                        className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--color-danger)"
                      >
                        Remove
                      </button>
                      <Link
                        href={`/services/${favorite.serviceId}`}
                        className="rounded-lg bg-(--btn-bg-primary) px-2.5 py-1 text-xs font-semibold text-(--btn-text-primary)"
                      >
                        Order service
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {favoriteCards.length > pagedFavorites.length ? (
            <button
              type="button"
              onClick={() => setFavoritesPage((prev) => prev + 1)}
              className="mt-4 rounded-lg border border-(--border-color) px-4 py-2 text-sm font-semibold text-(--text-primary)"
            >
              Load more favorites
            </button>
          ) : null}
        </SectionShell>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionShell>
          <SectionHeader
            title="Notifications Center"
            subtitle="Order, payment, and system updates"
          />

          {pagedNotifications.length === 0 ? (
            <EmptyState
              title="No notifications yet"
              description="No notifications exist yet. Updates will appear here in real time."
            />
          ) : (
            <div className="space-y-2">
              {pagedNotifications.map((item: BuyerNotification) => {
                const content =
                  item.message || item.body || item.title || "New update";
                return (
                  <article
                    key={item.id}
                    className={cn(
                      "rounded-xl border p-3",
                      item.is_read === false
                        ? "border-(--color-primary)/40 bg-(--color-primary)/5"
                        : "border-(--border-color) bg-(--bg-card)",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-(--text-primary)">
                          {content}
                        </p>
                        <p className="mt-1 text-xs text-(--text-muted)">
                          {formatDateTime(item.created_at)}
                        </p>
                      </div>
                      {item.is_read === false ? (
                        <span className="rounded-full bg-(--color-primary) px-2 py-0.5 text-[11px] font-semibold text-(--text-inverse)">
                          New
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void handleMarkRead(item.id)}
                        className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--text-primary)"
                      >
                        Mark as read
                      </button>
                      {item.order_id ? (
                        <Link
                          href={`/orders/${item.order_id}`}
                          className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--text-primary)"
                        >
                          Open order
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void handleDeleteNotification(item.id)}
                        className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--color-danger)"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {notifications.length > pagedNotifications.length ? (
            <button
              type="button"
              onClick={() => setNotificationsPage((prev) => prev + 1)}
              className="mt-4 rounded-lg border border-(--border-color) px-4 py-2 text-sm font-semibold text-(--text-primary)"
            >
              Load more notifications
            </button>
          ) : null}
        </SectionShell>

        <SectionShell>
          <SectionHeader
            title="Reviews & Ratings"
            subtitle="Manage the feedback you have published"
          />

          {pagedReviews.length === 0 ? (
            <EmptyState
              title="No reviews yet"
              description="No reviews exist yet. Complete an order and leave feedback for freelancers."
            />
          ) : (
            <div className="space-y-2">
              {pagedReviews.map(
                (review: ReturnType<typeof reviewCards>[number]) => (
                  <article
                    key={review.id}
                    className="rounded-xl border border-(--border-color) bg-(--bg-card) p-3"
                  >
                    <p className="text-sm font-semibold text-(--text-primary)">
                      {review.serviceName}
                    </p>
                    <p className="text-xs text-(--text-secondary)">
                      {review.sellerName}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-(--color-warning)">
                      <FiStar className="size-3.5" />
                      <span className="text-xs font-semibold">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-(--text-secondary)">
                      {review.text}
                    </p>
                    <p className="mt-2 text-xs text-(--text-muted)">
                      {formatDate(review.date)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link
                        href={`/services/${review.serviceId}`}
                        className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--text-primary)"
                      >
                        View service
                      </Link>
                      <Link
                        href={`/services/${review.serviceId}`}
                        className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--text-primary)"
                      >
                        Edit review
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleDeleteReview(review.id)}
                        className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--color-danger)"
                      >
                        Delete review
                      </button>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}

          {reviewCards.length > pagedReviews.length ? (
            <button
              type="button"
              onClick={() => setReviewsPage((prev) => prev + 1)}
              className="mt-4 rounded-lg border border-(--border-color) px-4 py-2 text-sm font-semibold text-(--text-primary)"
            >
              Load more reviews
            </button>
          ) : null}
        </SectionShell>
      </div>

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
              {formatPrice(
                paymentRows.reduce((sum, item) => sum + item.amount, 0),
              )}
            </p>
          </article>
          <article className="rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
              Monthly spending
            </p>
            <p className="mt-2 text-xl font-black text-(--text-primary)">
              {formatPrice(analytics.spendingOverTime.at(-1)?.amount || 0)}
            </p>
          </article>
          <article className="rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
              Pending payments
            </p>
            <p className="mt-2 text-xl font-black text-(--text-primary)">
              {
                paymentRows.filter((item) => item.status.includes("pending"))
                  .length
              }
            </p>
          </article>
          <article className="rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
              Refund history
            </p>
            <p className="mt-2 text-xl font-black text-(--text-primary)">
              {
                paymentRows.filter((item) => item.status.includes("refund"))
                  .length
              }
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
                    <tr
                      key={payment.id}
                      className="hover:bg-(--table-row-hover)"
                    >
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

      <SectionShell>
        <SectionHeader
          title="Recently Viewed Services"
          subtitle="Quickly return to recently visited service pages"
        />

        {recentlyViewed.length === 0 ? (
          <EmptyState
            title="No recently viewed services"
            description="Browse the marketplace and interact with services to build your quick access list."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {recentlyViewed.map((service) => (
              <article
                key={service.serviceId}
                className="overflow-hidden rounded-2xl border border-(--border-color) bg-(--bg-card)"
              >
                <div className="relative h-32 w-full">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="line-clamp-1 text-sm font-bold text-(--text-primary)">
                    {service.title}
                  </p>
                  <p className="mt-1 text-xs text-(--text-secondary)">
                    {service.sellerName}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs text-(--text-muted)">
                    <span className="inline-flex items-center gap-1">
                      <FiStar className="size-3.5 text-(--color-warning)" />
                      {service.rating.toFixed(1)}
                    </span>
                    <span>{formatPrice(service.price)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/services/${service.serviceId}`}
                      className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--text-primary)"
                    >
                      View service
                    </Link>
                    <Link
                      href={`/services/${service.serviceId}`}
                      className="rounded-lg bg-(--btn-bg-primary) px-2.5 py-1 text-xs font-semibold text-(--btn-text-primary)"
                    >
                      Order again
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionShell>
    </section>
  );
}
