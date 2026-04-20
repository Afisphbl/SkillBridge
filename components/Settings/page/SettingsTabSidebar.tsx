import { useSettingsPageContext } from "@/components/Settings/page/SettingsPageProvider";
import { settingsTabs } from "@/components/Settings/page/SettingsPageShared";

function useSettingsTabSidebarData() {
  const { activeTab, setActiveTab } = useSettingsPageContext();
  return { activeTab, setActiveTab };
}

export function SettingsTabSidebar() {
  const { activeTab, setActiveTab } = useSettingsTabSidebarData();

  return (
    <aside className="hidden rounded-3xl border border-(--border-color) bg-(--bg-card) p-3 md:sticky md:top-20 md:block md:h-fit">
      {settingsTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`mb-1 flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition ${
              isActive
                ? "bg-(--sidebar-item-active) text-(--text-primary) ring-1 ring-(--border-color)"
                : "text-(--text-secondary) hover:bg-(--hover-bg)"
            }`}
          >
            <Icon className="mt-0.5 size-4 shrink-0" />
            <span>
              <span className="block text-sm font-semibold">{tab.label}</span>
              <span className="block text-xs opacity-80">
                {tab.description}
              </span>
            </span>
          </button>
        );
      })}
    </aside>
  );
}
