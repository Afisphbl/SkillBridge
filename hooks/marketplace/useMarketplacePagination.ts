"use client";

import { useCallback, useMemo } from "react";
import { getServicesPaginated } from "@/services/supabase/servicesApi";
import { setMarketplaceState, useMarketplaceStore } from "./store";
import { useMarketplaceServices } from "./useMarketplaceServices";
import { useSellerEnrichment } from "./useSellerEnrichment";
import { useSortedServices } from "./useSortedServices";
import { useVisibleServices } from "./useVisibleServices";
import { PAGE_LIMIT } from "./types";
import type { ServiceRecord } from "./types";

export function useMarketplacePagination() {
  const page = useMarketplaceStore((snapshot) => snapshot.page);
  const count = useMarketplaceStore((snapshot) => snapshot.count);
  const loadingMore = useMarketplaceStore((snapshot) => snapshot.loadingMore);
  const resultMode = useMarketplaceStore((snapshot) => snapshot.resultMode);
  const services = useMarketplaceStore((snapshot) => snapshot.services);

  useMarketplaceServices();
  const sortedServices = useSortedServices();
  const visibleServices = useVisibleServices();
  const { enrichServices } = useSellerEnrichment();

  const hasMore = useMemo(() => {
    if (resultMode === "browse") {
      return services.length < count;
    }

    return sortedServices.length > visibleServices.length;
  }, [count, resultMode, services.length, sortedServices.length, visibleServices.length]);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;

    if (resultMode !== "browse") {
      setMarketplaceState((current) => ({
        count: current.count + PAGE_LIMIT,
      }));
      return;
    }

    setMarketplaceState({ loadingMore: true, error: "" });

    try {
      const nextPage = page + 1;
      const { services: nextChunk, error: apiError } =
        await getServicesPaginated(nextPage, PAGE_LIMIT);
      if (apiError) throw apiError;

      const normalized = (nextChunk as ServiceRecord[]) ?? [];
      const enriched = await enrichServices(normalized);

      setMarketplaceState((current) => ({
        services: [...current.services, ...enriched],
        page: nextPage,
      }));
    } catch {
      setMarketplaceState({ error: "Unable to load more services." });
    } finally {
      setMarketplaceState({ loadingMore: false });
    }
  }, [enrichServices, loadingMore, page, resultMode]);

  return {
    page,
    count,
    loadingMore,
    hasMore,
    loadMore,
  };
}
