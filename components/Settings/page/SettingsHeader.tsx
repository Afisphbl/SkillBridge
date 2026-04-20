import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { useSettingsPageContext } from "@/components/Settings/page/SettingsPageProvider";

function useSettingsHeaderData() {
  const { dirty } = useSettingsPageContext();
  return { hasUnsavedChanges: dirty.any };
}

export function SettingsHeader() {
  const { hasUnsavedChanges } = useSettingsHeaderData();

  return (
    <header className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-6 shadow-[0_14px_35px_-25px_rgba(15,23,42,0.65)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-(--text-primary)">
            Settings
          </h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Centralized control for identity, security, privacy, notifications,
            and payments.
          </p>
        </div>
        {hasUnsavedChanges ? (
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
  );
}
