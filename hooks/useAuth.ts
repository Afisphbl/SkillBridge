"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import {
  ensureUserProfileExists,
  getSession,
  onAuthStateChange,
  saveUserProfile,
  signInWithEmail,
  signOutCurrentUser,
  signUpWithEmail,
  uploadAvatar,
} from "@/services/supabase/auth";
import type { UserRole } from "@/types/user";
import { AUTH_COOKIE_KEY } from "@/utils/constants";
import { mapSupabaseError } from "@/lib/validators/authSchemas";

type SignupInput = {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  avatarFile?: File;
};

function writeAuthCookie(token: string | null, rememberMe = true) {
  if (typeof document === "undefined") return;

  if (!token) {
    document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
    return;
  }

  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
  document.cookie = `${AUTH_COOKIE_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function useAuth() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initializeSession() {
      const { data } = await getSession();
      if (!mounted) return;

      setSession(data.session);
      writeAuthCookie(data.session?.access_token ?? null, true);
      setLoadingSession(false);
    }

    initializeSession();

    const { data: listener } = onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      writeAuthCookie(nextSession?.access_token ?? null, true);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      setSubmitting(true);
      try {
        const { data, error } = await signInWithEmail(email, password);

        if (error) {
          const message = mapSupabaseError(error.message);
          toast.error(message);
          return { success: false, message };
        }

        if (data.user) {
          const { error: syncError } = await ensureUserProfileExists(data.user);
          if (syncError) {
            const message =
              "Login succeeded but we could not sync your profile.";
            toast.error(message);
            return { success: false, message };
          }
        }

        writeAuthCookie(data.session?.access_token ?? null, rememberMe);
        toast.success("Login successful");
        router.push("/home");
        return { success: true };
      } catch {
        const message = "Network error. Please try again.";
        toast.error(message);
        return { success: false, message };
      } finally {
        setSubmitting(false);
      }
    },
    [router],
  );

  const handleSignUp = useCallback(
    async ({ fullName, email, password, role, avatarFile }: SignupInput) => {
      setSubmitting(true);
      try {
        const { data, error } = await signUpWithEmail({
          fullName,
          email,
          password,
          role,
        });

        if (error) {
          const message = mapSupabaseError(error.message);
          toast.error(message);
          return { success: false, message };
        }

        const userId = data.user?.id;
        if (!userId) {
          const message = "Failed to create account. Please try again.";
          toast.error(message);
          return { success: false, message };
        }

        let avatarUrl = "";
        if (avatarFile) {
          avatarUrl = await uploadAvatar(avatarFile, userId);
        }

        await saveUserProfile({
          id: userId,
          email,
          full_name: fullName,
          role,
          avatar: avatarUrl,
        });

        const { data: sessionData } = await getSession();
        writeAuthCookie(sessionData.session?.access_token ?? null, true);

        toast.success("Account created successfully");
        router.push("/home");
        return { success: true };
      } catch {
        const message = "Network error. Please try again.";
        toast.error(message);
        return { success: false, message };
      } finally {
        setSubmitting(false);
      }
    },
    [router],
  );

  const handleSignOut = useCallback(async () => {
    setSubmitting(true);
    try {
      const { error } = await signOutCurrentUser();
      if (error) {
        toast.error(mapSupabaseError(error.message));
        return;
      }

      writeAuthCookie(null);
      toast.success("Signed out successfully");
      router.push("/login");
    } finally {
      setSubmitting(false);
    }
  }, [router]);

  return useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.user),
      loadingSession,
      submitting,
      handleSignIn,
      handleSignUp,
      handleSignOut,
    }),
    [
      session,
      loadingSession,
      submitting,
      handleSignIn,
      handleSignOut,
      handleSignUp,
    ],
  );
}
