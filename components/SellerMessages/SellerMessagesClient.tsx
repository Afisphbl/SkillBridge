"use client";

import { SellerMessagesProvider } from "./SellerMessagesProvider";
import SellerMessagesSidebar from "./SellerMessagesSidebar";
import SellerMessagesChatPanel from "./SellerMessagesChatPanel";

export default function SellerMessagesClient() {
  return (
    <SellerMessagesProvider>
      <section className="flex h-[calc(100vh-8.25rem)] overflow-hidden rounded-3xl border border-(--border-color) bg-(--bg-card) shadow-[0_18px_44px_-26px_rgba(15,23,42,0.75)]">
        <div className="flex h-full min-h-0 w-full">
          <SellerMessagesSidebar />
          <SellerMessagesChatPanel />
        </div>
      </section>
    </SellerMessagesProvider>
  );
}
