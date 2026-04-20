"use client";

import { useMemo } from "react";
import { useOrdersStore } from "./store";
import { normalizeStatus } from "./types";

export function useOrdersStats() {
  const orders = useOrdersStore((snapshot) => snapshot.orders);

  return useMemo(() => {
    const countBy = (status: "pending" | "completed" | "cancelled") =>
      orders.filter((order) => normalizeStatus(order.status) === status).length;

    return {
      total: orders.length,
      pending: countBy("pending"),
      completed: countBy("completed"),
      cancelled: countBy("cancelled"),
    };
  }, [orders]);
}
