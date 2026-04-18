import { ACCEPTED_IMAGE_TYPES, MAX_AVATAR_SIZE } from "@/utils/constants";
import type { UserRole } from "@/types/user";

export type LoginPayload = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type SignupPayload = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  avatar?: FileList;
  termsAccepted: boolean;
};

export function validateImageFile(file?: File) {
  if (!file) return null;

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Please upload PNG, JPG, or WEBP image.";
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return "Avatar file must be smaller than 2MB.";
  }

  return null;
}

export function mapSupabaseError(errorMessage?: string) {
  if (!errorMessage) return "Something went wrong. Please try again.";

  const message = errorMessage.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "Invalid credentials. Please check your email and password.";
  }

  if (message.includes("email not confirmed")) {
    return "Please verify your email before signing in.";
  }

  if (message.includes("already registered")) {
    return "An account with this email already exists.";
  }

  if (message.includes("network")) {
    return "Network error. Check your connection and try again.";
  }

  return errorMessage;
}
