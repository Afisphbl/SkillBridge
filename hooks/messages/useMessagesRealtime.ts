"use client";

import { useEffect, useRef } from "react";
import { getAllMessages } from "@/services/supabase/messageServices";

type MessageRecord = {
  id: string;
  sender_id: string;
  receiver_id: string;
  order_id?: string | null;
  message?: string | null;
  created_at?: string | null;
  is_read?: boolean | null;
};

type UseMessagesRealtimeInput = {
  currentUserId: string;
  enabled?: boolean;
  intervalMs?: number;
  onNewMessages: (messages: MessageRecord[]) => void;
};

function normalizeMessages(records: unknown) {
  if (!Array.isArray(records)) return [] as MessageRecord[];

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

function sortByCreatedAtAsc(records: MessageRecord[]) {
  return [...records].sort((left, right) => {
    const leftMs = new Date(left.created_at || 0).getTime();
    const rightMs = new Date(right.created_at || 0).getTime();
    return leftMs - rightMs;
  });
}

export function useMessagesRealtime({
  currentUserId,
  enabled = true,
  intervalMs = 3500,
  onNewMessages,
}: UseMessagesRealtimeInput) {
  const knownIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || !currentUserId) {
      knownIdsRef.current = new Set();
      return;
    }

    let active = true;

    const poll = async () => {
      const { data, error } = await getAllMessages();
      if (error || !active) return;

      const scoped = sortByCreatedAtAsc(
        normalizeMessages(data).filter(
          (record) =>
            record.sender_id === currentUserId ||
            record.receiver_id === currentUserId,
        ),
      );

      if (knownIdsRef.current.size === 0) {
        knownIdsRef.current = new Set(scoped.map((record) => record.id));
        return;
      }

      const newMessages = scoped.filter(
        (record) => !knownIdsRef.current.has(record.id),
      );

      if (newMessages.length > 0) {
        for (const record of newMessages) {
          knownIdsRef.current.add(record.id);
        }

        onNewMessages(newMessages);
      }
    };

    void poll();
    const timer = window.setInterval(() => {
      void poll();
    }, intervalMs);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [currentUserId, enabled, intervalMs, onNewMessages]);
}
