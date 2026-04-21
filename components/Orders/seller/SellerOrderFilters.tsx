"use client";

import { FiSearch, FiFilter, FiXCircle } from "react-icons/fi";
import { useOrdersFilters } from "@/hooks/orders/useOrdersFilters";

export default function SellerOrderFilters() {
  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    sellerFilters,
    setSellerFilters,
    clearFilters,
  } = useOrdersFilters();

  const hasAdvancedFilters =
    sellerFilters.status !== "all" ||
    sellerFilters.createdFrom ||
    sellerFilters.createdTo ||
    sellerFilters.deliveryFrom ||
    sellerFilters.deliveryTo ||
    sellerFilters.minPrice ||
    sellerFilters.maxPrice ||
    sellerFilters.sortBy !== "newest";

  const showClear = Boolean(
    searchQuery || activeTab !== "all" || hasAdvancedFilters,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, buyer, or service..."
            className="h-12 w-full rounded-2xl border border-(--border-color) bg-(--bg-card) pl-11 pr-4 text-sm font-medium focus:border-(--btn-bg-primary) focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          {showClear && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-2 h-12 px-5 rounded-2xl border border-red-100 bg-red-50 text-sm font-bold text-red-600 hover:bg-red-100 transition-colors shadow-sm"
            >
              <FiXCircle className="size-4" />
              <span>Clear</span>
            </button>
          )}
          <div className="flex items-center gap-2 h-12 px-4 rounded-2xl border border-(--border-color) bg-(--bg-card) text-sm font-bold text-(--text-secondary) shadow-sm">
            <FiFilter className="size-4" />
            <span>Advanced Filters</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="flex flex-col gap-1.5 text-xs font-bold text-(--text-muted)">
          Status
          <select
            value={sellerFilters.status}
            onChange={(event) =>
              setSellerFilters({
                status: event.target.value as typeof sellerFilters.status,
              })
            }
            className="h-10 rounded-xl border border-(--border-color) bg-(--bg-card) px-3 text-sm font-semibold text-(--text-primary)"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="delivered">Delivered</option>
            <option value="revision_requested">Revision Requested</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-bold text-(--text-muted)">
          Sort
          <select
            value={sellerFilters.sortBy}
            onChange={(event) =>
              setSellerFilters({
                sortBy: event.target.value as typeof sellerFilters.sortBy,
              })
            }
            className="h-10 rounded-xl border border-(--border-color) bg-(--bg-card) px-3 text-sm font-semibold text-(--text-primary)"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest_price">Highest price</option>
            <option value="nearest_deadline">Nearest deadline</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-bold text-(--text-muted)">
          Order Date From
          <input
            type="date"
            value={sellerFilters.createdFrom}
            onChange={(event) =>
              setSellerFilters({ createdFrom: event.target.value })
            }
            className="h-10 rounded-xl border border-(--border-color) bg-(--bg-card) px-3 text-sm font-semibold text-(--text-primary)"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-bold text-(--text-muted)">
          Order Date To
          <input
            type="date"
            value={sellerFilters.createdTo}
            onChange={(event) =>
              setSellerFilters({ createdTo: event.target.value })
            }
            className="h-10 rounded-xl border border-(--border-color) bg-(--bg-card) px-3 text-sm font-semibold text-(--text-primary)"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-bold text-(--text-muted)">
          Delivery From
          <input
            type="date"
            value={sellerFilters.deliveryFrom}
            onChange={(event) =>
              setSellerFilters({ deliveryFrom: event.target.value })
            }
            className="h-10 rounded-xl border border-(--border-color) bg-(--bg-card) px-3 text-sm font-semibold text-(--text-primary)"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-bold text-(--text-muted)">
          Delivery To
          <input
            type="date"
            value={sellerFilters.deliveryTo}
            onChange={(event) =>
              setSellerFilters({ deliveryTo: event.target.value })
            }
            className="h-10 rounded-xl border border-(--border-color) bg-(--bg-card) px-3 text-sm font-semibold text-(--text-primary)"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-bold text-(--text-muted)">
          Min Price
          <input
            type="number"
            min="0"
            value={sellerFilters.minPrice}
            onChange={(event) =>
              setSellerFilters({ minPrice: event.target.value })
            }
            placeholder="0"
            className="h-10 rounded-xl border border-(--border-color) bg-(--bg-card) px-3 text-sm font-semibold text-(--text-primary)"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-bold text-(--text-muted)">
          Max Price
          <input
            type="number"
            min="0"
            value={sellerFilters.maxPrice}
            onChange={(event) =>
              setSellerFilters({ maxPrice: event.target.value })
            }
            placeholder="5000"
            className="h-10 rounded-xl border border-(--border-color) bg-(--bg-card) px-3 text-sm font-semibold text-(--text-primary)"
          />
        </label>
      </div>
    </div>
  );
}
