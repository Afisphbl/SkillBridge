"use client";

import { useMemo } from "react";
import { useServiceDetails } from "@/hooks/services/useServiceDetails";
import { toNumber } from "./types";

export function useServiceViews() {
  const { service } = useServiceDetails();

  return useMemo(() => {
    const rawViews = toNumber(service?.views_count ?? service?.view_count, 0);
    return {
      viewCount: rawViews > 0 ? rawViews : undefined,
    };
  }, [service?.view_count, service?.views_count]);
}
