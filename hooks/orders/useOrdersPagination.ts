"use client";

import { useMemo } from "react";
import { setOrdersState, useOrdersStore } from "./store";
import { useOrdersFilters } from "./useOrdersFilters";

export function useOrdersPagination() {
  const currentPage = useOrdersStore((snapshot) => snapshot.currentPage);
  const itemsPerPage = useOrdersStore((snapshot) => snapshot.itemsPerPage);
  const { filteredOrders } = useOrdersFilters();

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / itemsPerPage),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedOrders = useMemo(() => {
    const from = (safeCurrentPage - 1) * itemsPerPage;
    return filteredOrders.slice(from, from + itemsPerPage);
  }, [filteredOrders, itemsPerPage, safeCurrentPage]);

  const setCurrentPage = (value: number | ((prev: number) => number)) => {
    const nextValue =
      typeof value === "function" ? value(safeCurrentPage) : value;
    const bounded = Math.max(1, Math.min(totalPages, nextValue));
    setOrdersState({ currentPage: bounded });
  };

  const setItemsPerPage = (value: number) => {
    const normalized = Number(value);
    const safeValue = Number.isFinite(normalized)
      ? Math.max(5, Math.min(50, Math.round(normalized)))
      : 8;

    setOrdersState({
      itemsPerPage: safeValue,
      currentPage: 1,
    });
  };

  return {
    currentPage: safeCurrentPage,
    totalPages,
    pagedOrders,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
  };
}
