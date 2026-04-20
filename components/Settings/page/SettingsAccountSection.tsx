import { FiLogOut } from "react-icons/fi";
import Loader from "@/components/UI/Loader";
import Input from "@/components/UI/Input";
import { useSettingsPageContext } from "@/components/Settings/page/SettingsPageProvider";
import {
  SectionShell,
  ThemeModeSwitch,
} from "@/components/Settings/page/SettingsPageShared";

function useSettingsAccountSectionData() {
  const {
    actions,
    accountSettings,
    dirty,
    handleSignOut,
    savingBySection,
    securitySettings,
    setAccountSettings,
    setSecuritySettings,
    submitting,
  } = useSettingsPageContext();

  return {
    actions,
    accountSettings,
    dirty,
    handleSignOut,
    savingBySection,
    securitySettings,
    setAccountSettings,
    setSecuritySettings,
    submitting,
  };
}

export function SettingsAccountSection() {
  const {
    actions,
    accountSettings,
    dirty,
    handleSignOut,
    savingBySection,
    securitySettings,
    setAccountSettings,
    setSecuritySettings,
    submitting,
  } = useSettingsAccountSectionData();

  return (
    <SectionShell
      title="Account Settings"
      subtitle="Email, language, theme, and session actions."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-(--text-muted)">
            Account email
          </label>
          <Input
            type="email"
            value={accountSettings.email}
            onChange={(event) =>
              setAccountSettings((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="settings-account-language"
            className="text-xs font-semibold text-(--text-muted)"
          >
            Language
          </label>
          <select
            id="settings-account-language"
            title="Language preference"
            aria-label="Language preference"
            value={accountSettings.language}
            onChange={(event) =>
              setAccountSettings((current) => ({
                ...current,
                language: event.target.value,
              }))
            }
            className="h-11 w-full rounded-xl border border-(--border-color) bg-(--bg-card) px-3 text-sm text-(--text-primary)"
          >
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-(--text-muted)">
            Theme mode
          </label>
          <ThemeModeSwitch
            value={accountSettings.themeMode}
            onLight={() =>
              setAccountSettings((current) => ({
                ...current,
                themeMode: "light",
              }))
            }
            onDark={() =>
              setAccountSettings((current) => ({
                ...current,
                themeMode: "dark",
              }))
            }
            onSystem={() =>
              setAccountSettings((current) => ({
                ...current,
                themeMode: "system",
              }))
            }
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-(--text-muted)">
            Current password (required for email updates)
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
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void actions.saveAccount()}
          disabled={!dirty.account || savingBySection.account}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) disabled:cursor-not-allowed disabled:opacity-70"
        >
          {savingBySection.account ? (
            <>
              <Loader className="border-white/40 border-t-white" /> Saving
            </>
          ) : (
            "Save account"
          )}
        </button>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={submitting}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-(--border-color) bg-(--btn-bg-secondary) px-4 text-sm font-semibold text-(--btn-text-secondary) disabled:opacity-70"
        >
          <FiLogOut className="size-4" /> Logout
        </button>
      </div>
    </SectionShell>
  );
}
