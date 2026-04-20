export type ServiceRow = {
  id?: string;
  title?: string;
  category?: string;
  seller_id?: string;
  price?: number | string;
  average_rating?: number | string;
  rating?: number | string;
  reviews_count?: number | string;
  thumbnail_url?: string;
  image_url?: string;
  cover_image?: string;
  created_at?: string;
};

export type SellerRow = {
  id: string;
  full_name?: string;
  email?: string;
  avatar?: string;
};
