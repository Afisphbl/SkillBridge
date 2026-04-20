import { FiBell, FiRefreshCcw, FiTrendingUp } from "react-icons/fi";
import Link from "next/link";
import { cn } from "@/utils/helpers";
import { useBuyerDashboardContext } from "./BuyerDashboardProvider";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--bg-secondary) p-6 text-center">
      <p className="text-sm font-semibold text-(--text-primary)">{title}</p>
      <p className="mt-1 text-sm text-(--text-secondary)">{description}</p>
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-black tracking-tight text-(--text-primary)">
          {title}
        </h2>
        <p className="mt-1 text-sm text-(--text-secondary)">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function SectionShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-5 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.7)] md:p-6">
      {children}
    </section>
  );
}

export function LoadingShell() {
  return (
    <section className="space-y-4">
      <div className="h-32 animate-pulse rounded-3xl bg-(--bg-secondary)" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-32 animate-pulse rounded-3xl bg-(--bg-secondary)" />
        <div className="h-32 animate-pulse rounded-3xl bg-(--bg-secondary)" />
        <div className="h-32 animate-pulse rounded-3xl bg-(--bg-secondary)" />
      </div>
      <div className="h-64 animate-pulse rounded-3xl bg-(--bg-secondary)" />
    </section>
  );
}

function useHeroData() {
  const { loadDashboard, refreshing } = useBuyerDashboardContext();
  return { loadDashboard, refreshing };
}

export function BuyerDashboardHero() {
  const { loadDashboard, refreshing } = useHeroData();

  return (
    <SectionShell>
      <div className="relative overflow-hidden rounded-2xl border border-(--border-color) bg-linear-to-br from-(--bg-card) via-(--bg-secondary) to-(--bg-card) p-6">
        <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-(--color-primary)/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 size-40 rounded-full bg-(--color-success)/10 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-(--bg-card) px-3 py-1 text-xs font-semibold text-(--text-secondary)">
              <FiTrendingUp className="size-3.5" />
              Buyer Command Center
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-(--text-primary)">
              Buyer Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-(--text-secondary)">
              Manage orders, spending, conversations, and reorders from one
              real-time workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-(--border-color) bg-(--bg-card) px-3 py-2 text-sm font-semibold text-(--text-primary) hover:bg-(--hover-bg)"
          >
            <FiRefreshCcw
              className={cn("size-4", refreshing && "animate-spin")}
            />
            {refreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/services"
            className="rounded-xl border border-(--border-color) bg-(--bg-card) px-4 py-3 text-sm font-semibold text-(--text-primary) hover:bg-(--hover-bg)"
          >
            Browse Services
          </Link>
          <Link
            href="/orders"
            className="rounded-xl border border-(--border-color) bg-(--bg-card) px-4 py-3 text-sm font-semibold text-(--text-primary) hover:bg-(--hover-bg)"
          >
            View Orders
          </Link>
          <Link
            href="/messages"
            className="rounded-xl border border-(--border-color) bg-(--bg-card) px-4 py-3 text-sm font-semibold text-(--text-primary) hover:bg-(--hover-bg)"
          >
            Contact Freelancer
          </Link>
          <Link
            href="/services"
            className="rounded-xl border border-(--border-color) bg-(--bg-card) px-4 py-3 text-sm font-semibold text-(--text-primary) hover:bg-(--hover-bg)"
          >
            Reorder Service
          </Link>
        </div>
      </div>
    </SectionShell>
  );
}

function useOverviewBadge() {
  const { unreadNotifications } = useBuyerDashboardContext();
  return { unreadNotifications };
}

export function OverviewUnreadBadge() {
  const { unreadNotifications } = useOverviewBadge();

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-(--bg-secondary) px-3 py-1 text-xs font-semibold text-(--text-secondary)">
      <FiBell className="size-3.5" />
      {unreadNotifications} unread notifications
    </div>
  );
}
