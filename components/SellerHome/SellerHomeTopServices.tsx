"use client";

import Link from "next/link";
import { FiBriefcase, FiExternalLink, FiStar } from "react-icons/fi";
import { formatPrice } from "@/utils/format";
import { useSellerDashboardContext } from "@/components/Dashboard/seller/SellerDashboardProvider";
import { SectionHeader, SectionShell } from "@/components/Dashboard/seller/shared";

export default function SellerHomeTopServices() {
  const { topServices } = useSellerDashboardContext();

  return (
    <SectionShell>
      <SectionHeader
        title="Top Performing Services"
        subtitle="Your best services ranked by revenue"
        action={
          <Link
            href="/seller/services"
            className="inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) px-3 py-2 text-xs font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
          >
            Manage all
            <FiExternalLink className="size-3.5" />
          </Link>
        }
      />

      {topServices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--bg-secondary) p-8 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-(--bg-card)">
            <FiBriefcase className="size-5 text-(--text-muted)" />
          </div>
          <p className="mt-3 text-sm font-semibold text-(--text-primary)">
            You haven&apos;t created any services yet
          </p>
          <p className="mt-1 text-xs text-(--text-secondary)">
            Start earning by publishing your first service.
          </p>
          <Link
            href="/seller/services/create"
            className="mt-4 inline-flex items-center rounded-xl bg-(--btn-bg-primary) px-4 py-2 text-xs font-bold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover)"
          >
            Create Your First Service
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {topServices.map((svc, i) => (
            <article
              key={svc.id}
              className="relative rounded-2xl border border-(--border-color) bg-(--bg-card) p-4 transition hover:shadow-md"
            >
              <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-(--bg-secondary) text-[10px] font-black text-(--text-muted)">
                #{i + 1}
              </span>

              <p className="pr-8 text-sm font-bold text-(--text-primary) line-clamp-2">
                {svc.title}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-(--color-primary)">
                {svc.category}
              </p>

              <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-(--bg-secondary) p-3 text-center">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-(--text-muted)">Orders</p>
                  <p className="mt-1 text-base font-black text-(--text-primary)">{svc.totalOrders}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-(--text-muted)">Revenue</p>
                  <p className="mt-1 text-base font-black text-(--text-primary)">{formatPrice(svc.revenue)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-(--text-muted)">Rating</p>
                  <p className="mt-1 inline-flex items-center gap-0.5 text-sm font-black text-amber-500">
                    <FiStar className="size-3 fill-current" />
                    {svc.avgRating > 0 ? svc.avgRating.toFixed(1) : "—"}
                  </p>
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
                  href="/seller/services"
                  className="text-xs font-semibold text-(--color-primary) hover:underline"
                >
                  View
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
