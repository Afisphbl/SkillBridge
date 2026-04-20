"use client";

import { useSyncExternalStore } from "react";
import type {
  MarketplaceFilters,
  ResultMode,
  ServiceRecord,
  SortValue,
} from "./types";
import { INITIAL_FILTERS } from "./types";

type MarketplaceState = {
  query: string;
  debouncedQuery: string;
  searching: boolean;
  sortBy: SortValue;
  filters: MarketplaceFilters;
  services: ServiceRecord[];
  loading: boolean;
  error: string;
  page: number;
  count: number;
  resultMode: ResultMode;
  loadingMore: boolean;
  mobileFiltersOpen: boolean;
};

const state: MarketplaceState = {
  query: "",
  debouncedQuery: "",
  searching: false,
  sortBy: "relevant",
  filters: INITIAL_FILTERS,
  services: [],
  loading: true,
  error: "",
  page: 1,
  count: 0,
  resultMode: "browse",
  loadingMore: false,
  mobileFiltersOpen: false,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useMarketplaceStore<T>(selector: (snapshot: MarketplaceState) => T) {
  return useSyncExternalStore(
    subscribe,
    () => selector(getSnapshot()),
    () => selector(getSnapshot()),
  );
}

export function setMarketplaceState(
  patch:
    | Partial<MarketplaceState>
    | ((current: MarketplaceState) => Partial<MarketplaceState>),
) {
  const nextPatch = typeof patch === "function" ? patch(state) : patch;
  Object.assign(state, nextPatch);
  emit();
}
