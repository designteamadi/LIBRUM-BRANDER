import "server-only";
import { GoogleGenAI } from "@google/genai";

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

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

type ImagePart = { text: string } | {
  inlineData: { mimeType: string; data: string };
};

/** Parse a data URL into { mimeType, base64 } */
function dataUrlToInline(dataUrl: string): { mimeType: string; data: string } | null {
  const m = /^data:([^;,]+);base64,(.+)$/.exec(dataUrl);
  if (!m) return null;
  return { mimeType: m[1], data: m[2] };
}

export async function generateImage(
  prompt: string,
  inputImages?: string[]
): Promise<{ dataUrl: string } | null> {
  const ai = getClient();
  if (!ai) return null;
  try {
    const parts: ImagePart[] = [{ text: prompt }];
    if (inputImages && inputImages.length > 0) {
      for (const img of inputImages) {
        const inline = dataUrlToInline(img);
        if (inline) parts.push({ inlineData: inline });
      }
    }

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: parts,
    });

    const respParts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of respParts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || "image/png";
        return { dataUrl: `data:${mime};base64,${part.inlineData.data}` };
      }
    }
    return null;
  } catch (err) {
    console.error("[image] generation failed", err);
    return null;
  }
}

// Tolerant JSON extraction — strips fences if a model adds them
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
