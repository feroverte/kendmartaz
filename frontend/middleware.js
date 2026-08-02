import { NextResponse } from "next/server";

const ADMIN_PATH = process.env.ADMIN_PATH || "kendmart-admin";
const GATE_COOKIE = "kendmart_admin_gate";

export function middleware(request) {
  const url = request.nextUrl;
  const isRewrite = url.searchParams.has("__admin");

  if (url.pathname.startsWith(`/${ADMIN_PATH}`) && !isRewrite) {
    const subPath = url.pathname.replace(`/${ADMIN_PATH}`, "") || "/";
    const newUrl = url.clone();
    newUrl.pathname = `/admin${subPath}`;
    newUrl.searchParams.set("__admin", "1");
    const response = NextResponse.rewrite(newUrl);

    // Access-key gate: only set the short-lived gate cookie when the URL
    // contains the correct key. Otherwise clear it so login stays locked.
    const providedKey = newUrl.searchParams.get("key");
    if (providedKey && process.env.ADMIN_ACCESS_KEY && providedKey === process.env.ADMIN_ACCESS_KEY) {
      response.cookies.set(GATE_COOKIE, providedKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60,
        path: "/"
      });
    } else {
      response.cookies.delete(GATE_COOKIE);
    }
    return response;
  }

  if ((url.pathname === "/admin" || url.pathname.startsWith("/admin/")) && !isRewrite) {
    const subPath = url.pathname.replace("/admin", "") || "";
    const newUrl = url.clone();
    newUrl.pathname = `/${ADMIN_PATH}${subPath}`;
    newUrl.searchParams.delete("__admin");
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}
