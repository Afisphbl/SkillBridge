"use client";

import { createContext, useContext } from "react";
import { useBuyerDashboardData } from "@/hooks/dashboard/useBuyerDashboardData";

type BuyerDashboardContextValue = ReturnType<typeof useBuyerDashboardData>;

const BuyerDashboardContext = createContext<BuyerDashboardContextValue | null>(
  null,
);

export function BuyerDashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useBuyerDashboardData();

  return (
    <BuyerDashboardContext.Provider value={value}>
      {children}
    </BuyerDashboardContext.Provider>
  );
}

export function useBuyerDashboardContext() {
  const context = useContext(BuyerDashboardContext);
  if (!context) {
    throw new Error(
      "useBuyerDashboardContext must be used inside BuyerDashboardProvider",
    );
  }

  return context;
}
