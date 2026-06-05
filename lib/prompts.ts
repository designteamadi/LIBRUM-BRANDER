import type {
  BrandInput,
  CampaignInput,
  ColorPalette,
  LanguageCode,
} from "./types";
import { archetypeByKey } from "./archetypes";
import { languageName } from "./languages";
import { AVAILABLE_ICONS } from "./icon-names";

const archetypeBlock = (keys: BrandInput["archetypes"]) =>
  keys
    .map((k) => {
      const a = archetypeByKey(k);
      return `- ${a.name} — desire: ${a.desire}. Voice: ${a.voice}.`;
    })
    .join("\n");

const langClause = (lang: LanguageCode) =>
  `Write all creative copy (taglines, headlines, story, persona description, traits, CTA, channel ideas, pattern idea, essence titles and bodies, moodboard prompts) in ${languageName(
    lang
  )}. Keep JSON keys, font names, icon names, and hex codes in English.`;

const iconListClause = `Choose icon names ONLY from this list (use the exact strings): ${AVAILABLE_ICONS.join(
  ", "
)}.`;

export const brandSuggestionsPrompt = (b: BrandInput) => `
You are a senior brand strategist. Given the inputs below, propose three distinct creative directions for the brand.

Business name: ${b.businessName}
Industry: ${b.industry}
Description: ${b.description}
Target audience: ${b.targetAudience}
Mission: ${b.mission}
Archetypes:
${archetypeBlock(b.archetypes)}
Tone keywords: ${b.toneKeywords.join(", ")}

${langClause(b.outputLanguage)}

${iconListClause}

Return JSON only, no commentary:
{
  "palettes": [
    { "name": "string (max 3 words)", "hexes": ["#RRGGBB","#RRGGBB","#RRGGBB","#RRGGBB"], "rationale": "one sentence" }
  ],
  "typography": [
    { "display": "Font Name", "body": "Font Name", "rationale": "one sentence" }
  ],
  "taglines": ["three to five words","three to five words","three to five words"],
  "story": "120-180 word brand origin/story written in the chosen voice.",
  "patternIdea": "one sentence describing a signature pattern or texture.",
  "essence": [
    { "title": "two-to-four word value statement", "body": "one short sentence", "icon": "icon name from list" }
  ],
  "iconLabels": ["six icon names from the list above, picked to match this brand's domain"],
  "conceptThumbnailPrompts": [
    "concise photographic prompt for palette 1's mood",
    "same for palette 2",
    "same for palette 3"
  ],
  "mockupPrompts": [
    "image prompt for a key product mockup",
    "image prompt for a second contextual mockup",
    "image prompt for a third lifestyle / in-context mockup"
  ],
  "moodboardPrompts": [
    "concise photographic prompt for moodboard tile 1 — atmosphere, materials, light",
    "tile 2",
    "tile 3",
    "tile 4",
    "tile 5",
    "tile 6"
  ]
}

Exactly 3 palettes, 3 typography pairings, 4 essence items, 6 iconLabels, 3 concept thumbnail prompts, 3 mockup prompts, 6 moodboard prompts. Use only real currently-available Google Fonts for typography. Image prompts should be photographic, specific, and on-brief — include lighting, framing, surface, brand name where natural. Moodboard prompts should be evocative micro-scenes (textures, objects, environments) — not portraits of the product.
`.trim();

export const morePalettesBrandPrompt = (
  b: BrandInput,
  existing: ColorPalette[]
) => `
You are a senior brand strategist. The user has seen the following directions for "${b.businessName}" and wants 3 more — distinctly different from these. Avoid repeating any of these palette names or general color moods.

Existing directions:
${existing.map((p) => `- ${p.name}: ${p.hexes.join(", ")} — ${p.rationale}`).join("\n")}

Brand context:
${b.description}
Archetypes: ${b.archetypes.join(" + ")}
Tone: ${b.toneKeywords.join(", ")}

${langClause(b.outputLanguage)}

Return JSON only:
{
  "palettes": [
    { "name": "string", "hexes": ["#RRGGBB","#RRGGBB","#RRGGBB","#RRGGBB"], "rationale": "one sentence" }
  ],
  "conceptThumbnailPrompts": [
    "photographic prompt for palette 1",
    "palette 2",
    "palette 3"
  ]
}

Exactly 3 new palettes. Make them feel different from the existing ones — different temperatures, different energy.
`.trim();

