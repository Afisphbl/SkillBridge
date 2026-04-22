import { useState } from "react";
import {
  FiAlertTriangle,
  FiBell,
  FiClock,
  FiCreditCard,
  FiGlobe,
  FiLock,
  FiMonitor,
  FiMoon,
  FiShield,
  FiSun,
  FiUser,
} from "react-icons/fi";
import Loader from "@/components/UI/Loader";
import Input from "@/components/UI/Input";
import type { SettingsTab } from "@/hooks/settings/useSettingsState";

export const settingsTabs: Array<{
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    id: "profile",
    label: "Profile",
    icon: FiUser,
    description: "Identity and public info",
  },
  {
    id: "security",
    label: "Security",
    icon: FiShield,
    description: "Password, 2FA, sessions",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: FiBell,
    description: "Email and in-app alerts",
  },
  {
    id: "availability",
    label: "Availability",
    icon: FiClock,
    description: "Working hours and vacation",
  },
  {
    id: "payment",
    label: "Payment",
    icon: FiCreditCard,
    description: "Billing and payouts",
  },
  {
    id: "privacy",
    label: "Privacy",
    icon: FiLock,
    description: "Visibility and blocking",
  },
  {
    id: "account",
    label: "Account",
    icon: FiGlobe,
    description: "Email, language, theme",
  },
  {
    id: "danger",
    label: "Danger Zone",
    icon: FiAlertTriangle,
    description: "Critical actions",
  },
];

export function SectionShell({
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
        <h2 className="text-xl font-black tracking-tight text-(--text-primary)">
          {title}
        </h2>
        <p className="mt-1 text-sm text-(--text-secondary)">{subtitle}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function SettingRow({
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

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      className="inline-flex cursor-pointer items-center"
      aria-label="Toggle setting"
      title="Toggle setting"
    >
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

export function StickySave({
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

export function ConfirmModal({
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
            <label
              htmlFor="confirm-delete"
              className="text-xs font-semibold text-(--text-muted)"
            >
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
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-(--btn-bg-primary) hover:bg-(--btn-bg-primary-hover)"
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

export function SettingsLoadingState() {
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

export function ThemeModeSwitch({
  value,
  onLight,
  onDark,
  onSystem,
}: {
  value: "light" | "dark" | "system";
  onLight: () => void;
  onDark: () => void;
  onSystem: () => void;
}) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-xl border border-(--border-color) bg-(--bg-card) p-1">
      <button
        type="button"
        onClick={onLight}
        className={`inline-flex h-9 flex-1 items-center justify-center rounded-lg text-xs font-semibold ${
          value === "light"
            ? "bg-(--btn-bg-primary) text-(--btn-text-primary)"
            : "text-(--text-secondary)"
        }`}
      >
        <FiSun className="size-3.5" /> Light
      </button>
      <button
        type="button"
        onClick={onDark}
        className={`inline-flex h-9 flex-1 items-center justify-center rounded-lg text-xs font-semibold ${
          value === "dark"
            ? "bg-(--btn-bg-primary) text-(--btn-text-primary)"
            : "text-(--text-secondary)"
        }`}
      >
        <FiMoon className="size-3.5" /> Dark
      </button>
      <button
        type="button"
        onClick={onSystem}
        className={`inline-flex h-9 flex-1 items-center justify-center rounded-lg text-xs font-semibold ${
          value === "system"
            ? "bg-(--btn-bg-primary) text-(--btn-text-primary)"
            : "text-(--text-secondary)"
        }`}
      >
        <FiMonitor className="size-3.5" /> System
      </button>
    </div>
  );
}
