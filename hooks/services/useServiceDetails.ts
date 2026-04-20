"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import { getServiceById } from "@/services/supabase/servicesApi";
import type { ServiceRecord } from "./types";

type ServiceDetailsState = {
  service: ServiceRecord | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
};

const serviceStateById = new Map<string, ServiceDetailsState>();
const serviceListenersById = new Map<string, Set<() => void>>();

function getOrCreateState(serviceId: string): ServiceDetailsState {
  const existing = serviceStateById.get(serviceId);
  if (existing) {
    return existing;
  }

  const nextState: ServiceDetailsState = {
    service: null,
    loading: false,
    error: null,
    initialized: false,
  };
  serviceStateById.set(serviceId, nextState);
  return nextState;
}

function emit(serviceId: string) {
  const listeners = serviceListenersById.get(serviceId);
  listeners?.forEach((listener) => listener());
}

function subscribe(serviceId: string, listener: () => void) {
  const listeners = serviceListenersById.get(serviceId) ?? new Set<() => void>();
  listeners.add(listener);
  serviceListenersById.set(serviceId, listeners);

  return () => {
    const active = serviceListenersById.get(serviceId);
    if (!active) return;
    active.delete(listener);
    if (active.size === 0) {
      serviceListenersById.delete(serviceId);
    }
  };
}

function extractServiceId(rawId: string | string[] | undefined) {
  if (Array.isArray(rawId)) {
    return rawId[0] ?? "";
  }

  return rawId ?? "";
}

export function useServiceDetails() {
  const params = useParams<{ id?: string | string[] }>();
  const serviceId = extractServiceId(params?.id);

  const snapshot = useSyncExternalStore(
    (listener) => {
      if (!serviceId) {
        return () => {};
      }
      return subscribe(serviceId, listener);
    },
    () => (serviceId ? getOrCreateState(serviceId) : null),
    () => null,
  );

  useEffect(() => {
    if (!serviceId) return;

    const state = getOrCreateState(serviceId);
    if (state.initialized || state.loading) return;

    state.loading = true;
    state.initialized = true;
    state.error = null;
    emit(serviceId);

    void getServiceById(serviceId)
      .then(({ service, error }) => {
        state.loading = false;
        if (error || !service) {
          state.error = error?.message || "Service not found.";
          state.service = null;
          emit(serviceId);
          return;
        }

        state.error = null;
        state.service = service as ServiceRecord;
        emit(serviceId);
      })
      .catch(() => {
        state.loading = false;
        state.error = "Failed to load service.";
        state.service = null;
        emit(serviceId);
      });
  }, [serviceId]);

  return useMemo(
    () => ({
      serviceId,
      service: snapshot?.service ?? null,
      loading: serviceId ? (snapshot?.loading ?? true) : false,
      error: snapshot?.error ?? null,
    }),
    [serviceId, snapshot?.error, snapshot?.loading, snapshot?.service],
  );
}
