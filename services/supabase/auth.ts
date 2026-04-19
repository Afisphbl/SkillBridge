import { supabase } from "@/services/supabase/client";
import type { User } from "@supabase/supabase-js";

export type SignUpInput = {
  email: string;
  password: string;
  fullName: string;
  role: "buyer" | "seller" | "both";
  avatarUrl?: string;
};

export async function signUpWithEmail(input: SignUpInput) {
  return supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        role: input.role,
        avatar_url: input.avatarUrl ?? "",
      },
    },
  });
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOutCurrentUser() {
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}

export function onAuthStateChange(
  callback: Parameters<typeof supabase.auth.onAuthStateChange>[0],
) {
  return supabase.auth.onAuthStateChange(callback);
}

export async function getSession() {
  return supabase.auth.getSession();
}

function resolveUserRole(rawRole: unknown): "buyer" | "seller" | "both" {
  if (rawRole === "buyer" || rawRole === "seller" || rawRole === "both") {
    return rawRole;
  }

  return "buyer";
}

function resolveFullName(user: User) {
  const metadata = user.user_metadata ?? {};
  return (
    metadata.full_name ||
    metadata.name ||
    user.email?.split("@")[0] ||
    "SkillBridge User"
  );
}

function resolveAvatar(user: User) {
  const metadata = user.user_metadata ?? {};
  return metadata.avatar_url || metadata.picture || "";
}

export async function ensureUserProfileExists(user: User) {
  const { data: existingUser, error: checkError } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (checkError) {
    return { data: null, error: checkError };
  }

  if (existingUser) {
    return { data: existingUser, error: null };
  }

  const payload = {
    id: user.id,
    email: user.email ?? "",
    full_name: resolveFullName(user),
    role: resolveUserRole(user.user_metadata?.role),
    avatar: resolveAvatar(user),
  };

  return supabase.from("users").insert(payload).select("id").single();
}

export async function uploadAvatar(file: File, userId: string) {
  const extension = file.name.split(".").pop() || "png";
  const filePath = `avatars/${userId}_${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("profileImages")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw new Error(error.message);

  const { data: signedData, error: signedError } = await supabase.storage
    .from("profileImages")
    .createSignedUrl(filePath, 60 * 60 * 24 * 365);

  if (signedError) throw new Error(signedError.message);

  return signedData.signedUrl;
}

export async function saveUserProfile(data: {
  id: string;
  email: string;
  full_name: string;
  role: "buyer" | "seller" | "both";
  avatar: string;
}) {
  return supabase.from("users").upsert(data).select().single();
}
