"use client";

import { RefObject } from "react";
import { FiMessageCircle } from "react-icons/fi";
import type { MessageRecord } from "@/hooks/messages/useOrderChat";

function formatTimestamp(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
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

type OrderChatContentProps = {
  bottomAnchorRef: RefObject<HTMLDivElement | null>;
  currentUserId: string;
  errorMessage: string;
  hasConversationContext: boolean;
  isLoading: boolean;
  onRetry: () => Promise<void>;
  sortedMessages: MessageRecord[];
};

export function OrderChatContent({
  bottomAnchorRef,
  currentUserId,
  errorMessage,
  hasConversationContext,
  isLoading,
  onRetry,
  sortedMessages,
}: OrderChatContentProps) {
  return (
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
            onClick={() => void onRetry()}
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
  );
}
