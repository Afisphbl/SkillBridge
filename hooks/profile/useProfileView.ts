"use client";

import { useMemo } from "react";
import type { Session } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/user";

type ProfileView = {
  fullName: string;
  roleLabel: string;
  email: string;
  memberSince: string;
  bio: string;
};

export function useProfileView(
  profile: UserProfile | null,
  session: Session | null,
): ProfileView {
  return useMemo(() => {
    const fullName = profile?.full_name?.trim() || "SkillBridge Member";
    const roleRaw = profile?.role || "seller";
    const roleLabel = roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1);
    const email =
      profile?.email || session?.user?.email || "no-email@skillbridge.app";
    const createdAt = session?.user?.created_at;
    const memberSince = createdAt
      ? `Member since ${new Date(createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}`
      : "Member since recently";

    return {
      fullName,
      roleLabel,
      email,
      memberSince,
      bio: profile?.bio ?? "",
    };
  }, [
    profile?.bio,
    profile?.email,
    profile?.full_name,
    profile?.role,
    session?.user?.created_at,
    session?.user?.email,
  ]);
}
