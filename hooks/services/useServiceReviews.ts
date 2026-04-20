"use client";

import { useServiceDetails } from "@/hooks/services/useServiceDetails";
import type { ReviewItem } from "./types";
import { toNumber } from "./types";

export function useServiceReviews() {
  const { service } = useServiceDetails();

  const averageRating = toNumber(service?.average_rating ?? service?.rating, 0);
  const totalReviews = toNumber(
    service?.reviews_count ?? service?.review_count ?? service?.ratings_count,
    0,
  );

  const reviews = Array.isArray(service?.reviews)
    ? (service.reviews as ReviewItem[])
    : [];

  return {
    reviews,
    averageRating,
    totalReviews,
  };
}
