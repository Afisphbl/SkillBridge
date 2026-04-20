"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/supabase/auth";
import { getOrderById } from "@/services/supabase/orderServices";
import { getServiceById } from "@/services/supabase/servicesApi";
import { getUserById } from "@/services/supabase/userApi";

export type OrderDetailsRecord = {
  id: string;
  order_number?: string | null;
  buyer_id: string;
  seller_id: string;
  service_id: string;
  status?: string | null;
  price?: number | null;
  platform_fee?: number | null;
  seller_earnings?: number | null;
  requirements?: unknown;
  delivery_date?: string | null;
  created_at?: string | null;
  delivered_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
};

type UseOrderDetailsResult = {
  isLoading: boolean;
  errorMessage: string;
  order: OrderDetailsRecord | null;
  buyerName: string;
  sellerName: string;
  serviceName: string;
};

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

export function useOrderDetails(orderId: string): UseOrderDetailsResult {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [order, setOrder] = useState<OrderDetailsRecord | null>(null);
  const [buyerName, setBuyerName] = useState("-");
  const [sellerName, setSellerName] = useState("-");
  const [serviceName, setServiceName] = useState("-");

  useEffect(() => {
    let cancelled = false;

    async function loadOrderDetails() {
      if (!orderId) {
        setErrorMessage("Order not found.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const { user, error: authError } = await getCurrentUser();
        if (authError || !user?.id) {
          throw new Error("Please login to view this order.");
        }

        const { order: orderData, error: orderError } =
          await getOrderById(orderId);
        if (orderError || !orderData) {
          throw new Error("Order not found.");
        }

        const typedOrder = orderData as OrderDetailsRecord;
        const canAccess =
          typedOrder.buyer_id === user.id || typedOrder.seller_id === user.id;

        if (!canAccess) {
          throw new Error("You do not have access to this order.");
        }

        const [buyerResult, sellerResult, serviceResult] = await Promise.all([
          getUserById(typedOrder.buyer_id),
          getUserById(typedOrder.seller_id),
          getServiceById(typedOrder.service_id),
        ]);

        if (!cancelled) {
          setOrder(typedOrder);
          setBuyerName(
            buyerResult.data?.full_name ||
              buyerResult.data?.email ||
              typedOrder.buyer_id,
          );
          setSellerName(
            sellerResult.data?.full_name ||
              sellerResult.data?.email ||
              typedOrder.seller_id,
          );
          setServiceName(serviceResult.service?.title || typedOrder.service_id);
        }
      } catch (error) {
        if (!cancelled) {
          setOrder(null);
          setErrorMessage(toErrorMessage(error, "Failed to load order."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadOrderDetails();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return {
    isLoading,
    errorMessage,
    order,
    buyerName,
    sellerName,
    serviceName,
  };
}
