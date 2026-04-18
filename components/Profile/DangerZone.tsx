import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";

type DangerZoneProps = {
  onDeleteAccount: () => void;
};

export default function DangerZone({ onDeleteAccount }: DangerZoneProps) {
  return (
    <section className="rounded-2xl border border-red-200 bg-red-50/70 p-5 shadow-(--card-shadow) sm:p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex size-8 items-center justify-center rounded-full bg-red-100 text-red-700">
          <FiAlertTriangle className="size-4" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-red-800">Danger Zone</h2>
          <p className="mt-1 text-sm text-red-700">
            Permanently delete your account and all associated profile data.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onDeleteAccount}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
      >
        <FiTrash2 className="size-4" /> Delete Account
      </button>
    </section>
  );
}
