import type {
  BrandInput,
  CampaignInput,
  ColorPalette,
  LanguageCode,
} from "./types";
import { archetypeByKey } from "./archetypes";
import { languageName } from "./languages";

const archetypeBlock = (keys: BrandInput["archetypes"]) =>
  keys
    .map((k) => {
      const a = archetypeByKey(k);
      return `- ${a.name} — desire: ${a.desire}. Voice: ${a.voice}.`;
    })
    .join("\n");

const langClause = (lang: LanguageCode) =>
  `Write all creative copy (taglines, headlines, story, persona description, traits, CTA, channel ideas, pattern idea) in ${languageName(
    lang
  )}. Keep JSON keys and font names in English.`;

export const brandSuggestionsPrompt = (b: BrandInput) => `
You are a senior brand strategist. Given the inputs below, propose three distinct creative directions for the brand. Each direction is a coherent set: a color palette, a font pairing, a tagline, a one-paragraph brand story, and a pattern idea.

Business name: ${b.businessName}
Industry: ${b.industry}
Description: ${b.description}
Target audience: ${b.targetAudience}
Mission: ${b.mission}
Archetypes:
${archetypeBlock(b.archetypes)}
Tone keywords: ${b.toneKeywords.join(", ")}

${langClause(b.outputLanguage)}

Return JSON only, no commentary:
{
  "palettes": [
    { "name": "string (max 3 words, in ${languageName(b.outputLanguage)})", "hexes": ["#RRGGBB", "#RRGGBB", "#RRGGBB", "#RRGGBB"], "rationale": "one sentence" }
  ],
  "typography": [
    { "display": "Font Name", "body": "Font Name", "rationale": "one sentence" }
  ],
  "taglines": ["three to five words", "three to five words", "three to five words"],
  "story": "120-180 word brand origin/story written in the chosen voice.",
  "patternIdea": "one sentence describing a signature pattern or texture for this brand.",
  "conceptThumbnailPrompts": [
    "one concise photographic prompt for a representative visual of palette 1 — a single hero composition that captures the mood. Reference the brand name where natural.",
    "same for palette 2",
    "same for palette 3"
  ],
  "mockupPrompts": [
    "HERO PRODUCT APPLICATION (9:16 vertical, dramatic editorial). The signature image — show the brand's most defining product, packaging, or experience as a cinematic hero composition. Editorial lighting, strong subject framing, brand name visible naturally on packaging or surface. Premium magazine-cover feel.",
    "SOCIAL POST (1:1 square). A real-feeling, on-brand Instagram-style still showing the brand in a contemporary lifestyle moment. Specific scene, specific human subject if appropriate, brand name visible somewhere natural. Should look like it belongs in an editorial feed.",
    "PRINT POSTER (2:3 portrait). An editorial poster as if pinned to a gallery wall — strong typographic-photographic composition that could be the brand's announcement poster. Brand wordmark integrated as part of the layout, not pasted on top.",
    "OOH BILLBOARD (16:9 horizontal). The brand applied to a real out-of-home surface — billboard, transit ad, building wrap, or large-format installation — photographed in situ from a pedestrian or driving angle. Show environmental context: street, sky, surrounding city.",
    "BRAND COLLATERAL (4:3 horizontal). Tactile printed materials — business cards, stationery, packaging, swing tags, branded merch — arranged on a styled surface with intentional lighting and overhead or three-quarter angle. Show the brand mark/wordmark clearly across pieces.",
    "PHOTOGRAPHY DIRECTION (1:1 square). A single hero photograph that defines the brand's photographic style — subject, color treatment, depth, mood. Editorial, not stock. No text overlays. The image should answer 'how does this brand see the world?'",
    "EDITORIAL DIGITAL BANNER (16:9 horizontal). A wide marquee banner as it would appear at the top of the brand's website or in a sponsored magazine spread — strong central subject with editorial typography composition, brand wordmark prominent, dramatic lighting. Cinematic wide composition.",
    "BRAND ENVIRONMENT (1:1 square). The brand brought to life in a physical space — retail interior, branded storefront, exhibition booth, signage, or hero product display in context. Architectural feel, attention to materials and ambient lighting, brand identity visible across multiple surfaces."
  ]
}

Provide exactly 3 palettes, 3 typography pairings, 3 concept thumbnail prompts (one per palette), and 8 mockup prompts (one for each labeled surface, in the order shown). Use only real, currently available Google Fonts for typography. Make image prompts photographic, specific, and on-brief — include lighting, framing, surface, and the brand name where natural. The conceptThumbnailPrompts should each represent the matching palette's mood visually.
`.trim();

