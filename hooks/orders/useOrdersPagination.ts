"use client";

import { useMemo } from "react";
import { setOrdersState, useOrdersStore } from "./store";
import { PAGE_SIZE } from "./types";
import { useOrdersFilters } from "./useOrdersFilters";

export function useOrdersPagination() {
  const currentPage = useOrdersStore((snapshot) => snapshot.currentPage);
  const { filteredOrders } = useOrdersFilters();

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedOrders = useMemo(() => {
    const from = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(from, from + PAGE_SIZE);
  }, [filteredOrders, safeCurrentPage]);

  const setCurrentPage = (value: number | ((prev: number) => number)) => {
    const nextValue =
      typeof value === "function" ? value(safeCurrentPage) : value;
    const bounded = Math.max(1, Math.min(totalPages, nextValue));
    setOrdersState({ currentPage: bounded });
  };

  return {
    currentPage: safeCurrentPage,
    totalPages,
    pagedOrders,
    setCurrentPage,
  };
}
