import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const prompt = req.nextUrl.searchParams.get("prompt");
  if (!prompt) {
    return NextResponse.json({ error: "No prompt" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-2",
        prompt: prompt + ", fitness, clean background, professional",
        n: 1,
        size: "512x512",
      }),
    });

    const data = await res.json();
    const url = data.data?.[0]?.url;
    if (!url) {
      console.error("DALL-E error:", data);
      return NextResponse.json({ error: "Generation failed" }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Image generation error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
