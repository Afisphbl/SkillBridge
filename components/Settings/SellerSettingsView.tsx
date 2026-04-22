"use client";

import { useMemo } from "react";
import { SettingsActiveTabContent } from "@/components/Settings/page/SettingsActiveTabContent";
import { SettingsConfirmDialogs } from "@/components/Settings/page/SettingsConfirmDialogs";
import {
  SettingsPageProvider,
  useSettingsPageContext,
} from "@/components/Settings/page/SettingsPageProvider";
import {
  settingsTabs,
  SettingsLoadingState,
} from "@/components/Settings/page/SettingsPageShared";
import { SettingsStickySaves } from "@/components/Settings/page/SettingsStickySaves";
import { SettingsTabMobileSelect } from "@/components/Settings/page/SettingsTabMobileSelect";
import { SettingsTabSidebar } from "@/components/Settings/page/SettingsTabSidebar";
import SellerPageShell from "@/components/Seller/SellerPageShell";

function SellerSettingsMainContent() {
  const { activeTab, hydrated, loading, profileSettings, availabilitySettings, sellerPayment } = useSettingsPageContext();

  const currentTab = useMemo(
    () => settingsTabs.find((tab) => tab.id === activeTab) || settingsTabs[0],
    [activeTab],
  );

  if (!hydrated || loading) {
    return <SettingsLoadingState />;
  }

  const payoutStatus = sellerPayment.payoutAccount ? "Connected" : "Not set";
  const vacationStatus = availabilitySettings.vacationMode ? "On" : "Off";

  return (
    <SellerPageShell
      title="Settings"
      description="Manage your professional profile, availability, and payout preferences."
      highlights={[
        { label: "Payout account", value: payoutStatus },
        { label: "Full Name", value: profileSettings.fullName || "Not set" },
        { label: "Vacation mode", value: vacationStatus },
      ]}
    >
      <div className="space-y-6">
        <SettingsTabMobileSelect />

        <div className="grid gap-4 md:grid-cols-[250px_minmax(0,1fr)] lg:gap-6">
          <SettingsTabSidebar />

          <div key={activeTab} className="profile-fade-in min-w-0 space-y-4">
            <SettingsActiveTabContent />
          </div>
        </div>

        <SettingsStickySaves />
        <SettingsConfirmDialogs />
      </div>
    </SellerPageShell>
  );
}

export default function SellerSettingsView() {
  return (
    <SettingsPageProvider>
      <SellerSettingsMainContent />
    </SettingsPageProvider>
  );
}
