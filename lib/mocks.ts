import type {
  BrandInput,
  CampaignInput,
  ColorPalette,
  TypePairing,
} from "./types";

const PALETTES: ColorPalette[] = [
  {
    name: "Noir Spark",
    hexes: ["#0a0a0a", "#c8ff3e", "#f5f0e8", "#ff3e8e"],
    rationale: "Deep noir base lets an electric accent carry every moment.",
  },
  {
    name: "Dust & Ember",
    hexes: ["#1a1410", "#ff6b35", "#e8dcc4", "#3a2618"],
    rationale: "Warm, earthen tones anchored by a confident heat.",
  },
  {
    name: "Pacific Drift",
    hexes: ["#0f2230", "#54d4c3", "#f2eee3", "#ffb84d"],
    rationale: "Cool ocean restraint with a sunlit counterpoint.",
  },
];

const TYPES: TypePairing[] = [
  {
    display: "Instrument Serif",
    body: "Geist",
    rationale: "Editorial serif against a clean modern sans — confident, current.",
  },
  {
    display: "Fraunces",
    body: "Inter Tight",
    rationale: "Characterful variable serif paired with a tight, neutral workhorse.",
  },
  {
    display: "Space Grotesk",
    body: "IBM Plex Sans",
    rationale: "Technical sans display with a humanist body for clarity at scale.",
  },
];

/* ---------- Refinement mock pools (used when no GEMINI_API_KEY) ---------- */

const ALT_PALETTE_SETS: ColorPalette[][] = [
  [
    {
      name: "Bone & Iron",
      hexes: ["#f4f0e6", "#1c1c1e", "#8a8a8a", "#c0392b"],
      rationale: "Editorial restraint with a single arterial accent.",
    },
    {
      name: "Saffron Hush",
      hexes: ["#fff8e7", "#f2a900", "#1a1a1a", "#5e3a1a"],
      rationale: "Warm daylight tones around a confident gold anchor.",
    },
    {
      name: "Glacier Static",
      hexes: ["#e6f0f3", "#7fb8c4", "#0a0f1a", "#ff5a3c"],
      rationale: "Cool clinical surface broken by a single signal hit.",
    },
  ],
  [
    {
      name: "Tannin",
      hexes: ["#2b1810", "#a8714b", "#f0e6d2", "#4a2c20"],
      rationale: "Saturated leather and parchment, hand-set feel.",
    },
    {
      name: "Lab Coat",
      hexes: ["#ffffff", "#0066ff", "#101010", "#cccccc"],
      rationale: "Mid-century laboratory clarity, one bright signal.",
    },
    {
      name: "Wet Garden",
      hexes: ["#0c2018", "#7ab87a", "#f5f5e8", "#c4a843"],
      rationale: "Damp foliage tones with a quiet aged-gold counterpoint.",
    },
  ],
  [
    {
      name: "Velvet Hour",
      hexes: ["#1a0e1d", "#7d3c98", "#e9c0e0", "#ffc857"],
      rationale: "Late-night velvet with a single warm filament.",
    },
    {
      name: "Bauhaus Hi-Vis",
      hexes: ["#fefae0", "#d62828", "#003049", "#f77f00"],
      rationale: "Primary geometry, no apologies, full conviction.",
    },
    {
      name: "Slate Bloom",
      hexes: ["#2c333a", "#d4a373", "#faedcd", "#606c38"],
      rationale: "Slate and ochre softened by an unexpected olive.",
    },
  ],
];

const ALT_TYPE_SETS: TypePairing[][] = [
  [
    {
      display: "Editorial New",
      body: "Söhne",
      rationale: "High-contrast modern serif against a precise neo-grotesque.",
    },
    {
      display: "Migra",
      body: "Manrope",
      rationale: "Sharp editorial display paired with a rounded humanist body.",
    },
    {
      display: "GT Sectra",
      body: "Inter",
      rationale: "Calligraphic warmth with a neutral, ubiquitous body.",
    },
  ],
  [
    {
      display: "PP Editorial Old",
      body: "PP Neue Montreal",
      rationale: "Antique authority next to confident modernism.",
    },
    {
      display: "Söhne Breit",
      body: "Söhne",
      rationale: "Wide-set display sibling against its workhorse counterpart.",
    },
    {
      display: "Reckless",
      body: "Söhne Mono",
      rationale: "Sculpted serif energy with a technical monospaced body.",
    },
  ],
  [
    {
      display: "Cormorant Garamond",
      body: "Plus Jakarta Sans",
      rationale: "Lyrical serif with an approachable contemporary sans.",
    },
    {
      display: "JetBrains Mono",
      body: "Inter",
      rationale: "Technical mono display for an engineered, deliberate feel.",
    },
    {
      display: "Bodoni Moda",
      body: "DM Sans",
      rationale: "Fashion-grade contrast paired with a quiet, modern body.",
    },
  ],
];

