"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getOrdersWithFilters } from "@/services/supabase/orderServices";
import { getServicesByIds } from "@/services/supabase/servicesApi";
import { useMessagesInboxData } from "./useMessagesInboxData";
import type { ConversationPreview } from "./messagesInboxUtils";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "delivered"
  | "completed"
  | "cancelled"
  | "revision_requested";

export type EnrichedConversation = ConversationPreview & {
  orderStatus: OrderStatus | null;
  serviceTitle: string | null;
  orderNumber: string | null;
};

export type MessageFilter = "all" | "unread" | "active" | "completed";

const ACTIVE_STATUSES = new Set<string>([
  "pending",
  "accepted",
  "in_progress",
  "delivered",
  "revision_requested",
]);

/** Fetch order metadata keyed by order_id */
async function fetchOrderMeta(
  orderIds: string[],
  sellerId: string,
): Promise<
  Map<
    string,
    { status: OrderStatus | null; serviceTitle: string | null; orderNumber: string | null }
  >
> {
  if (!orderIds.length || !sellerId) return new Map();

  try {
    const result = await getOrdersWithFilters({
      seller_id: sellerId,
      page: 1,
      limit: 300,
    });

    if (!result.success || !Array.isArray(result.orders)) return new Map();

    const orders = result.orders as Array<{
      id: string;
      status?: string | null;
      service_id?: string | null;
      order_number?: string | null;
    }>;

    // Fetch service titles in parallel
    const serviceIds = Array.from(
      new Set(orders.map((o) => o.service_id).filter(Boolean) as string[]),
    );

    let serviceTitleMap = new Map<string, string>();
    if (serviceIds.length) {
      const { services } = await getServicesByIds(serviceIds);
      if (Array.isArray(services)) {
        for (const s of services as Array<{ id: string; title?: string }>) {
          if (s?.id) serviceTitleMap.set(s.id, s.title || "");
        }
      }
    }

    const map = new Map<
      string,
      { status: OrderStatus | null; serviceTitle: string | null; orderNumber: string | null }
    >();

    for (const order of orders) {
      if (!order.id) continue;
      map.set(order.id, {
        status: (order.status as OrderStatus) || null,
        serviceTitle: order.service_id
          ? (serviceTitleMap.get(order.service_id) ?? null)
          : null,
        orderNumber: order.order_number ?? null,
      });
    }

    return map;
  } catch {
    return new Map();
  }
}

export function useSellerMessagesData() {
  const base = useMessagesInboxData();
  const [orderMeta, setOrderMeta] = useState<
    Map<
      string,
      { status: OrderStatus | null; serviceTitle: string | null; orderNumber: string | null }
    >
  >(new Map());
  const [activeFilter, setActiveFilter] = useState<MessageFilter>("all");

  // Enrich conversations with order metadata once currentUserId and conversations are ready
  useEffect(() => {
    const sellerId = base.currentUserId;
    if (!sellerId || base.isLoadingConversations) return;

    const orderIds = Array.from(
      new Set(base.filteredConversations.map((c) => c.order_id)),
    );

    if (!orderIds.length) return;

    let cancelled = false;

    fetchOrderMeta(orderIds, sellerId).then((meta) => {
      if (!cancelled) setOrderMeta(meta);
    });

    return () => {
      cancelled = true;
    };
  }, [base.currentUserId, base.isLoadingConversations, base.filteredConversations]);

  /** All conversations enriched with order data */
  const enrichedConversations = useMemo<EnrichedConversation[]>(() => {
    return base.filteredConversations.map((conv) => {
      const meta = orderMeta.get(conv.order_id);
      return {
        ...conv,
        orderStatus: meta?.status ?? null,
        serviceTitle: meta?.serviceTitle ?? null,
        orderNumber: meta?.orderNumber ?? null,
      };
    });
  }, [base.filteredConversations, orderMeta]);

  /** Conversations after applying the active filter tab */
  const displayedConversations = useMemo<EnrichedConversation[]>(() => {
    switch (activeFilter) {
      case "unread":
        return enrichedConversations.filter((c) => c.unreadCount > 0);
      case "active":
        return enrichedConversations.filter(
          (c) => c.orderStatus && ACTIVE_STATUSES.has(c.orderStatus),
        );
      case "completed":
        return enrichedConversations.filter(
          (c) => c.orderStatus === "completed" || c.orderStatus === "cancelled",
        );
      default:
        return enrichedConversations;
    }
  }, [enrichedConversations, activeFilter]);

  const filterCounts = useMemo(() => {
    return {
      all: enrichedConversations.length,
      unread: enrichedConversations.filter((c) => c.unreadCount > 0).length,
      active: enrichedConversations.filter(
        (c) => c.orderStatus && ACTIVE_STATUSES.has(c.orderStatus),
      ).length,
      completed: enrichedConversations.filter(
        (c) => c.orderStatus === "completed" || c.orderStatus === "cancelled",
      ).length,
    };
  }, [enrichedConversations]);

  return {
    ...base,
    enrichedConversations,
    displayedConversations,
    activeFilter,
    setActiveFilter,
    filterCounts,
  };
}
