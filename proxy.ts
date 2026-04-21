import type { NextRequest } from "next/server";
import { handleAuthMiddleware } from "@/middleware/authMiddleware";

export function proxy(request: NextRequest) {
  return handleAuthMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/home/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/gigs/:path*",
    "/orders/:path*",
    "/settings/:path*",
    "/seller/:path*",
    "/login",
    "/signup",
  ],
};
