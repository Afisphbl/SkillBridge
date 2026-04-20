import { FiMessageSquare } from "react-icons/fi";

export function ThreadSkeleton({ count = 7 }: { count?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_value, index) => (
        <div
          key={index}
          className="rounded-xl border border-(--border-color) bg-(--bg-card) p-3"
        >
          <div className="flex items-start gap-3">
            <div className="size-10 animate-pulse rounded-full bg-(--bg-secondary)" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-2/5 animate-pulse rounded bg-(--bg-secondary)" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-(--bg-secondary)" />
            </div>
            <div className="h-3 w-10 animate-pulse rounded bg-(--bg-secondary)" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageBubbleSkeleton({ mine }: { mine: boolean }) {
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

export function EmptyConversationsState() {
  return (
    <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--bg-card) p-6 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-(--bg-secondary)">
        <FiMessageSquare className="size-5 text-(--text-muted)" />
      </div>
      <p className="mt-3 text-sm font-semibold text-(--text-primary)">
        No conversations yet
      </p>
      <p className="mt-1 text-xs text-(--text-secondary)">
        Start a chat from an order to see it here.
      </p>
    </div>
  );
}
