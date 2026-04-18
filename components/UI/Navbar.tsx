"use client";

import { useEffect, useState } from "react";
import { FiLogOut, FiMenu, FiMoon, FiSun, FiUser } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import Link from "next/link";
import { getUserById } from "@/services/supabase/userApi";

export default function Navbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { handleSignOut, submitting, session } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tinyMenuOpen, setTinyMenuOpen] = useState(false);
  const [navbarUser, setNavbarUser] = useState<{
    full_name?: string;
    email?: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUserById() {
      const userId = session?.user?.id;
      if (!userId) {
        if (mounted) setNavbarUser(null);
        return;
      }

      const { data } = await getUserById(userId);
      if (!mounted) return;

      setNavbarUser(
        (data as { full_name?: string; email?: string } | null) ?? null,
      );
    }

    loadUserById();

    return () => {
      mounted = false;
    };
  }, [session?.user?.id]);

  const displayName =
    navbarUser?.full_name || navbarUser?.email || session?.user.email || "User";

  return (
    <header className="sticky top-0 z-30 border-b border-(--border-color) bg-(--bg-navbar)">
      <div className="relative flex h-16 items-center justify-between px-4 md:px-8">
        <button
          type="button"
          className="hidden size-9 place-items-center rounded-md text-(--color-primary) hover:bg-(--hover-bg) max-[399px]:hidden md:hidden min-[400px]:grid"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <FiMenu className="size-5" />
        </button>

        <div className="grid size-8 place-items-center rounded-full bg-(--color-primary) text-xs font-semibold text-(--text-inverse) min-[400px]:hidden">
          {displayName.slice(0, 1).toUpperCase()}
        </div>

        <div className="flex flex-1 items-center justify-end gap-4 text-(--text-secondary) max-[399px]:hidden">
          <div className="hidden items-center gap-3 md:flex">
            <div className="grid size-8 place-items-center rounded-full bg-(--color-primary) text-xs font-semibold text-(--text-inverse)">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-(--text-secondary)">
              {displayName}
            </span>
          </div>

          <div className="grid size-8 place-items-center rounded-full bg-(--color-primary) text-xs font-semibold text-(--text-inverse) md:hidden">
            {displayName.slice(0, 1).toUpperCase()}
          </div>

          <button
            type="button"
            className="grid size-8 place-items-center rounded-md text-(--color-primary) hover:bg-(--hover-bg)"
            aria-label="Profile"
          >
            <FiUser className="size-4" />
          </button>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-md text-(--color-primary) hover:bg-(--hover-bg)"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <FiSun className="size-4" />
            ) : (
              <FiMoon className="size-4" />
            )}
          </button>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-md text-(--color-primary) hover:bg-(--hover-bg) disabled:opacity-50"
            onClick={handleSignOut}
            disabled={submitting}
            aria-label="Sign out"
          >
            <FiLogOut className="size-4" />
          </button>
        </div>

        <button
          type="button"
          className="grid size-9 place-items-center rounded-md text-(--color-primary) hover:bg-(--hover-bg) min-[400px]:hidden"
          onClick={() => setTinyMenuOpen((open) => !open)}
          aria-label="Toggle navbar actions"
        >
          <FiMenu className="size-5" />
        </button>

        {tinyMenuOpen ? (
          <div className="absolute right-4 top-14 z-40 w-44 rounded-lg border border-(--border-color) bg-(--bg-card) p-2 shadow-lg min-[400px]:hidden">
            <Link
              href="/profile"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-(--text-secondary) hover:bg-(--hover-bg)"
            >
              <FiUser className="size-4 text-(--color-primary)" />
              <span>Profile</span>
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-(--text-secondary) hover:bg-(--hover-bg)"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <FiSun className="size-4 text-(--color-primary)" />
              ) : (
                <FiMoon className="size-4 text-(--color-primary)" />
              )}
              <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-(--color-danger) hover:bg-(--badge-danger-bg) disabled:opacity-50"
              onClick={handleSignOut}
              disabled={submitting}
            >
              <FiLogOut className="size-4" />
              <span>Sign out</span>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
