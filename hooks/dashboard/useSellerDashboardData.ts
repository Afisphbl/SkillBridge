"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "@/services/supabase/auth";
import { supabase } from "@/services/supabase/client";
import {
  getSellerDashboardSnapshot,
  type SellerDashboardSnapshot,
} from "@/services/supabase/sellerDashboardApi";
import { toNumber, toDate } from "@/hooks/dashboard/buyerDashboardUtils";

// ─── helpers ─────────────────────────────────────────────────────────────────

function normalizeOrderStatus(status?: string | null) {
  const s = (status || "").toLowerCase();
  if (s === "completed") return "completed";
  if (s === "cancelled") return "cancelled";
  if (s === "delivered") return "delivered";
  if (s === "in_progress" || s === "accepted") return "in_progress";
  if (s === "revision_requested") return "revision_requested";
  return "pending";
}

function monthKey(value?: string | null) {
  const d = toDate(value);
  if (!d) return null;
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export function useSellerDashboardData() {
  const [sellerId, setSellerId] = useState("");
  const [snapshot, setSnapshot] = useState<SellerDashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setErrorMessage("");

    try {
      const { user, error: authError } = await getCurrentUser();
      if (authError || !user?.id) throw new Error("Please login to access your dashboard.");

      const result = await getSellerDashboardSnapshot(user.id);
      if (result.error || !result.data) throw new Error(result.error || "Failed to load dashboard.");

      setSellerId(user.id);
      setSnapshot(result.data);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void loadDashboard(false), 0);
    return () => window.clearTimeout(t);
  }, [loadDashboard]);

  // Realtime subscription — debounced refresh
  useEffect(() => {
    if (!sellerId) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const trigger = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void loadDashboard(true), 500);
    };

    const channel = supabase.channel(`seller-dashboard-${sellerId}`);
    channel
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `seller_id=eq.${sellerId}` }, trigger)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `receiver_id=eq.${sellerId}` }, trigger)
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews", filter: `seller_id=eq.${sellerId}` }, trigger)
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [loadDashboard, sellerId]);

  // ─── derived data ──────────────────────────────────────────────────────────

  const orders = useMemo(() => snapshot?.orders ?? [], [snapshot]);
  const services = useMemo(() => snapshot?.services ?? [], [snapshot]);
  const reviews = useMemo(() => snapshot?.reviews ?? [], [snapshot]);
  const messages = useMemo(() => snapshot?.messages ?? [], [snapshot]);
  const profilesMap = useMemo(() => snapshot?.profilesMap ?? {}, [snapshot]);

  const normalizedOrders = useMemo(
    () => orders.map((o) => ({ ...o, _status: normalizeOrderStatus(o.status) })),
    [orders],
  );

  // ─── stats cards ──────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const completedOrders = normalizedOrders.filter((o) => o._status === "completed");
    const activeOrders = normalizedOrders.filter(
      (o) => o._status === "in_progress" || o._status === "pending" || o._status === "revision_requested",
    );

    const totalEarnings = completedOrders.reduce(
      (sum, o) => sum + toNumber(o.seller_earnings ?? o.price, 0),
      0,
    );

    // Monthly earnings change: compare current month vs previous month
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const earningsThisMonth = completedOrders
      .filter((o) => {
        const d = toDate(o.completed_at || o.updated_at);
        return d && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .reduce((sum, o) => sum + toNumber(o.seller_earnings ?? o.price, 0), 0);

    const earningsPrevMonth = completedOrders
      .filter((o) => {
        const d = toDate(o.completed_at || o.updated_at);
        return d && d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      })
      .reduce((sum, o) => sum + toNumber(o.seller_earnings ?? o.price, 0), 0);

    const earningsTrend =
      earningsPrevMonth > 0
        ? Math.round(((earningsThisMonth - earningsPrevMonth) / earningsPrevMonth) * 100)
        : earningsThisMonth > 0
          ? 100
          : 0;

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + toNumber(r.rating, 0), 0) / reviews.length
        : 0;

    return {
      totalEarnings,
      earningsTrend,
      activeOrders: activeOrders.length,
      completedOrders: completedOrders.length,
      avgRating,
      totalOrders: normalizedOrders.length,
    };
  }, [normalizedOrders, reviews]);

  // ─── charts data ──────────────────────────────────────────────────────────

  const charts = useMemo(() => {
    // 1. Monthly earnings (line chart) — last 6 months
    const earningsMap = new Map<string, number>();
    for (const o of normalizedOrders.filter((o) => o._status === "completed")) {
      const key = monthKey(o.completed_at || o.updated_at);
      if (!key) continue;
      earningsMap.set(key, (earningsMap.get(key) ?? 0) + toNumber(o.seller_earnings ?? o.price, 0));
    }
    const earningsOverTime = Array.from(earningsMap.entries())
      .map(([month, amount]) => ({ month, amount: Math.round(amount) }))
      .slice(-6);

    // 2. Orders by status (bar chart)
    const statusMap = new Map<string, number>();
    for (const o of normalizedOrders) {
      statusMap.set(o._status, (statusMap.get(o._status) ?? 0) + 1);
    }
    const ordersByStatus = [
      { status: "Pending", count: statusMap.get("pending") ?? 0 },
      { status: "In Progress", count: statusMap.get("in_progress") ?? 0 },
      { status: "Completed", count: statusMap.get("completed") ?? 0 },
      { status: "Cancelled", count: statusMap.get("cancelled") ?? 0 },
    ];

    // 3. Revenue by service (pie chart)
    const serviceRevenueMap = new Map<string, { name: string; value: number }>();
    for (const o of normalizedOrders.filter((o) => o._status === "completed")) {
      const svc = services.find((s) => s.id === o.service_id);
      const name = svc?.title ?? `Service ${o.service_id.slice(0, 6)}`;
      const existing = serviceRevenueMap.get(o.service_id) ?? { name, value: 0 };
      existing.value += toNumber(o.seller_earnings ?? o.price, 0);
      serviceRevenueMap.set(o.service_id, existing);
    }
    const revenueByService = Array.from(serviceRevenueMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
      .map((item) => ({ ...item, value: Math.round(item.value) }));

    return { earningsOverTime, ordersByStatus, revenueByService };
  }, [normalizedOrders, services]);

  // ─── recent orders ────────────────────────────────────────────────────────

  const recentOrders = useMemo(
    () =>
      normalizedOrders.slice(0, 10).map((o) => ({
        ...o,
        buyerName:
          profilesMap[o.buyer_id]?.full_name ||
          profilesMap[o.buyer_id]?.email ||
          `Buyer ${o.buyer_id.slice(0, 6)}`,
        serviceTitle:
          services.find((s) => s.id === o.service_id)?.title ?? "Service",
      })),
    [normalizedOrders, profilesMap, services],
  );

  // ─── top services ─────────────────────────────────────────────────────────

  const topServices = useMemo(() => {
    return services
      .map((svc) => {
        const svcOrders = normalizedOrders.filter((o) => o.service_id === svc.id);
        const revenue = svcOrders
          .filter((o) => o._status === "completed")
          .reduce((sum, o) => sum + toNumber(o.seller_earnings ?? o.price, 0), 0);
        const svcReviews = reviews.filter((r) => r.service_id === svc.id);
        const avgRating =
          svcReviews.length > 0
            ? svcReviews.reduce((sum, r) => sum + toNumber(r.rating, 0), 0) / svcReviews.length
            : toNumber(svc.rating, 0);

        return {
          id: svc.id,
          title: svc.title ?? "Untitled",
          category: svc.category ?? "General",
          totalOrders: svcOrders.length,
          revenue: Math.round(revenue),
          avgRating,
          status: svc.status ?? "active",
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [services, normalizedOrders, reviews]);

  // ─── performance metrics ──────────────────────────────────────────────────

  const performance = useMemo(() => {
    const total = normalizedOrders.length;
    const completed = normalizedOrders.filter((o) => o._status === "completed").length;
    const cancelled = normalizedOrders.filter((o) => o._status === "cancelled").length;

    const completionRate = total > 0 ? Math.round(((total - cancelled) / total) * 100) : 0;

    const onTimeOrders = normalizedOrders.filter((o) => {
      if (o._status !== "completed") return false;
      if (!o.delivery_date || !o.delivered_at) return true;
      return new Date(o.delivered_at) <= new Date(o.delivery_date);
    }).length;
    const onTimeDelivery = completed > 0 ? Math.round((onTimeOrders / completed) * 100) : 0;

    const avgRating = stats.avgRating;
    const customerSatisfaction = Math.round((avgRating / 5) * 100);

    // Response rate: messages where seller replied within 24h (approximation)
    const unreadFromBuyers = messages.filter(
      (m) => m.receiver_id === sellerId && m.is_read === false,
    ).length;
    const totalReceived = messages.filter((m) => m.receiver_id === sellerId).length;
    const responseRate =
      totalReceived > 0
        ? Math.round(((totalReceived - unreadFromBuyers) / totalReceived) * 100)
        : 100;

    return { completionRate, onTimeDelivery, customerSatisfaction, responseRate };
  }, [normalizedOrders, messages, sellerId, stats.avgRating]);

  // ─── unread messages ──────────────────────────────────────────────────────

  const unreadMessages = useMemo(
    () => messages.filter((m) => m.receiver_id === sellerId && m.is_read === false).length,
    [messages, sellerId],
  );

  return {
    charts,
    errorMessage,
    loading,
    loadDashboard,
    normalizedOrders,
    performance,
    profilesMap,
    recentOrders,
    refreshing,
    services,
    sellerId,
    stats,
    topServices,
    unreadMessages,
  };
}
