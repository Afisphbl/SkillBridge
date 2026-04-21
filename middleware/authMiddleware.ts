import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_KEY,
  PROTECTED_ROUTES,
  PUBLIC_AUTH_ROUTES,
  SELLER_HOME_ROUTE,
  USER_ROLE_COOKIE_KEY,
} from "@/utils/constants";

export function handleAuthMiddleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_KEY)?.value;
  const role = request.cookies.get(USER_ROLE_COOKIE_KEY)?.value;
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthPage = PUBLIC_AUTH_ROUTES.some((route) => pathname === route);
  const isSellerRoute = pathname.startsWith("/seller");
  const isRootRoute = pathname === "/";

  if (token && isRootRoute) {
    const redirectPath = role === "seller" ? SELLER_HOME_ROUTE : "/home";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isSellerRoute && role === "buyer") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (isAuthPage && token) {
    const redirectPath = role === "seller" ? SELLER_HOME_ROUTE : "/home";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}
