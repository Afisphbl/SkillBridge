"use client";

import {
  FiBell,
  FiCheckCircle,
  FiDollarSign,
  FiMessageSquare,
  FiPackage,
  FiStar,
} from "react-icons/fi";
import { useSellerDashboardContext } from "@/components/Dashboard/seller/SellerDashboardProvider";
import { SectionHeader, SectionShell } from "@/components/Dashboard/seller/shared";

type NotifItem = {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  message: string;
  time: string | null;
};

function toRelativeTime(value?: string | null) {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const m = 60_000;
  const h = 3_600_000;
  const d = 86_400_000;
  if (diff < m) return "Just now";
  if (diff < h) return `${Math.floor(diff / m)}m ago`;
  if (diff < d) return `${Math.floor(diff / h)}h ago`;
  return `${Math.floor(diff / d)}d ago`;
}

export default function SellerHomeNotifications() {
  const {
    normalizedOrders,
    reviews: rawReviews,
    messages: rawMessages,
    sellerId,
    profilesMap,
  } = useSellerDashboardContext();

  const reviews = Array.isArray(rawReviews) ? rawReviews : [];
  const messages = Array.isArray(rawMessages) ? rawMessages : [];

  // Build a unified activity feed from orders, reviews, and messages
  const items: NotifItem[] = [];

  // New orders (pending)
  for (const o of normalizedOrders.filter((o) => o._status === "pending").slice(0, 3)) {
    const buyer =
      profilesMap[o.buyer_id]?.full_name ||
      profilesMap[o.buyer_id]?.email ||
      "A buyer";
    items.push({
      id: `order-new-${o.id}`,
      icon: FiPackage,
      iconBg: "bg-blue-100/60",
      iconColor: "text-blue-600",
      message: `New order received from ${buyer}`,
      time: o.created_at ?? null,
    });
  }

  // Completed orders
  for (const o of normalizedOrders.filter((o) => o._status === "completed").slice(0, 2)) {
    items.push({
      id: `order-done-${o.id}`,
      icon: FiCheckCircle,
      iconBg: "bg-(--badge-success-bg)",
      iconColor: "text-(--color-success)",
      message: `Order ${o.order_number ?? o.id.slice(0, 8)} completed successfully`,
      time: o.completed_at ?? o.updated_at ?? null,
    });
  }

  // New reviews
  for (const r of reviews.slice(0, 2)) {
    const buyer =
      profilesMap[r.buyer_id ?? ""]?.full_name ||
      profilesMap[r.buyer_id ?? ""]?.email ||
      "A buyer";
    items.push({
      id: `review-${r.id}`,
      icon: FiStar,
      iconBg: "bg-amber-100/60",
      iconColor: "text-amber-500",
      message: `New review received from ${buyer}`,
      time: r.created_at ?? null,
    });
  }

  // Unread messages
  const unreadMsgs = messages
    .filter((m) => m.receiver_id === sellerId && m.is_read === false)
    .slice(0, 2);
  for (const m of unreadMsgs) {
    const sender =
      profilesMap[m.sender_id]?.full_name ||
      profilesMap[m.sender_id]?.email ||
      "A buyer";
    items.push({
      id: `msg-${m.id}`,
      icon: FiMessageSquare,
      iconBg: "bg-(--badge-warning-bg)",
      iconColor: "text-(--color-warning)",
      message: `New message from ${sender}`,
      time: m.created_at ?? null,
    });
  }

  // Sort by time desc
  const sorted = items
    .sort((a, b) => {
      const at = new Date(a.time ?? 0).getTime();
      const bt = new Date(b.time ?? 0).getTime();
      return bt - at;
    })
    .slice(0, 8);

  return (
    <SectionShell>
      <SectionHeader
        title="Notifications & Updates"
        subtitle="Recent activity across your orders, reviews, and messages"
      />

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--bg-secondary) p-8 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-(--bg-card)">
            <FiBell className="size-5 text-(--text-muted)" />
          </div>
          <p className="mt-3 text-sm font-semibold text-(--text-primary)">
            No notifications yet
          </p>
          <p className="mt-1 text-xs text-(--text-secondary)">
            Activity from orders, reviews, and messages will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-2xl border border-(--border-color) bg-(--bg-card) p-3"
              >
                <div
                  className={`grid size-9 shrink-0 place-items-center rounded-xl ${item.iconBg}`}
                >
                  <Icon className={`size-4 ${item.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-(--text-primary)">
                    {item.message}
                  </p>
                  {item.time && (
                    <p className="mt-0.5 text-xs text-(--text-muted)">
                      {toRelativeTime(item.time)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}
