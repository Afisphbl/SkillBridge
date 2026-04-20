"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { getServices, getServicesByCategory } from "@/services/supabase/servicesApi";
import { useServiceDetails } from "@/hooks/services/useServiceDetails";
import type { ServiceRecord } from "./types";

type RelatedServicesState = {
  services: ServiceRecord[];
  loading: boolean;
  initialized: boolean;
};

const relatedStateByCategory = new Map<string, RelatedServicesState>();
const relatedListenersByCategory = new Map<string, Set<() => void>>();

function getOrCreateState(categoryKey: string): RelatedServicesState {
  const existing = relatedStateByCategory.get(categoryKey);
  if (existing) {
    return existing;
  }

  const nextState: RelatedServicesState = {
    services: [],
    loading: false,
    initialized: false,
  };
  relatedStateByCategory.set(categoryKey, nextState);
  return nextState;
}

function emit(categoryKey: string) {
  const listeners = relatedListenersByCategory.get(categoryKey);
  listeners?.forEach((listener) => listener());
}

function subscribe(categoryKey: string, listener: () => void) {
  const listeners =
    relatedListenersByCategory.get(categoryKey) ?? new Set<() => void>();
  listeners.add(listener);
  relatedListenersByCategory.set(categoryKey, listeners);

  return () => {
    const active = relatedListenersByCategory.get(categoryKey);
    if (!active) return;
    active.delete(listener);
    if (active.size === 0) {
      relatedListenersByCategory.delete(categoryKey);
    }
  };
}

export function useRelatedServices() {
  const { service } = useServiceDetails();
  const category = String(service?.category || "");
  const categoryKey = category || "__all__";

  const snapshot = useSyncExternalStore(
    (listener) => subscribe(categoryKey, listener),
    () => getOrCreateState(categoryKey),
    () => getOrCreateState(categoryKey),
  );

  useEffect(() => {
    const state = getOrCreateState(categoryKey);
    if (state.initialized || state.loading) return;

    state.loading = true;
    state.initialized = true;
    emit(categoryKey);

    const loader = category
      ? getServicesByCategory(category)
      : getServices();

    void loader
      .then(({ services }) => {
        state.loading = false;
        state.services = (services as ServiceRecord[] | null) ?? [];
        emit(categoryKey);
      })
      .catch(() => {
        state.loading = false;
        state.services = [];
        emit(categoryKey);
      });
  }, [category, categoryKey]);

  return useMemo(
    () => ({
      services: snapshot.services,
      loading: snapshot.loading,
    }),
    [snapshot.loading, snapshot.services],
  );
}
