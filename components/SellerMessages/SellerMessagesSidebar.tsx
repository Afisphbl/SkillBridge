"use client";

import Image from "next/image";
import {
  FiClock,
  FiMessageSquare,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import { cn } from "@/utils/helpers";
import {
  toRelativeTime,
} from "@/hooks/messages/messagesInboxUtils";
import type { MessageFilter } from "@/hooks/messages/useSellerMessagesData";
import { useSellerMessagesContext } from "./SellerMessagesProvider";

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ThreadSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-(--border-color) bg-(--bg-card) p-3"
        >
          <div className="flex items-start gap-3">
            <div className="size-10 shrink-0 animate-pulse rounded-full bg-(--bg-secondary)" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-2/5 animate-pulse rounded bg-(--bg-secondary)" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-(--bg-secondary)" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-(--bg-secondary)" />
            </div>
            <div className="h-3 w-10 animate-pulse rounded bg-(--bg-secondary)" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: MessageFilter }) {
  const messages: Record<MessageFilter, { title: string; sub: string }> = {
    all: {
      title: "No conversations yet",
      sub: "Start a chat from an order to see it here.",
    },
    unread: {
      title: "All caught up!",
      sub: "You have no unread messages.",
    },
    active: {
      title: "No active orders",
      sub: "Active order conversations will appear here.",
    },
    completed: {
      title: "No completed orders",
      sub: "Completed and cancelled order chats will appear here.",
    },
  };

  const { title, sub } = messages[filter];

  return (
    <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--bg-card) p-6 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-(--bg-secondary)">
        <FiMessageSquare className="size-5 text-(--text-muted)" />
      </div>
      <p className="mt-3 text-sm font-semibold text-(--text-primary)">{title}</p>
      <p className="mt-1 text-xs text-(--text-secondary)">{sub}</p>
    </div>
  );
}

// ─── Order status badge ───────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-(--badge-warning-bg) text-[color:var(--color-warning)]",
  accepted:
    "bg-green-100/70 text-green-700",
  in_progress:
    "bg-blue-100/60 text-blue-600",
  delivered:
    "bg-[color:color-mix(in_oklab,var(--color-info)_14%,transparent)] text-[color:var(--color-info)]",
  revision_requested:
    "bg-amber-100/60 text-amber-600",
  completed:
    "bg-(--badge-success-bg) text-[color:var(--color-success)]",
  cancelled:
    "bg-(--badge-danger-bg) text-[color:var(--color-danger)]",
};

