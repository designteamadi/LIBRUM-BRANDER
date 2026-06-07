import "server-only";
import { GoogleGenAI } from "@google/genai";

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";

// Image generation: try Nano Banana 2 first (gemini-3-pro-image-preview),
// then transparently fall back to Nano Banana 1 (gemini-2.5-flash-image)
// if NB2 isn't reachable. NB2 is a preview-tier model and some API keys
// don't yet have access — without this fallback, every image call would
// hard-fail and the UI would fill with "add GEMINI_API_KEY" placeholders.
//
// Override either via env var if Google ships new identifiers.
const IMAGE_MODEL_PRIMARY =
  process.env.GEMINI_IMAGE_MODEL || "gemini-3-pro-image-preview";
const IMAGE_MODEL_FALLBACK =
  process.env.GEMINI_IMAGE_MODEL_FALLBACK || "gemini-2.5-flash-image";

export const hasGeminiKey = () => Boolean(process.env.GEMINI_API_KEY);

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

export async function generateText(prompt: string): Promise<string> {
  const ai = getClient();
  if (!ai) return "";
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.9,
    },
  });
  return response.text ?? "";
}

type ImagePart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

/** Parse a data URL into { mimeType, base64 }. */
function dataUrlToInline(
  dataUrl: string
): { mimeType: string; data: string } | null {
  const m = /^data:([^;,]+);base64,(.+)$/.exec(dataUrl);
  if (!m) return null;
  return { mimeType: m[1], data: m[2] };
}

/**
 * Single attempt at one model. Returns the image data URL if the model
 * produced one, null if the response contained no image (e.g. safety
 * block), and throws on transport / 404 / quota errors so the caller
 * can decide whether to fall back.
 */
async function tryGenerate(
  ai: GoogleGenAI,
  model: string,
  parts: ImagePart[]
): Promise<{ dataUrl: string } | null> {
  const response = await ai.models.generateContent({
    model,
    contents: parts,
  });
  const respParts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of respParts) {
    if (part.inlineData?.data) {
      const mime = part.inlineData.mimeType || "image/png";
      return { dataUrl: `data:${mime};base64,${part.inlineData.data}` };
    }
  }
  // The model responded successfully but didn't return an image. Most
  // common cause: safety filter blocked the prompt or image. Log enough
  // for diagnosis but don't throw — the fallback model is unlikely to
  // help with a safety block.
  const finishReason = response.candidates?.[0]?.finishReason;
  const blockReason = (response as { promptFeedback?: { blockReason?: string } })
    ?.promptFeedback?.blockReason;
  if (finishReason || blockReason) {
    console.warn(
      `[image] ${model} returned no image · finishReason=${finishReason ?? "—"} · blockReason=${blockReason ?? "—"}`
    );
  }
  return null;
}

export async function generateImage(
  prompt: string,
  inputImages?: string[]
): Promise<{ dataUrl: string } | null> {
  const ai = getClient();
  if (!ai) return null;

  const parts: ImagePart[] = [{ text: prompt }];
  if (inputImages && inputImages.length > 0) {
    for (const img of inputImages) {
      const inline = dataUrlToInline(img);
      if (inline) parts.push({ inlineData: inline });
    }
  }

  // --- Attempt 1: Nano Banana 2 ---
  try {
    const result = await tryGenerate(ai, IMAGE_MODEL_PRIMARY, parts);
    if (result) return result;
    // tryGenerate returned null (safety block, etc.) — don't fall back,
    // the issue is the prompt content, not the model.
    return null;
  } catch (err) {
    // Network / 404 / quota / auth error — log full message and try
    // the fallback model.
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      `[image] primary "${IMAGE_MODEL_PRIMARY}" failed → falling back. error: ${msg}`
    );
  }

  // --- Attempt 2: Nano Banana 1 ---
  if (
    IMAGE_MODEL_FALLBACK &&
    IMAGE_MODEL_FALLBACK !== IMAGE_MODEL_PRIMARY
  ) {
    try {
      const result = await tryGenerate(ai, IMAGE_MODEL_FALLBACK, parts);
      if (result) return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(
        `[image] fallback "${IMAGE_MODEL_FALLBACK}" also failed. error: ${msg}`
      );
    }
  }

  return null;
}

/** Tolerant JSON extraction — strips fences if a model adds them. */
export function extractJson<T>(text: string): T | null {
  if (!text) return null;
  let s = text.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  }
  const firstBrace = s.indexOf("{");
  const lastBrace = s.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) return null;
  try {
    return JSON.parse(s.slice(firstBrace, lastBrace + 1)) as T;
  } catch {
    return null;
  }
}
