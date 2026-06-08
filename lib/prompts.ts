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
  ],
  "mockupDescriptions": [
    "one short case-study sentence (max 22 words) describing the hero product application and why it works for this brand",
    "same for the social post surface",
    "same for the print poster",
    "same for the OOH billboard",
    "same for the brand collateral",
    "same for the photography direction",
    "same for the editorial digital banner",
    "same for the brand environment"
  ]
}

Provide exactly 3 palettes, 3 typography pairings, 3 concept thumbnail prompts (one per palette), 8 mockup prompts, and 8 mockupDescriptions (one short case-study line per mockup, same index order). The mockupDescriptions are written in ${languageName(b.outputLanguage)} and read like the explanatory copy in a design case study ("Hero application pairs the mark with…"). Use only real, currently available Google Fonts for typography. Make image prompts photographic, specific, and on-brief — include lighting, framing, surface, and the brand name where natural. The conceptThumbnailPrompts should each represent the matching palette's mood visually.
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
  "channelPlans": {
    "instagram": {
      "location": "where this lives, specific (e.g. in-feed on the brand's IG)",
      "context": "the thematic angle for this channel",
      "rationale": "one or two sentences on why this placement carries the message",
      "hook": "a short contextual question or worry the audience has (under 9 words)",
      "executions": [
        "photographic prompt for a primary execution on this channel — specific scene, lighting, subject, on-message; the campaign idea made real",
        "an alternate execution prompt for the same channel (different scene/angle)"
      ]
    },
    "tiktok": { "location": "", "context": "", "rationale": "", "hook": "", "executions": [] },
    "youtube": { "location": "", "context": "", "rationale": "", "hook": "", "executions": [] },
    "ooh": { "location": "", "context": "", "rationale": "", "hook": "", "executions": [] },
    "print": { "location": "", "context": "", "rationale": "", "hook": "", "executions": [] },
    "web": { "location": "", "context": "", "rationale": "", "hook": "", "executions": [] },
    "email": { "location": "", "context": "", "rationale": "", "hook": "", "executions": [] },
    "radio": { "location": "", "context": "", "rationale": "", "hook": "", "executions": [] }
  }
}

Provide exactly 3 palettes, 3 typography pairings, and 3 concept thumbnail prompts. Fill channelIdeas AND channelPlans ONLY for the channels in the selected channels list above; for every other channel return empty strings and an empty executions array. For each SELECTED channel, write 2 distinct execution prompts (photographic, specific, on-message, referencing the campaign idea visually), plus its location, context, rationale, and a contextual hook question. For non-visual channels (radio, email) the executions may be empty — location/context/rationale/hook still matter. All copy (location, context, rationale, hook, headlines, channelIdeas) in ${languageName(c.outputLanguage)}; keep font names in English.
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

/**
 * Prompt for the campaign's OWN title logo — a generated wordmark/lockup for
 * the campaign name itself, distinct from the parent brand logo. Used in the
 * campaign bento hero and on the playbook cover.
 */
export const campaignLogoImagePrompt = (c: CampaignInput) =>
  `Studio-quality vector-style campaign title logo / wordmark for the campaign named "${
    c.campaignName || c.brandName
  }". A custom-set typographic lockup of the campaign name — expressive, modern, memorable, suitable as the campaign's signature mark. ${
    c.campaignPurpose ? `Campaign purpose: ${c.campaignPurpose}. ` : ""
  }Evocative of: ${
    c.toneKeywords.join(", ") || "bold, contemporary"
  }. Clean, flat, high-contrast, centered, on a plain white or transparent-looking background. No photographic elements, no mascot, no busy background — just the campaign wordmark as a crisp logo.`;
