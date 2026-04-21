"use client";

import { createContext, useContext } from "react";
import { useSellerDashboardData } from "@/hooks/dashboard/useSellerDashboardData";

type SellerDashboardContextValue = ReturnType<typeof useSellerDashboardData>;

const SellerDashboardContext = createContext<SellerDashboardContextValue | null>(null);

export function SellerDashboardProvider({ children }: { children: React.ReactNode }) {
  const value = useSellerDashboardData();
  return (
    <SellerDashboardContext.Provider value={value}>
      {children}
    </SellerDashboardContext.Provider>
  );
}

export function useSellerDashboardContext() {
  const ctx = useContext(SellerDashboardContext);
  if (!ctx) throw new Error("useSellerDashboardContext must be used inside SellerDashboardProvider");
  return ctx;
}
