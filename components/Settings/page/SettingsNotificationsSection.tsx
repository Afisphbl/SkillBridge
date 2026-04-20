import Loader from "@/components/UI/Loader";
import { useSettingsPageContext } from "@/components/Settings/page/SettingsPageProvider";
import {
  SectionShell,
  SettingRow,
  Toggle,
} from "@/components/Settings/page/SettingsPageShared";

function useSettingsNotificationsSectionData() {
  const {
    actions,
    dirty,
    notificationSettings,
    savingBySection,
    setNotificationSettings,
  } = useSettingsPageContext();

  return {
    actions,
    dirty,
    notificationSettings,
    savingBySection,
    setNotificationSettings,
  };
}

export function SettingsNotificationsSection() {
  const {
    actions,
    dirty,
    notificationSettings,
    savingBySection,
    setNotificationSettings,
  } = useSettingsNotificationsSectionData();

  return (
    <SectionShell
      title="Notification Preferences"
      subtitle="Choose what updates you receive and where."
    >
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
          General
        </p>
        <SettingRow
          title="Email notifications"
          description="Receive summaries and important account events."
          control={
            <Toggle
              checked={notificationSettings.emailNotifications}
              onChange={(next) =>
                setNotificationSettings((current) => ({
                  ...current,
                  emailNotifications: next,
                }))
              }
            />
          }
        />
        <SettingRow
          title="In-app notifications"
          description="Show alerts in your SkillBridge dashboard."
          control={
            <Toggle
              checked={notificationSettings.inAppNotifications}
              onChange={(next) =>
                setNotificationSettings((current) => ({
                  ...current,
                  inAppNotifications: next,
                }))
              }
            />
          }
        />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
          Orders & Messages
        </p>
        <SettingRow
          title="Order updates"
          description="Status changes, delivery updates, and completion events."
          control={
            <Toggle
              checked={notificationSettings.orderUpdates}
              onChange={(next) =>
                setNotificationSettings((current) => ({
                  ...current,
                  orderUpdates: next,
                }))
              }
            />
          }
        />
        <SettingRow
          title="Message alerts"
          description="Instant alerts for new order conversations."
          control={
            <Toggle
              checked={notificationSettings.messageAlerts}
              onChange={(next) =>
                setNotificationSettings((current) => ({
                  ...current,
                  messageAlerts: next,
                }))
              }
            />
          }
        />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
          Marketing
        </p>
        <SettingRow
          title="Marketing emails"
          description="Campaigns, product updates, and recommendations."
          control={
            <Toggle
              checked={notificationSettings.marketingEmails}
              onChange={(next) =>
                setNotificationSettings((current) => ({
                  ...current,
                  marketingEmails: next,
                }))
              }
            />
          }
        />
      </div>

      <button
        type="button"
        disabled={!dirty.notifications || savingBySection.notifications}
        onClick={() => void actions.saveNotifications()}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) disabled:cursor-not-allowed disabled:opacity-70"
      >
        {savingBySection.notifications ? (
          <>
            <Loader className="border-white/40 border-t-white" /> Saving
          </>
        ) : (
          "Save notifications"
        )}
      </button>
    </SectionShell>
  );
}
