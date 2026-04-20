"use client";

import { createContext, useContext } from "react";
import { useMessagesInboxData } from "@/hooks/messages/useMessagesInboxData";

type MessagesInboxContextValue = ReturnType<typeof useMessagesInboxData>;

const MessagesInboxContext = createContext<MessagesInboxContextValue | null>(
  null,
);

export function MessagesInboxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useMessagesInboxData();

  return (
    <MessagesInboxContext.Provider value={value}>
      {children}
    </MessagesInboxContext.Provider>
  );
}

export function useMessagesInboxContext() {
  const context = useContext(MessagesInboxContext);
  if (!context) {
    throw new Error(
      "useMessagesInboxContext must be used inside MessagesInboxProvider",
    );
  }

  return context;
}
