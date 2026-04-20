import { FiDownload, FiShield, FiTrash2 } from "react-icons/fi";
import { useSettingsPageContext } from "@/components/Settings/page/SettingsPageProvider";
import { SectionShell } from "@/components/Settings/page/SettingsPageShared";

function useSettingsDangerSectionData() {
  const { openConfirm } = useSettingsPageContext();
  return { openConfirm };
}

export function SettingsDangerSection() {
  const { openConfirm } = useSettingsDangerSectionData();

  return (
    <SectionShell
      title="Danger Zone"
      subtitle="Irreversible actions. Proceed only if you are absolutely sure."
    >
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-700">
          Deleting your account is permanent and cannot be undone.
        </p>
        <p className="mt-1 text-xs text-red-700/90">
          This will remove your profile and disconnect access to marketplace
          data.
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
  );
}
