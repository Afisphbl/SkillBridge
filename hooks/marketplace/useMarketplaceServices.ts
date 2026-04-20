"use client";

import { useEffect } from "react";
import {
  getServicesByCategory,
  getServicesPaginated,
  searchServices,
} from "@/services/supabase/servicesApi";
import { setMarketplaceState, useMarketplaceStore } from "./store";
import { useMarketplaceFilters } from "./useMarketplaceFilters";
import { useMarketplaceSearch } from "./useMarketplaceSearch";
import { useSellerEnrichment } from "./useSellerEnrichment";
import { PAGE_LIMIT } from "./types";
import type { ServiceRecord } from "./types";

export function useMarketplaceServices() {
  const services = useMarketplaceStore((snapshot) => snapshot.services);
  const loading = useMarketplaceStore((snapshot) => snapshot.loading);
  const error = useMarketplaceStore((snapshot) => snapshot.error);
  const resultMode = useMarketplaceStore((snapshot) => snapshot.resultMode);
  const count = useMarketplaceStore((snapshot) => snapshot.count);

  const { debouncedQuery } = useMarketplaceSearch();
  const { filters } = useMarketplaceFilters();
  const { enrichServices } = useSellerEnrichment();

  useEffect(() => {
    let active = true;

    async function runFetch() {
      setMarketplaceState({
        error: "",
        loading: true,
      });

      try {
        if (debouncedQuery) {
          setMarketplaceState({ searching: true });
          const { services: data, error: apiError } =
            await searchServices(debouncedQuery);
          if (apiError) throw apiError;
          if (!active) return;

          const enriched = await enrichServices((data as ServiceRecord[]) ?? []);
          if (!active) return;

          setMarketplaceState({
            resultMode: "search",
            services: enriched,
            count: enriched.length,
            page: 1,
          });
          return;
        }

        if (filters.category) {
          const { services: data, error: apiError } =
            await getServicesByCategory(filters.category);
          if (apiError) throw apiError;
          if (!active) return;

          const enriched = await enrichServices((data as ServiceRecord[]) ?? []);
          if (!active) return;

          setMarketplaceState({
            resultMode: "category",
            services: enriched,
            count: enriched.length,
            page: 1,
          });
          return;
        }

        const {
          services: paginated,
          error: apiError,
          count: total,
        } = await getServicesPaginated(1, PAGE_LIMIT);
        if (apiError) throw apiError;
        if (!active) return;

        const enriched = await enrichServices(
          (paginated as ServiceRecord[]) ?? [],
        );
        if (!active) return;

        setMarketplaceState({
          resultMode: "browse",
          services: enriched,
          count: total ?? 0,
          page: 1,
        });
      } catch {
        if (!active) return;

        setMarketplaceState({
          error: "Unable to load services right now. Please try again.",
          services: [],
          count: 0,
        });
      } finally {
        if (!active) return;

        setMarketplaceState({
          loading: false,
          searching: false,
        });
      }
    }

    void runFetch();

    return () => {
      active = false;
    };
  }, [debouncedQuery, enrichServices, filters.category]);

  return {
    services,
    loading,
    error,
    resultMode,
    count,
  };
}
