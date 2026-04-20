import Image from "next/image";
import { FiClock, FiMessageSquare, FiSearch, FiUser } from "react-icons/fi";
import { cn } from "@/utils/helpers";
import { toRelativeTime } from "@/hooks/messages/messagesInboxUtils";
import { useMessagesInboxContext } from "./MessagesInboxProvider";
import { EmptyConversationsState, ThreadSkeleton } from "./MessagesInboxShared";

function useMessagesInboxSidebar() {
  const {
    errorMessage,
    filteredConversations,
    handleSelectConversation,
    hasSelectedOrder,
    isLoadingConversations,
    loadConversations,
    searchQuery,
    selectedConversationKey,
    setSearchQuery,
    unreadCountTotal,
  } = useMessagesInboxContext();

  return {
    errorMessage,
    filteredConversations,
    handleSelectConversation,
    hasSelectedOrder,
    isLoadingConversations,
    loadConversations,
    searchQuery,
    selectedConversationKey,
    setSearchQuery,
    unreadCountTotal,
  };
}

export default function MessagesInboxSidebar() {
  const {
    errorMessage,
    filteredConversations,
    handleSelectConversation,
    hasSelectedOrder,
    isLoadingConversations,
    loadConversations,
    searchQuery,
    selectedConversationKey,
    setSearchQuery,
    unreadCountTotal,
  } = useMessagesInboxSidebar();

  return (
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
            <EmptyConversationsState />
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
  );
}
