"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { getUserById } from "@/services/supabase/userApi";
import { useServiceDetails } from "@/hooks/services/useServiceDetails";
import type { SellerProfile } from "./types";

type SellerState = {
  seller: SellerProfile | null;
  loading: boolean;
  initialized: boolean;
};

const sellerStateById = new Map<string, SellerState>();
const sellerListenersById = new Map<string, Set<() => void>>();

function getOrCreateState(sellerId: string): SellerState {
  const existing = sellerStateById.get(sellerId);
  if (existing) {
    return existing;
  }

  const nextState: SellerState = {
    seller: null,
    loading: false,
    initialized: false,
  };
  sellerStateById.set(sellerId, nextState);
  return nextState;
}

function emit(sellerId: string) {
  const listeners = sellerListenersById.get(sellerId);
  listeners?.forEach((listener) => listener());
}

function subscribe(sellerId: string, listener: () => void) {
  const listeners = sellerListenersById.get(sellerId) ?? new Set<() => void>();
  listeners.add(listener);
  sellerListenersById.set(sellerId, listeners);

  return () => {
    const active = sellerListenersById.get(sellerId);
    if (!active) return;
    active.delete(listener);
    if (active.size === 0) {
      sellerListenersById.delete(sellerId);
    }
  };
}

export function useSellerProfile() {
  const { service } = useServiceDetails();
  const sellerId = String(service?.seller_id || "");

  const snapshot = useSyncExternalStore(
    (listener) => {
      if (!sellerId) {
        return () => {};
      }
      return subscribe(sellerId, listener);
    },
    () => (sellerId ? getOrCreateState(sellerId) : null),
    () => null,
  );

  useEffect(() => {
    if (!sellerId) return;

    const state = getOrCreateState(sellerId);
    if (state.initialized || state.loading) return;

    state.loading = true;
    state.initialized = true;
    emit(sellerId);

    void getUserById(sellerId)
      .then(({ data }) => {
        state.loading = false;
        state.seller = (data as SellerProfile | null) ?? null;
        emit(sellerId);
      })
      .catch(() => {
        state.loading = false;
        state.seller = null;
        emit(sellerId);
      });
  }, [sellerId]);

  return useMemo(
    () => ({
      seller: snapshot?.seller ?? null,
      loading: sellerId ? (snapshot?.loading ?? true) : false,
    }),
    [sellerId, snapshot?.loading, snapshot?.seller],
  );
}
