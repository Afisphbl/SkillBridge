import type { ServiceRecord } from "@/services/supabase/buyerDashboardApi";

export type OrderStatus =
  | "all"
  | "active"
  | "pending"
  | "completed"
  | "cancelled";

export const ORDER_FILTERS: OrderStatus[] = [
  "all",
  "active",
  "pending",
  "completed",
  "cancelled",
];

export const ORDER_PAGE_SIZE = 6;
export const MESSAGE_PAGE_SIZE = 5;
export const FAVORITE_PAGE_SIZE = 6;
export const NOTIFICATION_PAGE_SIZE = 6;
export const REVIEW_PAGE_SIZE = 5;
export const PAYMENT_PAGE_SIZE = 8;

export const CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-danger)",
  "var(--color-info)",
];

export function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function formatDate(value?: string | null) {
  const date = toDate(value);
  if (!date) return "-";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(value?: string | null) {
  const date = toDate(value);
  if (!date) return "-";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(value?: string | null) {
  const date = toDate(value);
  if (!date) return "now";

  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
}

export function normalizeOrderStatus(status?: string | null): OrderStatus {
  const value = (status || "").toLowerCase();

  if (value.includes("cancel")) return "cancelled";
  if (value.includes("complete") || value.includes("deliver")) {
    return "completed";
  }
  if (value.includes("pending")) return "pending";
  if (value) return "active";

  return "pending";
}

export function getServiceImage(service?: ServiceRecord) {
  return service?.image_url || service?.thumbnail || "/SkillBridge.png";
}
