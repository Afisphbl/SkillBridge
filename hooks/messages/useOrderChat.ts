"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getCurrentUser } from "@/services/supabase/auth";
import {
  getChatMessages,
  markMessageAsRead,
  sendMessage,
} from "@/services/supabase/messageServices";

export type MessageRecord = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message?: string | null;
  created_at?: string | null;
  is_read?: boolean | null;
};

function normalizeMessages(
  records: unknown,
  currentUserId: string,
  peerId: string,
) {
  if (!Array.isArray(records)) return [] as MessageRecord[];

  return records
    .filter((record): record is MessageRecord => {
      if (!record || typeof record !== "object") return false;
      const item = record as Partial<MessageRecord>;

      return (
        typeof item.id === "string" &&
        typeof item.sender_id === "string" &&
        typeof item.receiver_id === "string"
      );
    })
    .filter(
      (record) =>
        (record.sender_id === currentUserId && record.receiver_id === peerId) ||
        (record.sender_id === peerId && record.receiver_id === currentUserId),
    )
    .sort((left, right) => {
      const leftMs = new Date(left.created_at || 0).getTime();
      const rightMs = new Date(right.created_at || 0).getTime();
      return leftMs - rightMs;
    });
}

type UseOrderChatInput = {
  orderId: string;
  peerId: string;
};

export function useOrderChat({ orderId, peerId }: UseOrderChatInput) {
  const [currentUserId, setCurrentUserId] = useState("");
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

  const hasConversationContext = Boolean(orderId && peerId);

  const refetchMessages = useCallback(async () => {
    if (!orderId || !peerId) {
      setErrorMessage(
        "Missing conversation details. Open this chat from inbox.",
      );
      setIsLoading(false);
      return;
    }

    try {
      const { user, error: authError } = await getCurrentUser();
      if (authError || !user?.id) {
        throw new Error("Please login to view this conversation.");
      }

      const { data, error } = await getChatMessages(orderId, user.id, peerId);
      if (error) {
        throw new Error("Failed to load chat messages.");
      }

      const scopedMessages = normalizeMessages(data, user.id, peerId);

      setCurrentUserId(user.id);
      setMessages(scopedMessages);
      setErrorMessage("");

      const unreadForCurrentUser = scopedMessages.filter(
        (record) => record.receiver_id === user.id && record.is_read === false,
      );

      if (unreadForCurrentUser.length > 0) {
        await Promise.all(
          unreadForCurrentUser.map((record) => markMessageAsRead(record.id)),
        );
      }
    } catch (error) {
      const messageText =
        error instanceof Error
          ? error.message
          : "Failed to load chat messages.";
      setErrorMessage(messageText);
      toast.error(messageText);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, peerId]);

  useEffect(() => {
    let active = true;

    const initialFetchTimeout = window.setTimeout(() => {
      if (!active) return;
      void refetchMessages();
    }, 0);

    const intervalId = window.setInterval(() => {
      if (!active) return;
      void refetchMessages();
    }, 7000);

    return () => {
      active = false;
      window.clearTimeout(initialFetchTimeout);
      window.clearInterval(intervalId);
    };
  }, [refetchMessages]);

  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sortedMessages = useMemo(
    () =>
      [...messages].sort((left, right) => {
        const leftMs = new Date(left.created_at || 0).getTime();
        const rightMs = new Date(right.created_at || 0).getTime();
        return leftMs - rightMs;
      }),
    [messages],
  );

  const handleSend = useCallback(async () => {
    if (
      !messageInput.trim() ||
      !currentUserId ||
      !peerId ||
      !orderId ||
      isSending
    ) {
      return;
    }

    setIsSending(true);

    const payload = {
      order_id: orderId,
      sender_id: currentUserId,
      receiver_id: peerId,
      message: messageInput.trim(),
    };

    const { error } = await sendMessage(payload);

    if (error) {
      toast.error("Failed to send message.");
      setIsSending(false);
      return;
    }

    setMessageInput("");
    await refetchMessages();
    setIsSending(false);
  }, [
    currentUserId,
    isSending,
    messageInput,
    orderId,
    peerId,
    refetchMessages,
  ]);

  return {
    bottomAnchorRef,
    currentUserId,
    errorMessage,
    hasConversationContext,
    isLoading,
    isSending,
    messageInput,
    refetchMessages,
    setMessageInput,
    sortedMessages,
    handleSend,
  };
}
