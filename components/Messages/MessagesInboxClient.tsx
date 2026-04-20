"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiClock,
  FiCircle,
  FiMessageSquare,
  FiSend,
  FiSearch,
  FiUser,
  FiX,
} from "react-icons/fi";
import { getCurrentUser } from "@/services/supabase/auth";
import {
  getAllMessages,
  getChatMessages,
  markMessageAsRead,
  sendMessage,
} from "@/services/supabase/messageServices";
import { getOrderById } from "@/services/supabase/orderServices";
import { getUsersByIds } from "@/services/supabase/userApi";
import { useMessagesRealtime } from "@/hooks/messages/useMessagesRealtime";
import { cn } from "@/utils/helpers";

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
  avatar?: string;
};

type ConversationPreview = {
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

type SelectedConversation = {
  order_id: string;
  peer_id: string;
  peer_name: string;
  peer_avatar?: string;
};

type OrderParticipants = {
  buyer_id?: string | null;
  seller_id?: string | null;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) return "SB";
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

function toRelativeTime(value: string) {
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

function formatChatTimestamp(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dedupeMessages(records: MessageRecord[]) {
  const map = new Map<string, MessageRecord>();
  for (const record of records) {
    map.set(record.id, record);
  }

  return Array.from(map.values());
}

function sortByCreatedAtAsc(records: MessageRecord[]) {
  return [...records].sort((left, right) => {
    const leftMs = new Date(left.created_at || 0).getTime();
    const rightMs = new Date(right.created_at || 0).getTime();
    return leftMs - rightMs;
  });
}

function normalizeMessages(records: unknown) {
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

function ThreadSkeleton({ count = 7 }: { count?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_value, index) => (
        <div
          key={index}
          className="rounded-xl border border-(--border-color) bg-(--bg-card) p-3"
        >
          <div className="flex items-start gap-3">
            <div className="size-10 animate-pulse rounded-full bg-(--bg-secondary)" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-2/5 animate-pulse rounded bg-(--bg-secondary)" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-(--bg-secondary)" />
            </div>
            <div className="h-3 w-10 animate-pulse rounded bg-(--bg-secondary)" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MessageBubbleSkeleton({ mine }: { mine: boolean }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`h-12 w-44 animate-pulse rounded-2xl ${
          mine ? "bg-blue-200/80" : "bg-(--bg-secondary)"
        }`}
      />
    </div>
  );
}

export default function MessagesInboxClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentUserId, setCurrentUserId] = useState("");
  const [allMessages, setAllMessages] = useState<MessageRecord[]>([]);
  const [usersById, setUsersById] = useState<Record<string, UserPreview>>({});
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeerByOrder, setSelectedPeerByOrder] = useState<
    Record<string, string>
  >({});
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [chatError, setChatError] = useState("");
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);
  const selectedOrderId = (searchParams.get("m") || "").trim();
  const hasSelectedOrder = Boolean(selectedOrderId);

  const setMessageOrderParam = useCallback(
    (orderId?: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (orderId) {
        params.set("m", orderId);
      } else {
        params.delete("m");
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setErrorMessage("");

    try {
      const { user, error: authError } = await getCurrentUser();
      if (authError || !user?.id) {
        throw new Error("Please login to view messages.");
      }

      const allMessagesResult = await getAllMessages();
      if (allMessagesResult.error) {
        throw new Error("Failed to load messages.");
      }

      const scopedMessages = sortByCreatedAtAsc(
        normalizeMessages(allMessagesResult.data).filter(
          (record) =>
            record.sender_id === user.id || record.receiver_id === user.id,
        ),
      );

      const participantIds = Array.from(
        new Set(
          scopedMessages
            .flatMap((record) => [record.sender_id, record.receiver_id])
            .filter((id) => id && id !== user.id),
        ),
      );

      const usersResult = await getUsersByIds(participantIds);
      const nextUsersById: Record<string, UserPreview> = {};
      for (const entry of Array.isArray(usersResult.users)
        ? usersResult.users
        : []) {
        if (entry?.id) {
          nextUsersById[entry.id] = {
            id: entry.id,
            full_name: entry.full_name,
            email: entry.email,
            avatar: entry.avatar,
          };
        }
      }

      setCurrentUserId(user.id);
      setAllMessages(scopedMessages);
      setUsersById(nextUsersById);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load messages.";
      setErrorMessage(message);
      setAllMessages([]);
      toast.error(message);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadConversations();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadConversations]);

  const conversations = useMemo(() => {
    if (!currentUserId) return [] as ConversationPreview[];

    const grouped = new Map<string, MessageRecord[]>();

    for (const record of allMessages) {
      const orderId = String(record.order_id || "").trim();
      if (!orderId) continue;

      const peerId =
        record.sender_id === currentUserId
          ? record.receiver_id
          : record.sender_id;

      if (!peerId || peerId === currentUserId) continue;

      const key = `${orderId}::${peerId}`;
      const existing = grouped.get(key) || [];
      existing.push(record);
      grouped.set(key, existing);
    }

    return Array.from(grouped.entries())
      .map(([key, records]) => {
        const [orderId, peerId] = key.split("::");
        const sorted = sortByCreatedAtAsc(records);
        const last = sorted[sorted.length - 1];
        const peer = usersById[peerId];
        const peerName =
          peer?.full_name || peer?.email || `User ${peerId.slice(0, 6)}`;

        return {
          key,
          order_id: orderId,
          peer_id: peerId,
          peer_name: peerName,
          peer_avatar: peer?.avatar,
          peer_initials: initialsFromName(peerName),
          lastMessage: last?.message || "No message content",
          lastMessageAt: last?.created_at || "",
          unreadCount: records.filter(
            (item) =>
              item.receiver_id === currentUserId && item.is_read === false,
          ).length,
        };
      })
      .sort((left, right) => {
        const leftTime = new Date(left.lastMessageAt || 0).getTime();
        const rightTime = new Date(right.lastMessageAt || 0).getTime();
        return rightTime - leftTime;
      });
  }, [allMessages, currentUserId, usersById]);

  const filteredConversations = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return conversations.filter((conversation) => {
      if (!normalizedQuery) return true;

      const searchable =
        `${conversation.peer_name} ${conversation.order_id}`.toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [conversations, searchQuery]);

  const unreadCountTotal = useMemo(
    () =>
      allMessages.filter(
        (record) =>
          record.receiver_id === currentUserId && record.is_read === false,
      ).length,
    [allMessages, currentUserId],
  );

  const selectedConversation = useMemo<SelectedConversation | null>(() => {
    if (!selectedOrderId) return null;

    const preferredPeerId = selectedPeerByOrder[selectedOrderId] || "";
    const initialConversation =
      conversations.find(
        (conversation) =>
          conversation.order_id === selectedOrderId &&
          conversation.peer_id === preferredPeerId,
      ) ||
      conversations.find(
        (conversation) => conversation.order_id === selectedOrderId,
      );

    if (initialConversation) {
      return {
        order_id: initialConversation.order_id,
        peer_id: initialConversation.peer_id,
        peer_name: initialConversation.peer_name,
        peer_avatar: initialConversation.peer_avatar,
      };
    }

    if (preferredPeerId) {
      const preferredPeer = usersById[preferredPeerId];
      const preferredPeerName =
        preferredPeer?.full_name ||
        preferredPeer?.email ||
        `User ${preferredPeerId.slice(0, 6)}`;

      return {
        order_id: selectedOrderId,
        peer_id: preferredPeerId,
        peer_name: preferredPeerName,
        peer_avatar: preferredPeer?.avatar,
      };
    }

    return {
      order_id: selectedOrderId,
      peer_id: "",
      peer_name: "New conversation",
    };
  }, [conversations, selectedOrderId, selectedPeerByOrder, usersById]);

  useEffect(() => {
    if (
      !selectedOrderId ||
      !currentUserId ||
      selectedPeerByOrder[selectedOrderId]
    ) {
      return;
    }

    let cancelled = false;

    const resolvePeerForNewConversation = async () => {
      try {
        const { success, order } = await getOrderById(selectedOrderId);
        if (!success || !order || cancelled) return;

        const typedOrder = order as OrderParticipants;
        const buyerId =
          typeof typedOrder.buyer_id === "string" ? typedOrder.buyer_id : "";
        const sellerId =
          typeof typedOrder.seller_id === "string" ? typedOrder.seller_id : "";

        const peerId =
          currentUserId === buyerId
            ? sellerId
            : currentUserId === sellerId
              ? buyerId
              : "";

        if (!peerId || cancelled) return;

        setSelectedPeerByOrder((current) => {
          if (current[selectedOrderId] === peerId) return current;
          return {
            ...current,
            [selectedOrderId]: peerId,
          };
        });

        if (!usersById[peerId]) {
          const usersResult = await getUsersByIds([peerId]);
          if (cancelled) return;

          const peerEntry = Array.isArray(usersResult.users)
            ? usersResult.users.find((entry) => entry?.id === peerId)
            : null;

          if (peerEntry?.id) {
            setUsersById((current) => ({
              ...current,
              [peerEntry.id]: {
                id: peerEntry.id,
                full_name: peerEntry.full_name,
                email: peerEntry.email,
                avatar: peerEntry.avatar,
              },
            }));
          }
        }
      } catch {
        // Keep the composer disabled if order participants cannot be resolved.
      }
    };

    void resolvePeerForNewConversation();

    return () => {
      cancelled = true;
    };
  }, [currentUserId, selectedOrderId, selectedPeerByOrder, usersById]);

  const selectedConversationKey = selectedConversation
    ? `${selectedConversation.order_id}::${selectedConversation.peer_id}`
    : "";
  const canSendInSelectedConversation = Boolean(selectedConversation?.peer_id);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    window.requestAnimationFrame(() => {
      bottomAnchorRef.current?.scrollIntoView({ behavior, block: "end" });
    });
  }, []);

  const loadConversationMessages = useCallback(async () => {
    if (
      !selectedConversation ||
      !currentUserId ||
      !selectedConversation.peer_id
    ) {
      setMessages([]);
      setChatError("");
      return;
    }

    setLoadingMessages(true);
    setChatError("");

    try {
      const response = await getChatMessages(
        selectedConversation.order_id,
        currentUserId,
        selectedConversation.peer_id,
      );

      if (response.error) {
        throw new Error("Failed to load chat messages.");
      }

      const scoped = sortByCreatedAtAsc(
        normalizeMessages(response.data).filter(
          (record) =>
            (record.sender_id === currentUserId &&
              record.receiver_id === selectedConversation.peer_id) ||
            (record.sender_id === selectedConversation.peer_id &&
              record.receiver_id === currentUserId),
        ),
      );

      setMessages(scoped);

      const unreadForCurrent = scoped.filter(
        (record) =>
          record.receiver_id === currentUserId && record.is_read === false,
      );

      if (unreadForCurrent.length > 0) {
        await Promise.all(
          unreadForCurrent.map((record) => markMessageAsRead(record.id)),
        );

        setMessages((current) =>
          current.map((record) =>
            unreadForCurrent.some((unread) => unread.id === record.id)
              ? { ...record, is_read: true }
              : record,
          ),
        );

        setAllMessages((current) =>
          current.map((record) =>
            unreadForCurrent.some((unread) => unread.id === record.id)
              ? { ...record, is_read: true }
              : record,
          ),
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load chat messages.";
      setChatError(message);
      toast.error(message);
    } finally {
      setLoadingMessages(false);
    }
  }, [currentUserId, selectedConversation]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadConversationMessages();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadConversationMessages]);

  const handleRealtimeMessages = useCallback(
    (incoming: MessageRecord[]) => {
      setAllMessages((current) => {
        const scoped = incoming.filter(
          (record) =>
            record.sender_id === currentUserId ||
            record.receiver_id === currentUserId,
        );
        if (scoped.length === 0) return current;
        return sortByCreatedAtAsc(dedupeMessages([...current, ...scoped]));
      });

      if (!selectedConversation) return;

      const scopedIncoming = incoming.filter(
        (record) =>
          record.order_id === selectedConversation.order_id &&
          ((record.sender_id === currentUserId &&
            record.receiver_id === selectedConversation.peer_id) ||
            (record.sender_id === selectedConversation.peer_id &&
              record.receiver_id === currentUserId)),
      );

      if (scopedIncoming.length === 0) return;

      setMessages((current) =>
        sortByCreatedAtAsc(dedupeMessages([...current, ...scopedIncoming])),
      );

      const unreadIncoming = scopedIncoming.filter(
        (record) =>
          record.receiver_id === currentUserId && record.is_read === false,
      );

      if (unreadIncoming.length > 0) {
        void Promise.all(
          unreadIncoming.map((record) => markMessageAsRead(record.id)),
        ).then(() => {
          setMessages((current) =>
            current.map((record) =>
              unreadIncoming.some((unread) => unread.id === record.id)
                ? { ...record, is_read: true }
                : record,
            ),
          );

          setAllMessages((current) =>
            current.map((record) =>
              unreadIncoming.some((unread) => unread.id === record.id)
                ? { ...record, is_read: true }
                : record,
            ),
          );
        });
      }
    },
    [currentUserId, selectedConversation],
  );

  useMessagesRealtime({
    currentUserId,
    enabled: Boolean(currentUserId),
    onNewMessages: handleRealtimeMessages,
  });

  useEffect(() => {
    scrollToBottom("auto");
  }, [messages, scrollToBottom]);

  const handleSelectConversation = useCallback(
    (conversation: ConversationPreview) => {
      setMessageOrderParam(conversation.order_id);
      setSelectedPeerByOrder((current) => ({
        ...current,
        [conversation.order_id]: conversation.peer_id,
      }));
      setChatError("");
    },
    [setMessageOrderParam],
  );

  const handleSend = useCallback(async () => {
    if (
      !selectedConversation ||
      !currentUserId ||
      !selectedConversation.peer_id ||
      !messageInput.trim() ||
      sendingMessage
    ) {
      return;
    }

    setSendingMessage(true);

    const payload = {
      order_id: selectedConversation.order_id,
      sender_id: currentUserId,
      receiver_id: selectedConversation.peer_id,
      message: messageInput.trim(),
    };

    const { data, error } = await sendMessage(payload);
    if (error) {
      toast.error("Failed to send message.");
      setSendingMessage(false);
      return;
    }

    const inserted = sortByCreatedAtAsc(normalizeMessages(data));
    setMessageInput("");

    if (inserted.length > 0) {
      setMessages((current) =>
        sortByCreatedAtAsc(dedupeMessages([...current, ...inserted])),
      );
      setAllMessages((current) =>
        sortByCreatedAtAsc(dedupeMessages([...current, ...inserted])),
      );
      scrollToBottom("smooth");
    } else {
      await loadConversationMessages();
      scrollToBottom("smooth");
    }

    setSendingMessage(false);
  }, [
    currentUserId,
    loadConversationMessages,
    messageInput,
    selectedConversation,
    scrollToBottom,
    sendingMessage,
  ]);

  return (
    <section className="flex h-[calc(100vh-8.25rem)] flex-col overflow-hidden rounded-3xl border border-(--border-color) bg-(--bg-card) shadow-[0_18px_44px_-26px_rgba(15,23,42,0.75)]">
      <div className="flex h-full min-h-0">
        <aside
          className={cn(
            "h-full min-h-0 border-r border-(--border-color) bg-(--bg-card)",
            hasSelectedOrder
              ? "hidden md:flex md:w-[280px] lg:w-[320px]"
              : "flex w-full flex-1",
          )}
        >
          <div className="flex h-full min-h-0 w-full flex-col">
            <header className="border-b border-(--border-color) p-4">
              <h1 className="text-xl font-black tracking-tight text-(--text-primary)">
                Messages
              </h1>
              <p className="mt-1 text-xs text-(--text-secondary)">
                {unreadCountTotal} unread messages
              </p>

              <label className="relative mt-3 block">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-(--text-muted)" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search conversations"
                  className="h-10 w-full rounded-xl border border-(--border-color) bg-(--bg-card) pl-9 pr-3 text-sm text-(--text-primary) outline-none focus:border-(--border-focus)"
                />
              </label>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
              {isLoadingConversations ? <ThreadSkeleton /> : null}

              {!isLoadingConversations && errorMessage ? (
                <div className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-4 text-center">
                  <p className="text-sm font-semibold text-(--color-danger)">
                    Failed to load messages
                  </p>
                  <p className="mt-1 text-xs text-(--text-secondary)">
                    {errorMessage}
                  </p>
                  <button
                    type="button"
                    onClick={() => void loadConversations()}
                    className="mt-3 inline-flex h-9 items-center rounded-lg bg-(--btn-bg-primary) px-3 text-xs font-semibold text-(--btn-text-primary)"
                  >
                    Retry
                  </button>
                </div>
              ) : null}

              {!isLoadingConversations &&
              !errorMessage &&
              filteredConversations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--bg-card) p-6 text-center">
                  <div className="mx-auto grid size-12 place-items-center rounded-full bg-(--bg-secondary)">
                    <FiMessageSquare className="size-5 text-(--text-muted)" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-(--text-primary)">
                    No conversations yet
                  </p>
                  <p className="mt-1 text-xs text-(--text-secondary)">
                    Start a chat from an order to see it here.
                  </p>
                </div>
              ) : null}

              {!isLoadingConversations && !errorMessage
                ? filteredConversations.map((conversation) => {
                    const active = conversation.key === selectedConversationKey;

                    return (
                      <button
                        key={conversation.key}
                        type="button"
                        onClick={() => handleSelectConversation(conversation)}
                        className={cn(
                          "mb-2.5 block w-full rounded-xl border p-3 text-left transition hover:bg-(--hover-bg)",
                          active
                            ? "border-(--color-primary) border-l-4 bg-(--bg-secondary)"
                            : "border-(--border-color) bg-(--bg-card)",
                        )}
                      >
                        <article className="flex items-start gap-3">
                          <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-(--bg-secondary) text-xs font-bold text-(--text-secondary)">
                            {conversation.peer_avatar ? (
                              <Image
                                src={conversation.peer_avatar}
                                alt={`${conversation.peer_name} avatar`}
                                width={40}
                                height={40}
                                unoptimized
                                className="size-10 rounded-full object-cover"
                              />
                            ) : (
                              conversation.peer_initials || (
                                <FiUser className="size-4" />
                              )
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={cn(
                                  "truncate text-sm text-(--text-primary)",
                                  active ? "font-bold" : "font-semibold",
                                )}
                              >
                                {conversation.peer_name}
                              </p>
                              <span className="inline-flex items-center gap-1 text-[11px] text-(--text-muted)">
                                <FiClock className="size-3" />
                                {toRelativeTime(conversation.lastMessageAt)}
                              </span>
                            </div>

                            <p className="mt-0.5 text-[11px] font-medium text-(--text-muted)">
                              Order #{conversation.order_id}
                            </p>

                            <div className="mt-1 flex items-center justify-between gap-2">
                              <p className="line-clamp-1 text-xs text-(--text-secondary)">
                                {conversation.lastMessage}
                              </p>
                              {conversation.unreadCount > 0 ? (
                                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-(--color-primary) px-1.5 py-0.5 text-[10px] font-bold text-(--text-inverse)">
                                  {conversation.unreadCount}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </article>
                      </button>
                    );
                  })
                : null}
            </div>
          </div>
        </aside>

        <section
          className={cn(
            "h-full min-h-0 flex-1 flex-col border-l border-(--border-color)",
            hasSelectedOrder ? "flex" : "hidden",
          )}
        >
          {!selectedConversation ? (
            <div className="grid flex-1 place-items-center p-6">
              <div className="max-w-md text-center">
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-(--bg-secondary)">
                  <FiMessageSquare className="size-8 text-(--text-muted)" />
                </div>
                <h2 className="mt-5 text-2xl font-bold text-(--text-primary)">
                  Select a conversation
                </h2>
                <p className="mt-2 text-sm text-(--text-secondary)">
                  Choose a conversation from the left to start messaging.
                </p>
              </div>
            </div>
          ) : (
            <>
              <header className="flex items-center justify-between gap-3 border-b border-(--border-color) bg-(--bg-card) px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMessageOrderParam()}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-(--border-color) text-(--text-secondary) md:hidden"
                    aria-label="Back to conversations"
                  >
                    <FiArrowLeft className="size-4" />
                  </button>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-(--text-primary) sm:text-base">
                      {selectedConversation.peer_name}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-(--text-muted)">
                      <FiCircle className="size-2.5 fill-current text-emerald-500" />
                      <span>Order #{selectedConversation.order_id}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMessageOrderParam()}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-(--border-color) px-3 text-xs font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
                  aria-label="Close chat"
                >
                  <FiX className="size-4" />
                  <span className="hidden sm:inline">Close</span>
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.08),transparent_50%)] px-3 py-4 sm:px-5">
                {loadingMessages ? (
                  <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
                    <MessageBubbleSkeleton mine={false} />
                    <MessageBubbleSkeleton mine={true} />
                    <MessageBubbleSkeleton mine={false} />
                  </div>
                ) : null}

                {!loadingMessages && chatError ? (
                  <div className="mx-auto mt-8 max-w-md rounded-2xl border border-(--border-color) bg-(--bg-card) p-6 text-center shadow-sm">
                    <p className="text-sm font-semibold text-(--color-danger)">
                      {chatError}
                    </p>
                    <button
                      type="button"
                      onClick={() => void loadConversationMessages()}
                      className="mt-4 inline-flex h-10 items-center rounded-xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary)"
                    >
                      Retry
                    </button>
                  </div>
                ) : null}

                {!loadingMessages && !chatError && messages.length === 0 ? (
                  <div className="mx-auto mt-10 w-full max-w-md rounded-2xl border border-dashed border-(--border-color) bg-(--bg-card) p-7 text-center shadow-sm">
                    <div className="mx-auto grid size-12 place-items-center rounded-full bg-(--bg-secondary)">
                      <FiMessageSquare className="size-6 text-(--text-muted)" />
                    </div>
                    <h2 className="mt-3 text-base font-semibold text-(--text-primary)">
                      No messages yet
                    </h2>
                    <p className="mt-1 text-sm text-(--text-secondary)">
                      Start this conversation by sending a message.
                    </p>
                  </div>
                ) : null}

                {!loadingMessages && !chatError && messages.length > 0 ? (
                  <div className="flex w-full flex-col gap-2.5 pb-2">
                    {messages.map((record) => {
                      const mine = record.sender_id === currentUserId;

                      return (
                        <article
                          key={record.id}
                          className={`flex ${mine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm sm:max-w-[72%] ${
                              mine
                                ? "rounded-br-md bg-blue-600 text-white"
                                : "rounded-bl-md bg-(--bg-secondary) text-(--text-primary)"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {record.message || "-"}
                            </p>
                            <p
                              className={`mt-1.5 text-[11px] ${
                                mine ? "text-blue-100" : "text-(--text-muted)"
                              }`}
                            >
                              {formatChatTimestamp(record.created_at)}
                            </p>
                          </div>
                        </article>
                      );
                    })}
                    <div ref={bottomAnchorRef} />
                  </div>
                ) : null}
              </div>

              <footer className="sticky bottom-0 border-t border-(--border-color) bg-(--bg-card)/95 p-3 backdrop-blur sm:p-4">
                <div className="mx-auto flex w-full max-w-4xl items-end gap-2.5">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(event) => setMessageInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder={
                      canSendInSelectedConversation
                        ? "Type a message..."
                        : "Waiting for a participant in this order chat"
                    }
                    disabled={
                      !canSendInSelectedConversation ||
                      Boolean(chatError) ||
                      sendingMessage
                    }
                    className="h-11 min-w-0 flex-1 rounded-2xl border border-(--border-color) bg-(--bg-card) px-4 text-sm text-(--text-primary) outline-none transition placeholder:text-(--text-muted) focus:border-(--border-focus) disabled:cursor-not-allowed disabled:opacity-65"
                  />

                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={
                      !selectedConversation?.peer_id ||
                      !messageInput.trim() ||
                      sendingMessage
                    }
                    className="inline-flex h-11 items-center gap-2 rounded-2xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) transition hover:bg-(--btn-bg-primary-hover) disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiSend className="size-4" />
                    Send
                  </button>
                </div>
              </footer>
            </>
          )}
        </section>
      </div>
    </section>
  );
}
