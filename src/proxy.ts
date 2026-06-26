import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes: skip i18n entirely, handle auth here
  if (pathname.startsWith("/admin")) {
    if (pathname !== "/admin/login") {
      const token = request.cookies.get("admin_token")?.value;
      if (!token || !verifyToken(token)) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
    return NextResponse.next();
  }

  // i18n for all public pages
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
