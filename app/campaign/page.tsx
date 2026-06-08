"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import StepShell from "@/components/StepShell";
import ArchetypePicker from "@/components/ArchetypePicker";
import TonePicker from "@/components/TonePicker";
import PalettePicker from "@/components/PalettePicker";
import TypePicker from "@/components/TypePicker";
import ChannelPicker from "@/components/ChannelPicker";
import LanguagePicker from "@/components/LanguagePicker";
import RefineBar from "@/components/RefineBar";
import { useBRND } from "@/lib/store";
import { archetypeByKey } from "@/lib/archetypes";
import {
  planCampaignImageTiles,
  nonVisualChannels,
  CHANNEL_META,
} from "@/lib/placements";
import { campaignLogoImagePrompt } from "@/lib/prompts";
import type {
  ColorPalette,
  TypePairing,
  Persona,
  GeneratedCampaign,
  MediaChannel,
  ChannelPlan,
  CampaignPlacementTile,
} from "@/lib/types";

const TOTAL = 9;

type Suggestions = {
  palettes: ColorPalette[];
  typography: TypePairing[];
  headlines: string[];
  cta: string;
  channelIdeas: Record<MediaChannel, string>;
  conceptThumbnailPrompts: string[];
  channelPlans?: Partial<Record<MediaChannel, ChannelPlan>>;
};

