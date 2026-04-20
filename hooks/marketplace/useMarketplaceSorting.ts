"use client";

import { useCallback } from "react";
import { setMarketplaceState, useMarketplaceStore } from "./store";
import type { SortValue } from "./types";

export function useMarketplaceSorting() {
  const sortBy = useMarketplaceStore((snapshot) => snapshot.sortBy);

  const setSortBy = useCallback((value: SortValue) => {
    setMarketplaceState({ sortBy: value });
  }, []);

  return {
    sortBy,
    setSortBy,
  };
}
