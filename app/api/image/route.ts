import { NextRequest, NextResponse } from "next/server";
import { generateImage, hasGeminiKey } from "@/lib/gemini";
import type { ImageRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const makePlaceholder = (label: string) => {
  const safe = label.replace(/[<>&]/g, "").slice(0, 60);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><rect width="800" height="800" fill="#15161a"/><g fill="#c8ff3e" opacity="0.8"><circle cx="400" cy="320" r="6"/><circle cx="380" cy="340" r="4"/><circle cx="420" cy="340" r="4"/></g><text x="400" y="430" text-anchor="middle" font-family="serif" font-style="italic" font-size="48" fill="#f4f0e6">mock visual</text><text x="400" y="470" text-anchor="middle" font-family="monospace" font-size="14" fill="#6b6b73">add GEMINI_API_KEY to generate</text><text x="400" y="540" text-anchor="middle" font-family="monospace" font-size="12" fill="#c8ff3e">${safe}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ImageRequest;
  const mocked = !hasGeminiKey();

  if (mocked) {
    return NextResponse.json({
      mocked,
      dataUrl: makePlaceholder(body.prompt),
    });
  }

  try {
    const result = await generateImage(body.prompt, body.inputImages);
    if (!result) {
      return NextResponse.json({
        mocked: false,
        dataUrl: makePlaceholder(body.prompt),
        warning: "no image returned",
      });
    }
    return NextResponse.json({ mocked: false, dataUrl: result.dataUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json(
      { error: message, dataUrl: makePlaceholder(body.prompt) },
      { status: 200 }
    );
  }
}