/* Deterministic-ish pick that rotates if the same note is sent repeatedly. */
const pickSet = <T>(sets: T[][], note?: string): T[] => {
  if (!sets.length) return [];
  if (!note) return sets[Math.floor(Math.random() * sets.length)];
  // Hash the note into an index so the same refinement returns the same set
  // (within a process), and different notes vary.
  let h = 0;
  for (let i = 0; i < note.length; i++) {
    h = (h * 31 + note.charCodeAt(i)) | 0;
  }
  return sets[Math.abs(h) % sets.length];
};

export const mockBrandSuggestions = (b: BrandInput) => ({
  palettes: PALETTES,
  typography: TYPES,
  taglines: [
    `${b.businessName}. Made plain.`,
    `Built for the long way.`,
    `One ${b.industry || "name"}, no apologies.`,
  ],
  story: `${b.businessName} began with a simple refusal — to make another forgettable ${b.industry || "thing"}. Built for ${b.targetAudience || "people who notice"}, it's the work of people who'd rather get it right than get it fast. The mission is clear: ${b.mission || "make work worth keeping"}. Every detail is a choice. Every choice is a stance. Nothing here is accidental, and nothing here is loud for the sake of being loud. This is craft with a point of view — quietly insistent, openly opinionated, and built to outlast the cycle that produced it.`,
  patternIdea:
    "A tight monoline geometric repeat — peaks or arrows — used as a textural background and as a brand-owned cropping device.",
  conceptThumbnailPrompts: [
    `Cinematic editorial hero composition representing ${b.businessName}, noir base with electric green accent, premium feel.`,
    `Warm earthen lifestyle composition for ${b.businessName}, ember sunset light, lived-in textures.`,
    `Cool minimal product composition for ${b.businessName}, ocean teal and bone with sunlit highlights.`,
  ],
  mockupPrompts: [
    `HERO product mockup for ${b.businessName}, 9:16 vertical, dramatic editorial lighting, the brand's defining product photographed as a cover hero. Brand name visible naturally on packaging.`,
    `SOCIAL post for ${b.businessName}, 1:1 square, in-context lifestyle shot with ${b.targetAudience || "the brand's audience"} using the product, on-brand color palette, natural light.`,
    `POSTER design for ${b.businessName}, 2:3 portrait, bold typographic-photographic composition with brand wordmark integrated, gallery-wall feel.`,
    `OOH billboard for ${b.businessName}, 16:9 horizontal, brand applied to a real urban billboard or transit ad, photographed at pedestrian street level, environmental context.`,
    `BRAND COLLATERAL for ${b.businessName}, 4:3 horizontal, business cards + stationery + packaging styled on a tactile surface, intentional lighting, brand mark visible on each piece.`,
    `PHOTOGRAPHY direction for ${b.businessName}, 1:1 square, a single hero editorial photograph defining the brand's photographic style — color treatment, subject, mood. No text overlays.`,
    `EDITORIAL DIGITAL BANNER for ${b.businessName}, 16:9 horizontal, wide marquee composition as it would appear at the top of the brand's website, strong central subject with editorial typography composition and brand wordmark prominent. Cinematic.`,
    `BRAND ENVIRONMENT for ${b.businessName}, 1:1 square, the brand brought to life in a physical space — retail interior, branded storefront, exhibition booth, or hero product display in context. Architectural feel, materials and ambient lighting deliberate.`,
  ],
});

export const mockBrandPersona = (b: BrandInput) => ({
  name: "The Restless Cartographer",
  description: `Thirty-something. Last to leave the trail, first to skip the resort. Speaks plainly, writes shorter than expected, and would rather show you a place than tell you about it. Believes ${b.businessName} is a vehicle, not a destination — that what matters is the terrain you choose, not the badge you wear. Owns three jackets, all worn through at the cuffs.`,
  traits: ["restless", "plainspoken", "deliberate", "uncompromising", "warm"],
});

