"use client";

import { FiEye, FiStar } from "react-icons/fi";
import { useServiceDetails } from "@/hooks/services/useServiceDetails";
import { useServiceReviews } from "@/hooks/services/useServiceReviews";
import { useServiceViews } from "@/hooks/services/useServiceViews";

export default function ServiceHeader() {
  const { service } = useServiceDetails();
  const { averageRating, totalReviews } = useServiceReviews();
  const { viewCount } = useServiceViews();

  return (
    <header className="space-y-3 rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-sm">
      <p className="text-xs font-medium text-(--text-muted)">
        {service?.category || "Services"}
        {service?.subcategory ? <span> / {service.subcategory}</span> : null}
      </p>

      <h1 className="text-2xl font-black tracking-tight text-(--text-primary) md:text-3xl">
        {service?.title || "Service"}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-(--text-secondary)">
        <div className="inline-flex items-center gap-1.5 text-amber-600">
          <FiStar className="fill-amber-500" />
          <span className="font-semibold">{averageRating.toFixed(1)}</span>
          <span className="text-(--text-muted)">({totalReviews} reviews)</span>
        </div>

        {typeof viewCount === "number" ? (
          <div className="inline-flex items-center gap-1.5 text-(--text-muted)">
            <FiEye className="size-4" />
            <span>{viewCount.toLocaleString()} views</span>
          </div>
        ) : null}
      </div>
    </header>
  );
}