export const brandPersonaPrompt = (b: BrandInput, p: ColorPalette) => `
You are a brand strategist. Compose the brand persona for the brand below, expressed as a single archetypal character — not a buyer persona.

Business: ${b.businessName} (${b.industry})
Description: ${b.description}
Audience: ${b.targetAudience}
Mission: ${b.mission}
Archetypes: ${b.archetypes.join(" + ")}
Tone: ${b.toneKeywords.join(", ")}
Visual direction: ${p.name} — ${p.rationale}

${langClause(b.outputLanguage)}

Return JSON only:
{
  "name": "evocative two-to-four word character name",
  "description": "60-90 word vivid character portrait in present tense",
  "traits": ["five short trait words or phrases"]
}
`.trim();

/**
 * Refinement prompt — regenerate ONLY the three brand creative directions
 * (palettes + concept thumbnail prompts), based on the user's free-form note.
 */
export const brandPalettesRefinePrompt = (b: BrandInput, note?: string) => `
You are a senior brand strategist. Propose three FRESH alternative creative directions for the brand below — visually distinct from each other and from any directions previously seen. Each direction is a coherent pairing of a color palette and a concept thumbnail prompt.

Business name: ${b.businessName}
Industry: ${b.industry}
Description: ${b.description}
Target audience: ${b.targetAudience}
Mission: ${b.mission}
Archetypes:
${archetypeBlock(b.archetypes)}
Tone keywords: ${b.toneKeywords.join(", ")}
${
  note
    ? `\nUSER REFINEMENT NOTE (this is the most important signal — let it steer your choices, even if it conflicts with the tone keywords above):\n"""\n${note}\n"""\n`
    : ""
}
${langClause(b.outputLanguage)}

Return JSON only, no commentary:
{
  "palettes": [
    { "name": "string (max 3 words, in ${languageName(b.outputLanguage)})", "hexes": ["#RRGGBB","#RRGGBB","#RRGGBB","#RRGGBB"], "rationale": "one sentence — explain how this direction reflects the user's note." }
  ],
  "conceptThumbnailPrompts": [
    "one concise photographic prompt for palette 1 — a hero composition that captures the mood and reflects the user's note.",
    "same for palette 2",
    "same for palette 3"
  ]
}

Provide exactly 3 palettes and 3 concept thumbnail prompts (one per palette, matching index order). Photographic prompts only — include lighting, framing, surface, and reference the brand name visually where natural.
`.trim();

/**
 * Refinement prompt — regenerate ONLY the three brand typography pairings.
 */
export const brandTypographyRefinePrompt = (b: BrandInput, note?: string) => `
You are a senior typographer. Propose three FRESH alternative typography pairings (display + body) for the brand below — distinct from each other and from any pairings previously seen.

Business name: ${b.businessName}
Industry: ${b.industry}
Description: ${b.description}
Archetypes:
${archetypeBlock(b.archetypes)}
Tone keywords: ${b.toneKeywords.join(", ")}
${
  note
    ? `\nUSER REFINEMENT NOTE (this is the most important signal — let it steer your choices):\n"""\n${note}\n"""\n`
    : ""
}

Return JSON only, no commentary:
{
  "typography": [
    { "display": "Font Name", "body": "Font Name", "rationale": "one sentence — explain how this pairing reflects the brand and the user's note." }
  ]
}

Provide exactly 3 typography pairings. Use only real, currently-available Google Fonts. Keep all font names in English regardless of brand language.
`.trim();

