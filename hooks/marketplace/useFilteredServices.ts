"use client";

import { useMemo } from "react";
import { useMarketplaceStore } from "./store";
import { useMarketplaceFilters } from "./useMarketplaceFilters";
import { normalizeText, toNumber } from "./types";

export function useFilteredServices() {
  const services = useMarketplaceStore((snapshot) => snapshot.services);
  const { filters } = useMarketplaceFilters();

  return useMemo(() => {
    const minPrice = filters.minPrice ? Number(filters.minPrice) : null;
    const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : null;
    const minRating = filters.minRating ? Number(filters.minRating) : null;
    const maxDeliveryDays = filters.deliveryTime
      ? Number(filters.deliveryTime)
      : null;

    return services.filter((service) => {
      const category = normalizeText(service.category);
      const selectedCategory = normalizeText(filters.category);
      if (selectedCategory && category !== selectedCategory) {
        return false;
      }

      const subcategory = normalizeText(service.subcategory);
      const selectedSubcategory = normalizeText(filters.subcategory);
      if (selectedSubcategory && subcategory !== selectedSubcategory) {
        return false;
      }

      const price = toNumber(
        service.price ?? service.base_price ?? service.hourly_rate,
        0,
      );
      if (minPrice !== null && price < minPrice) return false;
      if (maxPrice !== null && price > maxPrice) return false;

      const rating = toNumber(service.average_rating ?? service.rating, 0);
      if (minRating !== null && rating < minRating) return false;

      const delivery = toNumber(service.delivery_days ?? service.delivery_time, 999);
      if (maxDeliveryDays !== null && delivery > maxDeliveryDays) return false;

      const sellerLevel = normalizeText(service.seller_level ?? service.sellerLevel);
      const selectedSellerLevel = normalizeText(filters.sellerLevel);
      if (selectedSellerLevel && sellerLevel !== selectedSellerLevel) {
        return false;
      }

      return true;
    });
  }, [
    filters.category,
    filters.deliveryTime,
    filters.maxPrice,
    filters.minPrice,
    filters.minRating,
    filters.sellerLevel,
    filters.subcategory,
    services,
  ]);
}
