import Loader from "@/components/UI/Loader";
import Input from "@/components/UI/Input";
import { useSettingsPageContext } from "@/components/Settings/page/SettingsPageProvider";
import {
  SectionShell,
  SettingRow,
  Toggle,
} from "@/components/Settings/page/SettingsPageShared";

function useSettingsSecuritySectionData() {
  const {
    actions,
    activeSessions,
    dirty,
    openConfirm,
    savingBySection,
    securityLevel,
    securitySettings,
    setSecuritySettings,
  } = useSettingsPageContext();

  return {
    actions,
    activeSessions,
    dirty,
    openConfirm,
    savingBySection,
    securityLevel,
    securitySettings,
    setSecuritySettings,
  };
}

export function SettingsSecuritySection() {
  const {
    actions,
    activeSessions,
    dirty,
    openConfirm,
    savingBySection,
    securityLevel,
    securitySettings,
    setSecuritySettings,
  } = useSettingsSecuritySectionData();

  return (
    <SectionShell
      title="Security Settings"
      subtitle="Protect your account with password and session controls."
    >
      <div className="rounded-2xl border border-(--border-color) bg-(--bg-secondary)/55 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
          Security level
        </p>
        <p className="mt-1 text-lg font-black text-(--text-primary)">
          {securityLevel}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-(--text-muted)">
            Current password
          </label>
          <Input
            type="password"
            value={securitySettings.currentPassword}
            onChange={(event) =>
              setSecuritySettings((current) => ({
                ...current,
                currentPassword: event.target.value,
              }))
            }
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-(--text-muted)">
            New password
          </label>
          <Input
            type="password"
            value={securitySettings.newPassword}
            onChange={(event) =>
              setSecuritySettings((current) => ({
                ...current,
                newPassword: event.target.value,
              }))
            }
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-(--text-muted)">
            Confirm new password
          </label>
          <Input
            type="password"
            value={securitySettings.confirmPassword}
            onChange={(event) =>
              setSecuritySettings((current) => ({
                ...current,
                confirmPassword: event.target.value,
              }))
            }
          />
        </div>
      </div>

      <SettingRow
        title="Two-factor authentication"
        description="Add an extra security checkpoint on sign in."
        control={
          <Toggle
            checked={securitySettings.twoFactorEnabled}
            onChange={(next) =>
              setSecuritySettings((current) => ({
                ...current,
                twoFactorEnabled: next,
              }))
            }
          />
        }
      />

      <div className="space-y-3 rounded-2xl border border-(--border-color) bg-(--bg-secondary)/55 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
          Active sessions
        </p>
        {activeSessions.map((entry) => (
          <div
            key={entry.id}
            className="rounded-xl border border-(--border-color) bg-(--bg-card) px-3 py-2.5"
          >
            <p className="text-sm font-semibold text-(--text-primary)">
              {entry.device} {entry.current ? "(Current)" : ""}
            </p>
            <p className="text-xs text-(--text-muted)">
              {entry.location} - Last active {entry.lastActive}
            </p>
          </div>
        ))}
        <button
          type="button"
          onClick={() => openConfirm("logout-all")}
          className="inline-flex h-10 items-center rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700"
        >
          Logout from all devices
        </button>
      </div>

      <button
        type="button"
        disabled={!dirty.security || savingBySection.security}
        onClick={() => void actions.saveSecurity()}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) disabled:cursor-not-allowed disabled:opacity-70"
      >
        {savingBySection.security ? (
          <>
            <Loader className="border-white/40 border-t-white" /> Saving
          </>
        ) : (
          "Save security"
        )}
      </button>
    </SectionShell>
  );
}
