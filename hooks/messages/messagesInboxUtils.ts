import type { BuyerMessage } from "@/services/supabase/buyerDashboardApi";

export type MessageRecord = {
  id: string;
  order_id?: string | null;
  sender_id: string;
  receiver_id: string;
  message?: string | null;
  is_read?: boolean | null;
  created_at?: string | null;
};

export type UserPreview = {
  id: string;
  full_name?: string;
  email?: string;
  avatar?: string;
};

export type ConversationPreview = {
  key: string;
  order_id: string;
  peer_id: string;
  peer_name: string;
  peer_avatar?: string;
  peer_initials: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

export type SelectedConversation = {
  order_id: string;
  peer_id: string;
  peer_name: string;
  peer_avatar?: string;
};

export type OrderParticipants = {
  buyer_id?: string | null;
  seller_id?: string | null;
};

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) return "SB";
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

export function toRelativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "";

  const now = Date.now();
  const diffMs = Math.max(0, now - timestamp);
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (diffMs < minuteMs) return "Just now";
  if (diffMs < hourMs) return `${Math.floor(diffMs / minuteMs)}m ago`;
  if (diffMs < dayMs) return `${Math.floor(diffMs / hourMs)}h ago`;

  const days = Math.floor(diffMs / dayMs);
  if (days < 7) return `${days}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
  });
}

export function formatChatTimestamp(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dedupeMessages(records: MessageRecord[]) {
  const map = new Map<string, MessageRecord>();
  for (const record of records) {
    map.set(record.id, record);
  }

  return Array.from(map.values());
}

export function sortByCreatedAtAsc(records: MessageRecord[]) {
  return [...records].sort((left, right) => {
    const leftMs = new Date(left.created_at || 0).getTime();
    const rightMs = new Date(right.created_at || 0).getTime();
    return leftMs - rightMs;
  });
}

export function normalizeMessages(records: unknown) {
  if (!Array.isArray(records)) return [];

  return records.filter((record): record is MessageRecord => {
    if (!record || typeof record !== "object") return false;

    const item = record as Partial<MessageRecord>;
    return (
      typeof item.id === "string" &&
      typeof item.sender_id === "string" &&
      typeof item.receiver_id === "string"
    );
  });
}
