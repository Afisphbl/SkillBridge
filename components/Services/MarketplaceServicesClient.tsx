"use client";

import LoadMoreButton from "./LoadMoreButton";
import MarketplaceHeader from "./MarketplaceHeader";
import MarketplaceLayout from "./MarketplaceLayout";
import ServicesGrid from "./ServicesGrid";

export default function MarketplaceServicesClient() {
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
