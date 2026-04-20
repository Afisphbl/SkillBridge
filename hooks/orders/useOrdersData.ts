"use client";

import { useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { getCurrentUser } from "@/services/supabase/auth";
import {
  getOrdersWithFilters,
  updateOrder,
} from "@/services/supabase/orderServices";
import { supabase } from "@/services/supabase/client";
import { getServicesByIds } from "@/services/supabase/servicesApi";
import { getUserById, getUsersByIds } from "@/services/supabase/userApi";
import { dedupeOrders, type OrderRecord, type UserRole } from "./types";
import { setOrdersState, useOrdersStore } from "./store";

type OrdersRouteScope = "buyer" | "seller";

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return fallback;
}

export function useOrdersActions(routeScope?: OrdersRouteScope) {
  const enrichOrders = useCallback(async (rows: OrderRecord[]) => {
    const serviceIds = Array.from(new Set(rows.map((order) => order.service_id)));
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
    setOrdersState({
      isLoading: true,
      errorMessage: "",
    });

    try {
      const { user, error: authError } = await getCurrentUser();

      if (authError || !user?.id) {
        throw new Error("Please login to view orders.");
      }

      setOrdersState({ currentUserId: user.id });

      const { data: profile, error: profileError } = await getUserById(user.id);
      if (profileError) {
        throw new Error(toErrorMessage(profileError, "Unable to load profile."));
      }

      const profileRole =
        profile?.role === "seller" || profile?.role === "both"
          ? (profile.role as UserRole)
          : "buyer";

      const resolvedRole = routeScope || profileRole;

      if (routeScope === "seller" && !(profileRole === "seller" || profileRole === "both")) {
        throw new Error("Seller access is required to view this page.");
      }

      if (routeScope === "buyer" && !(profileRole === "buyer" || profileRole === "both")) {
        throw new Error("Buyer access is required to view this page.");
      }

      setOrdersState({ role: resolvedRole });

      const fetchBuyerOrders = () =>
        getOrdersWithFilters({
          status: undefined,
          buyer_id: user.id,
          seller_id: undefined,
          service_id: undefined,
          search: undefined,
          page: 1,
          limit: 300,
        });
      const fetchSellerOrders = () =>
        getOrdersWithFilters({
          status: undefined,
          buyer_id: undefined,
          seller_id: user.id,
          service_id: undefined,
          search: undefined,
          page: 1,
          limit: 300,
        });

      let orderRows: OrderRecord[] = [];

      if (resolvedRole === "buyer") {
        const buyerResult = await fetchBuyerOrders();
        if (!buyerResult.success) {
          throw new Error(toErrorMessage(buyerResult.error, "Failed to load orders."));
        }
        orderRows = (buyerResult.orders || []) as OrderRecord[];
      } else if (resolvedRole === "seller") {
        const sellerResult = await fetchSellerOrders();
        if (!sellerResult.success) {
          throw new Error(toErrorMessage(sellerResult.error, "Failed to load orders."));
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
      setOrdersState({ orders: enriched });
    } catch (error) {
      setOrdersState({
        orders: [],
        errorMessage:
          error instanceof Error
            ? error.message || "Failed to load orders"
            : "Failed to load orders",
      });
    } finally {
      setOrdersState({ isLoading: false });
    }
  }, [enrichOrders, routeScope]);

  const cancelOrder = useCallback(
    async (orderId: string) => {
      const confirmed = window.confirm("Cancel this order?");
      if (!confirmed) return;

      const { success, error } = await updateOrder(orderId, {
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: "Cancelled from orders page",
        updated_at: new Date().toISOString(),
      });

      if (!success) {
        toast.error(toErrorMessage(error, "Unable to cancel order."));
        return;
      }

      toast.success("Order cancelled successfully.");
      void fetchOrders();
    },
    [fetchOrders],
  );

  return { fetchOrders, cancelOrder };
}

export function useOrdersLifecycle(routeScope?: OrdersRouteScope) {
  const currentUserId = useOrdersStore((snapshot) => snapshot.currentUserId);
  const { fetchOrders } = useOrdersActions(routeScope);

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
}
