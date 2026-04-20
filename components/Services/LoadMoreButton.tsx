"use client";

import { useMarketplacePagination } from "@/hooks/marketplace/useMarketplacePagination";
import { useMarketplaceServices } from "@/hooks/marketplace/useMarketplaceServices";
import { useVisibleServices } from "@/hooks/marketplace/useVisibleServices";

export default function LoadMoreButton() {
  const { loading } = useMarketplaceServices();
  const visibleServices = useVisibleServices();
  const { loadingMore, hasMore, loadMore } = useMarketplacePagination();

  if (loading || visibleServices.length === 0 || !hasMore) {
    return null;
  }

  return (
    <div className="flex justify-center pt-2">
      <button
        type="button"
        onClick={loadMore}
        disabled={loadingMore}
        className="inline-flex h-10 items-center justify-center rounded-md border border-(--border-color) bg-(--bg-card) px-5 text-sm font-semibold text-(--text-secondary) shadow-sm hover:bg-(--hover-bg) disabled:opacity-60"
      >
        {loadingMore ? "Loading..." : "Load more services"}
      </button>
    </div>
  );
}
