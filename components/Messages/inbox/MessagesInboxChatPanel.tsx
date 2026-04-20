import {
  FiArrowLeft,
  FiCircle,
  FiMessageSquare,
  FiSend,
  FiX,
} from "react-icons/fi";
import { cn } from "@/utils/helpers";
import { formatChatTimestamp } from "@/hooks/messages/messagesInboxUtils";
import { useMessagesInboxContext } from "./MessagesInboxProvider";
import { MessageBubbleSkeleton } from "./MessagesInboxShared";

function useMessagesInboxChatPanel() {
  const {
    bottomAnchorRef,
    canSendInSelectedConversation,
    chatError,
    currentUserId,
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
  } = useMessagesInboxContext();

  return {
    bottomAnchorRef,
    canSendInSelectedConversation,
    chatError,
    currentUserId,
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
  };
}

export default function MessagesInboxChatPanel() {
  const {
    bottomAnchorRef,
    canSendInSelectedConversation,
    chatError,
    currentUserId,
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
  } = useMessagesInboxChatPanel();

  return (
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
                        <p className="whitespace-pre-wrap wrap-break-word">
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
                  !canSendInSelectedConversation ||
                  Boolean(chatError) ||
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
  );
}
