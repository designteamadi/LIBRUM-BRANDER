"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepShell from "@/components/StepShell";
import ArchetypePoster from "@/components/ArchetypePoster";
import TonePicker from "@/components/TonePicker";
import PalettePicker from "@/components/PalettePicker";
import TypePicker from "@/components/TypePicker";
import ChannelPicker from "@/components/ChannelPicker";
import LanguagePicker from "@/components/LanguagePicker";
import { useBRND } from "@/lib/store";
import { archetypeByKey } from "@/lib/archetypes";
import type {
  ColorPalette,
  TypePairing,
  Persona,
  GeneratedCampaign,
  MediaChannel,
  EssenceItem,
} from "@/lib/types";

const TOTAL = 9;

type Suggestions = {
  palettes: ColorPalette[];
  typography: TypePairing[];
  headlines: string[];
  cta: string;
  channelIdeas: Record<MediaChannel, string>;
  essence: EssenceItem[];
  iconLabels: string[];
  conceptThumbnailPrompts: string[];
  mockupPrompts: string[];
  moodboardPrompts: string[];
};

export default function CampaignFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [live, setLive] = useState(false);
  const [thumbnailsLoading, setThumbnailsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<TypePairing | null>(null);

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

  const fetchSuggestions = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/reason", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "campaign-suggestions", input: campaign }),
      });
      const json = (await res.json()) as { data: Suggestions; mocked: boolean };
      setSuggestions(json.data);
      setLive(!json.mocked);
      setSelectedPalette(json.data.palettes?.[0] ?? null);
      setSelectedType(json.data.typography?.[0] ?? null);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!suggestions || !suggestions.conceptThumbnailPrompts) return;
    if (suggestions.palettes.every((p) => p.conceptImageDataUrl)) return;

    const needsThumb = suggestions.palettes
      .map((p, i) => ({ p, i }))
      .filter((x) => !x.p.conceptImageDataUrl);
    if (needsThumb.length === 0) return;

    setThumbnailsLoading(true);
    Promise.all(
      needsThumb.map(({ i }) => {
        const prompt = suggestions.conceptThumbnailPrompts[i];
        if (!prompt) return Promise.resolve({ dataUrl: undefined });
        return fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, aspectRatio: "4:3" }),
        })
          .then((r) => r.json())
          .catch(() => ({ dataUrl: undefined }));
      })
    )
      .then((results) => {
        setSuggestions((prev) => {
          if (!prev) return prev;
          const palettes = [...prev.palettes];
          needsThumb.forEach(({ i }, k) => {
            palettes[i] = {
              ...palettes[i],
              conceptImageDataUrl:
                results[k]?.dataUrl ?? palettes[i].conceptImageDataUrl,
            };
          });
          return { ...prev, palettes };
        });
      })
      .finally(() => setThumbnailsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestions?.palettes.length, suggestions?.conceptThumbnailPrompts?.join("|")]);

  const handleLoadMore = async () => {
    if (!suggestions) return;
    setLoadingMore(true);
    try {
      const res = await fetch("/api/reason", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "more-campaign-palettes",
          input: campaign,
          existing: suggestions.palettes,
        }),
      });
      const json = await res.json();
      const more: {
        palettes: ColorPalette[];
        conceptThumbnailPrompts: string[];
      } = json.data;
      setSuggestions((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          palettes: [...prev.palettes, ...more.palettes],
          conceptThumbnailPrompts: [
            ...prev.conceptThumbnailPrompts,
            ...more.conceptThumbnailPrompts,
          ],
        };
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const finalize = async () => {
    if (!selectedPalette || !selectedType || !suggestions) return;
    setBusy(true);
    setMode("campaign");
    try {
      const personaRes = await fetch("/api/reason", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "campaign-persona",
          input: campaign,
          palette: selectedPalette,
        }),
      });
      const personaJson = await personaRes.json();
      const persona = personaJson.data as Persona;

      const mockupPrompts = (suggestions.mockupPrompts || []).slice(0, 3);
      const moodPrompts = (suggestions.moodboardPrompts || []).slice(0, 6);
      const userLogo = campaign.logoDataUrl;

      const [mockResults, moodResults] = await Promise.all([
        Promise.all(
          mockupPrompts.map((p, i) =>
            fetch("/api/image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: userLogo
                  ? `${p}\n\nIMPORTANT: Apply the brand logo from the provided image naturally onto the visible product/surface/sign in this scene — preserve its proportions; match the lighting and perspective.`
                  : p,
                aspectRatio: i === 0 ? "4:5" : "1:1",
                inputImages: userLogo ? [userLogo] : undefined,
              }),
            }).then((r) => r.json())
          )
        ),
        Promise.all(
          moodPrompts.map((p) =>
            fetch("/api/image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: p, aspectRatio: "1:1" }),
            }).then((r) => r.json())
          )
        ),
      ]);

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
        essence: suggestions.essence ?? [],
        iconLabels: suggestions.iconLabels ?? [],
        mockupPrompts,
        mockupImages: mockResults.map((r) => r?.dataUrl),
        moodboardPrompts: moodPrompts,
        moodboardImages: moodResults.map((r) => r?.dataUrl),
        live,
      };
      setGeneratedCampaign(generated);
      router.push("/result");
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

  // ---------- step 5 — archetype (POSTER) + tone ----------
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
          await fetchSuggestions();
          next();
        }}
        onBack={back}
        busy={busy}
        nextLabel={busy ? "Reasoning…" : "Continue"}
      >
        <div className="space-y-14">
          <ArchetypePoster
            selected={campaign.archetypes}
            onToggle={toggleCampaignArchetype}
          />
          <div className="border-t border-steel pt-10">
            <TonePicker
              selected={campaign.toneKeywords}
              onToggle={toggleCampaignTone}
            />
          </div>
        </div>
      </StepShell>
    );
  }

  // ---------- step 6 — palette ----------
  if (step === 6) {
    return (
      <StepShell
        flowLabel="Campaign"
        step={6}
        total={TOTAL}
        eyebrow="06 — direction & palette"
        title={
          <>
            Pick a
            <br />
            <span className="italic text-spark">direction.</span>
          </>
        }
        subtitle={
          suggestions
            ? "Concept thumbnails on the left, descriptions on the right. Hit 'More' for additional palette directions."
            : "Generating directions…"
        }
        nextDisabled={!selectedPalette}
        onNext={next}
        onBack={back}
      >
        {suggestions ? (
          <PalettePicker
            options={suggestions.palettes}
            selected={selectedPalette ?? undefined}
            onSelect={setSelectedPalette}
            thumbnailsLoading={thumbnailsLoading}
            onLoadMore={handleLoadMore}
            loadingMore={loadingMore}
          />
        ) : (
          <div className="text-ash font-mono text-sm">Loading…</div>
        )}
      </StepShell>
    );
  }

  // ---------- step 7 — typography ----------
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
        subtitle="Display + body. Currently-available Google Fonts only."
        nextDisabled={!selectedType}
        onNext={next}
        onBack={back}
      >
        {suggestions ? (
          <TypePicker
            options={suggestions.typography}
            selected={selectedType ?? undefined}
            onSelect={setSelectedType}
          />
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
          ? "We'll composite your logo onto every mockup, then render the full moodboard. Around 10 Nano Banana calls in parallel."
          : "Heads up — no logo uploaded. Visuals will be generated without your mark."
      }
      onNext={finalize}
      onBack={back}
      nextLabel={busy ? "Generating bento…" : "Generate bento →"}
      busy={busy}
    >
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
        <SummaryRow
          label="Language"
          value={campaign.outputLanguage.toUpperCase()}
        />
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
      <div className="mt-10 max-w-2xl">
        <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-ash">
          gemini mode:{" "}
          <span className={live ? "text-spark" : "text-magenta"}>
            ● {live ? "live API" : "mock — set GEMINI_API_KEY"}
          </span>
        </p>
      </div>
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
