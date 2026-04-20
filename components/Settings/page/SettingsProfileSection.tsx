import Image from "next/image";
import Loader from "@/components/UI/Loader";
import Input from "@/components/UI/Input";
import { useSettingsPageContext } from "@/components/Settings/page/SettingsPageProvider";
import { SectionShell } from "@/components/Settings/page/SettingsPageShared";

function useSettingsProfileSectionData() {
  const {
    actions,
    dirty,
    handleAvatarInput,
    profileSettings,
    role,
    savingBySection,
    setProfileSettings,
  } = useSettingsPageContext();

  return {
    actions,
    dirty,
    handleAvatarInput,
    profileSettings,
    role,
    savingBySection,
    setProfileSettings,
  };
}

export function SettingsProfileSection() {
  const {
    actions,
    dirty,
    handleAvatarInput,
    profileSettings,
    role,
    savingBySection,
    setProfileSettings,
  } = useSettingsProfileSectionData();

  return (
    <SectionShell
      title="Profile Settings"
      subtitle="Manage your public identity, avatar, and personal details."
    >
      <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-(--border-color) bg-(--bg-secondary)/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
            Profile photo
          </p>
          <div className="mt-3">
            <div className="relative mx-auto size-26 overflow-hidden rounded-full border-2 border-(--border-color) bg-(--bg-card)">
              {profileSettings.avatarPreview ? (
                <Image
                  src={profileSettings.avatarPreview}
                  alt="Profile preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : null}
            </div>
            <input
              id="settings-avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              title="Upload avatar image"
              aria-label="Upload avatar image"
              onChange={handleAvatarInput}
            />
            <button
              type="button"
              onClick={() =>
                document.getElementById("settings-avatar-upload")?.click()
              }
              className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg border border-(--border-color) bg-(--btn-bg-secondary) px-3 text-sm font-semibold text-(--btn-text-secondary)"
            >
              Upload photo
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-(--text-muted)">
              Full name
            </label>
            <Input
              value={profileSettings.fullName}
              onChange={(event) =>
                setProfileSettings((current) => ({
                  ...current,
                  fullName: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-(--text-muted)">
              Username
            </label>
            <Input
              value={profileSettings.username}
              onChange={(event) =>
                setProfileSettings((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-(--text-muted)">
              Display name
            </label>
            <Input
              value={profileSettings.displayName}
              onChange={(event) =>
                setProfileSettings((current) => ({
                  ...current,
                  displayName: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-(--text-muted)">
              Location
            </label>
            <Input
              value={profileSettings.location}
              onChange={(event) =>
                setProfileSettings((current) => ({
                  ...current,
                  location: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label
              htmlFor="settings-profile-bio"
              className="text-xs font-semibold text-(--text-muted)"
            >
              Bio
            </label>
            <textarea
              id="settings-profile-bio"
              value={profileSettings.bio}
              rows={4}
              placeholder="Tell clients what you do best."
              onChange={(event) =>
                setProfileSettings((current) => ({
                  ...current,
                  bio: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-(--input-border) bg-(--input-bg) px-3 py-2 text-sm text-(--input-text)"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-(--text-muted)">
              Skills{" "}
              {role === "seller" || role === "both" ? "(seller)" : "(optional)"}
            </label>
            <Input
              value={profileSettings.skills}
              onChange={(event) =>
                setProfileSettings((current) => ({
                  ...current,
                  skills: event.target.value,
                }))
              }
              placeholder="React, UI/UX, SEO..."
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-(--text-muted)">
              Languages
            </label>
            <Input
              value={profileSettings.languages}
              onChange={(event) =>
                setProfileSettings((current) => ({
                  ...current,
                  languages: event.target.value,
                }))
              }
              placeholder="English, Spanish..."
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!dirty.profile || savingBySection.profile}
          onClick={() => void actions.saveProfile()}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) disabled:cursor-not-allowed disabled:opacity-70"
        >
          {savingBySection.profile ? (
            <>
              <Loader className="border-white/40 border-t-white" /> Saving
            </>
          ) : (
            "Save profile"
          )}
        </button>
      </div>
    </SectionShell>
  );
}
