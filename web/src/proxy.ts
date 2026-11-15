import { NextResponse, type NextRequest } from "next/server";

const DEVICE_COOKIE = "jf_did";
const SESSION_COOKIE = "jf_session";

/** Constant-time string comparison (avoids leaking the password via timing). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** When PREVIEW_PASSWORD is set, the whole site sits behind HTTP Basic auth. */
function previewGate(request: NextRequest): NextResponse | null {
  const password = process.env.PREVIEW_PASSWORD;
  if (!password) return null;
  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const supplied = decoded.slice(decoded.indexOf(":") + 1);
      if (safeEqual(supplied, password)) return null;
    } catch {
      /* malformed header: fall through to the challenge */
    }
  }
  return new NextResponse("Private preview", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="JobFit preview", charset="UTF-8"' },
  });
}

/**
 * 0. Optional password gate for private previews (PREVIEW_PASSWORD).
 * 1. Gives every browser a long-lived device id (one free scan per device).
 * 2. Optimistic redirect to login for private pages. Real authorization
 *    happens on the server for every page and API call.
 */
export function proxy(request: NextRequest) {
  const gate = previewGate(request);
  if (gate) return gate;

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
  // Everything except static build assets. Images, robots and sitemap are
  // included so the preview password hides the whole site.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
