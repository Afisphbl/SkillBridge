"use client";

import { useMemo } from "react";
import { setOrdersState, useOrdersStore } from "./store";
import {
  normalizeStatus,
  type SellerOrdersFilterState,
  type StatusTab,
} from "./types";

function matchesDateRange(
  value: string | null | undefined,
  from: string,
  to: string,
) {
  if (!from && !to) return true;
  if (!value) return false;

  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return false;

  const fromTs = from ? new Date(from).getTime() : Number.NEGATIVE_INFINITY;
  const toTs = to
    ? new Date(`${to}T23:59:59.999`).getTime()
    : Number.POSITIVE_INFINITY;

  return ts >= fromTs && ts <= toTs;
}

function toNumber(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function bySort(
  left: {
    created_at?: string | null;
    price?: number | null;
    delivery_date?: string | null;
  },
  right: {
    created_at?: string | null;
    price?: number | null;
    delivery_date?: string | null;
  },
  sortBy: SellerOrdersFilterState["sortBy"],
) {
  if (sortBy === "oldest") {
    return (
      new Date(left.created_at || 0).getTime() -
      new Date(right.created_at || 0).getTime()
    );
  }

  if (sortBy === "highest_price") {
    return (right.price || 0) - (left.price || 0);
  }

  if (sortBy === "nearest_deadline") {
    const leftTs = left.delivery_date
      ? new Date(left.delivery_date).getTime()
      : Number.POSITIVE_INFINITY;
    const rightTs = right.delivery_date
      ? new Date(right.delivery_date).getTime()
      : Number.POSITIVE_INFINITY;
    return leftTs - rightTs;
  }

  return (
    new Date(right.created_at || 0).getTime() -
    new Date(left.created_at || 0).getTime()
  );
}

export function useOrdersFilters() {
  const orders = useOrdersStore((snapshot) => snapshot.orders);
  const activeTab = useOrdersStore((snapshot) => snapshot.activeTab);
  const searchQuery = useOrdersStore((snapshot) => snapshot.searchQuery);
  const sellerFilters = useOrdersStore((snapshot) => snapshot.sellerFilters);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const minPrice = toNumber(sellerFilters.minPrice);
    const maxPrice = toNumber(sellerFilters.maxPrice);

    return orders
      .filter((order) => {
        const statusMatch =
          activeTab === "all"
            ? sellerFilters.status === "all" ||
              normalizeStatus(order.status) === sellerFilters.status
            : normalizeStatus(order.status) === activeTab;
        if (!statusMatch) return false;

        if (
          !matchesDateRange(
            order.created_at,
            sellerFilters.createdFrom,
            sellerFilters.createdTo,
          )
        ) {
          return false;
        }

        if (
          !matchesDateRange(
            order.delivery_date,
            sellerFilters.deliveryFrom,
            sellerFilters.deliveryTo,
          )
        ) {
          return false;
        }

        const orderPrice = Number(order.price || 0);
        if (minPrice !== null && orderPrice < minPrice) return false;
        if (maxPrice !== null && orderPrice > maxPrice) return false;

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
      })
      .sort((left, right) => bySort(left, right, sellerFilters.sortBy));
  }, [activeTab, orders, searchQuery, sellerFilters]);

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

  const clearFilters = () => {
    setOrdersState({
      activeTab: "all",
      searchQuery: "",
      sellerFilters: {
        status: "all",
        createdFrom: "",
        createdTo: "",
        deliveryFrom: "",
        deliveryTo: "",
        minPrice: "",
        maxPrice: "",
        sortBy: "newest",
      },
      currentPage: 1,
    });
  };

  const setSellerFilters = (
    patch:
      | Partial<SellerOrdersFilterState>
      | ((prev: SellerOrdersFilterState) => Partial<SellerOrdersFilterState>),
  ) => {
    setOrdersState((current) => {
      const nextPatch =
        typeof patch === "function" ? patch(current.sellerFilters) : patch;

      return {
        sellerFilters: {
          ...current.sellerFilters,
          ...nextPatch,
        },
        currentPage: 1,
      };
    });
  };

  return {
    activeTab,
    searchQuery,
    sellerFilters,
    filteredOrders,
    setActiveTab,
    setSearchQuery,
    setSellerFilters,
    clearFilters,
  };
}
