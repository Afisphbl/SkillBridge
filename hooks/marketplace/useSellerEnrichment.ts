"use client";

import { useCallback } from "react";
import { getUsersByIds } from "@/services/supabase/userApi";
import type { ServiceRecord, UserProfile } from "./types";

export function useSellerEnrichment() {
  const enrichServices = useCallback(
    async (items: ServiceRecord[]): Promise<ServiceRecord[]> => {
      const sellerIds = Array.from(
        new Set(
          items
            .map((service) => String(service.seller_id ?? "").trim())
            .filter(Boolean),
        ),
      );

      if (sellerIds.length === 0) return items;

      const { users } = await getUsersByIds(sellerIds);
      const sellerMap = new Map(
        ((users as Array<{ id?: string } & UserProfile> | null) ?? [])
          .map((user) => [String(user.id ?? ""), user] as const)
          .filter(([id]) => Boolean(id)),
      );

      return items.map((service) => {
        const sellerId = String(service.seller_id ?? "").trim();
        const profile =
          (sellerMap.get(sellerId) as UserProfile | undefined) ?? null;
        const fallbackName = profile?.email?.split("@")[0] ?? "";

        return {
          ...service,
          seller_name:
            String(service.seller_name ?? "").trim() ||
            String(profile?.full_name ?? "").trim() ||
            fallbackName,
          seller_avatar:
            String(service.seller_avatar ?? "").trim() ||
            String(profile?.avatar ?? "").trim(),
        };
      });
    },
    [],
  );

  return {
    enrichServices,
  };
}
