import type { ServiceItem, ServiceStatus, ServiceVisibility } from "./types";

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeStatus(status: unknown): ServiceStatus {
  if (status === "active" || status === "paused" || status === "draft") {
    return status;
  }

  return "draft";
}

function normalizeVisibility(visibility: unknown): ServiceVisibility {
  return visibility === "private" ? "private" : "public";
}

export function normalizeService(record: Record<string, unknown>): ServiceItem {
  const fallbackId = `tmp-${Date.now()}-${Math.round(Math.random() * 100000)}`;

  return {
    id: String(record.id || fallbackId),
    title: String(record.title || "Untitled service"),
    category: String(record.category || "other"),
    tags: normalizeTags(record.tags),
    price: toNumber(record.price ?? record.base_price ?? record.hourly_rate, 0),
    deliveryDays: Math.max(
      1,
      toNumber(record.delivery_days ?? record.delivery_time, 3),
    ),
    rating: toNumber(record.average_rating ?? record.rating, 0),
    orders: toNumber(record.orders_count ?? record.total_orders, 0),
    views: toNumber(record.views, 0),
    conversionRate: toNumber(record.conversion_rate, 0),
    image: String(
      record.thumbnail_url ||
        record.image_url ||
        record.cover_image ||
        "/SkillBridge.png",
    ),
    status: normalizeStatus(record.status),
    visibility: normalizeVisibility(record.visibility),
    createdAt: String(record.created_at || new Date().toISOString()),
  };
}
