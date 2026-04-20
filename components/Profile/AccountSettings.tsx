import { FiKey, FiLogOut } from "react-icons/fi";
import toast from "react-hot-toast";
import Loader from "@/components/UI/Loader";
import { useAuth } from "@/hooks/useAuth";

export default function AccountSettings() {
  const { submitting, handleSignOut } = useAuth();

  const handleChangePassword = () => {
    toast("Password flow is available in account settings service.");
  };

  return (
    <section className="rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-(--card-shadow) sm:p-6">
      <h2 className="text-base font-semibold text-(--text-primary)">
        Account Settings
      </h2>
      <p className="mt-1 text-sm text-(--text-muted)">
        Manage security and session actions.
      </p>

      <div className="my-4 h-px bg-(--border-color)" />

      <div className="space-y-2">
        <button
          type="button"
          onClick={handleChangePassword}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-(--border-color) bg-(--btn-bg-secondary) px-4 py-2.5 text-sm font-semibold text-(--btn-text-secondary) hover:bg-(--btn-bg-secondary-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus)"
        >
          <FiKey className="size-4" /> Change Password
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-(--btn-bg-primary) px-4 py-2.5 text-sm font-semibold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus) disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader className="border-white/35 border-t-white" /> Signing out
            </>
          ) : (
            <>
              <FiLogOut className="size-4" /> Sign Out
            </>
          )}
        </button>
      </div>
    </section>
  );
}
