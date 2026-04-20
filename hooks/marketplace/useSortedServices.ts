"use client";

import { useMemo } from "react";
import { useFilteredServices } from "./useFilteredServices";
import { useMarketplaceSorting } from "./useMarketplaceSorting";
import { toNumber } from "./types";

export function useSortedServices() {
  const filteredServices = useFilteredServices();
  const { sortBy } = useMarketplaceSorting();

  return useMemo(() => {
    const sorted = [...filteredServices];

    if (sortBy === "price_low") {
      sorted.sort(
        (a, b) =>
          toNumber(a.price ?? a.base_price ?? a.hourly_rate, 0) -
          toNumber(b.price ?? b.base_price ?? b.hourly_rate, 0),
      );
    }

    if (sortBy === "price_high") {
      sorted.sort(
        (a, b) =>
          toNumber(b.price ?? b.base_price ?? b.hourly_rate, 0) -
          toNumber(a.price ?? a.base_price ?? a.hourly_rate, 0),
      );
    }

    if (sortBy === "rated") {
      sorted.sort(
        (a, b) =>
          toNumber(b.average_rating ?? b.rating, 0) -
          toNumber(a.average_rating ?? a.rating, 0),
      );
    }

    if (sortBy === "newest") {
      sorted.sort(
        (a, b) =>
          new Date(String(b.created_at ?? 0)).getTime() -
          new Date(String(a.created_at ?? 0)).getTime(),
      );
    }

    return sorted;
  }, [filteredServices, sortBy]);
}
