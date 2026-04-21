export const AUTH_COOKIE_KEY = "sb-access-token";
export const USER_ROLE_COOKIE_KEY = "sb-user-role";

export const PUBLIC_AUTH_ROUTES = ["/login", "/signup"];

export const PROTECTED_ROUTES = [
  "/home",
  "/dashboard",
  "/profile",
  "/gigs",
  "/orders",
  "/settings",
  "/seller",
];

export const SELLER_HOME_ROUTE = "/seller/home";

export const SELLER_PRIMARY_LINKS = [
  { href: "/seller/home", label: "Home" },
  { href: "/seller/dashboard", label: "Dashboard" },
  { href: "/seller/services", label: "Services" },
  { href: "/seller/orders", label: "My Orders" },
  { href: "/seller/messages", label: "Messages" },
] as const;

export const SELLER_SECONDARY_LINKS = [
  { href: "/seller/profile", label: "Profile" },
  { href: "/seller/settings", label: "Settings" },
] as const;

export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
