import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_KEY,
  PROTECTED_ROUTES,
  PUBLIC_AUTH_ROUTES,
} from "@/utils/constants";

export function handleAuthMiddleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_KEY)?.value;
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthPage = PUBLIC_AUTH_ROUTES.some((route) => pathname === route);

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}
