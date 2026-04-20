"use client";

import { useCallback, useMemo } from "react";
import { setMarketplaceState, useMarketplaceStore } from "./store";
import type { MarketplaceFilters } from "./types";
import { INITIAL_FILTERS } from "./types";

export function useMarketplaceFilters() {
  const filters = useMarketplaceStore((snapshot) => snapshot.filters);

  const updateFilter = useCallback(
    <K extends keyof MarketplaceFilters>(
      key: K,
      value: MarketplaceFilters[K],
    ) => {
      setMarketplaceState((current) => {
        if (key === "category") {
          return {
            filters: {
              ...current.filters,
              category: value,
              subcategory: "",
            },
          };
        }

        return {
          filters: {
            ...current.filters,
            [key]: value,
          },
        };
      });
    },
    [],
  );

  const removeFilter = useCallback((key: keyof MarketplaceFilters) => {
    setMarketplaceState((current) => ({
      filters: {
        ...current.filters,
        [key]: "",
      },
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setMarketplaceState({ filters: INITIAL_FILTERS });
  }, []);

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: keyof MarketplaceFilters; label: string }> = [];

    if (filters.category) {
      chips.push({ key: "category", label: `Category: ${filters.category}` });
    }

    if (filters.subcategory) {
      chips.push({
        key: "subcategory",
        label: `Subcategory: ${filters.subcategory}`,
      });
    }

    if (filters.minPrice) {
      chips.push({ key: "minPrice", label: `Min: $${filters.minPrice}` });
    }

    if (filters.maxPrice) {
      chips.push({ key: "maxPrice", label: `Max: $${filters.maxPrice}` });
    }

    if (filters.minRating) {
      chips.push({ key: "minRating", label: `Rating: ${filters.minRating}+` });
    }

    if (filters.deliveryTime) {
      chips.push({
        key: "deliveryTime",
        label: `Delivery: ${filters.deliveryTime}d`,
      });
    }

    if (filters.sellerLevel) {
      chips.push({
        key: "sellerLevel",
        label: `Seller: ${filters.sellerLevel}`,
      });
    }

    return chips;
  }, [
    filters.category,
    filters.deliveryTime,
    filters.maxPrice,
    filters.minPrice,
    filters.minRating,
    filters.sellerLevel,
    filters.subcategory,
  ]);

  return {
    filters,
    updateFilter,
    removeFilter,
    clearFilters,
    activeFilterChips,
  };
}
