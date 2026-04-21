"use client";

import { FiFilter, FiX } from "react-icons/fi";
import SearchBar from "./SearchBar";
import { useMarketplaceFilters } from "@/hooks/marketplace/useMarketplaceFilters";
import { useMobileFilters } from "@/hooks/marketplace/useMobileFilters";
import { useMarketplaceSearch } from "@/hooks/marketplace/useMarketplaceSearch";
import { useMarketplaceSorting } from "@/hooks/marketplace/useMarketplaceSorting";
import type { MarketplaceFilters, SortValue } from "@/hooks/marketplace/types";

function ActiveFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded-full border border-(--color-primary) bg-(--color-primary)/12 px-3 py-1 text-xs font-medium text-(--color-primary)"
    >
      <span>{label}</span>
      <FiX className="size-3" />
    </button>
  );
}

export default function MarketplaceHeader() {
  const { query, searching, setQuery, submitQuery, clearQuery } =
    useMarketplaceSearch();
  const { sortBy, setSortBy } = useMarketplaceSorting();
  const { activeFilterChips, removeFilter } = useMarketplaceFilters();
  const { toggleFilters } = useMobileFilters();

  return (
    <header className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-sm md:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-(--text-primary) md:text-3xl">
            Explore Marketplace Services
          </h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Find trusted freelancers for design, development, marketing, and
            more.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFilters}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-(--border-color) bg-(--bg-card) px-3 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg) lg:hidden"
          >
            <FiFilter className="size-4" />
            Filters
          </button>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortValue)}
            className="h-10 rounded-md border border-(--input-border) bg-(--input-bg) px-3 text-sm font-medium text-(--input-text) outline-none focus:border-(--input-border-focus) focus:ring-2 focus:ring-blue-500/20"
            aria-label="Sort services"
          >
            <option value="relevant">Most Relevant</option>
            <option value="price_low">Price Low to High</option>
            <option value="price_high">Price High to Low</option>
            <option value="rated">Best Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <SearchBar
        value={query}
        searching={searching}
        onChange={setQuery}
        onSubmit={submitQuery}
        onClear={clearQuery}
      />

      {activeFilterChips.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeFilterChips.map((chip) => (
            <ActiveFilterChip
              key={chip.key}
              label={chip.label}
              onRemove={() =>
                removeFilter(chip.key as keyof MarketplaceFilters)
              }
            />
          ))}
        </div>
      ) : null}
    </header>
  );
}
