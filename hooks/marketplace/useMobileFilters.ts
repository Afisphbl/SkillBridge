"use client";

import { useCallback } from "react";
import { setMarketplaceState, useMarketplaceStore } from "./store";

export function useMobileFilters() {
  const mobileFiltersOpen = useMarketplaceStore(
    (snapshot) => snapshot.mobileFiltersOpen,
  );

  const toggleFilters = useCallback(() => {
    setMarketplaceState((current) => ({
      mobileFiltersOpen: !current.mobileFiltersOpen,
    }));
  }, []);

  const closeFilters = useCallback(() => {
    setMarketplaceState({ mobileFiltersOpen: false });
  }, []);

  return {
    mobileFiltersOpen,
    toggleFilters,
    closeFilters,
  };
}
