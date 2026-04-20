"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiClock, FiHeart, FiStar, FiUser } from "react-icons/fi";
import { formatDate, formatDelivery, formatPrice } from "@/utils/format";

type ServiceRecord = {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  tags?: string[] | string;
  price?: number | string;
  base_price?: number | string;
  hourly_rate?: number | string;
  rating?: number | string;
  average_rating?: number | string;
  reviews_count?: number | string;
  review_count?: number | string;
  ratings_count?: number | string;
  delivery_days?: number | string;
  delivery_time?: number | string;
  created_at?: string;
  thumbnail_url?: string;
  image_url?: string;
  cover_image?: string;
  seller_id?: string;
  seller_name?: string;
  user_name?: string;
  full_name?: string;
  seller_avatar?: string;
  avatar_url?: string;
  seller_badge?: string;
  [key: string]: unknown;
};

function toNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeTags(tags: ServiceRecord["tags"]) {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export default function ServiceCard({ service }: { service: ServiceRecord }) {
  const [favorite, setFavorite] = useState(false);

  const view = useMemo(() => {
    const image =
      service.thumbnail_url ||
      service.image_url ||
      service.cover_image ||
      "/SkillBridge.png";

    const title = service.title || "Untitled service";
    const seller =
      service.seller_name || service.user_name || service.full_name || "Seller";

    const price = toNumber(
      service.price ?? service.base_price ?? service.hourly_rate,
      0,
    );
    const rating = toNumber(service.average_rating ?? service.rating, 0);
    const reviews = toNumber(
      service.reviews_count ?? service.review_count ?? service.ratings_count,
      0,
    );
    const days = Math.max(
      1,
      toNumber(service.delivery_days ?? service.delivery_time, 3),
    );

    return {
      id: String(service.id || ""),
      image,
      title,
      seller,
      sellerAvatar: service.seller_avatar || service.avatar_url || "",
      sellerBadge: String(service.seller_badge ?? ""),
      price,
      rating,
      reviews,
      days,
      createdAt: formatDate(service.created_at),
      tags: normalizeTags(service.tags),
      category: service.category || "General",
    };
  }, [service]);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-(--border-color) bg-(--bg-card) shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {view.id ? (
        <Link
          href={`/services/${view.id}`}
          aria-label={`Open ${view.title}`}
          className="absolute inset-0 z-10"
        />
      ) : null}

      <div className="relative h-44 w-full overflow-hidden bg-(--bg-secondary)">
        <Image
          src={view.image}
          alt={view.title}
          fill
          unoptimized
          loading="eager"
          className="object-cover transition duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <button
          type="button"
          onClick={() => setFavorite((prev) => !prev)}
          className="absolute right-3 top-3 z-20 grid size-8 place-items-center rounded-full border border-(--border-color) bg-(--modal-bg)/80 text-(--text-secondary) backdrop-blur hover:text-rose-500"
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <FiHeart className={favorite ? "fill-rose-500 text-rose-500" : ""} />
        </button>
      </div>

      <div className="relative z-20 space-y-3 p-4">
        <p className="inline-flex rounded-full border border-(--border-color) bg-(--bg-secondary) px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-(--text-secondary)">
          {view.category}
        </p>

        <h3 className="line-clamp-2 min-h-12 text-sm font-semibold text-(--text-primary)">
          {view.id ? (
            <Link
              href={`/services/${view.id}`}
              className="relative z-30 hover:text-(--color-primary)"
            >
              {view.title}
            </Link>
          ) : (
            view.title
          )}
        </h3>

        <div className="flex items-center gap-2 text-xs text-(--text-secondary)">
          <div className="grid size-7 place-items-center overflow-hidden rounded-full bg-(--bg-secondary) text-(--text-muted)">
            {view.sellerAvatar ? (
              <Image
                src={view.sellerAvatar}
                alt={view.seller}
                width={28}
                height={28}
                unoptimized
                loading="eager"
                className="size-7 rounded-full object-cover"
              />
            ) : (
              <FiUser className="size-3.5" />
            )}
          </div>
          <span className="truncate font-medium">{view.seller}</span>
          {view.sellerBadge ? (
            <span className="shrink-0 rounded-full bg-(--badge-success-bg) px-2 py-0.5 text-[10px] font-semibold text-(--color-success)">
              {view.sellerBadge}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="inline-flex items-center gap-1.5 text-amber-600">
            <FiStar className="fill-amber-500" />
            <span className="font-semibold">{view.rating.toFixed(1)}</span>
            <span className="text-(--text-muted)">({view.reviews})</span>
          </div>

          <div className="inline-flex items-center gap-1 text-(--text-muted)">
            <FiClock className="size-3.5" />
            <span>{formatDelivery(view.days)}</span>
          </div>
        </div>

        {view.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {view.tags.slice(0, 2).map((tag) => (
              <span
                key={`${view.id}-${tag}`}
                className="rounded-md border border-(--color-primary)/30 bg-(--color-primary)/12 px-2 py-0.5 text-[11px] font-medium text-(--color-primary)"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex items-baseline justify-end gap-1 border-t border-(--border-color) pt-3">
          {view.createdAt ? (
            <span className="mr-auto text-[11px] text-(--text-muted)">
              {view.createdAt}
            </span>
          ) : null}
          <span className="text-[11px] uppercase tracking-wide text-(--text-muted)">
            Starting at
          </span>
          <span className="text-base font-bold text-(--color-primary)">
            {formatPrice(view.price)}
          </span>
        </div>
      </div>
    </article>
  );
}
