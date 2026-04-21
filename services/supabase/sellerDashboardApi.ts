import { supabase } from "@/services/supabase/client";

export type SellerOrder = {
  id: string;
  order_number?: string | null;
  buyer_id: string;
  seller_id: string;
  service_id: string;
  status?: string | null;
  price?: number | string | null;
  seller_earnings?: number | string | null;
  delivery_date?: string | null;
  delivered_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type SellerService = {
  id: string;
  title?: string | null;
  category?: string | null;
  price?: number | string | null;
  rating?: number | string | null;
  reviews_count?: number | string | null;
  orders?: number | string | null;
  views?: number | string | null;
  status?: string | null;
  image_url?: string | null;
  thumbnail?: string | null;
  seller_id?: string | null;
  created_at?: string | null;
};

export type SellerReview = {
  id: string;
  buyer_id?: string | null;
  seller_id?: string | null;
  service_id?: string | null;
  rating?: number | string | null;
  review?: string | null;
  created_at?: string | null;
};

export type SellerMessage = {
  id: string;
  order_id?: string | null;
  sender_id: string;
  receiver_id: string;
  message?: string | null;
  is_read?: boolean | null;
  created_at?: string | null;
};

export type ProfileRecord = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  avatar?: string | null;
};

export type SellerDashboardSnapshot = {
  orders: SellerOrder[];
  services: SellerService[];
  reviews: SellerReview[];
  messages: SellerMessage[];
  profilesMap: Record<string, ProfileRecord>;
};

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

async function getProfilesMap(
  ids: string[],
): Promise<Record<string, ProfileRecord>> {
  if (!ids.length) return {};

  const { data } = await supabase
    .from("users")
    .select("id,full_name,email,avatar")
    .in("id", ids);

  const map: Record<string, ProfileRecord> = {};
  for (const p of asArray(data as ProfileRecord[] | null)) {
    if (p?.id) map[p.id] = p;
  }
  return map;
}

export async function getSellerDashboardSnapshot(
  sellerId: string,
): Promise<{ data: SellerDashboardSnapshot | null; error: string | null }> {
  const [ordersRes, servicesRes, reviewsRes, messagesRes] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })
      .limit(300),
    supabase
      .from("services")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false }),
    supabase
      .from("reviews")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false }),
    supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${sellerId},receiver_id.eq.${sellerId}`)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  if (ordersRes.error) {
    return { data: null, error: ordersRes.error.message };
  }

  const orders = asArray(ordersRes.data as SellerOrder[] | null);
  const services = asArray(servicesRes.data as SellerService[] | null);
  const reviews = asArray(reviewsRes.data as SellerReview[] | null);
  const messages = asArray(messagesRes.data as SellerMessage[] | null);

  const buyerIds = Array.from(
    new Set(orders.map((o) => o.buyer_id).filter(Boolean)),
  );
  const profilesMap = await getProfilesMap(buyerIds);

  return {
    data: { orders, services, reviews, messages, profilesMap },
    error: null,
  };
}
