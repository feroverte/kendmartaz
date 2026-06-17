import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET(req) {
  const token = req.cookies.get("kendmart_user_token")?.value;
  if (!token) return NextResponse.json({ user: null });

  try {
    const res = await fetch(`${BACKEND_URL}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ user: data.user });
    }
    return NextResponse.json({ user: null });
  } catch {
    return NextResponse.json({ user: null });
  }
}