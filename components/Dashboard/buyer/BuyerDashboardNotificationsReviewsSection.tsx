import Link from "next/link";
import { FiStar } from "react-icons/fi";
import {
  formatDate,
  formatDateTime,
} from "@/hooks/dashboard/buyerDashboardUtils";
import { cn } from "@/utils/helpers";
import { useBuyerDashboardContext } from "./BuyerDashboardProvider";
import { EmptyState, SectionHeader, SectionShell } from "./shared";

function useBuyerDashboardNotificationsReviewsSection() {
  const {
    handleDeleteNotification,
    handleDeleteReview,
    handleMarkRead,
    notifications,
    pagedNotifications,
    pagedReviews,
    reviewCards,
    setNotificationsPage,
    setReviewsPage,
  } = useBuyerDashboardContext();

  return {
    handleDeleteNotification,
    handleDeleteReview,
    handleMarkRead,
    notifications,
    pagedNotifications,
    pagedReviews,
    reviewCards,
    setNotificationsPage,
    setReviewsPage,
  };
}

export default function BuyerDashboardNotificationsReviewsSection() {
  const {
    handleDeleteNotification,
    handleDeleteReview,
    handleMarkRead,
    notifications,
    pagedNotifications,
    pagedReviews,
    reviewCards,
    setNotificationsPage,
    setReviewsPage,
  } = useBuyerDashboardNotificationsReviewsSection();

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <SectionShell>
        <SectionHeader
          title="Notifications Center"
          subtitle="Order, payment, and system updates"
        />

        {pagedNotifications.length === 0 ? (
          <EmptyState
            title="No notifications yet"
            description="No notifications exist yet. Updates will appear here in real time."
          />
        ) : (
          <div className="space-y-2">
            {pagedNotifications.map((item) => {
              const content =
                item.message || item.body || item.title || "New update";
              return (
                <article
                  key={item.id}
                  className={cn(
                    "rounded-xl border p-3",
                    item.is_read === false
                      ? "border-(--color-primary)/40 bg-(--color-primary)/5"
                      : "border-(--border-color) bg-(--bg-card)",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-(--text-primary)">
                        {content}
                      </p>
                      <p className="mt-1 text-xs text-(--text-muted)">
                        {formatDateTime(item.created_at)}
                      </p>
                    </div>
                    {item.is_read === false ? (
                      <span className="rounded-full bg-(--color-primary) px-2 py-0.5 text-[11px] font-semibold text-(--text-inverse)">
                        New
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleMarkRead(item.id)}
                      className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--text-primary)"
                    >
                      Mark as read
                    </button>
                    {item.order_id ? (
                      <Link
                        href={`/orders/${item.order_id}`}
                        className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--text-primary)"
                      >
                        Open order
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void handleDeleteNotification(item.id)}
                      className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--color-danger)"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {notifications.length > pagedNotifications.length ? (
          <button
            type="button"
            onClick={() => setNotificationsPage((prev) => prev + 1)}
            className="mt-4 rounded-lg border border-(--border-color) px-4 py-2 text-sm font-semibold text-(--text-primary)"
          >
            Load more notifications
          </button>
        ) : null}
      </SectionShell>

      <SectionShell>
        <SectionHeader
          title="Reviews & Ratings"
          subtitle="Manage the feedback you have published"
        />

        {pagedReviews.length === 0 ? (
          <EmptyState
            title="No reviews yet"
            description="No reviews exist yet. Complete an order and leave feedback for freelancers."
          />
        ) : (
          <div className="space-y-2">
            {pagedReviews.map((review) => (
              <article
                key={review.id}
                className="rounded-xl border border-(--border-color) bg-(--bg-card) p-3"
              >
                <p className="text-sm font-semibold text-(--text-primary)">
                  {review.serviceName}
                </p>
                <p className="text-xs text-(--text-secondary)">
                  {review.sellerName}
                </p>
                <div className="mt-1 flex items-center gap-1 text-(--color-warning)">
                  <FiStar className="size-3.5" />
                  <span className="text-xs font-semibold">
                    {review.rating.toFixed(1)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-(--text-secondary)">
                  {review.text}
                </p>
                <p className="mt-2 text-xs text-(--text-muted)">
                  {formatDate(review.date)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    href={`/services/${review.serviceId}`}
                    className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--text-primary)"
                  >
                    View service
                  </Link>
                  <Link
                    href={`/services/${review.serviceId}`}
                    className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--text-primary)"
                  >
                    Edit review
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleDeleteReview(review.id)}
                    className="rounded-lg border border-(--border-color) px-2.5 py-1 text-xs font-semibold text-(--color-danger)"
                  >
                    Delete review
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {reviewCards.length > pagedReviews.length ? (
          <button
            type="button"
            onClick={() => setReviewsPage((prev) => prev + 1)}
            className="mt-4 rounded-lg border border-(--border-color) px-4 py-2 text-sm font-semibold text-(--text-primary)"
          >
            Load more reviews
          </button>
        ) : null}
      </SectionShell>
    </div>
  );
}
