"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserProfile } from "@/types/user";
import { getUserById } from "@/services/supabase/userApi";
import { useAuth } from "@/hooks/useAuth";

export function useUser() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!session?.user.id) {
      setProfile(null);
      return;
    }

    setLoading(true);
    const { data } = await getUserById(session.user.id);
    setProfile((data as UserProfile | null) ?? null);
    setLoading(false);
  }, [session?.user.id]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return { profile, loading, refreshProfile };
}
