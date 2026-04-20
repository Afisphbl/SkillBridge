"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FiClock,
  FiMail,
  FiMessageSquare,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import { getCurrentUser } from "@/services/supabase/auth";
import {
  filterMessages,
  getAllMessages,
  getUnreadCount,
} from "@/services/supabase/messageServices";
import { getUsersByIds } from "@/services/supabase/userApi";

type MessageRecord = {
  id: string;
  order_id?: string | null;
  sender_id: string;
  receiver_id: string;
  message?: string | null;
  is_read?: boolean | null;
  created_at?: string | null;
};

type UserPreview = {
  id: string;
  full_name?: string;
  email?: string;
};

type ThreadPreview = {
  orderId: string;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
  peerId: string;
  peerName: string;
  peerInitials: string;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) return "SB";
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

function toRelativeTime(value?: string | null) {
  if (!value) return "";
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

function dedupeMessages(records: MessageRecord[]) {
  const map = new Map<string, MessageRecord>();
  for (const record of records) {
    map.set(record.id, record);
  }

  return Array.from(map.values());
}

function normalizeMessages(records: unknown): MessageRecord[] {
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

function ThreadSkeleton() {
  return (
    <div className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="size-11 animate-pulse rounded-full bg-(--bg-secondary)" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-2/5 animate-pulse rounded bg-(--bg-secondary)" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-(--bg-secondary)" />
          <div className="h-3 w-11/12 animate-pulse rounded bg-(--bg-secondary)" />
        </div>
        <div className="h-3 w-12 animate-pulse rounded bg-(--bg-secondary)" />
      </div>
    </div>
  );
}

export default function MessagesInboxClient() {
  const [currentUserId, setCurrentUserId] = useState("");
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [usersById, setUsersById] = useState<Record<string, UserPreview>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  const loadInboxSnapshot = async () => {
    const { user, error: authError } = await getCurrentUser();
    if (authError || !user?.id) {
      throw new Error("Please login to view messages.");
    }

    const [incomingResult, outgoingResult, unreadResult] = await Promise.all([
      filterMessages({ receiver_id: user.id }),
      filterMessages({ sender_id: user.id }),
      getUnreadCount(user.id),
    ]);

    const incoming = normalizeMessages(incomingResult.data);
    const outgoing = normalizeMessages(outgoingResult.data);

    let scopedMessages = dedupeMessages([...incoming, ...outgoing]).filter(
      (message) =>
        message.sender_id === user.id || message.receiver_id === user.id,
    );

    if (incomingResult.error && outgoingResult.error) {
      const fallback = await getAllMessages();
      if (fallback.error) {
        throw new Error("Failed to load messages.");
      }

      scopedMessages = normalizeMessages(fallback.data).filter(
        (message) =>
          message.sender_id === user.id || message.receiver_id === user.id,
      );
    }

    const participantIds = Array.from(
      new Set(
        scopedMessages
          .flatMap((message) => [message.sender_id, message.receiver_id])
          .filter(
            (participantId) => participantId && participantId !== user.id,
          ),
      ),
    );

    const usersResult = await getUsersByIds(participantIds);
    const userMap: Record<string, UserPreview> = {};
    for (const entry of Array.isArray(usersResult.users)
      ? usersResult.users
      : []) {
      if (entry?.id) {
        userMap[entry.id] = {
          id: entry.id,
          full_name: entry.full_name,
          email: entry.email,
        };
      }
    }

    return {
      currentUserId: user.id,
      scopedMessages,
      userMap,
      unreadCount: unreadResult.count || 0,
    };
  };

  const fetchInbox = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const snapshot = await loadInboxSnapshot();

      setCurrentUserId(snapshot.currentUserId);
      setUsersById(snapshot.userMap);
      setMessages(snapshot.scopedMessages);
      setTotalUnreadCount(snapshot.unreadCount);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load messages.";
      setErrorMessage(message);
      setMessages([]);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    void loadInboxSnapshot()
      .then((snapshot) => {
        if (!active) return;

        setCurrentUserId(snapshot.currentUserId);
        setUsersById(snapshot.userMap);
        setMessages(snapshot.scopedMessages);
        setTotalUnreadCount(snapshot.unreadCount);
      })
      .catch((error) => {
        if (!active) return;

        const message =
          error instanceof Error ? error.message : "Failed to load messages.";
        setErrorMessage(message);
        setMessages([]);
        toast.error(message);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const threads = useMemo(() => {
    if (!currentUserId) return [] as ThreadPreview[];

    const grouped = messages.reduce<Record<string, MessageRecord[]>>(
      (acc, msg) => {
        const orderId = String(msg.order_id || "").trim();
        if (!orderId) return acc;

        if (!acc[orderId]) {
          acc[orderId] = [];
        }
        acc[orderId].push(msg);
        return acc;
      },
      {},
    );

    return Object.entries(grouped)
      .map(([orderId, records]) => {
        const sorted = [...records].sort((left, right) => {
          const leftTime = new Date(left.created_at || 0).getTime();
          const rightTime = new Date(right.created_at || 0).getTime();
          return leftTime - rightTime;
        });

        const last = sorted[sorted.length - 1];
        const peerId =
          last.sender_id === currentUserId ? last.receiver_id : last.sender_id;

        const peer = usersById[peerId];
        const peerName =
          peer?.full_name || peer?.email || `User ${peerId.slice(0, 6)}`;

        const unreadCount = records.filter(
          (record) =>
            record.receiver_id === currentUserId && record.is_read === false,
        ).length;

        return {
          orderId,
          lastMessage: last.message || "No message content",
          lastMessageAt: last.created_at || null,
          unreadCount,
          peerId,
          peerName,
          peerInitials: initialsFromName(peerName),
        };
      })
      .sort((left, right) => {
        const leftTime = new Date(left.lastMessageAt || 0).getTime();
        const rightTime = new Date(right.lastMessageAt || 0).getTime();
        return rightTime - leftTime;
      });
  }, [currentUserId, messages, usersById]);

  const filteredThreads = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return threads.filter((thread) => {
      const unreadMatch = activeFilter === "all" || thread.unreadCount > 0;
      if (!unreadMatch) return false;

      if (!normalizedQuery) return true;

      const searchable = `${thread.peerName} ${thread.orderId}`.toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [activeFilter, searchQuery, threads]);

  return (
    <section className="space-y-5">
      <header className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-6 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.65)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-(--text-primary)">
              Messages
            </h1>
            <p className="mt-1 text-sm text-(--text-secondary)">
              Your conversations across active orders.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-(--bg-secondary) px-3 py-1.5 text-xs font-semibold text-(--text-secondary)">
            <FiMail className="size-3.5" />
            <span>{totalUnreadCount} unread</span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-(--text-muted)" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by user or order id"
              className="h-10 w-full rounded-xl border border-(--border-color) bg-(--bg-card) pl-9 pr-3 text-sm text-(--text-primary) outline-none focus:border-(--border-focus)"
            />
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold ${
                activeFilter === "all"
                  ? "bg-(--btn-bg-primary) text-(--btn-text-primary)"
                  : "bg-(--bg-secondary) text-(--text-secondary) hover:bg-(--hover-bg)"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("unread")}
              className={`inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold ${
                activeFilter === "unread"
                  ? "bg-(--btn-bg-primary) text-(--btn-text-primary)"
                  : "bg-(--bg-secondary) text-(--text-secondary) hover:bg-(--hover-bg)"
              }`}
            >
              Unread
            </button>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_value, index) => (
            <ThreadSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-(--color-danger)">
            Failed to load messages
          </p>
          <p className="mt-2 text-sm text-(--text-secondary)">{errorMessage}</p>
          <button
            type="button"
            onClick={() => void fetchInbox()}
            className="mt-4 inline-flex h-10 items-center rounded-xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover)"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !errorMessage && filteredThreads.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-(--border-color) bg-(--bg-card) p-10 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-(--bg-secondary)">
            <FiMessageSquare className="size-7 text-(--text-muted)" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-(--text-primary)">
            No messages yet
          </h2>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Your conversations will appear here
          </p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && filteredThreads.length > 0 ? (
        <div className="space-y-3">
          {filteredThreads.map((thread) => (
            <Link
              key={thread.orderId}
              href={`/messages/${thread.orderId}?peerId=${encodeURIComponent(thread.peerId)}&peerName=${encodeURIComponent(thread.peerName)}`}
              className="block rounded-2xl border border-(--border-color) bg-(--bg-card) p-4 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:bg-(--hover-bg)"
            >
              <article className="flex items-start gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-full bg-(--bg-secondary) text-xs font-bold text-(--text-secondary)">
                  {thread.peerInitials || <FiUser className="size-4" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-(--text-primary)">
                        {thread.peerName}
                      </p>
                      <p className="text-xs text-(--text-muted)">
                        Order #{thread.orderId}
                      </p>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-(--text-muted)">
                        <FiClock className="size-3" />
                        {toRelativeTime(thread.lastMessageAt)}
                      </span>
                      {thread.unreadCount > 0 ? (
                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {thread.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-(--text-secondary)">
                    {thread.lastMessage}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
