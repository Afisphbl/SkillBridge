"use client";

import { useMemo } from "react";
import { useMarketplaceStore } from "./store";
import { useSortedServices } from "./useSortedServices";
import { PAGE_LIMIT } from "./types";

export function useVisibleServices() {
  const resultMode = useMarketplaceStore((snapshot) => snapshot.resultMode);
  const count = useMarketplaceStore((snapshot) => snapshot.count);
  const sortedServices = useSortedServices();

  return useMemo(() => {
    if (resultMode === "browse") {
      return sortedServices;
    }

    return sortedServices.slice(0, count || PAGE_LIMIT);
  }, [count, resultMode, sortedServices]);
}
