"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiBriefcase,
  FiHome,
  FiLogOut,
  FiMessageSquare,
  FiPackage,
  FiSettings,
  FiShoppingBag,
  FiUser,
  FiX,
} from "react-icons/fi";
import { cn } from "@/utils/helpers";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

const primaryLinks = [
  { href: "/home", label: "Home", icon: FiHome },
  { href: "/services", label: "Services", icon: FiBriefcase },
  { href: "/gigs", label: "Gigs", icon: FiShoppingBag },
  { href: "/orders", label: "My Orders", icon: FiPackage },
  { href: "/messages", label: "Messages", icon: FiMessageSquare },
];

const secondaryLinks = [
  { href: "/profile", label: "Profile", icon: FiUser },
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
  const [viewport, setViewport] = useState<
    "tiny" | "mobile" | "desktop" | null
  >(() => {
    if (typeof window === "undefined") return null;
    if (window.matchMedia("(max-width: 399px)").matches) return "tiny";
    if (window.matchMedia("(max-width: 767px)").matches) return "mobile";
    return "desktop";
  });

  useEffect(() => {
    const tinyQuery = window.matchMedia("(max-width: 399px)");
    const mobileQuery = window.matchMedia("(max-width: 767px)");

    const updateViewportFromQueries = () => {
      if (tinyQuery.matches) {
        setViewport("tiny");
        return;
      }

      if (mobileQuery.matches) {
        setViewport("mobile");
        return;
      }

      setViewport("desktop");
    };

    updateViewportFromQueries();
    tinyQuery.addEventListener("change", updateViewportFromQueries);
    mobileQuery.addEventListener("change", updateViewportFromQueries);

    return () => {
      tinyQuery.removeEventListener("change", updateViewportFromQueries);
      mobileQuery.removeEventListener("change", updateViewportFromQueries);
    };
  }, []);

  if (viewport === null) {
    return null;
  }

  const renderLink = (item: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => {
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
  };

  const navItems = (
    <nav className="space-y-1.5">
      {primaryLinks.map(renderLink)}

      <div className="my-3 h-px w-full bg-(--border-color)" />

      {secondaryLinks.map(renderLink)}
    </nav>
  );

  const brand = (
    <div className="mb-8 border-b border-(--border-color) pb-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-11 place-items-center overflow-hidden rounded-full ring-2 ring-(--border-color)">
            <Image
              src="/SkillBridge.png"
              alt="SkillBridge logo"
              width={44}
              height={44}
              className="size-11 rounded-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h1 className="truncate bg-linear-to-r from-cyan-700 via-emerald-600 to-teal-700 bg-clip-text text-lg font-black tracking-[0.12em] text-transparent">
              SKILLBRIDGE
            </h1>
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
              Freelance Hub
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 grid size-8 place-items-center rounded-md text-(--text-muted) hover:bg-(--hover-bg) md:hidden"
          aria-label="Close sidebar"
        >
          <FiX className="size-4" />
        </button>
      </div>
    </div>
  );

  if (viewport === "desktop") {
    return (
      <aside className="hidden border-r border-(--border-color) bg-(--bg-sidebar) md:block md:h-full md:w-full md:overflow-hidden">
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
            <span>Logout</span>
          </button>
        </div>
      </aside>
    );
  }

  if (viewport === "tiny") {
    return (
      <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-(--border-color) bg-(--bg-sidebar) px-2 py-2">
        <nav className="grid grid-cols-5 gap-1">
          {primaryLinks.map((item) => {
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
    );
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-(--modal-overlay) transition-opacity",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-55 border-r border-(--border-color) bg-(--bg-sidebar) transition-transform",
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
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
