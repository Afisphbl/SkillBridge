import { useSettingsPageContext } from "@/components/Settings/page/SettingsPageProvider";
import { SettingsAccountSection } from "@/components/Settings/page/SettingsAccountSection";
import { SettingsDangerSection } from "@/components/Settings/page/SettingsDangerSection";
import { SettingsNotificationsSection } from "@/components/Settings/page/SettingsNotificationsSection";
import { SettingsPaymentSection } from "@/components/Settings/page/SettingsPaymentSection";
import { SettingsPrivacySection } from "@/components/Settings/page/SettingsPrivacySection";
import { SettingsProfileSection } from "@/components/Settings/page/SettingsProfileSection";
import { SettingsSecuritySection } from "@/components/Settings/page/SettingsSecuritySection";

function useSettingsActiveTabContentData() {
  const { activeTab } = useSettingsPageContext();
  return { activeTab };
}

export function SettingsActiveTabContent() {
  const { activeTab } = useSettingsActiveTabContentData();

  if (activeTab === "profile") return <SettingsProfileSection />;
  if (activeTab === "security") return <SettingsSecuritySection />;
  if (activeTab === "notifications") return <SettingsNotificationsSection />;
  if (activeTab === "payment") return <SettingsPaymentSection />;
  if (activeTab === "privacy") return <SettingsPrivacySection />;
  if (activeTab === "account") return <SettingsAccountSection />;

  return <SettingsDangerSection />;
}
