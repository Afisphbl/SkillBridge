"use client";

import { useOrdersLifecycle } from "@/hooks/orders/useOrdersData";

type OrdersDataControllerProps = {
  roleScope?: "buyer" | "seller";
};

export default function OrdersDataController({ roleScope }: OrdersDataControllerProps) {
  useOrdersLifecycle(roleScope);
  return null;
}
