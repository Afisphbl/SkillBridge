"use client";

import Link from "next/link";
import {
  FiBriefcase,
  FiMessageSquare,
  FiPackage,
  FiRefreshCcw,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";
import { cn } from "@/utils/helpers";
import { useSellerDashboardContext } from "./SellerDashboardProvider";
import { SectionShell } from "./shared";

const QUICK_ACTIONS = [
  { href: "/seller/services/create", label: "Create Service", icon: FiBriefcase },
  { href: "/seller/orders", label: "View Orders", icon: FiPackage },
  { href: "/seller/messages", label: "Messages", icon: FiMessageSquare },
  { href: "/seller/profile", label: "Edit Profile", icon: FiUser },
];

export default function SellerDashboardHero() {
  const { loadDashboard, refreshing, unreadMessages, stats } = useSellerDashboardContext();

  return (
    <SectionShell>
      <div className="relative overflow-hidden rounded-2xl border border-(--border-color) bg-linear-to-br from-(--bg-card) via-(--bg-secondary) to-(--bg-card) p-6">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-12 -top-14 size-48 rounded-full bg-(--color-primary)/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-14 -left-14 size-48 rounded-full bg-(--color-success)/10 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-(--bg-card) px-3 py-1 text-xs font-semibold text-(--text-secondary)">
              <FiTrendingUp className="size-3.5 text-(--color-primary)" />
              Seller Command Center
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-(--text-primary)">
              Seller Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm text-(--text-secondary)">
              Overview of your business performance — earnings, orders, and client activity in one place.
            </p>

            {/* Live indicators */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {unreadMessages > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-(--badge-warning-bg) px-3 py-1 text-xs font-bold text-(--color-warning)">
                  <FiMessageSquare className="size-3" />
                  {unreadMessages} unread {unreadMessages === 1 ? "message" : "messages"}
                </span>
              )}
              {stats.activeOrders > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/60 px-3 py-1 text-xs font-bold text-blue-600">
                  <FiPackage className="size-3" />
                  {stats.activeOrders} active {stats.activeOrders === 1 ? "order" : "orders"}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-(--border-color) bg-(--bg-card) px-4 py-2 text-sm font-semibold text-(--text-primary) hover:bg-(--hover-bg)"
          >
            <FiRefreshCcw className={cn("size-4", refreshing && "animate-spin")} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {/* Quick actions */}
        <div className="relative mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-xl border border-(--border-color) bg-(--bg-card) px-4 py-3 text-sm font-semibold text-(--text-primary) transition hover:bg-(--hover-bg) hover:text-(--color-primary)"
            >
              <Icon className="size-4 shrink-0 text-(--color-primary)" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
