"use client";

import Link from "next/link";
import { FiExternalLink, FiStar } from "react-icons/fi";
import { formatPrice } from "@/utils/format";
import { useSellerDashboardContext } from "./SellerDashboardProvider";
import { EmptyState, SectionHeader, SectionShell } from "./shared";

function RatingStars({ rating }: { rating: number }) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
      <FiStar className="size-3 fill-current" />
      {rounded > 0 ? rounded.toFixed(1) : "—"}
    </span>
  );
}

export default function SellerDashboardServicesSection() {
  const { topServices } = useSellerDashboardContext();

  return (
    <SectionShell>
      <SectionHeader
        title="Top Services"
        subtitle="Your 5 highest-earning services ranked by revenue"
        action={
          <Link
            href="/seller/services"
            className="inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) px-3 py-2 text-xs font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
          >
            Manage services
            <FiExternalLink className="size-3.5" />
          </Link>
        }
      />

      {topServices.length === 0 ? (
        <EmptyState
          title="No services yet"
          description="Create your first service to start earning on SkillBridge."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {topServices.map((svc, index) => (
            <article
              key={svc.id}
              className="relative rounded-2xl border border-(--border-color) bg-(--bg-card) p-4 transition hover:shadow-md"
            >
              {/* Rank badge */}
              <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-(--bg-secondary) text-[10px] font-black text-(--text-muted)">
                #{index + 1}
              </span>

              <p className="pr-8 text-sm font-bold text-(--text-primary) line-clamp-2">
                {svc.title}
              </p>
              <p className="mt-1 text-xs font-semibold text-(--color-primary)">
                {svc.category}
              </p>

              <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-(--bg-secondary) p-3">
                <div className="text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-(--text-muted)">
                    Orders
                  </p>
                  <p className="mt-1 text-base font-black text-(--text-primary)">
                    {svc.totalOrders}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-(--text-muted)">
                    Revenue
                  </p>
                  <p className="mt-1 text-base font-black text-(--text-primary)">
                    {formatPrice(svc.revenue)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-(--text-muted)">
                    Rating
                  </p>
                  <div className="mt-1">
                    <RatingStars rating={svc.avgRating} />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    svc.status === "active"
                      ? "bg-(--badge-success-bg) text-(--color-success)"
                      : "bg-(--badge-warning-bg) text-(--color-warning)"
                  }`}
                >
                  {svc.status}
                </span>
                <Link
                  href={`/seller/services/edit/${svc.id}`}
                  className="text-xs font-semibold text-(--color-primary) hover:underline"
                >
                  Edit
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
