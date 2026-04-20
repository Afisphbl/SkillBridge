"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
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
import {
  dedupeMessages,
  initialsFromName,
  normalizeMessages,
  sortByCreatedAtAsc,
  type ConversationPreview,
  type MessageRecord,
  type OrderParticipants,
  type SelectedConversation,
  type UserPreview,
} from "@/hooks/messages/messagesInboxUtils";

export function useMessagesInboxData() {
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
        // Keep composer disabled if participants cannot be resolved.
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

  return {
    bottomAnchorRef,
    canSendInSelectedConversation,
    chatError,
    currentUserId,
    errorMessage,
    filteredConversations,
    handleSelectConversation,
    handleSend,
    hasSelectedOrder,
    isLoadingConversations,
    loadConversationMessages,
    loadConversations,
    loadingMessages,
    messageInput,
    messages,
    selectedConversation,
    selectedConversationKey,
    sendingMessage,
    setMessageInput,
    setMessageOrderParam,
    setSearchQuery,
    searchQuery,
    unreadCountTotal,
  };
}
