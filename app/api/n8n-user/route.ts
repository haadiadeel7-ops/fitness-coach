import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const N8N_URL = process.env.N8N_USER_WEBHOOK!;

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const res = await fetch(N8N_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "get", email: session.user.email }),
    cache: "no-store",
  });
  return NextResponse.json(await res.json());
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const res = await fetch(N8N_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "save", email: session.user.email, ...body }),
  });
  return NextResponse.json(await res.json());
}
