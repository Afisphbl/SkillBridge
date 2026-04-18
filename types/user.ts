export type UserRole = "buyer" | "seller" | "both";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar?: string;
};
