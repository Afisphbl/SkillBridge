"use client";

import { useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { getCurrentUser } from "@/services/supabase/auth";
import {
  getOrdersWithFilters,
  acceptOrder,
  deliverOrder,
  submitRevision,
  requestOrderExtension,
  cancelOrder as cancelOrderService,
  updateOrderStatus,
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
  const currentUserId = useOrdersStore((snapshot) => snapshot.currentUserId);
  const orders = useOrdersStore((snapshot) => snapshot.orders);

  const optimisticOrderPatch = useCallback(
    (orderId: string, patch: Partial<OrderRecord>) => {
      setOrdersState((current) => ({
        orders: current.orders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                ...patch,
                updated_at: new Date().toISOString(),
              }
            : order,
        ),
      }));
    },
    [],
  );

  const replaceOrderFromServer = useCallback(
    (nextOrder: Partial<OrderRecord> & { id: string }) => {
      setOrdersState((current) => ({
        orders: current.orders.map((order) =>
          order.id === nextOrder.id
            ? {
                ...order,
                ...nextOrder,
              }
            : order,
        ),
      }));
    },
    [],
  );

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
        throw new Error(
          toErrorMessage(profileError, "Unable to load profile."),
        );
      }

      const profileRole =
        profile?.role === "seller" || profile?.role === "both"
          ? (profile.role as UserRole)
          : "buyer";

      const resolvedRole = routeScope || profileRole;

      if (
        routeScope === "seller" &&
        !(profileRole === "seller" || profileRole === "both")
      ) {
        throw new Error("Seller access is required to view this page.");
      }

      if (
        routeScope === "buyer" &&
        !(profileRole === "buyer" || profileRole === "both")
      ) {
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
          throw new Error(
            toErrorMessage(buyerResult.error, "Failed to load orders."),
          );
        }
        orderRows = (buyerResult.orders || []) as OrderRecord[];
      } else if (resolvedRole === "seller") {
        const sellerResult = await fetchSellerOrders();
        if (!sellerResult.success) {
          throw new Error(
            toErrorMessage(sellerResult.error, "Failed to load orders."),
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
    async (orderId: string, reason?: string) => {
      optimisticOrderPatch(orderId, {
        status: "cancelled",
        cancellation_reason: reason || "Cancelled by seller",
        cancelled_at: new Date().toISOString(),
      });

      const { success, error } = await cancelOrderService(orderId, reason);

      if (!success) {
        toast.error(toErrorMessage(error, "Unable to cancel order."));
        void fetchOrders();
        return;
      }

      toast.success("Order cancelled successfully.");
      setOrdersState({ isLoading: false });
    },
    [fetchOrders, optimisticOrderPatch],
  );

  const handleAcceptOrder = useCallback(
    async (orderId: string) => {
      const targetOrder = orders.find((order) => order.id === orderId);

      if (
        !targetOrder ||
        targetOrder.seller_id !== currentUserId ||
        String(targetOrder.status || "").toLowerCase() !== "pending"
      ) {
        toast.error("Failed to accept order. Please try again.");
        return;
      }

      optimisticOrderPatch(orderId, {
        status: "accepted",
      });

      const { success, error, order } = await acceptOrder(orderId);

      if (!success) {
        toast.error(
          toErrorMessage(error, "Failed to accept order. Please try again."),
        );
        void fetchOrders();
        return;
      }

      replaceOrderFromServer(
        order || {
          ...targetOrder,
          status: "accepted",
        },
      );
      toast.success("Order accepted!");
      setOrdersState({ isLoading: false });
    },
    [
      currentUserId,
      fetchOrders,
      optimisticOrderPatch,
      orders,
      replaceOrderFromServer,
    ],
  );

  const handleDeliverOrder = useCallback(
    async (
      orderId: string,
      deliveryData: { message: string; files: string[] },
    ) => {
      optimisticOrderPatch(orderId, {
        status: "delivered",
        delivered_at: new Date().toISOString(),
        delivery_message: deliveryData.message,
        delivery_files: deliveryData.files,
      });

      const { success, error } = await deliverOrder(orderId, deliveryData);

      if (!success) {
        toast.error(toErrorMessage(error, "Unable to deliver order."));
        void fetchOrders();
        return;
      }

      toast.success("Order delivered successfully!");
      setOrdersState({ isLoading: false });
    },
    [fetchOrders, optimisticOrderPatch],
  );

  const handleSubmitRevision = useCallback(
    async (
      orderId: string,
      revisionData: { message: string; files: string[] },
    ) => {
      optimisticOrderPatch(orderId, {
        status: "delivered",
        delivery_message: revisionData.message,
        delivery_files: revisionData.files,
      });

      const { success, error } = await submitRevision(orderId, revisionData);

      if (!success) {
        toast.error(toErrorMessage(error, "Unable to submit revision."));
        void fetchOrders();
        return;
      }

      toast.success("Revision submitted!");
      setOrdersState({ isLoading: false });
    },
    [fetchOrders, optimisticOrderPatch],
  );

  const handleRequestExtension = useCallback(
    async (input: { orderId: string; deliveryDate: string; note: string }) => {
      optimisticOrderPatch(input.orderId, {
        delivery_date: input.deliveryDate,
        revision_notes: input.note,
      });

      const { success, error } = await requestOrderExtension(input);

      if (!success) {
        toast.error(toErrorMessage(error, "Unable to request extension."));
        void fetchOrders();
        return;
      }

      toast.success("Delivery extension requested.");
      setOrdersState({ isLoading: false });
    },
    [fetchOrders, optimisticOrderPatch],
  );

  const handleChangeOrderStatus = useCallback(
    async (orderId: string, status: string) => {
      const targetOrder = orders.find((order) => order.id === orderId);

      if (!targetOrder) {
        toast.error("Order not found.");
        return { success: false };
      }

      // Permission check — only the seller who owns the order may change its status
      if (targetOrder.seller_id !== currentUserId) {
        toast.error("You do not have permission to update this order.");
        return { success: false };
      }

      // Build the optimistic timestamp patch to mirror what the API does
      const now = new Date().toISOString();
      const timestampPatch: Partial<OrderRecord> = {};
      if (status === "in_progress") timestampPatch.started_at = now;
      if (status === "delivered") timestampPatch.delivered_at = now;
      if (status === "completed") timestampPatch.completed_at = now;
      if (status === "cancelled") timestampPatch.cancelled_at = now;

      // Optimistic update — UI reflects the change immediately
      optimisticOrderPatch(orderId, { status, ...timestampPatch });

      const { success, error, order } = await updateOrderStatus(orderId, status);

      if (!success) {
        toast.error(
          toErrorMessage(error, "Failed to update order status. Please try again."),
        );
        // Roll back by re-fetching
        void fetchOrders();
        return { success: false };
      }

      if (order) {
        replaceOrderFromServer(order as OrderRecord & { id: string });
      }

      const statusLabels: Record<string, string> = {
        accepted: "Order accepted!",
        in_progress: "Order is now in progress.",
        delivered: "Order marked as delivered.",
        completed: "Order completed!",
        cancelled: "Order cancelled.",
      };
      toast.success(statusLabels[status] ?? "Order status updated.");

      return { success: true };
    },
    [
      currentUserId,
      fetchOrders,
      optimisticOrderPatch,
      orders,
      replaceOrderFromServer,
    ],
  );

  return {
    fetchOrders,
    cancelOrder,
    acceptOrder: handleAcceptOrder,
    deliverOrder: handleDeliverOrder,
    submitRevision: handleSubmitRevision,
    requestExtension: handleRequestExtension,
    changeOrderStatus: handleChangeOrderStatus,
  };
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
