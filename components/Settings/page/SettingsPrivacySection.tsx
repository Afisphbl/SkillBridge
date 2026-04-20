import Loader from "@/components/UI/Loader";
import { useSettingsPageContext } from "@/components/Settings/page/SettingsPageProvider";
import {
  SectionShell,
  SettingRow,
  Toggle,
} from "@/components/Settings/page/SettingsPageShared";

function useSettingsPrivacySectionData() {
  const {
    actions,
    dirty,
    privacySettings,
    savingBySection,
    setPrivacySettings,
  } = useSettingsPageContext();

  return {
    actions,
    dirty,
    privacySettings,
    savingBySection,
    setPrivacySettings,
  };
}

export function SettingsPrivacySection() {
  const {
    actions,
    dirty,
    privacySettings,
    savingBySection,
    setPrivacySettings,
  } = useSettingsPrivacySectionData();

  return (
    <SectionShell
      title="Privacy Controls"
      subtitle="Control visibility, discoverability, and blocked contacts."
    >
      <SettingRow
        title="Profile visibility"
        description="Choose who can view your profile details."
        control={
          <select
            title="Profile visibility"
            aria-label="Profile visibility"
            value={privacySettings.profileVisibility}
            onChange={(event) =>
              setPrivacySettings((current) => ({
                ...current,
                profileVisibility: event.target.value as
                  | "public"
                  | "private"
                  | "limited",
              }))
            }
            className="h-9 rounded-lg border border-(--border-color) bg-(--bg-card) px-2 text-xs text-(--text-primary)"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="limited">Limited</option>
          </select>
        }
      />

      <SettingRow
        title="Online status"
        description="Show when you are available for messages."
        control={
          <Toggle
            checked={privacySettings.onlineStatus}
            onChange={(next) =>
              setPrivacySettings((current) => ({
                ...current,
                onlineStatus: next,
              }))
            }
          />
        }
      />

      <SettingRow
        title="Search engine visibility"
        description="Allow search engines to index your profile page."
        control={
          <Toggle
            checked={privacySettings.searchEngineVisibility}
            onChange={(next) =>
              setPrivacySettings((current) => ({
                ...current,
                searchEngineVisibility: next,
              }))
            }
          />
        }
      />

      <div className="space-y-2 rounded-2xl border border-(--border-color) bg-(--bg-secondary)/55 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
          Blocked users
        </p>
        {privacySettings.blockedUsers.length === 0 ? (
          <p className="text-sm text-(--text-muted)">No blocked users.</p>
        ) : (
          privacySettings.blockedUsers.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-lg border border-(--border-color) bg-(--bg-card) px-3 py-2"
            >
              <span className="text-sm font-semibold text-(--text-primary)">
                {entry.name}
              </span>
              <button
                type="button"
                className="text-xs font-semibold text-(--color-primary)"
                onClick={() => actions.removeBlockedUser(entry.id)}
              >
                Unblock
              </button>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        disabled={!dirty.privacy || savingBySection.privacy}
        onClick={() => void actions.savePrivacy()}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) disabled:cursor-not-allowed disabled:opacity-70"
      >
        {savingBySection.privacy ? (
          <>
            <Loader className="border-white/40 border-t-white" /> Saving
          </>
        ) : (
          "Save privacy"
        )}
      </button>
    </SectionShell>
  );
}