export const brandPersonaPrompt = (b: BrandInput, p: ColorPalette) => `
You are a brand strategist. Compose the brand persona for the brand below as a single archetypal character — not a buyer persona.

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

${iconListClause}

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
  "essence": [
    { "title": "two-to-four word campaign principle", "body": "one short sentence", "icon": "icon name from list" }
  ],
  "iconLabels": ["six icon names from the list above"],
  "conceptThumbnailPrompts": [
    "concise photographic prompt for palette 1",
    "palette 2",
    "palette 3"
  ],
  "mockupPrompts": [
    "image prompt for a hero campaign visual",
    "image prompt for a second key campaign asset",
    "image prompt for an in-context lifestyle moment"
  ],
  "moodboardPrompts": [
    "moodboard tile 1 — atmosphere, materials, light",
    "tile 2","tile 3","tile 4","tile 5","tile 6"
  ]
}

Exactly 3 palettes, 3 typography pairings, 4 essence items, 6 iconLabels, 3 thumbnail prompts, 3 mockup prompts, 6 moodboard prompts. Only fill channelIdeas keys present in the selected channels list above; for others, return an empty string.
`.trim();

export const morePalettesCampaignPrompt = (
  c: CampaignInput,
  existing: ColorPalette[]
) => `
You are a senior campaign creative director. The user has seen the following directions for the campaign "${c.campaignName}" and wants 3 more — distinctly different from these.

Existing directions:
${existing.map((p) => `- ${p.name}: ${p.hexes.join(", ")} — ${p.rationale}`).join("\n")}

Campaign context:
Brand: ${c.brandName} — ${c.brandDescription}
Story: ${c.campaignStory}
Archetypes: ${c.archetypes.join(" + ")}
Tone: ${c.toneKeywords.join(", ")}

${langClause(c.outputLanguage)}

Return JSON only:
{
  "palettes": [
    { "name": "string", "hexes": ["#RRGGBB","#RRGGBB","#RRGGBB","#RRGGBB"], "rationale": "one sentence" }
  ],
  "conceptThumbnailPrompts": [
    "photographic prompt for palette 1",
    "palette 2",
    "palette 3"
  ]
}

Exactly 3 new palettes — distinctly different from the existing ones.
`.trim();

export const campaignPersonaPrompt = (c: CampaignInput, p: ColorPalette) => `
You are a brand strategist. Compose the campaign persona — the single character voice this campaign speaks as.

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
  "description": "60-90 word character portrait, present tense",
  "traits": ["five short trait words or phrases"]
}
`.trim();

export const logoImagePrompt = (b: BrandInput) => {
  const styleHint = {
    wordmark: "wordmark — a custom-set typographic logo using the brand name. No icon.",
    symbol: "a single distinctive geometric symbol or mark, no text.",
    combination: "a combination mark: a small distinctive symbol next to the wordmark.",
    mascot: "a stylized mascot illustration paired with the brand name.",
  }[b.logoStyle];

  return `Studio-quality vector-style brand logo for "${b.businessName}". ${styleHint} ${b.logoPrompt}. Clean, modern, flat, on a plain white background, centered. High contrast, premium feel, evocative of: ${b.toneKeywords.join(", ")}.`;
};

export const logoCompositePrompt = (basePrompt: string, brandName: string) =>
  `${basePrompt}\n\nIMPORTANT: Take the brand logo from the provided image and integrate it naturally into the scene as the visible brand identity for "${brandName}" — apply it to the relevant product surface, packaging, signage, or apparel in a way that feels real and physically consistent with the lighting and perspective. Do not redraw the logo; preserve its proportions and style.`;
