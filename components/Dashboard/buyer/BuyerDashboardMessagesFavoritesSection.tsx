import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiMessageSquare, FiSearch } from "react-icons/fi";
import { formatRelativeTime } from "@/hooks/dashboard/buyerDashboardUtils";
import { formatPrice } from "@/utils/format";
import { cn } from "@/utils/helpers";
import { useBuyerDashboardContext } from "./BuyerDashboardProvider";
import { EmptyState, SectionHeader, SectionShell } from "./shared";

function useBuyerDashboardMessagesFavoritesSection() {
  const {
    favoriteCards,
    handleRemoveFavorite,
    messagesPreview,
    pagedFavorites,
    pagedMessages,
    setFavoritesPage,
    setMessagesPage,
    unreadMessages,
  } = useBuyerDashboardContext();

  return {
    favoriteCards,
    handleRemoveFavorite,
    messagesPreview,
    pagedFavorites,
    pagedMessages,
    setFavoritesPage,
    setMessagesPage,
    unreadMessages,
  };
}

export default function BuyerDashboardMessagesFavoritesSection() {
  const {
    favoriteCards,
    handleRemoveFavorite,
    messagesPreview,
    pagedFavorites,
    pagedMessages,
    setFavoritesPage,
    setMessagesPage,
    unreadMessages,
  } = useBuyerDashboardMessagesFavoritesSection();

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <SectionShell>
        <SectionHeader
          title="Messages Preview"
          subtitle="Recent freelancer conversations"
          action={
            <Link
              href="/messages"
              className="inline-flex items-center gap-1 text-sm font-semibold text-(--color-primary)"
            >
              Open inbox <FiArrowRight className="size-4" />
            </Link>
          }
        />

        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-(--bg-secondary) px-3 py-1 text-xs font-semibold text-(--text-secondary)">
          <FiMessageSquare className="size-3.5" />
          {unreadMessages} unread messages
        </div>

        {pagedMessages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="No messages exist yet. Start an order conversation to chat with freelancers."
          />
        ) : (
          <div className="space-y-3">
            {pagedMessages.map((thread) => (
              <article
                key={`${thread.peerId}-${thread.orderId}`}
                className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="relative size-11 overflow-hidden rounded-full bg-(--bg-secondary)">
                    {thread.peerAvatar ? (
                      <Image
                        src={thread.peerAvatar}
                        alt={thread.peerName}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <span className="grid h-full place-items-center text-xs font-bold text-(--text-secondary)">
                        {thread.peerName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-(--bg-card)",
                        thread.online
                          ? "bg-(--color-success)"
                          : "bg-(--text-muted)",
                      )}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-(--text-primary)">
                        {thread.peerName}
                      </p>
                      <span className="text-xs text-(--text-muted)">
                        {formatRelativeTime(thread.timestamp)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm text-(--text-secondary)">
                      {thread.lastMessage}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Link
                        href={`/messages?m=${thread.orderId}`}
                        className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--text-primary)"
                      >
                        Open conversation
                      </Link>
                      <Link
                        href={`/orders/${thread.orderId}`}
                        className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--text-primary)"
                      >
                        View order
                      </Link>
                      {thread.unreadCount > 0 ? (
                        <span className="rounded-full bg-(--color-primary) px-2 py-0.5 text-[11px] font-semibold text-(--text-inverse)">
                          {thread.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {messagesPreview.length > pagedMessages.length ? (
          <button
            type="button"
            onClick={() => setMessagesPage((prev) => prev + 1)}
            className="mt-4 rounded-lg border border-(--border-color) px-4 py-2 text-sm font-semibold text-(--text-primary)"
          >
            Load more conversations
          </button>
        ) : null}
      </SectionShell>

      <SectionShell>
        <SectionHeader
          title="Saved Services"
          subtitle="Favorites you can quickly revisit and order"
          action={
            <Link
              href="/services"
              className="inline-flex items-center gap-1 text-sm font-semibold text-(--color-primary)"
            >
              Discover more <FiSearch className="size-4" />
            </Link>
          }
        />

        {pagedFavorites.length === 0 ? (
          <EmptyState
            title="No favorites saved"
            description="No favorites exist yet. Save services while browsing to access them quickly here."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {pagedFavorites.map((favorite) => (
              <article
                key={favorite.favoriteId}
                className="overflow-hidden rounded-2xl border border-(--border-color) bg-(--bg-card)"
              >
                <div className="relative h-28 w-full">
                  <Image
                    src={favorite.image}
                    alt={favorite.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="line-clamp-1 text-sm font-bold text-(--text-primary)">
                    {favorite.title}
                  </p>
                  <p className="mt-1 text-xs text-(--text-secondary)">
                    {favorite.sellerName}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs text-(--text-muted)">
                    <span>{favorite.category}</span>
                    <span>{formatPrice(favorite.price)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/services/${favorite.serviceId}`}
                      className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--text-primary)"
                    >
                      View service
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        void handleRemoveFavorite(favorite.favoriteId)
                      }
                      className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--color-danger)"
                    >
                      Remove
                    </button>
                    <Link
                      href={`/services/${favorite.serviceId}`}
                      className="rounded-lg bg-(--btn-bg-primary) px-2.5 py-1 text-xs font-semibold text-(--btn-text-primary)"
                    >
                      Order service
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {favoriteCards.length > pagedFavorites.length ? (
          <button
            type="button"
            onClick={() => setFavoritesPage((prev) => prev + 1)}
            className="mt-4 rounded-lg border border-(--border-color) px-4 py-2 text-sm font-semibold text-(--text-primary)"
          >
            Load more favorites
          </button>
        ) : null}
      </SectionShell>
    </div>
  );
}