function OrderStatusPill({ status }: { status: string | null }) {
  if (!status) return null;
  const style = STATUS_STYLES[status] ?? "bg-(--bg-secondary) text-(--text-muted)";
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${style}`}
    >
      {label}
    </span>
  );
}

// ─── Filter tabs ─────────────────────────────────────────────────────────────

const FILTER_TABS: Array<{ key: MessageFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Done" },
];

// ─── Main sidebar ─────────────────────────────────────────────────────────────

export default function SellerMessagesSidebar() {
  const {
    activeFilter,
    displayedConversations,
    errorMessage,
    filterCounts,
    handleSelectConversation,
    hasSelectedOrder,
    isLoadingConversations,
    loadConversations,
    searchQuery,
    selectedConversationKey,
    setActiveFilter,
    setSearchQuery,
    unreadCountTotal,
  } = useSellerMessagesContext();

  return (
    <aside
      className={cn(
        "h-full min-h-0 border-r border-(--border-color) bg-(--bg-card) flex-col",
        hasSelectedOrder
          ? "hidden md:flex md:w-[300px] lg:w-[340px] shrink-0"
          : "flex w-full flex-1",
      )}
    >
      {/* ── Header ── */}
      <header className="border-b border-(--border-color) px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black tracking-tight text-(--text-primary)">
              Messages
            </h1>
            {unreadCountTotal > 0 && (
              <p className="mt-0.5 text-xs font-semibold text-(--text-muted)">
                {unreadCountTotal} unread
              </p>
            )}
          </div>
        </div>

        {/* Search */}
        <label className="relative block">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-(--text-muted)" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by buyer, order…"
            className="h-9 w-full rounded-xl border border-(--border-color) bg-(--bg-secondary) pl-9 pr-3 text-xs text-(--text-primary) outline-none transition focus:border-(--border-focus) focus:bg-(--bg-card)"
          />
        </label>

        {/* Filter tabs */}
        <div className="flex items-center gap-1">
          {FILTER_TABS.map((tab) => {
            const count = filterCounts[tab.key];
            const active = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all",
                  active
                    ? "bg-(--btn-bg-primary) text-(--btn-text-primary) shadow-sm"
                    : "text-(--text-muted) hover:bg-(--hover-bg) hover:text-(--text-secondary)",
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-black",
                      active
                        ? "bg-white/25 text-white"
                        : "bg-(--bg-secondary) text-(--text-muted)",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── Conversation list ── */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {isLoadingConversations && <ThreadSkeleton />}

        {!isLoadingConversations && errorMessage && (
          <div className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-4 text-center">
            <p className="text-sm font-semibold text-(--color-danger)">
              Failed to load messages
            </p>
            <p className="mt-1 text-xs text-(--text-secondary)">{errorMessage}</p>
            <button
              type="button"
              onClick={() => void loadConversations()}
              className="mt-3 inline-flex h-9 items-center rounded-lg bg-(--btn-bg-primary) px-3 text-xs font-semibold text-(--btn-text-primary)"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoadingConversations && !errorMessage && displayedConversations.length === 0 && (
          <EmptyState filter={activeFilter} />
        )}

        {!isLoadingConversations &&
          !errorMessage &&
          displayedConversations.map((conv) => {
            const active = conv.key === selectedConversationKey;

            return (
              <button
                key={conv.key}
                type="button"
                onClick={() => handleSelectConversation(conv)}
                className={cn(
                  "block w-full rounded-xl border p-3 text-left transition-all hover:bg-(--hover-bg)",
                  active
                    ? "border-(--color-primary) border-l-[3px] bg-(--bg-secondary) shadow-sm"
                    : "border-(--border-color) bg-(--bg-card)",
                )}
              >
                <article className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="grid size-10 place-items-center overflow-hidden rounded-full bg-(--bg-secondary) text-xs font-bold text-(--text-secondary)">
                      {conv.peer_avatar ? (
                        <Image
                          src={conv.peer_avatar}
                          alt={`${conv.peer_name} avatar`}
                          width={40}
                          height={40}
                          unoptimized
                          className="size-10 rounded-full object-cover"
                        />
                      ) : (
                        conv.peer_initials || <FiUser className="size-4" />
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-(--color-primary) text-[9px] font-black text-(--text-inverse)">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "truncate text-sm text-(--text-primary)",
                          conv.unreadCount > 0 ? "font-black" : "font-semibold",
                        )}
                      >
                        {conv.peer_name}
                      </p>
                      <span className="inline-flex shrink-0 items-center gap-1 text-[10px] text-(--text-muted)">
                        <FiClock className="size-2.5" />
                        {toRelativeTime(conv.lastMessageAt)}
                      </span>
                    </div>

                    {/* Service title */}
                    {conv.serviceTitle && (
                      <p className="mt-0.5 truncate text-[11px] font-semibold text-(--color-primary)">
                        {conv.serviceTitle}
                      </p>
                    )}

                    {/* Order ref + status */}
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-[10px] font-medium text-(--text-muted)">
                        #{conv.orderNumber ?? conv.order_id.slice(0, 8)}
                      </p>
                      <OrderStatusPill status={conv.orderStatus} />
                    </div>

                    {/* Last message */}
                    <p
                      className={cn(
                        "mt-1 line-clamp-1 text-xs",
                        conv.unreadCount > 0
                          ? "font-semibold text-(--text-primary)"
                          : "text-(--text-secondary)",
                      )}
                    >
                      {conv.lastMessage}
                    </p>
                  </div>
                </article>
              </button>
            );
          })}
      </div>
    </aside>
  );
}
