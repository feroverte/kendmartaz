import { NextResponse } from "next/server";

const ADMIN_PATH = process.env.ADMIN_PATH || "kendmart-admin";

export function middleware(request) {
  const url = request.nextUrl;
  const isRewrite = url.searchParams.has("__admin");

  if (url.pathname.startsWith(`/${ADMIN_PATH}`) && !isRewrite) {
    const subPath = url.pathname.replace(`/${ADMIN_PATH}`, "") || "/";
    const newUrl = url.clone();
    newUrl.pathname = `/admin${subPath}`;
    newUrl.searchParams.set("__admin", "1");
    return NextResponse.rewrite(newUrl);
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
