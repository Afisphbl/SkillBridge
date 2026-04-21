"use client";

import Image from "next/image";
import Link from "next/link";
import { FiExternalLink, FiMessageSquare } from "react-icons/fi";
import { useSellerDashboardContext } from "@/components/Dashboard/seller/SellerDashboardProvider";
import { SectionHeader, SectionShell } from "@/components/Dashboard/seller/shared";

function toRelativeTime(value?: string | null) {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const m = 60_000;
  const h = 3_600_000;
  const d = 86_400_000;
  if (diff < m) return "Just now";
  if (diff < h) return `${Math.floor(diff / m)}m ago`;
  if (diff < d) return `${Math.floor(diff / h)}h ago`;
  return `${Math.floor(diff / d)}d ago`;
}

function initialsFromName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function SellerHomeMessages() {
  const { messages, sellerId, profilesMap } = useSellerDashboardContext();

  // Group messages by order_id + peer, take the latest per conversation
  const conversations = (() => {
    if (!Array.isArray(messages)) return [];

    const map = new Map<
      string,
      {
        orderId: string;
        peerId: string;
        peerName: string;
        peerAvatar?: string | null;
        lastMessage: string;
        lastAt: string | null;
        unread: number;
      }
    >();

    for (const msg of messages) {
      const peerId =
        msg.sender_id === sellerId ? msg.receiver_id : msg.sender_id;
      const orderId = msg.order_id ?? "";
      const key = `${orderId}::${peerId}`;

      const existing = map.get(key);
      const peer = profilesMap[peerId];
      const peerName =
        peer?.full_name || peer?.email || `Buyer ${peerId.slice(0, 6)}`;

      if (!existing) {
        map.set(key, {
          orderId,
          peerId,
          peerName,
          peerAvatar: peer?.avatar,
          lastMessage: msg.message ?? "",
          lastAt: msg.created_at ?? null,
          unread:
            msg.receiver_id === sellerId && msg.is_read === false ? 1 : 0,
        });
      } else {
        if (
          msg.receiver_id === sellerId &&
          msg.is_read === false
        ) {
          existing.unread += 1;
        }
      }
    }

    return Array.from(map.values())
      .sort((a, b) => {
        const at = new Date(a.lastAt ?? 0).getTime();
        const bt = new Date(b.lastAt ?? 0).getTime();
        return bt - at;
      })
      .slice(0, 6);
  })();

  return (
    <SectionShell>
      <SectionHeader
        title="Recent Messages"
        subtitle="Latest conversations with your buyers"
        action={
          <Link
            href="/seller/messages"
            className="inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) px-3 py-2 text-xs font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
          >
            Open inbox
            <FiExternalLink className="size-3.5" />
          </Link>
        }
      />

      {conversations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--bg-secondary) p-8 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-(--bg-card)">
            <FiMessageSquare className="size-5 text-(--text-muted)" />
          </div>
          <p className="mt-3 text-sm font-semibold text-(--text-primary)">
            No messages yet
          </p>
          <p className="mt-1 text-xs text-(--text-secondary)">
            Buyer conversations will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const initials = initialsFromName(conv.peerName);
            const href = conv.orderId
              ? `/seller/messages?m=${conv.orderId}`
              : "/seller/messages";

            return (
              <Link
                key={`${conv.orderId}::${conv.peerId}`}
                href={href}
                className="flex items-center gap-3 rounded-2xl border border-(--border-color) bg-(--bg-card) p-3 transition hover:bg-(--hover-bg)"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="grid size-10 place-items-center overflow-hidden rounded-full bg-(--bg-secondary) text-xs font-bold text-(--text-secondary)">
                    {conv.peerAvatar ? (
                      <Image
                        src={conv.peerAvatar}
                        alt={conv.peerName}
                        width={40}
                        height={40}
                        unoptimized
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      initials || "?"
                    )}
                  </div>
                  {conv.unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-(--color-primary) text-[9px] font-black text-(--text-inverse)">
                      {conv.unread > 9 ? "9+" : conv.unread}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`truncate text-sm text-(--text-primary) ${
                        conv.unread > 0 ? "font-black" : "font-semibold"
                      }`}
                    >
                      {conv.peerName}
                    </p>
                    <span className="shrink-0 text-[10px] text-(--text-muted)">
                      {toRelativeTime(conv.lastAt)}
                    </span>
                  </div>
                  <p
                    className={`mt-0.5 truncate text-xs ${
                      conv.unread > 0
                        ? "font-semibold text-(--text-primary)"
                        : "text-(--text-secondary)"
                    }`}
                  >
                    {conv.lastMessage || "No message content"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}
