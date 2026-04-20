"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  FiAlertTriangle,
  FiBell,
  FiCheckCircle,
  FiCreditCard,
  FiDownload,
  FiGlobe,
  FiLock,
  FiLogOut,
  FiMoon,
  FiMonitor,
  FiShield,
  FiSun,
  FiTrash2,
  FiUser,
} from "react-icons/fi";
import Loader from "@/components/UI/Loader";
import Input from "@/components/UI/Input";
import { useAuth } from "@/hooks/useAuth";
import { type SettingsTab, useSettingsState } from "@/hooks/settings/useSettingsState";

type ConfirmState = {
  open: boolean;
  action: null | "logout-all" | "deactivate" | "delete" | "export";
};

const tabs: Array<{
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  { id: "profile", label: "Profile", icon: FiUser, description: "Identity and public info" },
  { id: "security", label: "Security", icon: FiShield, description: "Password, 2FA, sessions" },
  {
    id: "notifications",
    label: "Notifications",
    icon: FiBell,
    description: "Email and in-app alerts",
  },
  { id: "payment", label: "Payment", icon: FiCreditCard, description: "Billing and payouts" },
  { id: "privacy", label: "Privacy", icon: FiLock, description: "Visibility and blocking" },
  { id: "account", label: "Account", icon: FiGlobe, description: "Email, language, theme" },
  { id: "danger", label: "Danger Zone", icon: FiAlertTriangle, description: "Critical actions" },
];

function SectionShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-5 shadow-[0_16px_35px_-25px_rgba(15,23,42,0.55)] sm:p-6 lg:p-7">
      <div className="mb-5">
        <h2 className="text-xl font-black tracking-tight text-(--text-primary)">{title}</h2>
        <p className="mt-1 text-sm text-(--text-secondary)">{subtitle}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function SettingRow({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-(--border-color) bg-(--bg-secondary)/55 p-4 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-semibold text-(--text-primary)">{title}</p>
        <p className="mt-0.5 text-xs text-(--text-muted)">{description}</p>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center" aria-label="Toggle setting" title="Toggle setting">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
          checked ? "bg-(--btn-bg-primary)" : "bg-(--bg-tertiary)"
        }`}
      >
        <span
          className={`inline-block size-5 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </label>
  );
}

