import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const res = await fetch(process.env.N8N_USER_WEBHOOK!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Store plain text password alongside hash so admin can view it
      body: JSON.stringify({ action: "register", email, name, password, passwordHash }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: data.success ? 200 : 400 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