/** Mock for the "regenerate palettes" refinement path. */
export const mockBrandPalettes = (b: BrandInput, note?: string) => {
  const palettes = pickSet(ALT_PALETTE_SETS, note);
  const noteFragment = note ? ` — interpreted as "${note.slice(0, 40)}"` : "";
  return {
    palettes,
    conceptThumbnailPrompts: palettes.map(
      (p) =>
        `Cinematic editorial hero composition for ${b.businessName}, ${p.name} direction${noteFragment}: ${p.rationale.toLowerCase()}`
    ),
  };
};

/** Mock for the "regenerate typography" refinement path. */
export const mockBrandTypography = (_b: BrandInput, note?: string) => ({
  typography: pickSet(ALT_TYPE_SETS, note),
});

export const mockCampaignSuggestions = (c: CampaignInput) => ({
  palettes: PALETTES,
  typography: TYPES,
  headlines: [
    `No map. No excuses.`,
    `${c.brandName}, made loud.`,
    `Stop scrolling. Start moving.`,
    `Built different. On purpose.`,
    `${c.campaignName || "It"} starts now.`,
  ],
  cta: "See what's possible",
  channelIdeas: Object.fromEntries(
    c.channels.map((ch) => [
      ch,
      `A ${ch} execution that leads with one strong line and earns the second look through restraint.`,
    ])
  ),
  conceptThumbnailPrompts: [
    `Cinematic campaign hero for "${c.campaignName}" — noir base, electric accent, ${c.brandName} energy.`,
    `Warm sunset campaign visual for "${c.campaignName}", ember tones, lived-in.`,
    `Cool minimal campaign visual for "${c.campaignName}", ocean palette, daylight clean.`,
  ],
  mockupPrompts: [
    `HERO campaign visual for "${c.campaignName}", 9:16 vertical, cinematic, on-message, the defining lead image for the launch announcement. ${c.brandName} mark visible if it fits naturally.`,
    `SOCIAL POST for "${c.campaignName}", 1:1 square, a real-feeling Instagram still showing ${c.targetMarket || "the audience"} encountering the campaign in a lifestyle moment. ${c.brandName} wordmark visible.`,
    `STORY/REEL frame for "${c.campaignName}", 9:16 vertical, a single bold thumb-stop composition designed for Instagram Stories / TikTok feed.`,
    `POSTER for "${c.campaignName}", 2:3 portrait, editorial campaign poster as if wheat-pasted to an urban wall, headline integrated into the composition, photographic feel.`,
    `PHOTO MOODBOARD for "${c.campaignName}", 1:1 square, a single hero editorial photograph that defines the campaign's visual style — color, energy, human moment.`,
    `OOH for "${c.campaignName}", 16:9 horizontal, the campaign applied to a real-world billboard or transit surface, photographed in situ at street level.`,
    `DIGITAL BANNER for "${c.campaignName}", 16:9 horizontal, wide marquee composition as it would appear at the top of a website or in an in-app sponsored placement, strong central subject with the campaign headline composed editorially. ${c.brandName} wordmark prominent.`,
    `CAMPAIGN ACTIVATION for "${c.campaignName}", 1:1 square, the campaign brought to life in a physical experience — pop-up activation, branded installation, event stage, immersive moment. Architectural feel, ambient lighting deliberate.`,
  ],
});

export const mockCampaignPersona = (c: CampaignInput) => ({
  name: "The Quiet Provocateur",
  description: `Knows exactly what they're doing. Speaks once, lands hard. Wears ${c.brandName} not as a flag but as a position — and dares you to read it. Has nothing to prove and everything to say. The kind of presence that changes the room without raising their voice.`,
  traits: ["composed", "incisive", "low-volume", "high-conviction", "magnetic"],
});

/** Mock for the "regenerate campaign palettes" refinement path. */
export const mockCampaignPalettes = (c: CampaignInput, note?: string) => {
  const palettes = pickSet(ALT_PALETTE_SETS, note);
  const noteFragment = note ? ` — interpreted as "${note.slice(0, 40)}"` : "";
  return {
    palettes,
    conceptThumbnailPrompts: palettes.map(
      (p) =>
        `Cinematic campaign hero for "${c.campaignName || c.brandName}", ${p.name} direction${noteFragment}: ${p.rationale.toLowerCase()}`
    ),
  };
};

/** Mock for the "regenerate campaign typography" refinement path. */
export const mockCampaignTypography = (_c: CampaignInput, note?: string) => ({
  typography: pickSet(ALT_TYPE_SETS, note),
});
