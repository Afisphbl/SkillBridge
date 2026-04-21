"use client";

import Link from "next/link";
import { FiAlertCircle, FiRefreshCcw } from "react-icons/fi";
import {
  SellerDashboardProvider,
  useSellerDashboardContext,
} from "./seller/SellerDashboardProvider";
import { LoadingShell, SectionShell } from "./seller/shared";
import SellerDashboardHero from "./seller/SellerDashboardHero";
import SellerDashboardStatsSection from "./seller/SellerDashboardStatsSection";
import SellerDashboardChartsSection from "./seller/SellerDashboardChartsSection";
import SellerDashboardOrdersSection from "./seller/SellerDashboardOrdersSection";
import SellerDashboardServicesSection from "./seller/SellerDashboardServicesSection";
import SellerDashboardPerformanceSection from "./seller/SellerDashboardPerformanceSection";

function SellerDashboardContent() {
  const { loading, errorMessage, loadDashboard, stats } = useSellerDashboardContext();

  if (loading) return <LoadingShell />;

  if (errorMessage) {
    return (
      <SectionShell>
        <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <FiAlertCircle className="size-10 text-(--color-danger)" />
          <h2 className="text-xl font-bold text-(--text-primary)">
            Failed to load dashboard
          </h2>
          <p className="max-w-md text-sm text-(--text-secondary)">{errorMessage}</p>
          <button
            type="button"
            onClick={() => void loadDashboard(false)}
            className="inline-flex items-center gap-2 rounded-xl bg-(--btn-bg-primary) px-5 py-2.5 text-sm font-semibold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover)"
          >
            <FiRefreshCcw className="size-4" />
            Retry
          </button>
        </div>
      </SectionShell>
    );
  }

  // Empty state — no orders and no services
  const isEmpty = stats.totalOrders === 0;

  return (
    <section className="space-y-6 pb-6">
      <SellerDashboardHero />
      <SellerDashboardStatsSection />

      {isEmpty ? (
        <SectionShell>
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-(--bg-secondary)">
              <FiAlertCircle className="size-8 text-(--text-muted)" />
            </div>
            <h2 className="text-xl font-bold text-(--text-primary)">
              No data available yet
            </h2>
            <p className="max-w-md text-sm text-(--text-secondary)">
              Create your first service to start receiving orders and see your dashboard come to life.
            </p>
            <Link
              href="/seller/services/create"
              className="inline-flex items-center rounded-xl bg-(--btn-bg-primary) px-5 py-2.5 text-sm font-semibold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover)"
            >
              Create your first service
            </Link>
          </div>
        </SectionShell>
      ) : (
        <>
          <SellerDashboardChartsSection />
          <SellerDashboardOrdersSection />
          <SellerDashboardServicesSection />
          <SellerDashboardPerformanceSection />
        </>
      )}
    </section>
  );
}

export default function SellerDashboardClient() {
  return (
    <SellerDashboardProvider>
      <SellerDashboardContent />
    </SellerDashboardProvider>
  );
}
