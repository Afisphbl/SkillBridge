"use client";

import { createContext, useContext } from "react";
import { useSettingsPageData } from "@/hooks/settings/useSettingsPageData";

type SettingsPageContextValue = ReturnType<typeof useSettingsPageData>;

const SettingsPageContext = createContext<SettingsPageContextValue | null>(
  null,
);

export function SettingsPageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useSettingsPageData();

  return (
    <SettingsPageContext.Provider value={value}>
      {children}
    </SettingsPageContext.Provider>
  );
}

export function useSettingsPageContext() {
  const context = useContext(SettingsPageContext);
  if (!context) {
    throw new Error(
      "useSettingsPageContext must be used inside SettingsPageProvider",
    );
  }

  return context;
}
