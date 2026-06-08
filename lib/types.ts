export type ArchetypeKey =
  | "innocent"
  | "sage"
  | "explorer"
  | "outlaw"
  | "magician"
  | "hero"
  | "lover"
  | "jester"
  | "everyman"
  | "caregiver"
  | "ruler"
  | "creator";

export type LogoStyle = "wordmark" | "symbol" | "combination" | "mascot";

export type LanguageCode =
  | "en"
  | "id"
  | "ms"
  | "th"
  | "vi"
  | "tl"
  | "es"
  | "fr"
  | "de"
  | "ja"
  | "ko"
  | "zh";

export type ColorPalette = {
  name: string;
  hexes: string[];
  rationale: string;
  conceptImageDataUrl?: string;
};

export type TypePairing = {
  display: string;
  body: string;
  rationale: string;
};

export type Persona = {
  name: string;
  description: string;
  traits: string[];
};

/**
 * Per-channel campaign plan returned by the AI in campaign-suggestions.
 * Drives the channel-specific placement tiles in the campaign bento and the
 * Location / Context / rationale pages in the campaign playbook.
 */
export type ChannelPlan = {
  /** where this placement physically lives, e.g. "MRT station concourse" */
  location: string;
  /** the thematic angle, e.g. "commuting" / "frequently asked question" */
  context: string;
  /** one or two sentences on why this placement carries the message */
  rationale: string;
  /** a short contextual hook/question the placement answers (speech-bubble) */
  hook: string;
  /** one to three photographic execution prompts for this channel */
  executions: string[];
};

/**
 * A single resolved placement tile in the campaign bento, index-aligned with
 * GeneratedCampaign.mockupImages and .mockupPrompts. `composed` tiles
 * (radio/email) carry no generated image — the bento renders a code card.
 */
export type CampaignPlacementTile = {
  channel: MediaChannel;
  label: string;
  location: string;
  context: string;
  rationale: string;
  hook: string;
  aspect: string;
  composed: boolean;
};

export type BrandInput = {
  businessName: string;
  industry: string;
  description: string;
  targetAudience: string;
  mission: string;
  archetypes: ArchetypeKey[];
  archetypeMix?: Record<ArchetypeKey, number>;
  toneKeywords: string[];
  logoStyle: LogoStyle;
  logoPrompt: string;
  outputLanguage: LanguageCode;
};

export type CampaignInput = {
  brandName: string;
  brandDescription: string;
  logoDataUrl?: string;
  campaignName: string;
  campaignPurpose: string;
  campaignStory: string;
  targetMarket: string;
  archetypes: ArchetypeKey[];
  toneKeywords: string[];
  channels: MediaChannel[];
  outputLanguage: LanguageCode;
};

export type MediaChannel =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "ooh"
  | "print"
  | "email"
  | "web"
  | "radio";

export type GeneratedBrand = {
  input: BrandInput;
  logoSvg?: string;
  logoImageDataUrl?: string;
  logoPrompt: string;
  palettes: ColorPalette[];
  selectedPalette: ColorPalette;
  typography: TypePairing[];
  selectedType: TypePairing;
  persona: Persona;
  tagline: string;
  story: string;
  patternIdea: string;
  mockupPrompts: string[];
  mockupImages: (string | undefined)[];
  /**
   * Per-applied-surface case-study copy (index-aligned with mockupImages):
   * a short "what this is / why it works" line shown under each elevated
   * bento panel and on each "in action" playbook page.
   */
  mockupDescriptions?: string[];
  /** Nano Banana 2-generated editorial hero image used as the playbook cover background. */
  coverImageDataUrl?: string;
  /**
   * Six Nano Banana 2-generated "what NOT to do" examples for the logo:
   * stretched, rotated, recolored, outlined, crowded, patterned. Shown on
   * the playbook's "Don't" page as concrete bad-usage illustrations.
   */
  logoDontExamples?: (string | undefined)[];
};

export type GeneratedCampaign = {
  input: CampaignInput;
  palettes: ColorPalette[];
  selectedPalette: ColorPalette;
  typography: TypePairing[];
  selectedType: TypePairing;
  persona: Persona;
  headlines: string[];
  cta: string;
  channelIdeas: Record<MediaChannel, string>;
  mockupPrompts: string[];
  mockupImages: (string | undefined)[];
  /**
   * Resolved placement tiles, index-aligned with mockupImages/mockupPrompts.
   * Drives the channel-driven campaign bento and the playbook placement pages.
   */
  placements?: CampaignPlacementTile[];
  /** Nano Banana 2-generated editorial hero image used as the campaign-book cover. */
  coverImageDataUrl?: string;
  /**
   * The campaign's OWN title logo — a generated wordmark/lockup for the
   * campaign name itself (distinct from the parent brand logo in input).
   * Shown in the campaign bento hero/lockup and on the playbook cover.
   */
  campaignLogoDataUrl?: string;
};

export type ReasonRequest =
  | { kind: "brand-suggestions"; input: BrandInput }
  | { kind: "brand-persona"; input: BrandInput; palette: ColorPalette }
  | { kind: "brand-palettes"; input: BrandInput; note?: string }
  | { kind: "brand-typography"; input: BrandInput; note?: string }
  | { kind: "campaign-suggestions"; input: CampaignInput }
  | { kind: "campaign-persona"; input: CampaignInput; palette: ColorPalette }
  | { kind: "campaign-palettes"; input: CampaignInput; note?: string }
  | { kind: "campaign-typography"; input: CampaignInput; note?: string };

export type ImageRequest = {
  prompt: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:5";
  /** Optional input images (data URLs) for compositing — Nano Banana edit mode */
  inputImages?: string[];
};
