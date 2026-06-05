import type {
  BrandInput,
  CampaignInput,
  ColorPalette,
  TypePairing,
  EssenceItem,
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

const MORE_PALETTES: ColorPalette[] = [
  {
    name: "Cobalt Riot",
    hexes: ["#11163d", "#4d7cff", "#fefae0", "#ffc857"],
    rationale: "Cool corporate cobalt loosened up with a sunlit yellow.",
  },
  {
    name: "Verde Hush",
    hexes: ["#10261d", "#7ad19b", "#f4f1ea", "#d34f4f"],
    rationale: "Forest-quiet greens with one decisive punch of red.",
  },
  {
    name: "Cinder Clay",
    hexes: ["#2b1a18", "#e07856", "#f0e6d2", "#664433"],
    rationale: "Hand-fired terracotta tones — analog, patient, durable.",
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

const ESSENCE: EssenceItem[] = [
  { title: "Built to ship", body: "We make things that work, not slides.", icon: "rocket" },
  { title: "Plainspoken", body: "If you can't say it short, don't say it.", icon: "zap" },
  { title: "Made deliberately", body: "Every detail is a choice.", icon: "compass" },
  { title: "Honest craft", body: "Last to leave, first to revise.", icon: "hammer" },
];

const ICON_LABELS = ["zap", "compass", "mountain", "anchor", "flame", "star"];

const MOODBOARD = [
  "Cinematic close-up of weathered canvas texture, golden hour side light, shallow depth of field.",
  "Bold typographic poster on a brick wall, urban environment, late afternoon light.",
  "Hand holding a worn leather notebook, natural window light, neutral background.",
  "Empty modernist hallway, single overhead light, long shadows, minimal.",
  "Studio still life of three matte ceramic objects, soft directional light.",
  "Wide shot of misty mountain ridge at dawn, muted greens and grey-blues.",
];

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
  essence: ESSENCE,
  iconLabels: ICON_LABELS,
  conceptThumbnailPrompts: [
    `Cinematic editorial hero composition representing ${b.businessName}, noir base with electric green accent, premium feel.`,
    `Warm earthen lifestyle composition for ${b.businessName}, ember sunset light, lived-in textures.`,
    `Cool minimal product composition for ${b.businessName}, ocean teal and bone with sunlit highlights.`,
  ],
  mockupPrompts: [
    `A premium product mockup for ${b.businessName}, soft natural lighting, neutral background, brand-forward composition.`,
    `An in-context lifestyle shot showing ${b.businessName} in use by ${b.targetAudience || "someone in their element"}, cinematic light.`,
    `A bold poster mockup featuring the ${b.businessName} wordmark on a city wall at golden hour.`,
  ],
  moodboardPrompts: MOODBOARD,
});

export const mockMoreBrandPalettes = () => ({
  palettes: MORE_PALETTES,
  conceptThumbnailPrompts: [
    "Cobalt corporate composition with one sunlit punch.",
    "Forest-quiet still life with a decisive red moment.",
    "Hand-fired terracotta arrangement, analog texture.",
  ],
});

export const mockBrandPersona = (b: BrandInput) => ({
  name: "The Restless Cartographer",
  description: `Thirty-something. Last to leave the trail, first to skip the resort. Speaks plainly, writes shorter than expected, and would rather show you a place than tell you about it. Believes ${b.businessName} is a vehicle, not a destination — that what matters is the terrain you choose, not the badge you wear. Owns three jackets, all worn through at the cuffs.`,
  traits: ["restless", "plainspoken", "deliberate", "uncompromising", "warm"],
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
  essence: [
    { title: "One idea", body: "Land it before you elaborate.", icon: "target" },
    { title: "Earn the look", body: "Restraint over decoration.", icon: "eye" },
    { title: "Speak once", body: "Repetition kills resonance.", icon: "mic" },
    { title: "Show, don't sell", body: "Story over slogan.", icon: "sparkles" },
  ],
  iconLabels: ["target", "eye", "mic", "sparkles", "flame", "send"],
  conceptThumbnailPrompts: [
    `Cinematic campaign hero for "${c.campaignName}" — noir base, electric accent, ${c.brandName} energy.`,
    `Warm sunset campaign visual for "${c.campaignName}", ember tones, lived-in.`,
    `Cool minimal campaign visual for "${c.campaignName}", ocean palette, daylight clean.`,
  ],
  mockupPrompts: [
    `Hero campaign poster for ${c.campaignName}, bold typography, high contrast, evocative subject.`,
    `Secondary campaign visual — product in dramatic light with the ${c.brandName} wordmark.`,
    `Lifestyle moment showing ${c.targetMarket || "the audience"} encountering the campaign in the wild.`,
  ],
  moodboardPrompts: MOODBOARD,
});

export const mockMoreCampaignPalettes = () => ({
  palettes: MORE_PALETTES,
  conceptThumbnailPrompts: [
    "Cobalt cinematic campaign moment.",
    "Forest-quiet campaign still with red punctuation.",
    "Terracotta campaign tableau, soft analog light.",
  ],
});

export const mockCampaignPersona = (c: CampaignInput) => ({
  name: "The Quiet Provocateur",
  description: `Knows exactly what they're doing. Speaks once, lands hard. Wears ${c.brandName} not as a flag but as a position — and dares you to read it. Has nothing to prove and everything to say. The kind of presence that changes the room without raising their voice.`,
  traits: ["composed", "incisive", "low-volume", "high-conviction", "magnetic"],
});
