"use client";

import { createContext, useContext } from "react";
import {
  useSellerMessagesData,
} from "@/hooks/messages/useSellerMessagesData";

type SellerMessagesContextValue = ReturnType<typeof useSellerMessagesData>;

const SellerMessagesContext = createContext<SellerMessagesContextValue | null>(null);

export function SellerMessagesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useSellerMessagesData();
  return (
    <SellerMessagesContext.Provider value={value}>
      {children}
    </SellerMessagesContext.Provider>
  );
}

export function useSellerMessagesContext() {
  const ctx = useContext(SellerMessagesContext);
  if (!ctx) {
    throw new Error(
      "useSellerMessagesContext must be used inside SellerMessagesProvider",
    );
  }
  return ctx;
}