export default function CampaignFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [thumbnailsLoading, setThumbnailsLoading] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<TypePairing | null>(null);

  const [genError, setGenError] = useState<string | null>(null);

  // ---------- Refinement state (steps 6 & 7) ----------
  const [paletteNote, setPaletteNote] = useState("");
  const [paletteRegenBusy, setPaletteRegenBusy] = useState(false);
  const [paletteRegenError, setPaletteRegenError] = useState<string | null>(
    null
  );
  const [typeNote, setTypeNote] = useState("");
  const [typeRegenBusy, setTypeRegenBusy] = useState(false);
  const [typeRegenError, setTypeRegenError] = useState<string | null>(null);

  // Monotonic op counter — see brand/page.tsx for full explanation.
  const opSeqRef = useRef(0);

  const {
    campaign,
    setCampaign,
    toggleCampaignArchetype,
    toggleCampaignTone,
    toggleChannel,
    setCampaignLanguage,
    setMode,
    setGeneratedCampaign,
  } = useBRND();

  const next = () => setStep((s) => Math.min(TOTAL, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const fetchSuggestions = async (): Promise<boolean> => {
    const seq = ++opSeqRef.current;
    setBusy(true);
    setGenError(null);
    try {
      const res = await fetch("/api/reason", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "campaign-suggestions", input: campaign }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = (await res.json()) as {
        data?: Suggestions;
        error?: string;
      };
      if (seq !== opSeqRef.current) return false;
      if (json.error) throw new Error(json.error);
      if (
        !json.data?.palettes?.length ||
        !json.data?.typography?.length
      ) {
        throw new Error("Incomplete suggestions returned");
      }
      setSuggestions(json.data);
      setSelectedPalette(json.data.palettes[0] ?? null);
      setSelectedType(json.data.typography[0] ?? null);
      return true;
    } catch (e) {
      if (seq !== opSeqRef.current) return false;
      setGenError(
        e instanceof Error
          ? `Couldn't generate suggestions — ${e.message}`
          : "Couldn't generate suggestions"
      );
      return false;
    } finally {
      if (seq === opSeqRef.current) setBusy(false);
    }
  };

  // Concept-thumbnail effect — stale-guard same as brand flow.
  useEffect(() => {
    if (!suggestions || !suggestions.conceptThumbnailPrompts) return;
    if (suggestions.palettes.every((p) => p.conceptImageDataUrl)) return;

    const expectedKey = suggestions.conceptThumbnailPrompts.join("|");
    setThumbnailsLoading(true);
    const prompts = suggestions.conceptThumbnailPrompts.slice(0, 3);

    Promise.all(
      prompts.map((p) =>
        fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: p, aspectRatio: "4:5" }),
        })
          .then((r) => r.json())
          .catch(() => ({ dataUrl: undefined }))
      )
    )
      .then((results) => {
        setSuggestions((prev) => {
          if (!prev) return prev;
          if (prev.conceptThumbnailPrompts.join("|") !== expectedKey) {
            return prev;
          }
          return {
            ...prev,
            palettes: prev.palettes.map((p, i) => ({
              ...p,
              conceptImageDataUrl:
                results[i]?.dataUrl ?? p.conceptImageDataUrl,
            })),
          };
        });
      })
      .finally(() => setThumbnailsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestions?.conceptThumbnailPrompts?.join("|")]);

  // ---------- Regenerate campaign directions (step 6) ----------
  const regeneratePalettes = async () => {
    if (paletteRegenBusy) return;
    const seq = ++opSeqRef.current;
    setPaletteRegenBusy(true);
    setPaletteRegenError(null);
    try {
      const res = await fetch("/api/reason", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "campaign-palettes",
          input: campaign,
          note: paletteNote.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = (await res.json()) as {
        data?: {
          palettes: ColorPalette[];
          conceptThumbnailPrompts?: string[];
        };
        error?: string;
      };
      if (seq !== opSeqRef.current) return;
      if (json.error || !json.data?.palettes?.length) {
        throw new Error(json.error || "No palettes returned");
      }
      const { palettes, conceptThumbnailPrompts } = json.data;
      const fresh = palettes.map((p) => ({
        ...p,
        conceptImageDataUrl: undefined,
      }));
      const safePrompts =
        conceptThumbnailPrompts &&
        conceptThumbnailPrompts.length === fresh.length
          ? conceptThumbnailPrompts
          : fresh.map(
              (p) =>
                `Cinematic campaign hero composition for "${campaign.campaignName || campaign.brandName}", ${p.name} direction — ${p.rationale}`
            );
      setSuggestions((prev) => {
        if (!prev) return prev;
        if (seq !== opSeqRef.current) return prev;
        return {
          ...prev,
          palettes: fresh,
          conceptThumbnailPrompts: safePrompts,
        };
      });
      setSelectedPalette(fresh[0] ?? null);
    } catch (e) {
      if (seq !== opSeqRef.current) return;
      setPaletteRegenError(
        e instanceof Error
          ? `Couldn't regenerate directions — ${e.message}`
          : "Couldn't regenerate directions"
      );
    } finally {
      if (seq === opSeqRef.current) setPaletteRegenBusy(false);
    }
  };

  // ---------- Regenerate campaign typography (step 7) ----------
  const regenerateTypography = async () => {
    if (typeRegenBusy) return;
    const seq = ++opSeqRef.current;
    setTypeRegenBusy(true);
    setTypeRegenError(null);
    try {
      const res = await fetch("/api/reason", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "campaign-typography",
          input: campaign,
          note: typeNote.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = (await res.json()) as {
        data?: { typography: TypePairing[] };
        error?: string;
      };
      if (seq !== opSeqRef.current) return;
      if (json.error || !json.data?.typography?.length) {
        throw new Error(json.error || "No typography returned");
      }
      const { typography } = json.data;
      setSuggestions((prev) => {
        if (!prev) return prev;
        if (seq !== opSeqRef.current) return prev;
        return { ...prev, typography };
      });
      setSelectedType(typography[0] ?? null);
    } catch (e) {
      if (seq !== opSeqRef.current) return;
      setTypeRegenError(
        e instanceof Error
          ? `Couldn't regenerate typography — ${e.message}`
          : "Couldn't regenerate typography"
      );
    } finally {
      if (seq === opSeqRef.current) setTypeRegenBusy(false);
    }
  };

  const finalize = async () => {
    if (!selectedPalette || !selectedType || !suggestions) return;
    setBusy(true);
    setGenError(null);
    setMode("campaign");
    // eslint-disable-next-line no-console
    console.log("[finalize:campaign] start", {
      campaignName: campaign.campaignName,
      palette: selectedPalette.name,
      type: `${selectedType.display}/${selectedType.body}`,
    });
    try {
      // -------- Single parallel stage --------
      // For campaigns the brand logo is uploaded at step 2 (already in
      // campaign.logoDataUrl), so persona text + 6 mockups can all start
      // immediately. Cover image — playbook-only — is background-gen on
      // /result so the bento appears faster.
      //
      // -------- Channel-driven placement plan --------
      // The campaign bento visualizes each SELECTED media placement. Visual
      // channels get generated images (capped at 12, going deep when few
      // channels are picked and wide when many); radio/email become
      // code-composed cards. We also generate the campaign's OWN title logo.
      const userLogo = campaign.logoDataUrl;
      const channelPlans: Partial<Record<MediaChannel, ChannelPlan>> =
        suggestions.channelPlans ?? {};

      const imageSpecs = planCampaignImageTiles(campaign.channels);
      const composedChannels = nonVisualChannels(campaign.channels);

      const compositeInstruction = (p: string) =>
        userLogo
          ? `${p}\n\nIMPORTANT: Apply the brand logo from the provided image naturally onto the visible product/surface/sign in this scene — preserve its proportions; match the lighting and perspective.`
          : p;

      const buildImageReq = (
        prompt: string,
        aspectRatio: string,
        withLogo: boolean
      ) =>
        fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            aspectRatio,
            inputImages: withLogo && userLogo ? [userLogo] : undefined,
          }),
        })
          .then((r) => r.json())
          .catch(() => ({ dataUrl: undefined }));

      // Resolve each image spec into a prompt + a placement descriptor.
      const imageTiles = imageSpecs.map((spec) => {
        const plan = channelPlans[spec.channel];
        const execs = (plan?.executions ?? []).filter(Boolean);
        const meta = CHANNEL_META[spec.channel];
        const basePrompt = execs.length
          ? execs[spec.execIndex % execs.length]
          : `Campaign visual for "${campaign.campaignName || campaign.brandName}" — ${spec.label}. On-message, editorial lighting, strong single subject, ${campaign.brandName} present naturally.`;
        const placement: CampaignPlacementTile = {
          channel: spec.channel,
          label: spec.label,
          location: plan?.location || meta?.label || spec.channel,
          context: plan?.context || campaign.campaignName || "",
          rationale: plan?.rationale || "",
          hook: plan?.hook || "",
          aspect: spec.aspect,
          composed: false,
        };
        return { prompt: basePrompt, aspect: spec.aspect, placement };
      });

      // Non-visual channels (radio/email) → code-composed placement cards.
      const composedTiles = composedChannels.map((ch) => {
        const plan = channelPlans[ch];
        const meta = CHANNEL_META[ch];
        const placement: CampaignPlacementTile = {
          channel: ch,
          label: meta?.label || ch,
          location: plan?.location || meta?.label || ch,
          context: plan?.context || campaign.campaignName || "",
          rationale:
            plan?.rationale ||
            (suggestions.channelIdeas?.[ch] ?? "") ||
            "",
          hook: plan?.hook || "",
          aspect: meta?.aspect || "1:1",
          composed: true,
        };
        return { placement };
      });

      const [personaRes, campaignLogoRes, imgResults] = await Promise.all([
        fetch("/api/reason", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "campaign-persona",
            input: campaign,
            palette: selectedPalette,
          }),
        }),
        // Campaign's own title logo — no compositing, transparent-ish bg.
        buildImageReq(campaignLogoImagePrompt(campaign), "1:1", false),
        Promise.all(
          imageTiles.map((t) =>
            buildImageReq(
              compositeInstruction(t.prompt),
              t.aspect,
              Boolean(userLogo)
            )
          )
        ),
      ]);

      if (!personaRes.ok) {
        throw new Error(`Persona service returned ${personaRes.status}`);
      }
      const personaJson = (await personaRes.json()) as {
        data?: Partial<Persona>;
        error?: string;
      };
      // Persona must have name + description + traits[] for the Bento to
      // render without crashing. If any field is missing or malformed,
      // synthesize a fallback from the campaign inputs rather than throw.
      const d = personaJson.data;
      const validPersona =
        d &&
        typeof d.name === "string" &&
        d.name.trim().length > 0 &&
        typeof d.description === "string" &&
        d.description.trim().length > 0 &&
        Array.isArray(d.traits) &&
        d.traits.length > 0 &&
        d.traits.every((t) => typeof t === "string");
      const persona: Persona = validPersona
        ? (d as Persona)
        : {
            name: campaign.campaignName || campaign.brandName || "The Voice",
            description:
              campaign.campaignStory ||
              campaign.campaignPurpose ||
              `A campaign voice built around ${campaign.toneKeywords.join(", ") || "conviction"}.`,
            traits:
              campaign.toneKeywords.length > 0
                ? campaign.toneKeywords.slice(0, 5)
                : ["composed", "incisive", "low-volume", "high-conviction", "magnetic"],
          };
      if (!validPersona) {
        // eslint-disable-next-line no-console
        console.warn(
          "[finalize] campaign persona response was malformed; using synthetic fallback",
          { received: personaJson }
        );
      }

      // Stitch image tiles + composed tiles into index-aligned arrays.
      const placements: CampaignPlacementTile[] = [
        ...imageTiles.map((t) => t.placement),
        ...composedTiles.map((t) => t.placement),
      ];
      const mockupPrompts = [
        ...imageTiles.map((t) => t.prompt),
        ...composedTiles.map(() => ""),
      ];
      const mockupImages: (string | undefined)[] = [
        ...imgResults.map((r) => r?.dataUrl),
        ...composedTiles.map(() => undefined),
      ];

      const generated: GeneratedCampaign = {
        input: campaign,
        palettes: suggestions.palettes,
        selectedPalette,
        typography: suggestions.typography,
        selectedType,
        persona,
        headlines: suggestions.headlines ?? [],
        cta: suggestions.cta ?? "",
        channelIdeas:
          suggestions.channelIdeas ?? ({} as Record<MediaChannel, string>),
        mockupPrompts,
        mockupImages,
        placements,
        campaignLogoDataUrl: campaignLogoRes?.dataUrl,
        // coverImageDataUrl is filled in by background generation on /result.
      };
      setGeneratedCampaign(generated);
      // eslint-disable-next-line no-console
      console.log("[finalize:campaign] success → /result", {
        placementCount: placements.length,
        imageCount: imgResults.filter((r) => r?.dataUrl).length,
        hasCampaignLogo: Boolean(campaignLogoRes?.dataUrl),
        hasLogo: Boolean(userLogo),
        usedSyntheticPersona: !validPersona,
      });
      router.push("/result");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[finalize:campaign] failed", e);
      setGenError(
        e instanceof Error
          ? `Couldn't finish generating — ${e.message}`
          : "Couldn't finish generating"
      );
    } finally {
      setBusy(false);
    }
  };

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () =>
      setCampaign({ logoDataUrl: String(reader.result) });
    reader.readAsDataURL(f);
  };

  // ---------- step 1 — language ----------
  if (step === 1) {
    return (
      <StepShell
        flowLabel="Campaign"
        step={1}
        total={TOTAL}
        eyebrow="01 — language"
        title={
          <>
            What language should
            <br />
            the <span className="italic text-spark">copy</span> be in?
          </>
        }
        subtitle="Headlines, CTAs, channel ideas — all generated in your language."
        onNext={next}
      >
        <LanguagePicker
          value={campaign.outputLanguage}
          onChange={setCampaignLanguage}
        />
      </StepShell>
    );
  }

  // ---------- step 2 — brand ----------
  if (step === 2) {
    const valid =
      campaign.brandName.trim() && campaign.brandDescription.trim();
    return (
      <StepShell
        flowLabel="Campaign"
        step={2}
        total={TOTAL}
        eyebrow="02 — your brand"
        title={
          <>
            Start with the
            <br />
            <span className="italic text-spark">brand.</span>
          </>
        }
        subtitle="Upload your logo and tell us about the business. We'll composite it onto every campaign visual."
        nextDisabled={!valid}
        onNext={next}
        onBack={back}
      >
        <div className="space-y-10 max-w-2xl">
          <div>
            <p className="eyebrow mb-3">Upload your logo</p>
            <label className="block border-2 border-dashed border-steel hover:border-spark transition-colors p-8 cursor-pointer text-center">
              <input
                type="file"
                accept="image/*"
                onChange={onLogoChange}
                className="hidden"
              />
              {campaign.logoDataUrl ? (
                <div className="flex flex-col items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={campaign.logoDataUrl}
                    alt="Logo"
                    className="max-h-24 max-w-xs object-contain"
                  />
                  <span className="font-mono text-[11px] tracking-widest uppercase text-spark">
                    Replace
                  </span>
                </div>
              ) : (
                <div className="font-mono text-[11px] tracking-widest uppercase text-ash">
                  click to upload · PNG / SVG / JPG
                </div>
              )}
            </label>
          </div>
          <div>
            <p className="eyebrow mb-3">Brand name</p>
            <input
              className="field"
              value={campaign.brandName}
              onChange={(e) => setCampaign({ brandName: e.target.value })}
              placeholder="Roam"
            />
          </div>
          <div>
            <p className="eyebrow mb-3">What is the business about?</p>
            <textarea
              className="field field-sm"
              value={campaign.brandDescription}
              onChange={(e) =>
                setCampaign({ brandDescription: e.target.value })
              }
              placeholder="Two sentences. What you make, who it's for."
              rows={3}
            />
          </div>
        </div>
      </StepShell>
    );
  }

  // ---------- step 3 — brief ----------
  if (step === 3) {
    const valid =
      campaign.campaignName.trim() &&
      campaign.campaignPurpose.trim() &&
      campaign.campaignStory.trim();
    return (
      <StepShell
        flowLabel="Campaign"
        step={3}
        total={TOTAL}
        eyebrow="03 — the brief"
        title={
          <>
            What is the
            <br />
            <span className="italic text-spark">campaign?</span>
          </>
        }
        subtitle="The shorter you say it, the sharper it lands."
        nextDisabled={!valid}
        onNext={next}
        onBack={back}
      >
        <div className="space-y-10 max-w-2xl">
          <div>
            <p className="eyebrow mb-3">Campaign name</p>
            <input
              className="field"
              value={campaign.campaignName}
              onChange={(e) => setCampaign({ campaignName: e.target.value })}
              placeholder="No Map, No Excuses"
            />
          </div>
          <div>
            <p className="eyebrow mb-3">Purpose</p>
            <textarea
              className="field field-sm"
              value={campaign.campaignPurpose}
              onChange={(e) =>
                setCampaign({ campaignPurpose: e.target.value })
              }
              placeholder="Drive product launch awareness · Reposition the brand · Reactivate lapsed users · …"
              rows={2}
            />
          </div>
          <div>
            <p className="eyebrow mb-3">The story — what are we actually saying?</p>
            <textarea
              className="field field-sm"
              value={campaign.campaignStory}
              onChange={(e) =>
                setCampaign({ campaignStory: e.target.value })
              }
              placeholder="The single idea this campaign exists to communicate."
              rows={3}
            />
          </div>
        </div>
      </StepShell>
    );
  }

  // ---------- step 4 — target market ----------
  if (step === 4) {
    return (
      <StepShell
        flowLabel="Campaign"
        step={4}
        total={TOTAL}
        eyebrow="04 — target market"
        title={
          <>
            Who needs to
            <br />
            <span className="italic text-spark">hear this?</span>
          </>
        }
        subtitle="A real person, not a segment."
        nextDisabled={!campaign.targetMarket.trim()}
        onNext={next}
        onBack={back}
      >
        <div className="max-w-2xl">
          <textarea
            className="field field-sm"
            value={campaign.targetMarket}
            onChange={(e) => setCampaign({ targetMarket: e.target.value })}
            placeholder="Twenty-five to thirty-five, lives in dense cities, has stopped trusting most brands but still wants to be moved by one."
            rows={4}
          />
        </div>
      </StepShell>
    );
  }

  // ---------- step 5 — archetype + tone ----------
  if (step === 5) {
    return (
      <StepShell
        flowLabel="Campaign"
        step={5}
        total={TOTAL}
        eyebrow="05 — archetype & voice"
        title={
          <>
            How should the
            <br />
            <span className="italic text-spark">campaign</span> sound?
          </>
        }
        subtitle="Campaigns can lean different from the parent brand. That contrast is often the move."
        nextDisabled={campaign.archetypes.length === 0}
        onNext={async () => {
          const ok = await fetchSuggestions();
          if (ok) next();
        }}
        onBack={back}
        busy={busy}
        nextLabel={busy ? "Reasoning…" : "Continue"}
      >
        <div className="space-y-12">
          <ArchetypePicker
            selected={campaign.archetypes}
            onToggle={toggleCampaignArchetype}
          />
          <div className="border-t border-steel pt-8">
            <TonePicker
              selected={campaign.toneKeywords}
              onToggle={toggleCampaignTone}
            />
          </div>
          {genError && (
            <div
              role="alert"
              className="border border-ember/40 bg-ember/5 p-4"
            >
              <p className="font-mono text-xs text-ember tracking-wide">
                {genError}
              </p>
              <p className="font-mono text-[10px] text-ash mt-2">
                Click Continue to try again.
              </p>
            </div>
          )}
        </div>
      </StepShell>
    );
  }

  // ---------- step 6 — palette with concept thumbnails (with refinement) ----------
  if (step === 6) {
    return (
      <StepShell
        flowLabel="Campaign"
        step={6}
        total={TOTAL}
        eyebrow="06 — direction & palette"
        title={
          <>
            Three directions,
            <br />
            <span className="italic text-spark">pick one.</span>
          </>
        }
        subtitle={
          suggestions
            ? "Each direction has a concept thumbnail so you see the mood before committing. Not quite right? Refine below."
            : "Generating directions…"
        }
        nextDisabled={!selectedPalette || paletteRegenBusy}
        onNext={next}
        onBack={paletteRegenBusy ? undefined : back}
      >
        {suggestions ? (
          <>
            <PalettePicker
              options={suggestions.palettes}
              selected={selectedPalette ?? undefined}
              onSelect={setSelectedPalette}
              thumbnailsLoading={thumbnailsLoading || paletteRegenBusy}
            />
            <RefineBar
              label="Not quite right? Steer the directions"
              placeholder='e.g. "darker, more cinematic. Less corporate." Or: "warmer, sun-bleached, southwestern."'
              value={paletteNote}
              onChange={setPaletteNote}
              onSubmit={regeneratePalettes}
              busy={paletteRegenBusy}
              error={paletteRegenError}
              ctaLabel="Regenerate directions"
              hint="⌘/Ctrl + Enter to submit · regenerates all three directions and their thumbnails"
            />
          </>
        ) : (
          <div className="text-ash font-mono text-sm">Loading…</div>
        )}
      </StepShell>
    );
  }

  // ---------- step 7 — typography (with refinement) ----------
  if (step === 7) {
    return (
      <StepShell
        flowLabel="Campaign"
        step={7}
        total={TOTAL}
        eyebrow="07 — typography"
        title={
          <>
            Pair the
            <br />
            <span className="italic text-spark">letters.</span>
          </>
        }
        subtitle="Display + body. Currently-available Google Fonts only. Refine below if these don't fit."
        nextDisabled={!selectedType || typeRegenBusy}
        onNext={next}
        onBack={typeRegenBusy ? undefined : back}
      >
        {suggestions ? (
          <>
            <TypePicker
              options={suggestions.typography}
              selected={selectedType ?? undefined}
              onSelect={setSelectedType}
            />
            <RefineBar
              label="Want different type? Steer the pairings"
              placeholder='e.g. "more editorial serif feel, magazine-style." Or: "cleaner geometric sans, no serifs anywhere."'
              value={typeNote}
              onChange={setTypeNote}
              onSubmit={regenerateTypography}
              busy={typeRegenBusy}
              error={typeRegenError}
              ctaLabel="Regenerate typography"
              hint="⌘/Ctrl + Enter to submit · returns three fresh pairings"
            />
          </>
        ) : (
          <div className="text-ash font-mono text-sm">Loading…</div>
        )}
      </StepShell>
    );
  }

  // ---------- step 8 — channels ----------
  if (step === 8) {
    return (
      <StepShell
        flowLabel="Campaign"
        step={8}
        total={TOTAL}
        eyebrow="08 — channels"
        title={
          <>
            Where does it
            <br />
            <span className="italic text-spark">live?</span>
          </>
        }
        subtitle="Pick the channels you'll actually run. We'll generate a channel-specific idea for each."
        nextDisabled={campaign.channels.length === 0}
        onNext={next}
        onBack={back}
      >
        <ChannelPicker
          selected={campaign.channels}
          onToggle={toggleChannel}
        />
      </StepShell>
    );
  }

  // ---------- step 9 — review ----------
  const archLabel = campaign.archetypes
    .map((a) => archetypeByKey(a).name)
    .join(" + ");
  return (
    <StepShell
      flowLabel="Campaign"
      step={9}
      total={TOTAL}
      eyebrow="09 — review & generate"
      title={
        <>
          Ready to
          <br />
          <span className="italic text-spark">launch.</span>
        </>
      }
      subtitle={
        campaign.logoDataUrl
          ? "We'll composite your logo onto every generated visual using Nano Banana 2's image editing mode."
          : "Heads up — no logo uploaded. Visuals will be generated without your mark."
      }
      onNext={finalize}
      onBack={back}
      nextLabel={busy ? "Generating bento…" : "Generate bento →"}
      busy={busy}
    >
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
        <SummaryRow label="Language" value={campaign.outputLanguage.toUpperCase()} />
        <SummaryRow label="Brand" value={campaign.brandName} />
        <SummaryRow label="Campaign" value={campaign.campaignName} />
        <SummaryRow label="Purpose" value={campaign.campaignPurpose} />
        <SummaryRow label="Story" value={campaign.campaignStory} />
        <SummaryRow label="Target" value={campaign.targetMarket} />
        <SummaryRow label="Archetypes" value={archLabel} />
        <SummaryRow
          label="Tone"
          value={campaign.toneKeywords.join(", ") || "—"}
        />
        <SummaryRow
          label="Channels"
          value={campaign.channels.join(", ") || "—"}
        />
        <SummaryRow
          label="Palette"
          value={selectedPalette?.name ?? "—"}
          swatches={selectedPalette?.hexes}
        />
        <SummaryRow
          label="Type"
          value={
            selectedType
              ? `${selectedType.display} / ${selectedType.body}`
              : "—"
          }
        />
      </div>
      {genError && (
        <div
          role="alert"
          className="mt-10 max-w-4xl border border-ember/40 bg-ember/5 p-4"
        >
          <p className="font-mono text-xs text-ember tracking-wide">
            {genError}
          </p>
          <p className="font-mono text-[10px] text-ash mt-2">
            Click Generate bento again to retry.
          </p>
        </div>
      )}
    </StepShell>
  );
}

function SummaryRow({
  label,
  value,
  swatches,
}: {
  label: string;
  value: string;
  swatches?: string[];
}) {
  return (
    <div className="border-t border-steel pt-4">
      <p className="eyebrow mb-2">{label}</p>
      <p className="text-bone text-lg leading-snug">{value || "—"}</p>
      {swatches && (
        <div className="flex gap-1 mt-3">
          {swatches.map((h) => (
            <div
              key={h}
              className="w-8 h-8 border border-steel"
              style={{ background: h }}
              title={h}
            />
          ))}
        </div>
      )}
    </div>
  );
}
