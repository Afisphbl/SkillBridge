"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { FiArrowLeft, FiCircle, FiMessageCircle, FiSend } from "react-icons/fi";
import { getCurrentUser } from "@/services/supabase/auth";
import {
  getChatMessages,
  markMessageAsRead,
  sendMessage,
} from "@/services/supabase/messageServices";

type MessageRecord = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message?: string | null;
  created_at?: string | null;
  is_read?: boolean | null;
};

function formatTimestamp(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

export default function MessageDetailsPage() {
  const params = useParams<{ order_id?: string; orderId?: string }>();
  const searchParams = useSearchParams();

  const orderId = useMemo(() => {
    const raw = params?.order_id || params?.orderId || "";
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const peerId = searchParams.get("peerId") || "";
  const peerName = searchParams.get("peerName") || "Conversation";

  const [currentUserId, setCurrentUserId] = useState("");
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

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

  const hasConversationContext = Boolean(orderId && peerId);
  const sortedMessages = useMemo(
    () =>
      [...messages].sort((left, right) => {
        const leftMs = new Date(left.created_at || 0).getTime();
        const rightMs = new Date(right.created_at || 0).getTime();
        return leftMs - rightMs;
      }),
    [messages],
  );

  const handleSend = async () => {
    if (!message.trim() || !currentUserId || !peerId || !orderId || isSending) {
      return;
    }

    setIsSending(true);

    const payload = {
      order_id: orderId,
      sender_id: currentUserId,
      receiver_id: peerId,
      message: message.trim(),
    };

    const { error } = await sendMessage(payload);

    if (error) {
      toast.error("Failed to send message.");
      setIsSending(false);
      return;
    }

    setMessage("");
    await refetchMessages();
    setIsSending(false);
  };

  return (
    <section className="flex h-[calc(100vh-8.25rem)] flex-col overflow-hidden rounded-3xl border border-(--border-color) bg-(--bg-card) shadow-[0_18px_44px_-26px_rgba(15,23,42,0.75)]">
      <header className="sticky top-0 z-10 border-b border-(--border-color) bg-(--bg-card)/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/messages"
            className="inline-flex size-9 items-center justify-center rounded-full border border-(--border-color) text-(--text-secondary) transition hover:bg-(--hover-bg)"
            aria-label="Back to messages inbox"
          >
            <FiArrowLeft className="size-4" />
          </Link>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-(--text-primary) sm:text-base">
              {peerName}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-(--text-muted)">
              <FiCircle className="size-2.5 fill-current text-emerald-500" />
              <span>Order #{orderId}</span>
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.08),transparent_50%)] px-3 py-4 sm:px-5">
        {!hasConversationContext ? (
          <div className="mx-auto mt-6 max-w-md rounded-2xl border border-(--border-color) bg-(--bg-card) p-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-(--color-danger)">
              Missing conversation details.
            </p>
            <p className="mt-1 text-sm text-(--text-secondary)">
              Open this thread from your inbox to load peer information.
            </p>
          </div>
        ) : null}

        {hasConversationContext && isLoading ? (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
            <MessageBubbleSkeleton mine={false} />
            <MessageBubbleSkeleton mine={true} />
            <MessageBubbleSkeleton mine={false} />
            <MessageBubbleSkeleton mine={true} />
          </div>
        ) : null}

        {hasConversationContext && !isLoading && errorMessage ? (
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-(--border-color) bg-(--bg-card) p-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-(--color-danger)">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => void refetchMessages()}
              className="mt-4 inline-flex h-10 items-center rounded-xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover)"
            >
              Retry
            </button>
          </div>
        ) : null}

        {hasConversationContext && !isLoading && !errorMessage ? (
          <div className="flex w-full flex-col gap-2.5 pb-2">
            {sortedMessages.length === 0 ? (
              <div className="mx-auto mt-10 w-full max-w-md rounded-2xl border border-dashed border-(--border-color) bg-(--bg-card) p-7 text-center shadow-sm">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-(--bg-secondary)">
                  <FiMessageCircle className="size-6 text-(--text-muted)" />
                </div>
                <h2 className="mt-3 text-base font-semibold text-(--text-primary)">
                  Start the conversation
                </h2>
                <p className="mt-1 text-sm text-(--text-secondary)">
                  Send the first message to begin this order chat.
                </p>
              </div>
            ) : (
              sortedMessages.map((record) => {
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
                      <p className="whitespace-pre-wrap wrap-break-word">
                        {record.message || "-"}
                      </p>
                      <p
                        className={`mt-1.5 text-[11px] ${
                          mine ? "text-blue-100" : "text-(--text-muted)"
                        }`}
                      >
                        {formatTimestamp(record.created_at)}
                      </p>
                    </div>
                  </article>
                );
              })
            )}
            <div ref={bottomAnchorRef} />
          </div>
        ) : null}
      </div>

      <footer className="sticky bottom-0 border-t border-(--border-color) bg-(--bg-card)/95 p-3 backdrop-blur sm:p-4">
        <div className="mx-auto flex w-full max-w-3xl items-end gap-2.5">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            placeholder="Type a message..."
            disabled={
              !hasConversationContext || Boolean(errorMessage) || isSending
            }
            className="h-11 min-w-0 flex-1 rounded-2xl border border-(--border-color) bg-(--bg-card) px-4 text-sm text-(--text-primary) outline-none transition placeholder:text-(--text-muted) focus:border-(--border-focus) disabled:cursor-not-allowed disabled:opacity-65"
          />

          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!message.trim() || !hasConversationContext || isSending}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) transition hover:bg-(--btn-bg-primary-hover) disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSend className="size-4" />
            Send
          </button>
        </div>
      </footer>
    </section>
  );
}
