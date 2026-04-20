"use client";

import { createContext, useContext } from "react";
import { useOrderFormModalData } from "@/hooks/orders/useOrderFormModalData";

type OrderFormModalContextValue = ReturnType<typeof useOrderFormModalData>;

const OrderFormModalContext = createContext<OrderFormModalContextValue | null>(
  null,
);

export function OrderFormModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useOrderFormModalData();

  return (
    <OrderFormModalContext.Provider value={value}>
      {children}
    </OrderFormModalContext.Provider>
  );
}

export function useOrderFormModalContext() {
  const context = useContext(OrderFormModalContext);

  if (!context) {
    throw new Error(
      "useOrderFormModalContext must be used inside OrderFormModalProvider",
    );
  }

  return context;
}
