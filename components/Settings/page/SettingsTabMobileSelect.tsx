import { useSettingsPageContext } from "@/components/Settings/page/SettingsPageProvider";
import { settingsTabs } from "@/components/Settings/page/SettingsPageShared";
import type { SettingsTab } from "@/hooks/settings/useSettingsState";

function useSettingsTabMobileSelectData() {
  const { activeTab, setActiveTab } = useSettingsPageContext();
  return { activeTab, setActiveTab };
}

export function SettingsTabMobileSelect() {
  const { activeTab, setActiveTab } = useSettingsTabMobileSelectData();

  return (
    <div className="md:hidden">
      <label
        htmlFor="settings-mobile-tab"
        className="mb-1 block text-xs font-semibold text-(--text-muted)"
      >
        Settings section
      </label>
      <select
        id="settings-mobile-tab"
        value={activeTab}
        onChange={(event) => setActiveTab(event.target.value as SettingsTab)}
        className="h-11 w-full rounded-xl border border-(--border-color) bg-(--bg-card) px-3 text-sm font-semibold text-(--text-primary)"
      >
        {settingsTabs.map((tab) => (
          <option key={tab.id} value={tab.id}>
            {tab.label}
          </option>
        ))}
      </select>
    </div>
  );
}
