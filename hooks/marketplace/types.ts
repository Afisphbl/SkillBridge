export type ServiceRecord = {
  id?: string;
  category?: string;
  subcategory?: string;
  seller_id?: string;
  seller_name?: string;
  seller_avatar?: string;
  reviews_count?: number | string;
  seller_level?: string;
  sellerLevel?: string;
  created_at?: string;
  price?: number | string;
  base_price?: number | string;
  hourly_rate?: number | string;
  rating?: number | string;
  average_rating?: number | string;
  delivery_days?: number | string;
  delivery_time?: number | string;
  [key: string]: unknown;
};

export type UserProfile = {
  full_name?: string;
  email?: string;
  avatar?: string;
};

export type MarketplaceFilters = {
  category: string;
  subcategory: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  deliveryTime: string;
  sellerLevel: string;
};

export type SortValue = "relevant" | "price_low" | "price_high" | "rated" | "newest";

export type ResultMode = "browse" | "search" | "category";

export const PAGE_LIMIT = 9;

export const DEFAULT_CATEGORIES = [
  "Web Development",
  "Design",
  "Marketing",
  "Writing",
  "Video & Animation",
  "Data",
  "AI Services",
];

export const INITIAL_FILTERS: MarketplaceFilters = {
  category: "",
  subcategory: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  deliveryTime: "",
  sellerLevel: "",
};

export function toNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}
