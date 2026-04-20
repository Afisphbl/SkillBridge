"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "@/services/supabase/auth";
import { supabase } from "@/services/supabase/client";
import {
  deleteNotification,
  deleteReview,
  getBuyerDashboardSnapshot,
  markNotificationAsRead,
  removeFavorite,
  updateOrderStatus,
  type BuyerDashboardSnapshot,
  type BuyerMessage,
} from "@/services/supabase/buyerDashboardApi";
import {
  FAVORITE_PAGE_SIZE,
  MESSAGE_PAGE_SIZE,
  normalizeOrderStatus,
  NOTIFICATION_PAGE_SIZE,
  ORDER_PAGE_SIZE,
  PAYMENT_PAGE_SIZE,
  REVIEW_PAGE_SIZE,
  toDate,
  toNumber,
  type OrderStatus,
  getServiceImage,
} from "@/hooks/dashboard/buyerDashboardUtils";
import { formatPrice } from "@/utils/format";

export function useBuyerDashboardData() {
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
  const servicesMap = useMemo(
    () => new Map(services.map((service) => [service.id, service])),
    [services],
  );

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

  const normalizedOrders = useMemo(
    () =>
      orders.map((order) => ({
        ...order,
        normalizedStatus: normalizeOrderStatus(order.status),
      })),
    [orders],
  );

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
    if (!userId) {
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
    }

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

  const paymentRows = useMemo(
    () =>
      payments.map((payment) => ({
        id: payment.id,
        orderId: payment.order_id || "-",
        method: payment.payment_method || payment.method || "Card",
        status: (payment.status || "completed").toLowerCase(),
        date: payment.created_at || null,
        amount: toNumber(payment.amount, 0),
      })),
    [payments],
  );

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

  return {
    analytics,
    categories,
    errorMessage,
    favoriteCards,
    filteredOrders,
    handleDeleteNotification,
    handleDeleteReview,
    handleMarkRead,
    handleOrderAction,
    handleRemoveFavorite,
    loadDashboard,
    loading,
    messagesPreview,
    notifications,
    ordersFilter,
    pagedFavorites,
    pagedMessages,
    pagedNotifications,
    pagedOrders,
    pagedPayments,
    pagedReviews,
    paymentRows,
    profileMap,
    recentActivity,
    recentlyViewed,
    refreshing,
    reviewCards,
    roleBlocked,
    servicesMap,
    setFavoritesPage,
    setMessagesPage,
    setNotificationsPage,
    setOrdersFilter,
    setOrdersPage,
    setPaymentsPage,
    setReviewsPage,
    snapshot,
    stats,
    unreadMessages,
    unreadNotifications,
  };
}
