"use client";

import Image from "next/image";
import {
  FiArrowLeft,
  FiMessageSquare,
  FiSend,
  FiUser,
  FiX,
} from "react-icons/fi";
import { cn } from "@/utils/helpers";
import { formatChatTimestamp } from "@/hooks/messages/messagesInboxUtils";
import { useSellerMessagesContext } from "./SellerMessagesProvider";

// ─── Skeleton ────────────────────────────────────────────────────────────────

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

// ─── Order status badge (in header) ──────────────────────────────────────────

const HEADER_STATUS_STYLES: Record<string, string> = {
  pending: "bg-(--badge-warning-bg) text-[color:var(--color-warning)] ring-[color:color-mix(in_oklab,var(--color-warning)_40%,transparent)]",
  accepted: "bg-green-100/70 text-green-700 ring-green-400/40",
  in_progress: "bg-blue-100/60 text-blue-600 ring-blue-400/40",
  delivered: "bg-[color:color-mix(in_oklab,var(--color-info)_14%,transparent)] text-[color:var(--color-info)] ring-[color:color-mix(in_oklab,var(--color-info)_35%,transparent)]",
  revision_requested: "bg-amber-100/60 text-amber-600 ring-amber-400/40",
  completed: "bg-(--badge-success-bg) text-[color:var(--color-success)] ring-[color:color-mix(in_oklab,var(--color-success)_35%,transparent)]",
  cancelled: "bg-(--badge-danger-bg) text-[color:var(--color-danger)] ring-[color:color-mix(in_oklab,var(--color-danger)_35%,transparent)]",
};

