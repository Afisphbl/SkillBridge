"use client";

import Image from "next/image";
import { FiStar } from "react-icons/fi";
import { useServiceReviews } from "@/hooks/services/useServiceReviews";

function toNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export default function ReviewsSection() {
  const { reviews, averageRating, totalReviews } = useServiceReviews();

  return (
    <section className="space-y-4 rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-(--text-primary)">Reviews</h2>
        <p className="inline-flex items-center gap-1.5 text-sm text-(--text-secondary)">
          <FiStar className="fill-amber-500 text-amber-500" />
          <span className="font-semibold">{averageRating.toFixed(1)}</span>
          <span className="text-(--text-muted)">({totalReviews})</span>
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-(--border-color) bg-(--bg-secondary) px-4 py-8 text-center">
          <p className="text-sm text-(--text-secondary)">
            No reviews yet for this service.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review, index) => {
            const reviewRating = toNumber(review.rating, 0);
            const name = review.user_name || "Anonymous buyer";
            const key = String(review.id || `${name}-${index}`);

            return (
              <article
                key={key}
                className="rounded-xl border border-(--border-color) p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="grid size-8 place-items-center overflow-hidden rounded-full bg-(--bg-secondary)">
                    {review.user_avatar ? (
                      <Image
                        src={review.user_avatar}
                        alt={name}
                        width={32}
                        height={32}
                        unoptimized
                        className="size-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-[11px] font-bold text-(--text-muted)">
                        {name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-(--text-primary)">
                      {name}
                    </p>
                    <p className="inline-flex items-center gap-1 text-xs text-amber-600">
                      <FiStar className="fill-amber-500" />
                      {reviewRating.toFixed(1)}
                    </p>
                  </div>
                </div>

                <p className="text-sm leading-6 text-(--text-secondary)">
                  {review.comment || "No written comment."}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
