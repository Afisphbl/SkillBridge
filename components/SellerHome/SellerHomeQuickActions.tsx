"use client";

import Link from "next/link";
import {
  FiBriefcase,
  FiDollarSign,
  FiLayers,
  FiMessageSquare,
  FiPackage,
  FiUser,
} from "react-icons/fi";
import { SectionHeader, SectionShell } from "@/components/Dashboard/seller/shared";

type Action = {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  accent: string;
};

const ACTIONS: Action[] = [
  {
    href: "/seller/services/create",
    icon: FiBriefcase,
    title: "Create New Service",
    description: "Start offering a new service to buyers",
    accent: "bg-blue-500",
  },
  {
    href: "/seller/services",
    icon: FiLayers,
    title: "Manage Services",
    description: "Edit, pause, or delete your services",
    accent: "bg-violet-500",
  },
  {
    href: "/seller/orders",
    icon: FiPackage,
    title: "View Orders",
    description: "Track and manage all your orders",
    accent: "bg-emerald-500",
  },
  {
    href: "/seller/messages",
    icon: FiMessageSquare,
    title: "Open Messages",
    description: "Reply to buyers and manage chats",
    accent: "bg-amber-500",
  },
  {
    href: "/seller/profile",
    icon: FiUser,
    title: "Edit Profile",
    description: "Update your bio, skills, and avatar",
    accent: "bg-rose-500",
  },
];

export default function SellerHomeQuickActions() {
  return (
    <SectionShell>
      <SectionHeader
        title="Quick Actions"
        subtitle="Jump straight to the most common seller tasks"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {ACTIONS.map(({ href, icon: Icon, title, description, accent }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-3 rounded-2xl border border-(--border-color) bg-(--bg-card) p-4 transition hover:border-(--color-primary)/40 hover:bg-(--hover-bg) hover:shadow-md"
          >
            <div className={`grid size-10 place-items-center rounded-xl ${accent}/15`}>
              <Icon className={`size-5 ${accent.replace("bg-", "text-")}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-(--text-primary) group-hover:text-(--color-primary)">
                {title}
              </p>
              <p className="mt-0.5 text-xs text-(--text-secondary)">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </SectionShell>
  );
}
