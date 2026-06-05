import { NextResponse } from "next/server";
import { hasGeminiKey } from "@/lib/gemini";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    live: hasGeminiKey(),
    text_model: process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash",
    image_model: process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image",
    timestamp: new Date().toISOString(),
  });
}
