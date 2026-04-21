"use client";

import { useOrdersFilters } from "@/hooks/orders/useOrdersFilters";
import { ORDER_TABS, type StatusTab } from "@/hooks/orders/types";

export default function SellerOrdersTabs() {
  const { activeTab, setActiveTab } = useOrdersFilters();

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-(--border-color)">
      {ORDER_TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key as StatusTab)}
          className={`relative px-4 py-3 text-sm font-bold transition-all ${
            activeTab === tab.key
              ? "text-(--btn-bg-primary)"
              : "text-(--text-muted) hover:text-(--text-primary)"
          }`}
        >
          {tab.label}
          {activeTab === tab.key && (
            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-(--btn-bg-primary)" />
          )}
        </button>
      ))}
    </div>
  );
}
