"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { setMarketplaceState, useMarketplaceStore } from "./store";

export function useMarketplaceSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const query = useMarketplaceStore((snapshot) => snapshot.query);
  const debouncedQuery = useMarketplaceStore(
    (snapshot) => snapshot.debouncedQuery,
  );
  const searching = useMarketplaceStore((snapshot) => snapshot.searching);

  const syncQueryToUrl = useCallback(
    (value: string, method: "push" | "replace") => {
      const trimmedQuery = value.trim();
      const currentParams = new URLSearchParams(window.location.search);

      if (trimmedQuery) {
        currentParams.set("q", trimmedQuery);
      } else {
        currentParams.delete("q");
      }

      const nextSearch = currentParams.toString();
      const nextHref = nextSearch ? `${pathname}?${nextSearch}` : pathname;

      setMarketplaceState({
        debouncedQuery: trimmedQuery,
        searching: Boolean(trimmedQuery),
      });

      if (method === "replace") {
        router.replace(nextHref, { scroll: false });
        return;
      }

      router.push(nextHref, { scroll: false });
    },
    [pathname, router],
  );

  const setQuery = useCallback((value: string) => {
    setMarketplaceState({ query: value });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim() === debouncedQuery) {
        return;
      }

      syncQueryToUrl(query, "replace");
    }, 350);

    return () => clearTimeout(timeout);
  }, [debouncedQuery, query, syncQueryToUrl]);

  const submitQuery = useCallback(
    (value = query) => {
      syncQueryToUrl(value, "push");
    },
    [query, syncQueryToUrl],
  );

  const clearQuery = useCallback(() => {
    setMarketplaceState({ query: "" });
    syncQueryToUrl("", "replace");
  }, [syncQueryToUrl]);

  return {
    query,
    debouncedQuery,
    searching,
    setQuery,
    submitQuery,
    clearQuery,
  };
}