export const campaignSuggestionsPrompt = (c: CampaignInput) => `
You are a senior campaign creative director. Given the campaign brief below, propose three creative directions.

Brand: ${c.brandName}
Brand description: ${c.brandDescription}
Campaign: ${c.campaignName}
Purpose: ${c.campaignPurpose}
Story / message: ${c.campaignStory}
Target market: ${c.targetMarket}
Archetypes:
${archetypeBlock(c.archetypes)}
Tone keywords: ${c.toneKeywords.join(", ")}
Channels: ${c.channels.join(", ")}

${langClause(c.outputLanguage)}

Return JSON only:
{
  "palettes": [
    { "name": "string", "hexes": ["#RRGGBB","#RRGGBB","#RRGGBB","#RRGGBB"], "rationale": "one sentence" }
  ],
  "typography": [
    { "display": "Font Name", "body": "Font Name", "rationale": "one sentence" }
  ],
  "headlines": ["five strong campaign headlines, each under 8 words"],
  "cta": "the campaign call-to-action, under 5 words",
  "channelIdeas": {
    "instagram": "one-sentence idea (or empty if not in channels)",
    "tiktok": "one-sentence idea",
    "youtube": "one-sentence idea",
    "ooh": "one-sentence idea",
    "print": "one-sentence idea",
    "email": "one-sentence idea",
    "web": "one-sentence idea",
    "radio": "one-sentence idea"
  },
  "conceptThumbnailPrompts": [
    "one concise photographic prompt for palette 1's campaign hero feel",
    "same for palette 2",
    "same for palette 3"
  ],
  "mockupPrompts": [
    "HERO CAMPAIGN VISUAL (9:16 vertical, cinematic). The defining campaign image — what would be the lead asset in a launch announcement. Editorial lighting, on-message, brand name visible if it fits naturally on a surface. Magazine cover feel.",
    "SOCIAL POST (1:1 square). A real-feeling on-brand Instagram-style still that lives in a feed. Specific scene from the campaign, lifestyle subject, brand name visible somewhere natural. Should belong on a curated editorial account.",
    "STORY / REEL FRAME (9:16 vertical). A vertical video poster-frame as it would appear in Instagram Stories or TikTok — single bold composition designed for thumb-stop, brand mark layered into the composition. Strong central subject.",
    "CAMPAIGN POSTER (2:3 portrait). An editorial campaign poster as if wheat-pasted to an urban wall or pinned in a gallery — typographic + photographic composition with the campaign headline integrated visually. Print-feel, slight texture.",
    "PHOTO MOODBOARD (1:1 square). A single hero photograph that defines this campaign's visual style — the color, the energy, the type of human moment it captures. Editorial, not stock. No text overlays.",
    "OOH BILLBOARD (16:9 horizontal). The campaign applied to a real-world out-of-home surface — billboard, transit, kiosk, projection — photographed in situ at street level with environmental context (city, sky, passers-by).",
    "DIGITAL BANNER (16:9 horizontal). A wide marquee banner as it would appear at the top of a website, in-app sponsored placement, or magazine digital spread — strong central subject with the campaign headline composed editorially, brand wordmark prominent. Cinematic wide composition.",
    "CAMPAIGN ACTIVATION (1:1 square). The campaign brought to life in a physical experience — pop-up activation, branded installation, event stage, immersive moment. Architectural feel, attention to materials and ambient lighting, campaign identity visible across the space."
  ]
}

Provide exactly 3 palettes, 3 typography pairings, 3 concept thumbnail prompts, and 8 mockup prompts (one for each labeled surface, in the order shown). Only fill channelIdeas keys that are in the selected channels list above; for others, return an empty string. Photographic prompts only — include lighting, framing, subject, and reference the campaign message visually.
`.trim();

export const campaignPersonaPrompt = (c: CampaignInput, p: ColorPalette) => `
You are a brand strategist. Compose the campaign persona — the single character voice this campaign will speak as.

Brand: ${c.brandName}
Campaign: ${c.campaignName}
Purpose: ${c.campaignPurpose}
Story: ${c.campaignStory}
Target market: ${c.targetMarket}
Archetypes: ${c.archetypes.join(" + ")}
Tone: ${c.toneKeywords.join(", ")}
Visual direction: ${p.name} — ${p.rationale}

${langClause(c.outputLanguage)}

Return JSON only:
{
  "name": "two-to-four word character name",
  "description": "60-90 word character portrait, present tense, in the campaign's voice",
  "traits": ["five short trait words or phrases"]
}
`.trim();

