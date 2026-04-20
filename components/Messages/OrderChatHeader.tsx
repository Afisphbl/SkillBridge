"use client";

import Link from "next/link";
import { FiArrowLeft, FiCircle } from "react-icons/fi";

type OrderChatHeaderProps = {
  orderId: string;
  peerName: string;
};

export function OrderChatHeader({ orderId, peerName }: OrderChatHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-(--border-color) bg-(--bg-card)/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <Link
          href="/messages"
          className="inline-flex size-9 items-center justify-center rounded-full border border-(--border-color) text-(--text-secondary) transition hover:bg-(--hover-bg)"
          aria-label="Back to messages inbox"
        >
          <FiArrowLeft className="size-4" />
        </Link>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-(--text-primary) sm:text-base">
            {peerName}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-(--text-muted)">
            <FiCircle className="size-2.5 fill-current text-emerald-500" />
            <span>Order #{orderId}</span>
          </p>
        </div>
      </div>
    </header>
  );
}
