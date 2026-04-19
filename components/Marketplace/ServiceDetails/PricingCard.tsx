"use client";

import { useState } from "react";
import { FiHeart } from "react-icons/fi";
import { formatDelivery, formatPrice } from "@/utils/format";

type PricingCardProps = {
  title: string;
  price: number | string;
  deliveryDays: number | string;
  summary?: string;
};

export default function PricingCard({
  title,
  price,
  deliveryDays,
  summary,
}: PricingCardProps) {
  const [saved, setSaved] = useState(false);

  return (
    <aside className="space-y-4 rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-sm lg:sticky lg:top-24">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-(--text-muted)">
          Starting at
        </p>
        <p className="text-3xl font-black text-(--color-primary)">
          {formatPrice(price)}
        </p>
      </div>

      <p className="text-sm text-(--text-secondary)">
        {formatDelivery(deliveryDays)}
      </p>

      <p className="rounded-lg bg-(--bg-secondary) px-3 py-2 text-sm text-(--text-secondary)">
        {summary || title}
      </p>

      <button
        type="button"
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-(--color-primary) px-4 text-sm font-semibold text-white hover:opacity-90"
      >
        Order Now
      </button>

      <button
        type="button"
        onClick={() => setSaved((value) => !value)}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-(--border-color) bg-(--bg-card) px-4 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
      >
        <FiHeart className={saved ? "fill-rose-500 text-rose-500" : ""} />
        {saved ? "Saved" : "Save to Favorites"}
      </button>
    </aside>
  );
}