function HeaderStatusBadge({ status }: { status: string | null }) {
  if (!status) return null;
  const style =
    HEADER_STATUS_STYLES[status] ??
    "bg-(--bg-secondary) text-(--text-muted) ring-(--border-color)";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ${style}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Empty / no-selection state ───────────────────────────────────────────────

function NoChatSelected() {
  return (
    <div className="grid flex-1 place-items-center p-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-(--bg-secondary)">
          <FiMessageSquare className="size-9 text-(--text-muted)" />
        </div>
        <h2 className="mt-5 text-xl font-bold text-(--text-primary)">
          Select a conversation
        </h2>
        <p className="mt-2 text-sm text-(--text-secondary)">
          Choose a conversation from the left to start messaging your buyer.
        </p>
      </div>
    </div>
  );
}

// ─── Main chat panel ──────────────────────────────────────────────────────────

export default function SellerMessagesChatPanel() {
  const {
    bottomAnchorRef,
    canSendInSelectedConversation,
    chatError,
    currentUserId,
    displayedConversations,
    handleSend,
    hasSelectedOrder,
    loadConversationMessages,
    loadingMessages,
    messageInput,
    messages,
    selectedConversation,
    sendingMessage,
    setMessageInput,
    setMessageOrderParam,
  } = useSellerMessagesContext();

  // Find enriched data for the selected conversation
  const enriched = selectedConversation
    ? displayedConversations.find(
        (c) =>
          c.order_id === selectedConversation.order_id &&
          c.peer_id === selectedConversation.peer_id,
      ) ?? null
    : null;

  return (
    <section
      className={cn(
        "h-full min-h-0 flex-1 flex-col border-l border-(--border-color)",
        hasSelectedOrder ? "flex" : "hidden",
      )}
    >
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <>
          {/* ── Chat header ── */}
          <header className="flex items-center justify-between gap-3 border-b border-(--border-color) bg-(--bg-card) px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              {/* Back button (mobile) */}
              <button
                type="button"
                onClick={() => setMessageOrderParam()}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-(--border-color) text-(--text-secondary) transition hover:bg-(--hover-bg) md:hidden"
                aria-label="Back to conversations"
              >
                <FiArrowLeft className="size-4" />
              </button>

              {/* Peer avatar */}
              <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-(--bg-secondary) text-xs font-bold text-(--text-secondary)">
                {selectedConversation.peer_avatar ? (
                  <Image
                    src={selectedConversation.peer_avatar}
                    alt={`${selectedConversation.peer_name} avatar`}
                    width={36}
                    height={36}
                    unoptimized
                    className="size-9 rounded-full object-cover"
                  />
                ) : (
                  <FiUser className="size-4" />
                )}
              </div>

              {/* Peer info */}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-(--text-primary)">
                  {selectedConversation.peer_name}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  {enriched?.serviceTitle && (
                    <span className="truncate text-xs font-semibold text-(--color-primary)">
                      {enriched.serviceTitle}
                    </span>
                  )}
                  <span className="text-xs text-(--text-muted)">
                    #{enriched?.orderNumber ?? selectedConversation.order_id.slice(0, 8)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {/* Order status badge */}
              <HeaderStatusBadge status={enriched?.orderStatus ?? null} />

              {/* Close button */}
              <button
                type="button"
                onClick={() => setMessageOrderParam()}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-(--border-color) px-3 text-xs font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
                aria-label="Close chat"
              >
                <FiX className="size-3.5" />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>
          </header>

          {/* ── Message list ── */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.07),transparent_55%)] px-3 py-4 sm:px-5">
            {loadingMessages && (
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
                <MessageBubbleSkeleton mine={false} />
                <MessageBubbleSkeleton mine={true} />
                <MessageBubbleSkeleton mine={false} />
                <MessageBubbleSkeleton mine={true} />
              </div>
            )}

            {!loadingMessages && chatError && (
              <div className="mx-auto mt-8 max-w-md rounded-2xl border border-(--border-color) bg-(--bg-card) p-6 text-center shadow-sm">
                <p className="text-sm font-semibold text-(--color-danger)">
                  {chatError}
                </p>
                <button
                  type="button"
                  onClick={() => void loadConversationMessages()}
                  className="mt-4 inline-flex h-10 items-center rounded-xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover)"
                >
                  Retry
                </button>
              </div>
            )}

            {!loadingMessages && !chatError && messages.length === 0 && (
              <div className="mx-auto mt-10 w-full max-w-md rounded-2xl border border-dashed border-(--border-color) bg-(--bg-card) p-7 text-center shadow-sm">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-(--bg-secondary)">
                  <FiMessageSquare className="size-6 text-(--text-muted)" />
                </div>
                <h2 className="mt-3 text-base font-semibold text-(--text-primary)">
                  No messages yet
                </h2>
                <p className="mt-1 text-sm text-(--text-secondary)">
                  Send the first message to start this conversation.
                </p>
              </div>
            )}

            {!loadingMessages && !chatError && messages.length > 0 && (
              <div className="flex w-full flex-col gap-2.5 pb-2">
                {messages.map((record) => {
                  const mine = record.sender_id === currentUserId;
                  return (
                    <article
                      key={record.id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm sm:max-w-[72%]",
                          mine
                            ? "rounded-br-md bg-blue-600 text-white"
                            : "rounded-bl-md bg-(--bg-secondary) text-(--text-primary)",
                        )}
                      >
                        <p className="whitespace-pre-wrap wrap-break-word">
                          {record.message || "—"}
                        </p>
                        <p
                          className={cn(
                            "mt-1.5 text-[11px]",
                            mine ? "text-blue-100" : "text-(--text-muted)",
                          )}
                        >
                          {formatChatTimestamp(record.created_at)}
                        </p>
                      </div>
                    </article>
                  );
                })}
                <div ref={bottomAnchorRef} />
              </div>
            )}
          </div>

          {/* ── Composer ── */}
          <footer className="border-t border-(--border-color) bg-(--bg-card)/95 p-3 backdrop-blur sm:p-4">
            <div className="mx-auto flex w-full max-w-4xl items-end gap-2.5">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder={
                  canSendInSelectedConversation
                    ? "Type a message…"
                    : "Waiting for order participant info…"
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
                  !canSendInSelectedConversation ||
                  Boolean(chatError) ||
                  !messageInput.trim() ||
                  sendingMessage
                }
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) transition hover:bg-(--btn-bg-primary-hover) disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSend className="size-4" />
                <span className="hidden sm:inline">
                  {sendingMessage ? "Sending…" : "Send"}
                </span>
              </button>
            </div>
          </footer>
        </>
      )}
    </section>
  );
}
