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

export type EssenceItem = {
  title: string;
  body: string;
  icon: string;
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
  essence: EssenceItem[];
  iconLabels: string[];
  mockupPrompts: string[];
  mockupImages: (string | undefined)[];
  moodboardPrompts: string[];
  moodboardImages: (string | undefined)[];
  /** True if Gemini API was actually called; false if mocks were used */
  live: boolean;
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
  essence: EssenceItem[];
  iconLabels: string[];
  mockupPrompts: string[];
  mockupImages: (string | undefined)[];
  moodboardPrompts: string[];
  moodboardImages: (string | undefined)[];
  live: boolean;
};

export type ReasonRequest =
  | { kind: "brand-suggestions"; input: BrandInput }
  | { kind: "brand-persona"; input: BrandInput; palette: ColorPalette }
  | { kind: "campaign-suggestions"; input: CampaignInput }
  | { kind: "campaign-persona"; input: CampaignInput; palette: ColorPalette }
  | {
      kind: "more-brand-palettes";
      input: BrandInput;
      existing: ColorPalette[];
    }
  | {
      kind: "more-campaign-palettes";
      input: CampaignInput;
      existing: ColorPalette[];
    };

export type ImageRequest = {
  prompt: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:5";
  inputImages?: string[];
};
