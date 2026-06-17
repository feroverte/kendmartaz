import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function POST(req) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/api/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      const response = NextResponse.json({ success: true, user: data.user });
      response.cookies.set("kendmart_user_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/"
      });
      return response;
    }
    return NextResponse.json({ success: false, error: data.error || "Registration failed" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}