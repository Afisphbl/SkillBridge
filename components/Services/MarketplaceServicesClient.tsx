"use client";

import { useEffect } from "react";
import LoadMoreButton from "./LoadMoreButton";
import MarketplaceHeader from "./MarketplaceHeader";
import MarketplaceLayout from "./MarketplaceLayout";
import ServicesGrid from "./ServicesGrid";
import { setMarketplaceState } from "@/hooks/marketplace/store";

export default function MarketplaceServicesClient({
  initialQuery,
}: {
  initialQuery: string;
}) {
  useEffect(() => {
    setMarketplaceState({
      query: initialQuery,
      debouncedQuery: initialQuery,
    });
  }, [initialQuery]);

  return (
    <section className="space-y-6">
      <MarketplaceHeader />

      <MarketplaceLayout>
        <ServicesGrid />
        <LoadMoreButton />
      </MarketplaceLayout>
    </section>
  );
}
