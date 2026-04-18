"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiCalendar,
  FiGrid,
  FiHome,
  FiLogOut,
  FiSettings,
  FiShoppingBag,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { cn } from "@/utils/helpers";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

const links = [
  { href: "/home", label: "Home", icon: FiHome },
  { href: "/dashboard", label: "Dashboard", icon: FiGrid },
  { href: "/orders", label: "Bookings", icon: FiCalendar },
  { href: "/gigs", label: "Cabins", icon: FiShoppingBag },
  { href: "/profile", label: "Users", icon: FiUsers },
  { href: "/settings", label: "Settings", icon: FiSettings },
];

export default function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { handleSignOut, submitting } = useAuth();

  const navItems = (
    <nav className="space-y-1.5">
      {links.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-(--text-secondary) hover:bg-(--sidebar-item-hover) hover:text-(--text-primary)",
              isActive &&
                "bg-(--sidebar-item-active) text-(--color-primary) ring-1 ring-inset ring-(--border-color)",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="size-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="mb-8 border-b border-(--border-color) pb-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative grid size-11 place-items-center rounded-full bg-linear-to-br from-emerald-700 to-emerald-900 text-sm font-bold text-white">
            <Image
              src="/SkillBridge.png"
              alt="Logo"
              fill
              className="size-6 object-center object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-[0.25em] text-(--text-muted)">
              Skill<span className="text-(--text-primary)">Bridge</span>
            </h1>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-8 place-items-center rounded-md text-(--text-muted) hover:bg-(--hover-bg) md:hidden"
          aria-label="Close sidebar"
        >
          <FiX className="size-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-(--modal-overlay) transition-opacity max-[399px]:hidden md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-70 border-r border-(--border-color) bg-(--bg-sidebar) transition-transform max-[399px]:hidden md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col px-5 py-6">
          {brand}
          {navItems}

          <button
            type="button"
            onClick={handleSignOut}
            disabled={submitting}
            className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-(--color-primary) hover:bg-(--hover-bg) disabled:opacity-60"
          >
            <FiLogOut className="size-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-(--border-color) bg-(--bg-sidebar) px-2 py-2 min-[400px]:hidden">
        <nav className="grid grid-cols-6 gap-1">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "grid place-items-center rounded-md py-2 text-(--text-muted)",
                  isActive &&
                    "bg-(--sidebar-item-active) text-(--color-primary)",
                )}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="size-4" />
              </Link>
            );
          })}
        </nav>
      </aside>

      <aside className="hidden border-r border-(--border-color) bg-(--bg-sidebar) md:block">
        <div className="flex h-full flex-col px-5 py-6">
          <div className="mb-8 border-b border-(--border-color) pb-6">
            <div className="flex items-center gap-3">
              <div className="relative grid size-11 place-items-center rounded-full bg-linear-to-br from-emerald-700 to-emerald-900 text-sm font-bold text-white">
                <Image
                  src="/SkillBridge.png"
                  alt="Logo"
                  fill
                  className="size-6 object-center object-cover"
                />
              </div>
              <div>
                <p className="text-xl font-extrabold tracking-[0.25em] text-(--text-muted)">
                  Skill<span className="text-(--text-primary)">Bridge</span>
                </p>
              </div>
            </div>
          </div>
          {navItems}
        </div>
      </aside>
    </>
  );
}
