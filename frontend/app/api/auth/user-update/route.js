import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function PUT(req) {
  const token = req.cookies.get("kendmart_user_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const { name, phone } = await req.json();
    const res = await fetch(`${BACKEND_URL}/api/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, phone }),
    });

    const data = await res.json();
    if (res.ok) return NextResponse.json(data);
    return NextResponse.json({ error: data.error || "Update failed" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}