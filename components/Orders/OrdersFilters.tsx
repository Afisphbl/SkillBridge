import { FiSearch } from "react-icons/fi";
import { useOrdersFilters } from "@/hooks/orders/useOrdersFilters";
import { ORDER_TABS } from "@/hooks/orders/types";

export default function OrdersFilters() {
  const { activeTab, searchQuery, setActiveTab, setSearchQuery } =
    useOrdersFilters();

  return (
    <div className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.7)] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {ORDER_TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex h-9 items-center rounded-full px-3 text-sm font-semibold ${
                  active
                    ? "bg-(--btn-bg-primary) text-(--btn-text-primary)"
                    : "bg-(--bg-secondary) text-(--text-secondary) hover:bg-(--hover-bg)"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-96">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-(--text-muted)" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search order, service, buyer, seller"
            className="h-10 w-full rounded-xl border border-(--border-color) bg-(--bg-card) pl-9 pr-3 text-sm text-(--text-primary) outline-none focus:border-(--border-focus)"
          />
        </div>
      </div>
    </div>
  );
}