/**
 * Refinement prompt — regenerate ONLY the three campaign creative directions.
 */
export const campaignPalettesRefinePrompt = (
  c: CampaignInput,
  note?: string
) => `
You are a senior campaign creative director. Propose three FRESH alternative creative directions for the campaign below — visually distinct from each other and from any directions previously seen. Each direction is a coherent pairing of a color palette and a concept thumbnail prompt.

Brand: ${c.brandName}
Brand description: ${c.brandDescription}
Campaign: ${c.campaignName}
Purpose: ${c.campaignPurpose}
Story / message: ${c.campaignStory}
Target market: ${c.targetMarket}
Archetypes:
${archetypeBlock(c.archetypes)}
Tone keywords: ${c.toneKeywords.join(", ")}
${
  note
    ? `\nUSER REFINEMENT NOTE (this is the most important signal — let it steer your choices, even if it conflicts with the tone keywords above):\n"""\n${note}\n"""\n`
    : ""
}
${langClause(c.outputLanguage)}

Return JSON only, no commentary:
{
  "palettes": [
    { "name": "string (max 3 words, in ${languageName(c.outputLanguage)})", "hexes": ["#RRGGBB","#RRGGBB","#RRGGBB","#RRGGBB"], "rationale": "one sentence — explain how this direction reflects the campaign and the user's note." }
  ],
  "conceptThumbnailPrompts": [
    "one concise photographic prompt for palette 1 — a campaign hero composition that captures the mood and reflects the user's note.",
    "same for palette 2",
    "same for palette 3"
  ]
}

Provide exactly 3 palettes and 3 concept thumbnail prompts (one per palette, matching index order). Photographic prompts only — include lighting, framing, subject, and reference the campaign message visually.
`.trim();

/**
 * Refinement prompt — regenerate ONLY the three campaign typography pairings.
 */
export const campaignTypographyRefinePrompt = (
  c: CampaignInput,
  note?: string
) => `
You are a senior typographer. Propose three FRESH alternative typography pairings (display + body) for the campaign below — distinct from each other and from any pairings previously seen.

Brand: ${c.brandName}
Campaign: ${c.campaignName}
Purpose: ${c.campaignPurpose}
Archetypes:
${archetypeBlock(c.archetypes)}
Tone keywords: ${c.toneKeywords.join(", ")}
${
  note
    ? `\nUSER REFINEMENT NOTE (this is the most important signal — let it steer your choices):\n"""\n${note}\n"""\n`
    : ""
}

Return JSON only, no commentary:
{
  "typography": [
    { "display": "Font Name", "body": "Font Name", "rationale": "one sentence — explain how this pairing reflects the campaign and the user's note." }
  ]
}

Provide exactly 3 typography pairings. Use only real, currently-available Google Fonts. Keep all font names in English regardless of campaign language.
`.trim();

export const logoImagePrompt = (b: BrandInput) => {
  const styleHint = {
    wordmark: "wordmark — a custom-set typographic logo using the brand name. No icon.",
    symbol: "a single distinctive geometric symbol or mark, no text.",
    combination: "a combination mark: a small distinctive symbol next to the wordmark.",
    mascot: "a stylized mascot illustration paired with the brand name.",
  }[b.logoStyle];

  return `Studio-quality vector-style brand logo for "${b.businessName}". ${styleHint} ${b.logoPrompt}. Clean, modern, flat, on a plain white or transparent-looking background, centered, suitable for use as a brand identity. High contrast, premium feel, evocative of: ${b.toneKeywords.join(", ")}.`;
};

/** Prompt for compositing brand logo onto a mockup scene */
export const logoCompositePrompt = (basePrompt: string, brandName: string) =>
  `${basePrompt}\n\nIMPORTANT: Take the brand logo from the provided image and integrate it naturally into the scene as the visible brand identity for "${brandName}" — apply it to the relevant product surface, packaging, signage, or apparel in a way that feels real and physically consistent with the lighting and perspective. Do not redraw the logo; preserve its proportions and style.`;
