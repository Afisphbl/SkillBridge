export type ServiceRecord = {
  id?: string;
  title?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  thumbnail_url?: string;
  gallery_urls?: unknown;
  gallery_images?: unknown;
  image_url?: string;
  cover_image?: string;
  rating?: number | string;
  average_rating?: number | string;
  reviews_count?: number | string;
  review_count?: number | string;
  ratings_count?: number | string;
  views_count?: number | string;
  view_count?: number | string;
  delivery_days?: number | string;
  delivery_time?: number | string;
  price?: number | string;
  base_price?: number | string;
  hourly_rate?: number | string;
  seller_id?: string;
  tags?: string[] | string;
  features?: unknown;
  reviews?: unknown;
  [key: string]: unknown;
};

export type ReviewItem = {
  id?: string;
  user_name?: string;
  user_avatar?: string;
  rating?: number | string;
  comment?: string;
  created_at?: string;
};

export type SellerProfile = {
  full_name?: string;
  email?: string;
  avatar?: string;
  role?: string;
  bio?: string;
  response_time?: string;
};

export function toNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}
