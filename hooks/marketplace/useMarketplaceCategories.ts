"use client";

import { useMemo } from "react";
import { useMarketplaceStore } from "./store";
import { DEFAULT_CATEGORIES } from "./types";

export function useMarketplaceCategories() {
  const services = useMarketplaceStore((snapshot) => snapshot.services);

  const categories = useMemo(() => {
    const fromData = services
      .map((service) => String(service.category ?? "").trim())
      .filter(Boolean);

    return Array.from(new Set([...DEFAULT_CATEGORIES, ...fromData]));
  }, [services]);

  const subcategories = useMemo(() => {
    return Array.from(
      new Set(
        services
          .map((service) => String(service.subcategory ?? "").trim())
          .filter(Boolean),
      ),
    );
  }, [services]);

  return {
    categories,
    subcategories,
  };
}
