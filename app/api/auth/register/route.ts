import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();
  if (!email || !password || !name) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const res = await fetch(process.env.N8N_USER_WEBHOOK!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "register", email, name, passwordHash }),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: data.success ? 200 : 400 });
}
