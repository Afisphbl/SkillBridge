"use client";

import Link from "next/link";
import { FiAlertCircle, FiRefreshCcw } from "react-icons/fi";
import {
  SellerDashboardProvider,
  useSellerDashboardContext,
} from "@/components/Dashboard/seller/SellerDashboardProvider";
import { LoadingShell, SectionShell } from "@/components/Dashboard/seller/shared";
import SellerHomeWelcome from "./SellerHomeWelcome";
import SellerHomeStatsRow from "./SellerHomeStatsRow";
import SellerHomeQuickActions from "./SellerHomeQuickActions";
import SellerHomeActiveOrders from "./SellerHomeActiveOrders";
import SellerHomeMessages from "./SellerHomeMessages";
import SellerHomeTopServices from "./SellerHomeTopServices";
import SellerHomeNotifications from "./SellerHomeNotifications";

function SellerHomeContent() {
  const { loading, errorMessage, loadDashboard } = useSellerDashboardContext();

  if (loading) return <LoadingShell />;

  if (errorMessage) {
    return (
      <SectionShell>
        <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <FiAlertCircle className="size-10 text-(--color-danger)" />
          <h2 className="text-xl font-bold text-(--text-primary)">
            Something went wrong
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

  return (
    <section className="space-y-6 pb-6">
      {/* 1. Welcome header */}
      <SellerHomeWelcome />

      {/* 2. Performance summary cards */}
      <SellerHomeStatsRow />

      {/* 3. Quick actions */}
      <SellerHomeQuickActions />

      {/* 4 + 5. Active orders & Recent messages — side by side on xl */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <SellerHomeActiveOrders />
        <SellerHomeMessages />
      </div>

      {/* 6 + 7. Top services & Notifications — side by side on xl */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <SellerHomeTopServices />
        <SellerHomeNotifications />
      </div>
    </section>
  );
}

export default function SellerHomeClient() {
  return (
    <SellerDashboardProvider>
      <SellerHomeContent />
    </SellerDashboardProvider>
  );
}
