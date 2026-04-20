"use client";

import type { ReactNode } from "react";
import FilterSidebar from "./FilterSidebar";
import { useMarketplaceCategories } from "@/hooks/marketplace/useMarketplaceCategories";
import { useMarketplaceFilters } from "@/hooks/marketplace/useMarketplaceFilters";
import { useMobileFilters } from "@/hooks/marketplace/useMobileFilters";

export default function MarketplaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { categories, subcategories } = useMarketplaceCategories();
  const { filters, updateFilter, clearFilters } = useMarketplaceFilters();
  const { mobileFiltersOpen } = useMobileFilters();

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className={mobileFiltersOpen ? "block" : "hidden lg:block"}>
        <FilterSidebar
          categories={categories}
          subcategories={subcategories}
          filters={filters}
          onFilterChange={updateFilter}
          onClear={clearFilters}
        />
      </div>

      <div className="space-y-5">{children}</div>
    </div>
  );
}
