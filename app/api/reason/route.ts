import { NextRequest, NextResponse } from "next/server";
import { generateText, extractJson, hasGeminiKey } from "@/lib/gemini";
import {
  brandSuggestionsPrompt,
  brandPersonaPrompt,
  brandPalettesRefinePrompt,
  brandTypographyRefinePrompt,
  campaignSuggestionsPrompt,
  campaignPersonaPrompt,
  campaignPalettesRefinePrompt,
  campaignTypographyRefinePrompt,
} from "@/lib/prompts";
import {
  mockBrandSuggestions,
  mockBrandPersona,
  mockBrandPalettes,
  mockBrandTypography,
  mockCampaignSuggestions,
  mockCampaignPersona,
  mockCampaignPalettes,
  mockCampaignTypography,
} from "@/lib/mocks";
import type { ReasonRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ReasonRequest;
  const mocked = !hasGeminiKey();

  try {
    if (body.kind === "brand-suggestions") {
      if (mocked) {
        return NextResponse.json({
          mocked,
          data: mockBrandSuggestions(body.input),
        });
      }
      const raw = await generateText(brandSuggestionsPrompt(body.input));
      const data = extractJson<object>(raw) ?? mockBrandSuggestions(body.input);
      return NextResponse.json({ mocked, data });
    }

    if (body.kind === "brand-persona") {
      if (mocked) {
        return NextResponse.json({
          mocked,
          data: mockBrandPersona(body.input),
        });
      }
      const raw = await generateText(
        brandPersonaPrompt(body.input, body.palette)
      );
      const data = extractJson<object>(raw) ?? mockBrandPersona(body.input);
      return NextResponse.json({ mocked, data });
    }

    if (body.kind === "brand-palettes") {
      if (mocked) {
        return NextResponse.json({
          mocked,
          data: mockBrandPalettes(body.input, body.note),
        });
      }
      const raw = await generateText(
        brandPalettesRefinePrompt(body.input, body.note)
      );
      const data =
        extractJson<object>(raw) ?? mockBrandPalettes(body.input, body.note);
      return NextResponse.json({ mocked, data });
    }

    if (body.kind === "brand-typography") {
      if (mocked) {
        return NextResponse.json({
          mocked,
          data: mockBrandTypography(body.input, body.note),
        });
      }
      const raw = await generateText(
        brandTypographyRefinePrompt(body.input, body.note)
      );
      const data =
        extractJson<object>(raw) ?? mockBrandTypography(body.input, body.note);
      return NextResponse.json({ mocked, data });
    }

    if (body.kind === "campaign-suggestions") {
      if (mocked) {
        return NextResponse.json({
          mocked,
          data: mockCampaignSuggestions(body.input),
        });
      }
      const raw = await generateText(campaignSuggestionsPrompt(body.input));
      const data =
        extractJson<object>(raw) ?? mockCampaignSuggestions(body.input);
      return NextResponse.json({ mocked, data });
    }

    if (body.kind === "campaign-persona") {
      if (mocked) {
        return NextResponse.json({
          mocked,
          data: mockCampaignPersona(body.input),
        });
      }
      const raw = await generateText(
        campaignPersonaPrompt(body.input, body.palette)
      );
      const data =
        extractJson<object>(raw) ?? mockCampaignPersona(body.input);
      return NextResponse.json({ mocked, data });
    }

    if (body.kind === "campaign-palettes") {
      if (mocked) {
        return NextResponse.json({
          mocked,
          data: mockCampaignPalettes(body.input, body.note),
        });
      }
      const raw = await generateText(
        campaignPalettesRefinePrompt(body.input, body.note)
      );
      const data =
        extractJson<object>(raw) ??
        mockCampaignPalettes(body.input, body.note);
      return NextResponse.json({ mocked, data });
    }

    if (body.kind === "campaign-typography") {
      if (mocked) {
        return NextResponse.json({
          mocked,
          data: mockCampaignTypography(body.input, body.note),
        });
      }
      const raw = await generateText(
        campaignTypographyRefinePrompt(body.input, body.note)
      );
      const data =
        extractJson<object>(raw) ??
        mockCampaignTypography(body.input, body.note);
      return NextResponse.json({ mocked, data });
    }

    return NextResponse.json({ error: "unknown kind" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
