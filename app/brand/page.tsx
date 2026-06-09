"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import StepShell from "@/components/StepShell";
import ArchetypePicker from "@/components/ArchetypePicker";
import TonePicker from "@/components/TonePicker";
import LogoStylePicker from "@/components/LogoStylePicker";
import LanguagePicker from "@/components/LanguagePicker";
import PalettePicker from "@/components/PalettePicker";
import TypePicker from "@/components/TypePicker";
import RefineBar from "@/components/RefineBar";
import { useBRND } from "@/lib/store";
import { archetypeByKey } from "@/lib/archetypes";
import { logoVariantEditPrompts } from "@/lib/prompts";
import type {
  ColorPalette,
  TypePairing,
  Persona,
  GeneratedBrand,
} from "@/lib/types";

const TOTAL = 8;

type Suggestions = {
  palettes: ColorPalette[];
  typography: TypePairing[];
  taglines: string[];
  story: string;
  patternIdea: string;
  conceptThumbnailPrompts: string[];
  mockupPrompts: string[];
  mockupDescriptions?: string[];
};

export default function BrandFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [thumbnailsLoading, setThumbnailsLoading] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<TypePairing | null>(null);

  // User-visible error from a failing /api/reason call. Cleared at the
  // start of each new fetch. Surfaced inline on the step that triggered it.
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

  // Monotonically-increasing counter used to detect stale async operations.
  // Every fetchSuggestions / regeneratePalettes / regenerateTypography
  // call increments this and captures its sequence number. When the call
  // returns, it bails if the counter has moved on (meaning a newer op has
  // started and the response would clobber fresh state).
  const opSeqRef = useRef(0);

  const {
    brand,
    setBrand,
    toggleBrandArchetype,
    toggleBrandTone,
    setLogoStyle,
    setBrandLanguage,
    setMode,
    setGeneratedBrand,
  } = useBRND();

  const next = () => setStep((s) => Math.min(TOTAL, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  // Fetch the initial creative suggestions on the way into step 6.
  // Returns true on success so the caller can decide whether to advance.
  const fetchSuggestions = async (): Promise<boolean> => {
    const seq = ++opSeqRef.current;
    setBusy(true);
    setGenError(null);
    try {
      const res = await fetch("/api/reason", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "brand-suggestions", input: brand }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = (await res.json()) as {
        data?: Suggestions;
        error?: string;
      };
      // If a newer op has started while we waited, drop this result.
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

  // Concept-thumbnail generation. Stale-result guarded both by the
  // expectedKey check (prompts changed mid-flight) and by the fact that
  // setSuggestions(prev => ...) reads the latest state synchronously.
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

  // ---------- Regenerate palettes & directions (step 6) ----------
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
          kind: "brand-palettes",
          input: brand,
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
      // Strip any thumbnails from incoming palettes so the existing useEffect
      // will fetch fresh ones for the new directions.
      const fresh = palettes.map((p) => ({
        ...p,
        conceptImageDataUrl: undefined,
      }));
      // If Gemini omitted conceptThumbnailPrompts (or returned a wrong-length
      // array), synthesize fallback prompts from the new palette names. This
      // GUARANTEES the thumbnail useEffect's dependency changes so new
      // thumbnails are fetched — without this, the new palettes would show
      // "preview unavailable" forever.
      const safePrompts =
        conceptThumbnailPrompts &&
        conceptThumbnailPrompts.length === fresh.length
          ? conceptThumbnailPrompts
          : fresh.map(
              (p) =>
                `Cinematic editorial hero composition representing ${brand.businessName} in the ${p.name} direction — ${p.rationale}`
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

  // ---------- Regenerate typography (step 7) ----------
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
          kind: "brand-typography",
          input: brand,
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

  // Generate the persona, logo, and mockups, then go to /result.
  // Surfaces failures inline instead of silently swallowing them.
  const finalize = async () => {
    if (!selectedPalette || !selectedType || !suggestions) return;
    setBusy(true);
    setGenError(null);
    setMode("brand");
    // eslint-disable-next-line no-console
    console.log("[finalize] start", {
      businessName: brand.businessName,
      palette: selectedPalette.name,
      type: `${selectedType.display}/${selectedType.body}`,
    });
    try {
      // -------- Stage 1 (parallel, no inter-deps): persona + logo --------
      // The persona is text (fast); the logo is an image (slow). They have
      // no dependencies on each other so we kick both off together.
      const logoPrompt = `Studio brand logo for "${brand.businessName}". Style: ${brand.logoStyle}. ${brand.logoPrompt}. Clean, modern, on a plain background, suitable as a brand mark. Premium feel.`;

      const [personaRes, logoRes] = await Promise.all([
        fetch("/api/reason", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "brand-persona",
            input: brand,
            palette: selectedPalette,
          }),
        }),
        fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: logoPrompt, aspectRatio: "1:1" }),
        })
          .then((r) => r.json())
          .catch(() => ({ dataUrl: undefined })),
      ]);

      if (!personaRes.ok) {
        throw new Error(`Persona service returned ${personaRes.status}`);
      }
      const personaJson = (await personaRes.json()) as {
        data?: Partial<Persona>;
        error?: string;
      };
      // Persona must have name + description + traits[] for the Bento to
      // render without crashing. If ANY field is missing or malformed,
      // synthesize a fallback from the brand inputs rather than throw —
      // we'd rather ship an imperfect persona than fail to render the result.
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
            name: brand.businessName || "The Brand",
            description:
              brand.description ||
              brand.mission ||
              `A brand built around ${brand.toneKeywords.join(", ") || "honest craft"}.`,
            traits:
              brand.toneKeywords.length > 0
                ? brand.toneKeywords.slice(0, 5)
                : ["considered", "deliberate", "honest", "warm", "specific"],
          };
      if (!validPersona) {
        // eslint-disable-next-line no-console
        console.warn(
          "[finalize] persona response was malformed; using synthetic fallback",
          { received: personaJson }
        );
      }

      // -------- Stage 2 (parallel, depends on logo): 6 categorized mockups
      //   slot 0: HERO         9:16
      //   slot 0: HERO          9:16
      //   slot 1: SOCIAL        1:1
      //   slot 2: POSTER        2:3
      //   slot 3: OOH/BILLBOARD 16:9
      //   slot 4: COLLATERAL    4:3
      //   slot 5: PHOTOGRAPHY   1:1
      //   slot 6: EDITORIAL BANNER 16:9   (new — wide marquee web/print banner)
      //   slot 7: BRAND ENVIRONMENT 1:1   (new — retail/space/packaging in-context)
      // The aspect ratios are matched to the AI's prompt categories so
      // each mockup arrives in the shape the bento expects.
      const mockupPrompts = (suggestions.mockupPrompts || []).slice(0, 8);
      const logoForComposite = logoRes?.dataUrl;
      const MOCKUP_ASPECTS = ["9:16", "1:1", "2:3", "16:9", "4:3", "1:1", "16:9", "1:1"];

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
            inputImages:
              withLogo && logoForComposite ? [logoForComposite] : undefined,
          }),
        })
          .then((r) => r.json())
          .catch(() => ({ dataUrl: undefined }));

      const mockupResults = await Promise.all(
        mockupPrompts.map((p, i) =>
          buildImageReq(
            logoForComposite
              ? `${p}\n\nIMPORTANT: Apply the brand logo from the provided image naturally onto the visible product/surface/sign in this scene — preserve its proportions; match the lighting and perspective.`
              : p,
            MOCKUP_ASPECTS[i] || "1:1",
            Boolean(logoForComposite)
          )
        )
      );

      // Real logo variants (primary·dark, inverted·light, accent, monochrome)
      // — generated by editing the logo, not by re-tinting one image.
      const logoVariants: (string | undefined)[] = logoForComposite
        ? (
            await Promise.all(
              logoVariantEditPrompts(selectedPalette.hexes ?? []).map((p) =>
                buildImageReq(p, "1:1", true)
              )
            )
          ).map((r) => r?.dataUrl)
        : [];

      const generated: GeneratedBrand = {
        input: brand,
        logoImageDataUrl: logoRes?.dataUrl,
        logoPrompt,
        palettes: suggestions.palettes,
        selectedPalette,
        typography: suggestions.typography,
        selectedType,
        persona,
        tagline: suggestions.taglines?.[0] ?? "",
        story: suggestions.story ?? "",
        patternIdea: suggestions.patternIdea ?? "",
        mockupPrompts,
        mockupImages: mockupResults.map((r) => r?.dataUrl),
        mockupDescriptions: (suggestions.mockupDescriptions || []).slice(0, 8),
        logoVariants,
        // coverImageDataUrl + logoDontExamples are deliberately omitted.
        // They get filled in by background-generation effects on /result.
      };
      setGeneratedBrand(generated);
      // eslint-disable-next-line no-console
      console.log("[finalize] success → /result", {
        mockupCount: mockupResults.filter((r) => r?.dataUrl).length,
        hasLogo: Boolean(logoRes?.dataUrl),
        usedSyntheticPersona: !validPersona,
      });
      router.push("/result");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[finalize] failed", e);
      setGenError(
        e instanceof Error
          ? `Couldn't finish generating — ${e.message}`
          : "Couldn't finish generating"
      );
    } finally {
      setBusy(false);
    }
  };

  // ---------- step 1 — language ----------
  if (step === 1) {
    return (
      <StepShell
        flowLabel="Brand"
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
        subtitle="Taglines, headlines, story, persona — everything written, generated in your language."
        onNext={next}
      >
        <LanguagePicker
          value={brand.outputLanguage}
          onChange={setBrandLanguage}
        />
      </StepShell>
    );
  }

  // ---------- step 2 — basics ----------
  if (step === 2) {
    const valid =
      brand.businessName.trim() &&
      brand.industry.trim() &&
      brand.description.trim();
    return (
      <StepShell
        flowLabel="Brand"
        step={2}
        total={TOTAL}
        eyebrow="02 — business basics"
        title={
          <>
            What are we
            <br />
            <span className="italic text-spark">building?</span>
          </>
        }
        subtitle="Plain words beat clever ones — the model reasons better from honest inputs."
        nextDisabled={!valid}
        onNext={next}
        onBack={back}
      >
        <div className="space-y-10 max-w-2xl">
          <div>
            <p className="eyebrow mb-3">Business name</p>
            <input
              className="field"
              value={brand.businessName}
              onChange={(e) => setBrand({ businessName: e.target.value })}
              placeholder="Roam"
              autoFocus
            />
          </div>
          <div>
            <p className="eyebrow mb-3">Industry</p>
            <input
              className="field field-sm"
              value={brand.industry}
              onChange={(e) => setBrand({ industry: e.target.value })}
              placeholder="Outdoor gear · Hospitality · Fintech · …"
            />
          </div>
          <div>
            <p className="eyebrow mb-3">What does the business do?</p>
            <textarea
              className="field field-sm"
              value={brand.description}
              onChange={(e) => setBrand({ description: e.target.value })}
              placeholder="One or two sentences. What you make, who it's for."
              rows={3}
            />
          </div>
        </div>
      </StepShell>
    );
  }

  // ---------- step 3 — audience & mission ----------
  if (step === 3) {
    const valid = brand.targetAudience.trim() && brand.mission.trim();
    return (
      <StepShell
        flowLabel="Brand"
        step={3}
        total={TOTAL}
        eyebrow="03 — audience & mission"
        title={
          <>
            Who is it
            <br />
            <span className="italic text-spark">for?</span>
          </>
        }
        subtitle="Specifics over demographics."
        nextDisabled={!valid}
        onNext={next}
        onBack={back}
      >
        <div className="space-y-10 max-w-2xl">
          <div>
            <p className="eyebrow mb-3">Target audience</p>
            <textarea
              className="field field-sm"
              value={brand.targetAudience}
              onChange={(e) => setBrand({ targetAudience: e.target.value })}
              placeholder="Be specific. What do they already love, hate, want?"
              rows={3}
            />
          </div>
          <div>
            <p className="eyebrow mb-3">Mission — why does this exist?</p>
            <textarea
              className="field field-sm"
              value={brand.mission}
              onChange={(e) => setBrand({ mission: e.target.value })}
              placeholder="The thing the world is missing that this fixes."
              rows={3}
            />
          </div>
        </div>
      </StepShell>
    );
  }

  // ---------- step 4 — archetype & tone ----------
  if (step === 4) {
    return (
      <StepShell
        flowLabel="Brand"
        step={4}
        total={TOTAL}
        eyebrow="04 — archetype & voice"
        title={
          <>
            How does it
            <br />
            <span className="italic text-spark">speak?</span>
          </>
        }
        subtitle="Pick your archetype mix (one or two), then add tone words."
        nextDisabled={brand.archetypes.length === 0}
        onNext={next}
        onBack={back}
      >
        <div className="space-y-12">
          <ArchetypePicker
            selected={brand.archetypes}
            onToggle={toggleBrandArchetype}
          />
          <div className="border-t border-steel pt-8">
            <TonePicker
              selected={brand.toneKeywords}
              onToggle={toggleBrandTone}
            />
          </div>
        </div>
      </StepShell>
    );
  }

  // ---------- step 5 — logo ----------
  if (step === 5) {
    const valid = brand.logoPrompt.trim().length > 5;
    return (
      <StepShell
        flowLabel="Brand"
        step={5}
        total={TOTAL}
        eyebrow="05 — logo direction"
        title={
          <>
            What should the
            <br />
            <span className="italic text-spark">mark</span> look like?
          </>
        }
        subtitle="Pick a logo type, then describe the feeling. Nano Banana 2 takes it from there."
        nextDisabled={!valid}
        onNext={async () => {
          const ok = await fetchSuggestions();
          if (ok) next();
          // On failure, genError state is set and surfaced below. The
          // user stays on step 5 so they can retry by clicking Continue
          // again (or adjust their inputs).
        }}
        onBack={back}
        busy={busy}
        nextLabel={busy ? "Reasoning…" : "Continue"}
      >
        <div className="space-y-10">
          <LogoStylePicker
            selected={brand.logoStyle}
            onSelect={setLogoStyle}
          />
          <div>
            <p className="eyebrow mb-3">Describe the look</p>
            <textarea
              className="field field-sm"
              value={brand.logoPrompt}
              onChange={(e) => setBrand({ logoPrompt: e.target.value })}
              placeholder="Sharp, minimal, a single geometric peak. No serifs. Charcoal on bone."
              rows={3}
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

  // ---------- step 6 — palette + concept thumbnails (with refinement) ----------
  if (step === 6) {
    return (
      <StepShell
        flowLabel="Brand"
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
            ? "Each direction comes with a generated concept thumbnail so you can see the mood before committing. Not quite right? Refine below."
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
              placeholder='e.g. "darker, more editorial. Less neon, more bone-and-iron." Or: "warmer, sun-bleached, southwestern."'
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
        flowLabel="Brand"
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

  // ---------- step 8 — review & generate ----------
  const archLabel = brand.archetypes
    .map((a) => archetypeByKey(a).name)
    .join(" + ");
  return (
    <StepShell
      flowLabel="Brand"
      step={8}
      total={TOTAL}
      eyebrow="08 — review & generate"
      title={
        <>
          Ready to
          <br />
          <span className="italic text-spark">build.</span>
        </>
      }
      subtitle="We'll generate the logo first, then composite it onto your mockups so the brand applies consistently."
      onNext={finalize}
      onBack={back}
      nextLabel={busy ? "Generating bento…" : "Generate bento →"}
      busy={busy}
    >
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
        <SummaryRow label="Language" value={brand.outputLanguage.toUpperCase()} />
        <SummaryRow label="Name" value={brand.businessName} />
        <SummaryRow label="Industry" value={brand.industry} />
        <SummaryRow label="Audience" value={brand.targetAudience} />
        <SummaryRow label="Mission" value={brand.mission} />
        <SummaryRow label="Archetypes" value={archLabel} />
        <SummaryRow
          label="Tone"
          value={brand.toneKeywords.join(", ") || "—"}
        />
        <SummaryRow label="Logo style" value={brand.logoStyle} />
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
