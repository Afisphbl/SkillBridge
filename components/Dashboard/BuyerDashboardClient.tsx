"use client";

import BuyerDashboardAnalyticsSection from "./buyer/BuyerDashboardAnalyticsSection";
import BuyerDashboardMessagesFavoritesSection from "./buyer/BuyerDashboardMessagesFavoritesSection";
import BuyerDashboardNotificationsReviewsSection from "./buyer/BuyerDashboardNotificationsReviewsSection";
import BuyerDashboardOrdersSection from "./buyer/BuyerDashboardOrdersSection";
import BuyerDashboardPaymentsSection from "./buyer/BuyerDashboardPaymentsSection";
import BuyerDashboardRecentlyViewedSection from "./buyer/BuyerDashboardRecentlyViewedSection";
import { BuyerDashboardHero } from "./buyer/shared";
import BuyerDashboardOverviewSection from "./buyer/BuyerDashboardOverviewSection";
import BuyerDashboardStateGate from "./buyer/BuyerDashboardStateGate";
import {
  BuyerDashboardProvider,
  useBuyerDashboardContext,
} from "./buyer/BuyerDashboardProvider";

function BuyerDashboardContent() {
  const { errorMessage, loading, roleBlocked } = useBuyerDashboardContext();

  if (loading || errorMessage || roleBlocked) {
    return <BuyerDashboardStateGate />;
  }

  return (
    <section className="space-y-6 pb-4">
      <BuyerDashboardHero />
      <BuyerDashboardOverviewSection />
      <BuyerDashboardOrdersSection />
      <BuyerDashboardAnalyticsSection />
      <BuyerDashboardMessagesFavoritesSection />
      <BuyerDashboardNotificationsReviewsSection />
      <BuyerDashboardPaymentsSection />
      <BuyerDashboardRecentlyViewedSection />
    </section>
  );
}

export default function BuyerDashboardClient() {
  return (
    <BuyerDashboardProvider>
      <BuyerDashboardContent />
    </BuyerDashboardProvider>
  );
}
