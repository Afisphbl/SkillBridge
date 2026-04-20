"use client";

import Image from "next/image";
import { FiClock, FiMessageSquare, FiShield } from "react-icons/fi";
import { useSellerProfile } from "@/hooks/services/useSellerProfile";

export default function SellerCard() {
  const { seller } = useSellerProfile();
  const fullName = seller?.full_name || seller?.email;
  const avatar = seller?.avatar;
  const role = seller?.role;
  const bio = seller?.bio;
  const responseTime = seller?.response_time;

  const sellerName = fullName || "Seller";

  return (
    <section className="space-y-4 rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 shadow-sm">
      <h2 className="text-lg font-bold text-(--text-primary)">
        About the seller
      </h2>

      <div className="flex items-center gap-3">
        <div className="grid size-12 place-items-center overflow-hidden rounded-full bg-(--bg-secondary)">
          {avatar ? (
            <Image
              src={avatar}
              alt={sellerName}
              width={48}
              height={48}
              unoptimized
              className="size-12 rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-(--text-muted)">
              {sellerName.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-(--text-primary)">
            {sellerName}
          </p>
          {role ? (
            <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-(--badge-success-bg) px-2 py-0.5 text-[11px] font-semibold text-(--color-success)">
              <FiShield className="size-3" />
              {role}
            </p>
          ) : null}
        </div>
      </div>

      <p className="text-sm leading-6 text-(--text-secondary)">
        {bio || "This seller has not added a bio yet."}
      </p>

      {responseTime ? (
        <p className="inline-flex items-center gap-1.5 text-xs text-(--text-muted)">
          <FiClock className="size-3.5" />
          Avg. response: {responseTime}
        </p>
      ) : null}

      <button
        type="button"
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-(--border-color) bg-(--bg-card) px-4 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
      >
        <FiMessageSquare className="size-4" />
        Contact Seller
      </button>
    </section>
  );
}
