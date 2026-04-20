"use client";

import { FiAlertCircle } from "react-icons/fi";
import ServiceCard from "./ServiceCard";
import { useMarketplaceServices } from "@/hooks/marketplace/useMarketplaceServices";
import { useVisibleServices } from "@/hooks/marketplace/useVisibleServices";

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-(--border-color) bg-(--bg-card) p-4 shadow-sm">
      <div className="h-40 animate-pulse rounded-xl bg-(--bg-secondary)" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-1/3 animate-pulse rounded bg-(--bg-secondary)" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-(--bg-secondary)" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-(--bg-secondary)" />
      </div>
      <div className="mt-4 h-8 w-full animate-pulse rounded bg-(--bg-secondary)" />
    </div>
  );
}

export default function ServicesGrid() {
  const { loading, error } = useMarketplaceServices();
  const visibleServices = useVisibleServices();

  return (
    <>
      {error ? (
        <div className="inline-flex items-center gap-2 rounded-lg border border-(--color-danger)/35 bg-(--badge-danger-bg) px-4 py-3 text-sm font-medium text-(--color-danger)">
          <FiAlertCircle className="size-4" />
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </div>
      ) : visibleServices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--bg-card) px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-(--text-primary)">
            No services found
          </h2>
          <p className="mt-2 text-sm text-(--text-secondary)">
            Try a broader search or remove one or two filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleServices.map((service, index) => (
            <ServiceCard
              key={String(service.id ?? `service-${index}`)}
              service={service}
            />
          ))}
        </div>
      )}
    </>
  );
}
