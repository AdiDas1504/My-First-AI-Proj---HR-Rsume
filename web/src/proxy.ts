import { NextResponse, type NextRequest } from "next/server";

const DEVICE_COOKIE = "jf_did";
const SESSION_COOKIE = "jf_session";

/**
 * 1. Gives every browser a long-lived device id (one free scan per device).
 * 2. Optimistic redirect to login for private pages. Real authorization
 *    happens on the server for every page and API call.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPrivate = pathname.startsWith("/app") || pathname.startsWith("/account");

  let response: NextResponse;
  if (isPrivate && !request.cookies.get(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    response = NextResponse.redirect(url);
  } else {
    response = NextResponse.next();
  }

  if (!request.cookies.get(DEVICE_COOKIE)) {
    response.cookies.set(DEVICE_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 2,
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|img/|icon.svg|robots.txt|sitemap.xml).*)"],
};
