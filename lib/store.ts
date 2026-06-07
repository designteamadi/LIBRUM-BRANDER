"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  BrandInput,
  CampaignInput,
  GeneratedBrand,
  GeneratedCampaign,
  ArchetypeKey,
  MediaChannel,
  LogoStyle,
  LanguageCode,
} from "./types";

const blankBrand: BrandInput = {
  businessName: "",
  industry: "",
  description: "",
  targetAudience: "",
  mission: "",
  archetypes: [],
  toneKeywords: [],
  logoStyle: "wordmark",
  logoPrompt: "",
  outputLanguage: "en",
};

const blankCampaign: CampaignInput = {
  brandName: "",
  brandDescription: "",
  logoDataUrl: undefined,
  campaignName: "",
  campaignPurpose: "",
  campaignStory: "",
  targetMarket: "",
  archetypes: [],
  toneKeywords: [],
  channels: [],
  outputLanguage: "en",
};

type State = {
  brand: BrandInput;
  campaign: CampaignInput;
  generatedBrand?: GeneratedBrand;
  generatedCampaign?: GeneratedCampaign;
  mode?: "brand" | "campaign";
  setBrand: (patch: Partial<BrandInput>) => void;
  setCampaign: (patch: Partial<CampaignInput>) => void;
  toggleBrandArchetype: (k: ArchetypeKey) => void;
  toggleCampaignArchetype: (k: ArchetypeKey) => void;
  toggleBrandTone: (t: string) => void;
  toggleCampaignTone: (t: string) => void;
  setLogoStyle: (s: LogoStyle) => void;
  toggleChannel: (m: MediaChannel) => void;
  setBrandLanguage: (l: LanguageCode) => void;
  setCampaignLanguage: (l: LanguageCode) => void;
  setGeneratedBrand: (g: GeneratedBrand) => void;
  setGeneratedCampaign: (g: GeneratedCampaign) => void;
  setMode: (m: "brand" | "campaign") => void;
  updateBrandMockup: (idx: number, dataUrl: string) => void;
  updateBrandLogo: (dataUrl: string) => void;
  updateBrandCover: (dataUrl: string) => void;
  updateBrandDontExamples: (examples: (string | undefined)[]) => void;
  updateCampaignMockup: (idx: number, dataUrl: string) => void;
  updateCampaignCover: (dataUrl: string) => void;
  reset: () => void;
};

export const useBRND = create<State>()(
  persist(
    (set) => ({
      brand: blankBrand,
      campaign: blankCampaign,
      setBrand: (patch) =>
        set((s) => ({ brand: { ...s.brand, ...patch } })),
      setCampaign: (patch) =>
        set((s) => ({ campaign: { ...s.campaign, ...patch } })),
      toggleBrandArchetype: (k) =>
        set((s) => {
          const has = s.brand.archetypes.includes(k);
          const next = has
            ? s.brand.archetypes.filter((a) => a !== k)
            : s.brand.archetypes.length < 2
            ? [...s.brand.archetypes, k]
            : [s.brand.archetypes[1], k];
          return { brand: { ...s.brand, archetypes: next } };
        }),
      toggleCampaignArchetype: (k) =>
        set((s) => {
          const has = s.campaign.archetypes.includes(k);
          const next = has
            ? s.campaign.archetypes.filter((a) => a !== k)
            : s.campaign.archetypes.length < 2
            ? [...s.campaign.archetypes, k]
            : [s.campaign.archetypes[1], k];
          return { campaign: { ...s.campaign, archetypes: next } };
        }),
      toggleBrandTone: (t) =>
        set((s) => {
          const has = s.brand.toneKeywords.includes(t);
          const next = has
            ? s.brand.toneKeywords.filter((a) => a !== t)
            : [...s.brand.toneKeywords, t];
          return { brand: { ...s.brand, toneKeywords: next } };
        }),
      toggleCampaignTone: (t) =>
        set((s) => {
          const has = s.campaign.toneKeywords.includes(t);
          const next = has
            ? s.campaign.toneKeywords.filter((a) => a !== t)
            : [...s.campaign.toneKeywords, t];
          return { campaign: { ...s.campaign, toneKeywords: next } };
        }),
      setLogoStyle: (logoStyle) =>
        set((s) => ({ brand: { ...s.brand, logoStyle } })),
      toggleChannel: (m) =>
        set((s) => {
          const has = s.campaign.channels.includes(m);
          const next = has
            ? s.campaign.channels.filter((a) => a !== m)
            : [...s.campaign.channels, m];
          return { campaign: { ...s.campaign, channels: next } };
        }),
      setBrandLanguage: (outputLanguage) =>
        set((s) => ({ brand: { ...s.brand, outputLanguage } })),
      setCampaignLanguage: (outputLanguage) =>
        set((s) => ({ campaign: { ...s.campaign, outputLanguage } })),
      setGeneratedBrand: (g) => set({ generatedBrand: g }),
      setGeneratedCampaign: (g) => set({ generatedCampaign: g }),
      setMode: (m) => set({ mode: m }),
      updateBrandMockup: (idx, dataUrl) =>
        set((s) => {
          if (!s.generatedBrand) return s;
          const mockups = [...s.generatedBrand.mockupImages];
          mockups[idx] = dataUrl;
          return {
            generatedBrand: { ...s.generatedBrand, mockupImages: mockups },
          };
        }),
      updateBrandLogo: (dataUrl) =>
        set((s) => {
          if (!s.generatedBrand) return s;
          return {
            generatedBrand: { ...s.generatedBrand, logoImageDataUrl: dataUrl },
          };
        }),
      updateBrandCover: (dataUrl) =>
        set((s) => {
          if (!s.generatedBrand) return s;
          return {
            generatedBrand: { ...s.generatedBrand, coverImageDataUrl: dataUrl },
          };
        }),
      updateBrandDontExamples: (examples) =>
        set((s) => {
          if (!s.generatedBrand) return s;
          return {
            generatedBrand: { ...s.generatedBrand, logoDontExamples: examples },
          };
        }),
      updateCampaignMockup: (idx, dataUrl) =>
        set((s) => {
          if (!s.generatedCampaign) return s;
          const mockups = [...s.generatedCampaign.mockupImages];
          mockups[idx] = dataUrl;
          return {
            generatedCampaign: {
              ...s.generatedCampaign,
              mockupImages: mockups,
            },
          };
        }),
      updateCampaignCover: (dataUrl) =>
        set((s) => {
          if (!s.generatedCampaign) return s;
          return {
            generatedCampaign: {
              ...s.generatedCampaign,
              coverImageDataUrl: dataUrl,
            },
          };
        }),
      reset: () =>
        set({
          brand: blankBrand,
          campaign: blankCampaign,
          generatedBrand: undefined,
          generatedCampaign: undefined,
          mode: undefined,
        }),
    }),
    {
      name: "brnd-store",
      storage: createJSONStorage(() => sessionStorage),
      // Only persist the wizard INPUTS to sessionStorage. The generated*
      // objects contain base64-encoded mockup images that can run into
      // megabytes — easily exceeding sessionStorage's ~5MB per-origin quota
      // and causing the persist write to throw. Generated output is in-memory
      // only and lives for the duration of the SPA session, which is all we
      // need: the user goes /brand → /result in one navigation.
      partialize: (state) => ({
        brand: state.brand,
        campaign: state.campaign,
        mode: state.mode,
      }),
    }
  )
);
