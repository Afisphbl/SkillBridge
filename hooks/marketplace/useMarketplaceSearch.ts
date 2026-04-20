"use client";

import { useCallback, useEffect } from "react";
import { setMarketplaceState, useMarketplaceStore } from "./store";

export function useMarketplaceSearch() {
  const query = useMarketplaceStore((snapshot) => snapshot.query);
  const debouncedQuery = useMarketplaceStore(
    (snapshot) => snapshot.debouncedQuery,
  );
  const searching = useMarketplaceStore((snapshot) => snapshot.searching);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMarketplaceState({ debouncedQuery: query.trim() });
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  const setQuery = useCallback((value: string) => {
    setMarketplaceState({ query: value });
  }, []);

  const clearQuery = useCallback(() => {
    setMarketplaceState({ query: "" });
  }, []);

  return {
    query,
    debouncedQuery,
    searching,
    setQuery,
    clearQuery,
  };
}
