import { supabase } from "@/services/supabase/client";

export type BuyerOrder = {
  id: string;
  order_number?: string | null;
  buyer_id: string;
  seller_id: string;
  service_id: string;
  status?: string | null;
  price?: number | string | null;
  delivery_date?: string | null;
  progress?: number | string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

export type BuyerPayment = {
  id: string;
  buyer_id?: string | null;
  user_id?: string | null;
  order_id?: string | null;
  amount?: number | string | null;
  status?: string | null;
  payment_method?: string | null;
  method?: string | null;
  created_at?: string | null;
};

export type BuyerMessage = {
  id: string;
  order_id?: string | null;
  sender_id: string;
  receiver_id: string;
  message?: string | null;
  is_read?: boolean | null;
  created_at?: string | null;
};

export type BuyerReview = {
  id: string;
  buyer_id?: string | null;
  service_id?: string | null;
  seller_id?: string | null;
  rating?: number | string | null;
  review?: string | null;
  comment?: string | null;
  created_at?: string | null;
};

export type BuyerNotification = {
  id: string;
  buyer_id?: string | null;
  user_id?: string | null;
  receiver_id?: string | null;
  order_id?: string | null;
  type?: string | null;
  title?: string | null;
  message?: string | null;
  body?: string | null;
  is_read?: boolean | null;
  created_at?: string | null;
};

export type FavoriteRecord = {
  id: string;
  buyer_id?: string | null;
  user_id?: string | null;
  service_id?: string | null;
  created_at?: string | null;
};

export type ServiceRecord = {
  id: string;
  title?: string | null;
  category?: string | null;
  price?: number | string | null;
  rating?: number | string | null;
  reviews_count?: number | string | null;
  image_url?: string | null;
  thumbnail?: string | null;
  seller_id?: string | null;
  status?: string | null;
  created_at?: string | null;
};

export type CategoryRecord = {
  id?: string;
  name?: string | null;
  slug?: string | null;
  title?: string | null;
};

export type ProfileRecord = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  avatar?: string | null;
  role?: "buyer" | "seller" | "both" | string | null;
};

export type BuyerDashboardSnapshot = {
  orders: BuyerOrder[];
  payments: BuyerPayment[];
  messages: BuyerMessage[];
  reviews: BuyerReview[];
  notifications: BuyerNotification[];
  favorites: FavoriteRecord[];
  services: ServiceRecord[];
  categories: CategoryRecord[];
  profilesMap: Record<string, ProfileRecord>;
  role: "buyer" | "seller" | "both";
};

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeRole(input: unknown): "buyer" | "seller" | "both" {
  if (input === "buyer" || input === "seller" || input === "both") {
    return input;
  }

  return "buyer";
}

async function getRoleFromTable(
  table: "profiles" | "users",
  userId: string,
): Promise<"buyer" | "seller" | "both" | null> {
  const { data, error } = await supabase
    .from(table)
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return normalizeRole((data as { role?: unknown } | null)?.role);
}

async function queryByFirstAvailableColumn<T>(
  table: string,
  columns: string[],
  userId: string,
  select = "*",
  orderBy?: string,
): Promise<{ data: T[]; error: string | null }> {
  let lastError = "";

  for (const column of columns) {
    const query = supabase.from(table).select(select).eq(column, userId);
    const response = orderBy
      ? await query.order(orderBy, { ascending: false })
      : await query;

    if (!response.error) {
      return { data: asArray(response.data as T[] | null), error: null };
    }

    lastError = response.error.message || `Failed to query ${table}`;
  }

  return { data: [], error: lastError || `Failed to query ${table}` };
}

async function getProfilesMap(
  ids: string[],
): Promise<Record<string, ProfileRecord>> {
  if (ids.length === 0) return {};

  const profileResponse = await supabase
    .from("profiles")
    .select("id,full_name,email,avatar,role")
    .in("id", ids);

  if (!profileResponse.error) {
    const map: Record<string, ProfileRecord> = {};
    for (const profile of asArray(
      profileResponse.data as ProfileRecord[] | null,
    )) {
      map[profile.id] = profile;
    }

    return map;
  }

  const usersResponse = await supabase
    .from("users")
    .select("id,full_name,email,avatar,role")
    .in("id", ids);

  const map: Record<string, ProfileRecord> = {};
  for (const profile of asArray(usersResponse.data as ProfileRecord[] | null)) {
    map[profile.id] = profile;
  }

  return map;
}

export async function getBuyerDashboardSnapshot(
  userId: string,
): Promise<{ data: BuyerDashboardSnapshot | null; error: string | null }> {
  const roleFromProfiles = await getRoleFromTable("profiles", userId);
  const role =
    roleFromProfiles || (await getRoleFromTable("users", userId)) || "buyer";

  const [
    ordersResult,
    paymentsResult,
    messagesResult,
    reviewsResult,
    notificationsResult,
    favoritesResult,
    servicesResult,
    categoriesResult,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false }),
    queryByFirstAvailableColumn<BuyerPayment>(
      "payments",
      ["buyer_id", "user_id"],
      userId,
      "*",
      "created_at",
    ),
    supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false }),
    queryByFirstAvailableColumn<BuyerReview>(
      "reviews",
      ["buyer_id", "user_id"],
      userId,
      "*",
      "created_at",
    ),
    queryByFirstAvailableColumn<BuyerNotification>(
      "notifications",
      ["buyer_id", "user_id", "receiver_id"],
      userId,
      "*",
      "created_at",
    ),
    queryByFirstAvailableColumn<FavoriteRecord>(
      "favorites",
      ["buyer_id", "user_id"],
      userId,
      "*",
      "created_at",
    ),
    supabase
      .from("services")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(120),
    supabase.from("categories").select("*").order("name", { ascending: true }),
  ]);

  const fatalErrors = [
    ordersResult.error?.message,
    messagesResult.error?.message,
    servicesResult.error?.message,
  ].filter(Boolean);

  if (fatalErrors.length > 0) {
    return { data: null, error: fatalErrors[0] || "Failed to load dashboard." };
  }

  const orders = asArray(ordersResult.data as BuyerOrder[] | null);
  const payments = paymentsResult.data;
  const messages = asArray(messagesResult.data as BuyerMessage[] | null);
  const reviews = reviewsResult.data;
  const notifications = notificationsResult.data;
  const favorites = favoritesResult.data;
  const services = asArray(servicesResult.data as ServiceRecord[] | null);
  const categories = asArray(categoriesResult.data as CategoryRecord[] | null);

  const userIds = Array.from(
    new Set(
      [
        ...orders.map((item) => item.seller_id),
        ...messages.flatMap((item) => [item.sender_id, item.receiver_id]),
        ...services.map((item) => item.seller_id || ""),
        ...reviews.map((item) => item.seller_id || ""),
      ].filter((id) => Boolean(id) && id !== userId),
    ),
  );

  const profilesMap = await getProfilesMap(userIds);

  return {
    data: {
      orders,
      payments,
      messages,
      reviews,
      notifications,
      favorites,
      services,
      categories,
      profilesMap,
      role,
    },
    error: null,
  };
}

export async function updateOrderStatus(orderId: string, status: string) {
  return supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select("id")
    .single();
}

export async function markNotificationAsRead(notificationId: string) {
  return supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .select("id")
    .single();
}

export async function deleteNotification(notificationId: string) {
  return supabase.from("notifications").delete().eq("id", notificationId);
}

export async function removeFavorite(favoriteId: string) {
  return supabase.from("favorites").delete().eq("id", favoriteId);
}

export async function deleteReview(reviewId: string) {
  return supabase.from("reviews").delete().eq("id", reviewId);
}
