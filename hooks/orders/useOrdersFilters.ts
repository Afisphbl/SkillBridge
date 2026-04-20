"use client";

import { useMemo } from "react";
import { setOrdersState, useOrdersStore } from "./store";
import { normalizeStatus, type StatusTab } from "./types";

export function useOrdersFilters() {
  const orders = useOrdersStore((snapshot) => snapshot.orders);
  const activeTab = useOrdersStore((snapshot) => snapshot.activeTab);
  const searchQuery = useOrdersStore((snapshot) => snapshot.searchQuery);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
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
  }, [activeTab, orders, searchQuery]);

  const setActiveTab = (tab: StatusTab) => {
    setOrdersState({
      activeTab: tab,
      currentPage: 1,
    });
  };

  const setSearchQuery = (query: string) => {
    setOrdersState({
      searchQuery: query,
      currentPage: 1,
    });
  };

  return {
    activeTab,
    searchQuery,
    filteredOrders,
    setActiveTab,
    setSearchQuery,
  };
}
