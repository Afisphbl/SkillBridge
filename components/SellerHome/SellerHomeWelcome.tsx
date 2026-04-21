"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FiCircle } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { getUserById } from "@/services/supabase/userApi";
import { useSellerDashboardContext } from "@/components/Dashboard/seller/SellerDashboardProvider";
import { SectionShell } from "@/components/Dashboard/seller/shared";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatTodayDate() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function SellerHomeWelcome() {
  const { session } = useAuth();
  const { unreadMessages, stats } = useSellerDashboardContext();

  const [profile, setProfile] = useState<{
    full_name?: string;
    email?: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    let mounted = true;

    getUserById(userId).then(({ data }) => {
      if (mounted) setProfile(data as typeof profile);
    });

    return () => { mounted = false; };
  }, [session?.user?.id]);

  const displayName =
    profile?.full_name ||
    profile?.email?.split("@")[0] ||
    session?.user?.email?.split("@")[0] ||
    "Seller";

  const firstName = displayName.split(" ")[0];
  const avatarUrl = profile?.avatar ?? "";
  const avatarLetter = displayName.slice(0, 1).toUpperCase();

  return (
    <SectionShell>
      <div className="relative overflow-hidden rounded-2xl border border-(--border-color) bg-linear-to-br from-(--bg-card) via-(--bg-secondary) to-(--bg-card) p-6">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-(--color-primary)/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-emerald-500/8 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-5">
          {/* Left — greeting */}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
              {formatTodayDate()}
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-(--text-primary) sm:text-3xl">
              {getGreeting()}, {firstName} 👋
            </h1>
            <p className="mt-1.5 text-sm text-(--text-secondary)">
              Here is what&apos;s happening with your business today.
            </p>

            {/* Live status pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {stats.activeOrders > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/60 px-3 py-1 text-xs font-bold text-blue-600">
                  <FiCircle className="size-2 fill-current" />
                  {stats.activeOrders} active {stats.activeOrders === 1 ? "order" : "orders"}
                </span>
              )}
              {unreadMessages > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-(--badge-warning-bg) px-3 py-1 text-xs font-bold text-(--color-warning)">
                  <FiCircle className="size-2 fill-current" />
                  {unreadMessages} unread {unreadMessages === 1 ? "message" : "messages"}
                </span>
              )}
              {stats.activeOrders === 0 && unreadMessages === 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-(--badge-success-bg) px-3 py-1 text-xs font-bold text-(--color-success)">
                  <FiCircle className="size-2 fill-current" />
                  All caught up
                </span>
              )}
            </div>
          </div>

          {/* Right — avatar + online status */}
          <div className="flex shrink-0 flex-col items-center gap-2">
            <div className="relative">
              <div className="grid size-16 place-items-center overflow-hidden rounded-full bg-(--color-primary) text-xl font-black text-(--text-inverse) ring-4 ring-(--border-color)">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={`${displayName} avatar`}
                    width={64}
                    height={64}
                    unoptimized
                    className="size-16 rounded-full object-cover"
                  />
                ) : (
                  avatarLetter
                )}
              </div>
              {/* Online dot */}
              <span className="absolute bottom-0.5 right-0.5 size-3.5 rounded-full bg-emerald-500 ring-2 ring-(--bg-card)" />
            </div>
            <span className="text-xs font-semibold text-emerald-600">Online</span>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
