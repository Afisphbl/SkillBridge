"use client";

import MessagesInboxChatPanel from "./inbox/MessagesInboxChatPanel";
import { MessagesInboxProvider } from "./inbox/MessagesInboxProvider";
import MessagesInboxSidebar from "./inbox/MessagesInboxSidebar";

export default function MessagesInboxClient() {
  return (
    <MessagesInboxProvider>
      <section className="flex h-[calc(100vh-8.25rem)] flex-col overflow-hidden rounded-3xl border border-(--border-color) bg-(--bg-card) shadow-[0_18px_44px_-26px_rgba(15,23,42,0.75)]">
        <div className="flex h-full min-h-0">
          <MessagesInboxSidebar />
          <MessagesInboxChatPanel />
        </div>
      </section>
    </MessagesInboxProvider>
  );
}
