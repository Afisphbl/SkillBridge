export type OrderRecord = {
  id: string;
  order_number?: string | null;
  buyer_id: string;
  seller_id: string;
  service_id: string;
  status?: string | null;
  price?: number | null;
  platform_fee?: number | null;
  seller_earnings?: number | null;
  requirements?: string | { description?: string | null } | null;
  delivery_date?: string | null;
  delivered_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  // Seller workflow fields
  started_at?: string | null;
  delivery_message?: string | null;
  delivery_files?: string[] | string | null; // Can be JSON string or array
  revision_notes?: string | null;
  revision_count?: number | null;
};

export type EnrichedOrder = OrderRecord & {
  serviceName: string;
  buyerName: string;
  sellerName: string;
};

export type UserRole = "buyer" | "seller" | "both";

export type SellerSortOption =
  | "newest"
  | "oldest"
  | "highest_price"
  | "nearest_deadline";

export type SellerOrdersFilterState = {
  status:
    | "all"
    | "pending"
    | "in_progress"
    | "delivered"
    | "completed"
    | "cancelled"
    | "revision_requested";
  createdFrom: string;
  createdTo: string;
  deliveryFrom: string;
  deliveryTo: string;
  minPrice: string;
  maxPrice: string;
  sortBy: SellerSortOption;
};

export type StatusTab =
  | "all"
  | "pending"
  | "in_progress"
  | "delivered"
  | "completed"
  | "cancelled";

export const ORDER_TABS: Array<{ key: StatusTab; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "delivered", label: "Delivered" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export const PAGE_SIZE = 8;

export function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function normalizeStatus(status?: string | null) {
  const value = (status || "pending").toLowerCase();

  if (value === "confirmed") {
    return "in_progress";
  }

  if (value === "accepted") {
    return "in_progress";
  }

  return value;
}

export function dedupeOrders(records: OrderRecord[]) {
  const map = new Map<string, OrderRecord>();

  for (const record of records) {
    map.set(record.id, record);
  }

  return Array.from(map.values()).sort((a, b) => {
    const left = new Date(a.created_at || 0).getTime();
    const right = new Date(b.created_at || 0).getTime();
    return right - left;
  });
}
