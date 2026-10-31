import { NextResponse, type NextRequest } from "next/server";

const COOKIE = "lasan_admin";

/** Reads the JWT expiry without verifying the signature; the API verifies every request. */
function isFresh(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.role === "admin" && typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(COOKIE)?.value;
  const signedIn = !!token && isFresh(token);
  const onLogin = pathname === "/login";

  if (!signedIn && !onLogin) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname + search);
    const res = NextResponse.redirect(url);
    if (token) res.cookies.delete(COOKIE);
    return res;
  }
  if (onLogin && request.nextUrl.searchParams.has("expired")) {
    // The API rejected the token (expired or revoked): clear it so the admin can sign in again.
    const res = NextResponse.next();
    res.cookies.delete(COOKIE);
    return res;
  }
  if (signedIn && onLogin) return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico|jpg|webp)$).*)"],
};
