import Link from "next/link";
import { FiAlertCircle, FiRefreshCcw } from "react-icons/fi";
import { useBuyerDashboardContext } from "./BuyerDashboardProvider";
import { LoadingShell, SectionShell } from "./shared";

function useBuyerDashboardGate() {
  const { errorMessage, loadDashboard, loading, roleBlocked } =
    useBuyerDashboardContext();

  return {
    errorMessage,
    loadDashboard,
    loading,
    roleBlocked,
  };
}

export default function BuyerDashboardStateGate() {
  const { errorMessage, loadDashboard, loading, roleBlocked } =
    useBuyerDashboardGate();

  if (loading) {
    return <LoadingShell />;
  }

  if (errorMessage) {
    return (
      <SectionShell>
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <FiAlertCircle className="size-8 text-(--color-danger)" />
          <h1 className="text-xl font-bold text-(--text-primary)">
            Service unavailable
          </h1>
          <p className="max-w-xl text-sm text-(--text-secondary)">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={() => void loadDashboard(false)}
            className="inline-flex items-center gap-2 rounded-lg bg-(--btn-bg-primary) px-4 py-2 text-sm font-semibold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover)"
          >
            <FiRefreshCcw className="size-4" /> Retry
          </button>
        </div>
      </SectionShell>
    );
  }

  if (roleBlocked) {
    return (
      <SectionShell>
        <div className="space-y-3 py-4 text-center">
          <h1 className="text-2xl font-black text-(--text-primary)">
            Buyer Dashboard Access Required
          </h1>
          <p className="text-(--text-secondary)">
            Your account is seller-only. Switch to a buyer or dual-role account
            to manage purchases.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Link
              href="/settings"
              className="rounded-lg bg-(--btn-bg-primary) px-4 py-2 text-sm font-semibold text-(--btn-text-primary)"
            >
              Open settings
            </Link>
            <Link
              href="/services"
              className="rounded-lg border border-(--border-color) px-4 py-2 text-sm font-semibold text-(--text-primary)"
            >
              Browse services
            </Link>
          </div>
        </div>
      </SectionShell>
    );
  }

  return null;
}
