"use client";

import { useMemo } from "react";
import { SettingsActiveTabContent } from "@/components/Settings/page/SettingsActiveTabContent";
import { SettingsConfirmDialogs } from "@/components/Settings/page/SettingsConfirmDialogs";
import { SettingsHeader } from "@/components/Settings/page/SettingsHeader";
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

function SettingsPageContent() {
  const { activeTab, hydrated, loading } = useSettingsPageContext();

  const currentTab = useMemo(
    () => settingsTabs.find((tab) => tab.id === activeTab) || settingsTabs[0],
    [activeTab],
  );

  if (!hydrated || loading) {
    return <SettingsLoadingState />;
  }

  return (
    <section className="space-y-6 pb-18 md:pb-0">
      <SettingsHeader />

      <SettingsTabMobileSelect />

      <div className="grid gap-4 md:grid-cols-[250px_minmax(0,1fr)] lg:gap-6">
        <SettingsTabSidebar />

        <div key={activeTab} className="profile-fade-in min-w-0 space-y-4">
          <SettingsActiveTabContent />
        </div>
      </div>

      <SettingsStickySaves />
      <SettingsConfirmDialogs />

      <p className="text-xs text-(--text-muted)">
        Active section: {currentTab.label}
      </p>
    </section>
  );
}

export default function SettingsPageClient() {
  return (
    <SettingsPageProvider>
      <SettingsPageContent />
    </SettingsPageProvider>
  );
}
