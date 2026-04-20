"use client";

import { useState } from "react";
import { FiHeart } from "react-icons/fi";
import OrderNowButton from "@/components/Order/OrderNowButton";
import { useServiceDetails } from "@/hooks/services/useServiceDetails";
import { toNumber } from "@/hooks/services/types";
import { formatDelivery, formatPrice } from "@/utils/format";

export default function PricingCard() {
  const { service, loading, error } = useServiceDetails();
  const title = service?.title || "Service";
  const price = toNumber(
    service?.price ?? service?.base_price ?? service?.hourly_rate,
    0,
  );
  const deliveryDays = toNumber(
    service?.delivery_days ?? service?.delivery_time,
    1,
  );
  const summary = service?.description;
  const canOrder = Boolean(service && !loading && !error);

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

      {canOrder ? (
        <OrderNowButton className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-(--color-primary) px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70" />
      ) : (
        <button
          type="button"
          disabled
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-(--color-primary) px-4 text-sm font-semibold text-white opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Loading service..." : "Service unavailable"}
        </button>
      )}
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
