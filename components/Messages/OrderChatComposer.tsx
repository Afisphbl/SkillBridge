"use client";

import { FiSend } from "react-icons/fi";

type OrderChatComposerProps = {
  disabled: boolean;
  isSending: boolean;
  onSend: () => Promise<void>;
  messageInput: string;
  setMessageInput: (value: string) => void;
};

export function OrderChatComposer({
  disabled,
  isSending,
  onSend,
  messageInput,
  setMessageInput,
}: OrderChatComposerProps) {
  const isSendDisabled = disabled || !messageInput.trim() || isSending;

  return (
    <footer className="sticky bottom-0 border-t border-(--border-color) bg-(--bg-card)/95 p-3 backdrop-blur sm:p-4">
      <div className="mx-auto flex w-full max-w-3xl items-end gap-2.5">
        <input
          type="text"
          value={messageInput}
          onChange={(event) => setMessageInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void onSend();
            }
          }}
          placeholder="Type a message..."
          disabled={disabled}
          className="h-11 min-w-0 flex-1 rounded-2xl border border-(--border-color) bg-(--bg-card) px-4 text-sm text-(--text-primary) outline-none transition placeholder:text-(--text-muted) focus:border-(--border-focus) disabled:cursor-not-allowed disabled:opacity-65"
        />

        <button
          type="button"
          onClick={() => void onSend()}
          disabled={isSendDisabled}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) transition hover:bg-(--btn-bg-primary-hover) disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiSend className="size-4" />
          Send
        </button>
      </div>
    </footer>
  );
}
