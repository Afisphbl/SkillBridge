"use client";

import { useSyncExternalStore } from "react";
import type {
  EnrichedOrder,
  SellerOrdersFilterState,
  StatusTab,
  UserRole,
} from "./types";

type OrdersState = {
  orders: EnrichedOrder[];
  isLoading: boolean;
  activeTab: StatusTab;
  searchQuery: string;
  sellerFilters: SellerOrdersFilterState;
  currentPage: number;
  itemsPerPage: number;
  role: UserRole;
  currentUserId: string;
  errorMessage: string;
};

const state: OrdersState = {
  orders: [],
  isLoading: true,
  activeTab: "all",
  searchQuery: "",
  sellerFilters: {
    status: "all",
    createdFrom: "",
    createdTo: "",
    deliveryFrom: "",
    deliveryTo: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "newest",
  },
  currentPage: 1,
  itemsPerPage: 8,
  role: "buyer",
  currentUserId: "",
  errorMessage: "",
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

export function useOrdersStore<T>(selector: (snapshot: OrdersState) => T) {
  return useSyncExternalStore(
    subscribe,
    () => selector(getSnapshot()),
    () => selector(getSnapshot()),
  );
}

export function setOrdersState(
  patch:
    | Partial<OrdersState>
    | ((current: OrdersState) => Partial<OrdersState>),
) {
  const nextPatch = typeof patch === "function" ? patch(state) : patch;
  Object.assign(state, nextPatch);
  emit();
}