function StickySave({
  visible,
  disabled,
  loading,
  onSave,
  label,
}: {
  visible: boolean;
  disabled: boolean;
  loading: boolean;
  onSave: () => void;
  label: string;
}) {
  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-(--border-color) bg-(--bg-card)/95 p-3 backdrop-blur-sm md:hidden">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={onSave}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader className="border-white/40 border-t-white" /> Saving
          </>
        ) : (
          label
        )}
      </button>
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  description,
  confirmText,
  danger,
  requiresDeleteWord,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  danger?: boolean;
  requiresDeleteWord?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const [value, setValue] = useState("");

  if (!open) return null;

  const deleteWordInvalid = requiresDeleteWord && value.trim() !== "DELETE";

  return (
    <div
      className="fixed inset-0 z-60 grid place-items-center bg-(--modal-overlay) px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-pop w-md max-w-full rounded-2xl border border-(--border-color) bg-(--modal-bg) p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-red-100 text-red-700">
          <FiAlertTriangle className="size-5" />
        </div>
        <h3 className="text-lg font-black text-(--text-primary)">{title}</h3>
        <p className="mt-2 text-sm text-(--text-secondary)">{description}</p>

        {requiresDeleteWord ? (
          <div className="mt-4 space-y-1.5">
            <label htmlFor="confirm-delete" className="text-xs font-semibold text-(--text-muted)">
              Type DELETE to continue
            </label>
            <Input
              id="confirm-delete"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="DELETE"
            />
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-10 items-center rounded-lg border border-(--border-color) bg-(--btn-bg-secondary) px-4 text-sm font-semibold text-(--btn-text-secondary) disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading || deleteWordInvalid}
            className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-60 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-(--btn-bg-primary) hover:bg-(--btn-bg-primary-hover)"
            }`}
          >
            {loading ? (
              <>
                <Loader className="border-white/40 border-t-white" /> Working
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPageClient() {
  const { handleSignOut, submitting } = useAuth();
  const {
    loading,
    hydrated,
    role,
    activeTab,
    setActiveTab,
    savingBySection,
    profileSettings,
    setProfileSettings,
    securitySettings,
    setSecuritySettings,
    notificationSettings,
    setNotificationSettings,
    privacySettings,
    setPrivacySettings,
    buyerPayment,
    setBuyerPayment,
    sellerPayment,
    setSellerPayment,
    accountSettings,
    setAccountSettings,
    dirty,
    securityLevel,
    activeSessions,
    actions,
  } = useSettingsState();

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    action: null,
  });

  const currentTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTab) || tabs[0],
    [activeTab],
  );

  if (!hydrated || loading) {
    return (
      <section className="space-y-4">
        <div className="h-24 animate-pulse rounded-3xl bg-(--bg-secondary)" />
        <div className="grid gap-4 md:grid-cols-[250px_minmax(0,1fr)]">
          <div className="h-110 animate-pulse rounded-3xl bg-(--bg-secondary)" />
          <div className="h-110 animate-pulse rounded-3xl bg-(--bg-secondary)" />
        </div>
      </section>
    );
  }

  const handleAvatarInput: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileSettings((current) => ({
        ...current,
        avatarFile: file,
        avatarPreview: String(reader.result || ""),
      }));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const openConfirm = (action: ConfirmState["action"]) => {
    setConfirmState({ open: true, action });
  };

  const closeConfirm = () => {
    if (savingBySection.danger || savingBySection.security) return;
    setConfirmState({ open: false, action: null });
  };

  const runConfirmAction = async () => {
    if (!confirmState.action) return;

    if (confirmState.action === "logout-all") {
      await actions.logoutAllDevices();
      setConfirmState({ open: false, action: null });
      return;
    }

    if (confirmState.action === "deactivate") {
      await actions.saveDangerAction("deactivate");
      setConfirmState({ open: false, action: null });
      return;
    }

    if (confirmState.action === "delete") {
      await actions.saveDangerAction("delete");
      setConfirmState({ open: false, action: null });
      return;
    }

    if (confirmState.action === "export") {
      await actions.saveDangerAction("export");
      setConfirmState({ open: false, action: null });
    }
  };

  return (
    <section className="space-y-6 pb-18 md:pb-0">
      <header className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-6 shadow-[0_14px_35px_-25px_rgba(15,23,42,0.65)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-(--text-primary)">Settings</h1>
            <p className="mt-1 text-sm text-(--text-secondary)">
              Centralized control for identity, security, privacy, notifications, and payments.
            </p>
          </div>
          {dirty.any ? (
            <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
              <FiAlertTriangle className="size-3.5" /> Unsaved changes
            </p>
          ) : (
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <FiCheckCircle className="size-3.5" /> All changes saved
            </p>
          )}
        </div>
      </header>

      <div className="md:hidden">
        <label htmlFor="settings-mobile-tab" className="mb-1 block text-xs font-semibold text-(--text-muted)">
          Settings section
        </label>
        <select
          id="settings-mobile-tab"
          value={activeTab}
          onChange={(event) => setActiveTab(event.target.value as SettingsTab)}
          className="h-11 w-full rounded-xl border border-(--border-color) bg-(--bg-card) px-3 text-sm font-semibold text-(--text-primary)"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-[250px_minmax(0,1fr)] lg:gap-6">
        <aside className="hidden rounded-3xl border border-(--border-color) bg-(--bg-card) p-3 md:block md:sticky md:top-20 md:h-fit">
          {tabs.map((tab) => {
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
                  <span className="block text-xs opacity-80">{tab.description}</span>
                </span>
              </button>
            );
          })}
        </aside>

        <div key={activeTab} className="profile-fade-in min-w-0 space-y-4">
          {activeTab === "profile" ? (
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
                      onClick={() => document.getElementById("settings-avatar-upload")?.click()}
                      className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg border border-(--border-color) bg-(--btn-bg-secondary) px-3 text-sm font-semibold text-(--btn-text-secondary)"
                    >
                      Upload photo
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-(--text-muted)">Full name</label>
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
                    <label className="text-xs font-semibold text-(--text-muted)">Username</label>
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
                    <label className="text-xs font-semibold text-(--text-muted)">Display name</label>
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
                    <label className="text-xs font-semibold text-(--text-muted)">Location</label>
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
                    <label htmlFor="settings-profile-bio" className="text-xs font-semibold text-(--text-muted)">
                      Bio
                    </label>
                    <textarea
                      id="settings-profile-bio"
                      value={profileSettings.bio}
                      rows={4}
                      placeholder="Tell clients what you do best."
                      onChange={(event) =>
                        setProfileSettings((current) => ({ ...current, bio: event.target.value }))
                      }
                      className="w-full rounded-xl border border-(--input-border) bg-(--input-bg) px-3 py-2 text-sm text-(--input-text)"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-(--text-muted)">
                      Skills {role === "seller" || role === "both" ? "(seller)" : "(optional)"}
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
                    <label className="text-xs font-semibold text-(--text-muted)">Languages</label>
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
          ) : null}

          {activeTab === "security" ? (
            <SectionShell
              title="Security Settings"
              subtitle="Protect your account with password and session controls."
            >
              <div className="rounded-2xl border border-(--border-color) bg-(--bg-secondary)/55 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                  Security level
                </p>
                <p className="mt-1 text-lg font-black text-(--text-primary)">{securityLevel}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-(--text-muted)">Current password</label>
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
                  <label className="text-xs font-semibold text-(--text-muted)">New password</label>
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
                  <label className="text-xs font-semibold text-(--text-muted)">Confirm new password</label>
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
          ) : null}

          {activeTab === "notifications" ? (
            <SectionShell
              title="Notification Preferences"
              subtitle="Choose what updates you receive and where."
            >
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">General</p>
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
                <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">Orders & Messages</p>
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
                <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">Marketing</p>
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
          ) : null}

          {activeTab === "payment" ? (
            <SectionShell
              title="Payment Settings"
              subtitle={
                role === "seller" || role === "both"
                  ? "Manage payouts, withdrawals, and billing details."
                  : "Manage buyer payment methods and transaction snapshots."
              }
            >
              {role === "seller" || role === "both" ? (
                <>
                  <div className="rounded-2xl border border-(--border-color) bg-(--bg-secondary)/55 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                      Earnings summary
                    </p>
                    <p className="mt-1 text-2xl font-black text-(--text-primary)">$2,430.00</p>
                    <p className="text-xs text-(--text-muted)">Available for next payout cycle.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="settings-withdrawal-method" className="text-xs font-semibold text-(--text-muted)">
                        Withdrawal method
                      </label>
                      <select
                        id="settings-withdrawal-method"
                        title="Seller withdrawal method"
                        aria-label="Seller withdrawal method"
                        value={sellerPayment.withdrawalMethod}
                        onChange={(event) =>
                          setSellerPayment((current) => ({
                            ...current,
                            withdrawalMethod: event.target.value as "bank" | "wallet" | "none",
                          }))
                        }
                        className="h-11 w-full rounded-xl border border-(--border-color) bg-(--bg-card) px-3 text-sm text-(--text-primary)"
                      >
                        <option value="none">Not configured</option>
                        <option value="bank">Bank account</option>
                        <option value="wallet">Wallet</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-(--text-muted)">Payout account</label>
                      <Input
                        value={sellerPayment.payoutAccount}
                        onChange={(event) =>
                          setSellerPayment((current) => ({
                            ...current,
                            payoutAccount: event.target.value,
                          }))
                        }
                        placeholder="Account / wallet identifier"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-(--text-muted)">Tax / billing ID (optional)</label>
                      <Input
                        value={sellerPayment.taxId}
                        onChange={(event) =>
                          setSellerPayment((current) => ({ ...current, taxId: event.target.value }))
                        }
                        placeholder="Tax number"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3 rounded-2xl border border-(--border-color) bg-(--bg-secondary)/55 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                      Payment methods
                    </p>
                    {buyerPayment.methods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between rounded-xl border border-(--border-color) bg-(--bg-card) px-3 py-2"
                      >
                        <p className="text-sm font-semibold text-(--text-primary)">
                          {method.label} •••• {method.last4}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setBuyerPayment((current) => ({
                              ...current,
                              methods: current.methods.filter((entry) => entry.id !== method.id),
                            }))
                          }
                          className="text-xs font-semibold text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setBuyerPayment((current) => ({
                          ...current,
                          methods: [
                            ...current.methods,
                            {
                              id: `pm-${Date.now()}`,
                              label: "Mastercard",
                              last4: String(Math.floor(Math.random() * 9000) + 1000),
                            },
                          ],
                        }))
                      }
                      className="inline-flex h-10 items-center rounded-lg border border-(--border-color) bg-(--btn-bg-secondary) px-3 text-sm font-semibold text-(--btn-text-secondary)"
                    >
                      Add payment method
                    </button>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-(--border-color) bg-(--bg-secondary)/55 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                      Transaction preview
                    </p>
                    {buyerPayment.transactionPreview.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between rounded-xl border border-(--border-color) bg-(--bg-card) px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-semibold text-(--text-primary)">{entry.label}</p>
                          <p className="text-xs text-(--text-muted)">{entry.date}</p>
                        </div>
                        <p className="text-sm font-bold text-(--text-primary)">{entry.amount}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button
                type="button"
                disabled={!dirty.payment || savingBySection.payment}
                onClick={() => void actions.savePayment()}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) disabled:cursor-not-allowed disabled:opacity-70"
              >
                {savingBySection.payment ? (
                  <>
                    <Loader className="border-white/40 border-t-white" /> Saving
                  </>
                ) : (
                  "Save payment"
                )}
              </button>
            </SectionShell>
          ) : null}

          {activeTab === "privacy" ? (
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
                        profileVisibility: event.target.value as "public" | "private" | "limited",
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
                <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">Blocked users</p>
                {privacySettings.blockedUsers.length === 0 ? (
                  <p className="text-sm text-(--text-muted)">No blocked users.</p>
                ) : (
                  privacySettings.blockedUsers.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-lg border border-(--border-color) bg-(--bg-card) px-3 py-2"
                    >
                      <span className="text-sm font-semibold text-(--text-primary)">{entry.name}</span>
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
          ) : null}

          {activeTab === "account" ? (
            <SectionShell
              title="Account Settings"
              subtitle="Email, language, theme, and session actions."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-(--text-muted)">Account email</label>
                  <Input
                    type="email"
                    value={accountSettings.email}
                    onChange={(event) =>
                      setAccountSettings((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="settings-account-language" className="text-xs font-semibold text-(--text-muted)">
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
                  <label className="text-xs font-semibold text-(--text-muted)">Theme mode</label>
                  <div className="flex h-11 items-center gap-2 rounded-xl border border-(--border-color) bg-(--bg-card) p-1">
                    <button
                      type="button"
                      onClick={() => setAccountSettings((current) => ({ ...current, themeMode: "light" }))}
                      className={`inline-flex h-9 flex-1 items-center justify-center rounded-lg text-xs font-semibold ${
                        accountSettings.themeMode === "light"
                          ? "bg-(--btn-bg-primary) text-(--btn-text-primary)"
                          : "text-(--text-secondary)"
                      }`}
                    >
                      <FiSun className="size-3.5" /> Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountSettings((current) => ({ ...current, themeMode: "dark" }))}
                      className={`inline-flex h-9 flex-1 items-center justify-center rounded-lg text-xs font-semibold ${
                        accountSettings.themeMode === "dark"
                          ? "bg-(--btn-bg-primary) text-(--btn-text-primary)"
                          : "text-(--text-secondary)"
                      }`}
                    >
                      <FiMoon className="size-3.5" /> Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountSettings((current) => ({ ...current, themeMode: "system" }))}
                      className={`inline-flex h-9 flex-1 items-center justify-center rounded-lg text-xs font-semibold ${
                        accountSettings.themeMode === "system"
                          ? "bg-(--btn-bg-primary) text-(--btn-text-primary)"
                          : "text-(--text-secondary)"
                      }`}
                    >
                      <FiMonitor className="size-3.5" /> System
                    </button>
                  </div>
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
          ) : null}

          {activeTab === "danger" ? (
            <SectionShell
              title="Danger Zone"
              subtitle="Irreversible actions. Proceed only if you are absolutely sure."
            >
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  Deleting your account is permanent and cannot be undone.
                </p>
                <p className="mt-1 text-xs text-red-700/90">
                  This will remove your profile and disconnect access to marketplace data.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => openConfirm("export")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-(--border-color) bg-(--btn-bg-secondary) px-4 text-sm font-semibold text-(--btn-text-secondary)"
                >
                  <FiDownload className="size-4" /> Export data
                </button>

                <button
                  type="button"
                  onClick={() => openConfirm("deactivate")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-700"
                >
                  <FiShield className="size-4" /> Deactivate
                </button>

                <button
                  type="button"
                  onClick={() => openConfirm("delete")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
                >
                  <FiTrash2 className="size-4" /> Delete account
                </button>
              </div>
            </SectionShell>
          ) : null}
        </div>
      </div>

      <StickySave
        visible={activeTab === "profile"}
        disabled={!dirty.profile}
        loading={savingBySection.profile}
        onSave={() => void actions.saveProfile()}
        label="Save profile"
      />
      <StickySave
        visible={activeTab === "security"}
        disabled={!dirty.security}
        loading={savingBySection.security}
        onSave={() => void actions.saveSecurity()}
        label="Save security"
      />
      <StickySave
        visible={activeTab === "notifications"}
        disabled={!dirty.notifications}
        loading={savingBySection.notifications}
        onSave={() => void actions.saveNotifications()}
        label="Save notifications"
      />
      <StickySave
        visible={activeTab === "payment"}
        disabled={!dirty.payment}
        loading={savingBySection.payment}
        onSave={() => void actions.savePayment()}
        label="Save payment"
      />
      <StickySave
        visible={activeTab === "privacy"}
        disabled={!dirty.privacy}
        loading={savingBySection.privacy}
        onSave={() => void actions.savePrivacy()}
        label="Save privacy"
      />
      <StickySave
        visible={activeTab === "account"}
        disabled={!dirty.account}
        loading={savingBySection.account}
        onSave={() => void actions.saveAccount()}
        label="Save account"
      />

      <ConfirmModal
        open={confirmState.open && confirmState.action === "logout-all"}
        title="Logout from all devices"
        description="This signs you out from every active session and requires login again."
        confirmText="Confirm logout"
        onClose={closeConfirm}
        onConfirm={() => void runConfirmAction()}
        loading={savingBySection.security}
      />

      <ConfirmModal
        open={confirmState.open && confirmState.action === "export"}
        title="Request data export"
        description="SkillBridge will prepare your account data and notify you when export is ready."
        confirmText="Request export"
        onClose={closeConfirm}
        onConfirm={() => void runConfirmAction()}
        loading={savingBySection.danger}
      />

      <ConfirmModal
        open={confirmState.open && confirmState.action === "deactivate"}
        title="Deactivate account"
        description="You can return later by logging in again."
        confirmText="Deactivate"
        danger
        onClose={closeConfirm}
        onConfirm={() => void runConfirmAction()}
        loading={savingBySection.danger}
      />

      <ConfirmModal
        open={confirmState.open && confirmState.action === "delete"}
        title="Delete account permanently"
        description="This is irreversible and permanently removes your account from SkillBridge."
        confirmText="Delete forever"
        danger
        requiresDeleteWord
        onClose={closeConfirm}
        onConfirm={() => void runConfirmAction()}
        loading={savingBySection.danger}
      />

      <p className="text-xs text-(--text-muted)">
        Active section: {currentTab.label}
      </p>
    </section>
  );
}
