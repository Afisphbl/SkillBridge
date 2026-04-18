"use client";

import { useEffect, useState } from "react";
import type { UserProfile } from "@/types/user";
import { supabase } from "@/services/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useUser() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user.id) {
        setProfile(null);
        return;
      }

      setLoading(true);
      const { data } = await supabase
        .from("users")
        .select("id,email,full_name,role,avatar")
        .eq("id", session.user.id)
        .single();

      setProfile((data as UserProfile | null) ?? null);
      setLoading(false);
    }

    fetchProfile();
  }, [session?.user.id]);

  return { profile, loading };
}
