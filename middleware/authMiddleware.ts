import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_KEY,
  PROTECTED_ROUTES,
  PUBLIC_AUTH_ROUTES,
  SELLER_HOME_ROUTE,
} from "@/utils/constants";

type UserRole = "buyer" | "seller" | "both";

function parseUserRole(rawRole: unknown): UserRole | null {
  if (rawRole === "buyer" || rawRole === "seller" || rawRole === "both") {
    return rawRole;
  }

  return null;
}

async function getAuthoritativeRole(token: string): Promise<UserRole | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    return parseUserRole(user?.user_metadata?.role);
  } catch {
    return null;
  }
}

export async function handleAuthMiddleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_KEY)?.value;
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthPage = PUBLIC_AUTH_ROUTES.some((route) => pathname === route);
  const isSellerRoute = pathname.startsWith("/seller");
  const isRootRoute = pathname === "/";

  const shouldResolveRole = Boolean(
    token && (isRootRoute || isAuthPage || isSellerRoute),
  );

  const role = shouldResolveRole ? await getAuthoritativeRole(token!) : null;

  if (token && isRootRoute) {
    const redirectPath = role === "seller" ? SELLER_HOME_ROUTE : "/home";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isSellerRoute && role !== "seller" && role !== "both") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (isAuthPage && token) {
    const redirectPath = role === "seller" ? SELLER_HOME_ROUTE : "/home";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}
