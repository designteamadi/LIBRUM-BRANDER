"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import Bento from "@/components/Bento";
import { useBRND } from "@/lib/store";
import { archetypeByKey } from "@/lib/archetypes";
import { languageNative } from "@/lib/languages";
import {
  downloadBrandPlaybook,
  downloadCampaignPlaybook,
} from "@/lib/playbook";
import type { MediaChannel } from "@/lib/types";

type Tab = "summary" | "visuals" | "brandbook" | "export";

export default function ResultPage() {
  const router = useRouter();
  const {
    generatedBrand,
    generatedCampaign,
    mode,
    reset,
    updateBrandMockup,
    updateBrandCover,
    updateBrandDontExamples,
    updateCampaignMockup,
    updateCampaignCover,
  } = useBRND();
  const [tab, setTab] = useState<Tab>("visuals");
  const [hydrated, setHydrated] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  /**
   * Background generation status for the playbook-only assets (cover
   * image + 6 logo "Don't" examples). These aren't needed for the bento
   * itself — only for the downloadable PDF — so we generate them
   * silently after the user lands on /result. The Download button
   * shows a subtle "preparing playbook…" hint while this is in flight.
   */
  const [playbookAssetsReady, setPlaybookAssetsReady] = useState(false);
  // Ensures we only kick off background generation once per mount, even
  // if React re-runs the effect (StrictMode, props change, etc.).
  const backgroundStartedRef = useRef(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!generatedBrand && !generatedCampaign) {
      router.replace("/");
    }
  }, [hydrated, generatedBrand, generatedCampaign, router]);

  /**
   * Background generation of playbook-only assets. Fires once when the
   * user lands on /result with a finished generation. The user can browse
   * their bento immediately while these stream in behind the scenes;
   * by the time they click "Download playbook" they're usually ready.
   */
  useEffect(() => {
    if (!hydrated) return;
    if (backgroundStartedRef.current) return;
    if (!generatedBrand && !generatedCampaign) return;
    backgroundStartedRef.current = true;

    const run = async () => {
      // eslint-disable-next-line no-console
      console.log("[result] background playbook-asset generation started");

      const buildImageReq = (
        prompt: string,
        aspectRatio: string,
        inputImages?: string[]
      ) =>
        fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, aspectRatio, inputImages }),
        })
          .then((r) => r.json())
          .catch(() => ({ dataUrl: undefined }));

      if (generatedBrand) {
        const b = generatedBrand;
        const coverPrompt = `Editorial brand book cover photograph for "${b.input.businessName}", a ${b.input.industry || "modern"} brand.
Brand essence: ${b.input.description || b.input.mission || "considered, deliberate, specific"}
Archetypes: ${b.input.archetypes.join(", ")}.
Tone: ${b.input.toneKeywords.join(", ") || "honest, deliberate"}.
Visual direction: ${b.selectedPalette.name} — ${b.selectedPalette.rationale || ""}.
Color palette to evoke: ${b.selectedPalette.hexes.join(", ")}.

Style: cinematic, museum-quality editorial photograph. Should feel like the hero spread on a $50 designer brand-identity manual. Sophisticated composition — atmospheric macro photography, abstract material textures, OR a single hero conceptual shot.
Strictly NO text, NO logos, NO words, NO letters, NO type of any kind. Just atmospheric imagery.
Avoid stock photo look. Avoid generic minimalism. Texture, depth, strong point of view.
Aspect ratio: 3:2 landscape.`;

        const logo = b.logoImageDataUrl;
        const dontPrompts = logo
          ? [
              "Edit the provided logo: stretch it horizontally to roughly 2× its natural width while compressing its height. Center on a plain dark charcoal background. No text, no labels, no annotations — just the distorted logo as a single image.",
              "Edit the provided logo: rotate it 25 degrees clockwise so it sits at an angle. Center on a plain dark charcoal background. No text, no labels, no annotations — just the rotated logo.",
              "Edit the provided logo: recolor it with clashing rainbow gradient colors that conflict with the original palette. Center on a plain dark charcoal background. No text, no labels — just the recolored logo.",
              "Edit the provided logo: add a thick neon-green outline stroke and a heavy harsh drop shadow around it. Center on a plain dark charcoal background. No text, no labels — just the outlined logo.",
              "Edit the provided logo: surround it with crowded text snippets, icons, and graphic elements pressing tightly against its edges — clearly violating clear-space rules. Plain dark charcoal background. No annotations.",
              "Edit the provided logo: fill its interior shapes with a busy floral/leopard-print pattern texture so the silhouette is broken. Center on a plain dark charcoal background. No text, no labels — just the patterned logo.",
            ]
          : [];

        // Cover + all 6 don't examples in parallel.
        const [coverRes, dontRes] = await Promise.all([
          buildImageReq(coverPrompt, "3:2"),
          Promise.all(
            dontPrompts.map((p) =>
              buildImageReq(p, "1:1", logo ? [logo] : undefined)
            )
          ),
        ]);
        if (coverRes?.dataUrl) updateBrandCover(coverRes.dataUrl);
        if (dontRes.length > 0)
          updateBrandDontExamples(dontRes.map((r) => r?.dataUrl));
        // eslint-disable-next-line no-console
        console.log("[result] brand playbook assets ready", {
          hasCover: Boolean(coverRes?.dataUrl),
          dontCount: dontRes.filter((r) => r?.dataUrl).length,
        });
      } else if (generatedCampaign) {
        const cg = generatedCampaign;
        const coverPrompt = `Editorial campaign book cover photograph for "${cg.input.campaignName || cg.input.brandName}", a campaign for ${cg.input.brandName}.
Campaign story: ${cg.input.campaignStory || cg.input.campaignPurpose || ""}
Target audience: ${cg.input.targetMarket || ""}
Archetypes: ${cg.input.archetypes.join(", ")}.
Tone: ${cg.input.toneKeywords.join(", ") || "honest, deliberate"}.
Visual direction: ${cg.selectedPalette.name} — ${cg.selectedPalette.rationale || ""}.
Color palette to evoke: ${cg.selectedPalette.hexes.join(", ")}.

Style: cinematic, museum-quality editorial photograph. Should feel like the hero spread on a $50 designer campaign manual. Sophisticated composition — atmospheric macro photography, abstract material textures, OR a single hero conceptual shot.
Strictly NO text, NO logos, NO words, NO letters, NO type of any kind. Just atmospheric imagery.
Avoid stock photo look. Texture, depth, strong point of view.
Aspect ratio: 3:2 landscape.`;
        const coverRes = await buildImageReq(coverPrompt, "3:2");
        if (coverRes?.dataUrl) updateCampaignCover(coverRes.dataUrl);
        // eslint-disable-next-line no-console
        console.log("[result] campaign playbook assets ready", {
          hasCover: Boolean(coverRes?.dataUrl),
        });
      }

      setPlaybookAssetsReady(true);
    };

    void run();
    // We intentionally only depend on `hydrated` — the generated objects
    // are captured in the closure and updates from this very effect would
    // otherwise re-trigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!hydrated) return null;

  const g = generatedBrand;
  const c = generatedCampaign;
  const isCampaign = mode === "campaign" && c;
  if (!g && !c) return null;

  // Common derived — with defensive fallbacks for partially-malformed
  // generated data so the page never blanks out on a missing field.
  const name = isCampaign ? c!.input.brandName : g!.input.businessName;
  const archetypes = isCampaign ? c!.input.archetypes : g!.input.archetypes;
  const tone = isCampaign ? c!.input.toneKeywords : g!.input.toneKeywords;
  const palette = (isCampaign ? c!.selectedPalette : g!.selectedPalette) ?? {
    name: "—",
    hexes: ["#0a0a0a", "#c8ff3e", "#f5f0e8", "#ff3e8e"],
    rationale: "",
  };
  const type = (isCampaign ? c!.selectedType : g!.selectedType) ?? {
    display: "serif",
    body: "sans-serif",
    rationale: "",
  };
  const persona = (isCampaign ? c!.persona : g!.persona) ?? {
    name: name,
    description: "",
    traits: [],
  };
  const safeHexes =
    Array.isArray(palette.hexes) && palette.hexes.length >= 3
      ? palette.hexes
      : ["#0a0a0a", "#c8ff3e", "#f5f0e8", "#ff3e8e"];
  const mockups = isCampaign ? c!.mockupImages ?? [] : g!.mockupImages ?? [];
  const mockupPrompts = isCampaign
    ? c!.mockupPrompts ?? []
    : g!.mockupPrompts ?? [];
  const logoForComposite = isCampaign
    ? c!.input.logoDataUrl
    : g!.logoImageDataUrl;
  const tagline = g?.tagline;
  const story = g?.story;
  const patternIdea = g?.patternIdea;
  const headlines = c?.headlines;
  const cta = c?.cta;
  const channelIdeas = c?.channelIdeas;
  const language = isCampaign
    ? c!.input.outputLanguage
    : g!.input.outputLanguage;

  const archLabel = archetypes
    .map((a) => archetypeByKey(a).name)
    .join(" + ");

  const handleRegenMockup = async (idx: number) => {
    const prompt = mockupPrompts[idx];
    if (!prompt) return;
    // Per-slot aspect ratios must match what the initial finalize used,
    // so a regenerated tile arrives in the same shape as the bento expects.
    // Brand:    [0]9:16 [1]1:1 [2]2:3 [3]16:9 [4]4:3 [5]1:1 [6]16:9 [7]1:1
    // Campaign: [0]9:16 [1]1:1 [2]9:16 [3]2:3 [4]1:1 [5]16:9 [6]16:9 [7]1:1
    const brandAspects = ["9:16", "1:1", "2:3", "16:9", "4:3", "1:1", "16:9", "1:1"] as const;
    const campaignAspects = ["9:16", "1:1", "9:16", "2:3", "1:1", "16:9", "16:9", "1:1"] as const;
    const aspectRatio = isCampaign
      ? (campaignAspects[idx] ?? "1:1")
      : (brandAspects[idx] ?? "1:1");
    const body = {
      prompt: logoForComposite
        ? `${prompt}\n\nIMPORTANT: Apply the brand logo from the provided image naturally onto the visible product/surface in this scene — preserve its proportions; match lighting and perspective.`
        : prompt,
      aspectRatio,
      inputImages: logoForComposite ? [logoForComposite] : undefined,
    };
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const { dataUrl } = await res.json();
      if (dataUrl) {
        if (isCampaign) updateCampaignMockup(idx, dataUrl);
        else updateBrandMockup(idx, dataUrl);
      }
    } catch (err) {
      console.error("regen failed", err);
    }
  };

  const handleDownloadPlaybook = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      if (isCampaign && c) {
        await downloadCampaignPlaybook(c);
      } else if (g) {
        await downloadBrandPlaybook(g);
      }
    } catch (err) {
      console.error(err);
      setDownloadError(
        err instanceof Error ? err.message : "Couldn't build the playbook."
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Top bar */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-steel/40 sticky top-0 bg-noir/85 backdrop-blur-md z-30">
        <Link
          href="/"
          className="font-mono text-xs tracking-[0.22em] uppercase link-underline"
        >
          BRND
        </Link>
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-ash">
          {isCampaign ? "Campaign" : "Brand"} · {languageNative(language)} · output
        </div>
        <button
          onClick={() => {
            reset();
            router.push("/");
          }}
          className="font-mono text-[11px] tracking-[0.18em] uppercase text-ash hover:text-bone transition-colors"
        >
          Start over →
        </button>
      </header>

      {/* Title block */}
      <section className="px-8 pt-16 pb-10 max-w-7xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="eyebrow mb-6"
        >
          <span className="text-spark">●</span> Ready ·{" "}
          {isCampaign ? "Campaign" : "Brand"} build complete
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="display text-6xl md:text-8xl mb-4"
        >
          Your {isCampaign ? "campaign" : "brand"} is ready,
          <br />
          <span className="text-spark italic">{name}.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-ash text-lg max-w-2xl"
        >
          {archLabel} · tone: {tone.join(", ") || "—"} · palette:{" "}
          {palette.name}
        </motion.p>

        {/* Top-level download CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <button
            onClick={handleDownloadPlaybook}
            disabled={downloading}
            className="btn"
          >
            {downloading
              ? "Building playbook…"
              : `Download ${isCampaign ? "campaign" : "brand"} playbook ↓`}
          </button>
          <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-ash">
            PDF + all assets · ZIP
          </span>
          {!playbookAssetsReady && !downloading && (
            <span className="font-mono text-[11px] tracking-widest uppercase text-spark animate-pulse">
              · preparing extras…
            </span>
          )}
          {downloadError && (
            <span className="font-mono text-[11px] tracking-widest uppercase text-magenta">
              · {downloadError}
            </span>
          )}
        </motion.div>
      </section>

      {/* Tabs */}
      <section className="px-8 max-w-7xl mx-auto">
        <nav className="tabnav">
          <button
            aria-current={tab === "summary"}
            onClick={() => setTab("summary")}
          >
            Summary
          </button>
          <button
            aria-current={tab === "visuals"}
            onClick={() => setTab("visuals")}
          >
            Visuals
          </button>
          <button
            aria-current={tab === "brandbook"}
            onClick={() => setTab("brandbook")}
          >
            Brand book
          </button>
          <button
            aria-current={tab === "export"}
            onClick={() => setTab("export")}
          >
            Export
          </button>
        </nav>
      </section>

      {/* Content */}
      <section className="px-8 max-w-7xl mx-auto mt-8">
        {tab === "visuals" && (
          <Bento
            kind={isCampaign ? "campaign" : "brand"}
            name={name}
            archetypeLabel={archLabel}
            toneLabel={tone.join(", ") || "—"}
            palette={palette}
            type={type}
            persona={persona}
            tagline={tagline}
            story={story}
            description={
              isCampaign
                ? c?.input.brandDescription
                : g?.input.description
            }
            mockupImages={mockups}
            mockupPrompts={mockupPrompts}
            patternIdea={patternIdea}
            headlines={headlines}
            cta={cta}
            channelIdeas={channelIdeas}
            logoDataUrl={logoForComposite}
            conceptThumbnails={(isCampaign ? c?.palettes : g?.palettes)?.map(
              (p) => p.conceptImageDataUrl
            )}
            onRegenMockup={handleRegenMockup}
          />
        )}

        {tab === "summary" && (
          <div className="grid md:grid-cols-2 gap-10 stagger">
            <DetailBlock label="Name" value={name} />
            <DetailBlock label="Language" value={languageNative(language)} />
            <DetailBlock label="Archetypes" value={archLabel} />
            <DetailBlock label="Tone" value={tone.join(" · ") || "—"} />
            <DetailBlock
              label="Palette"
              value={`${palette.name} — ${palette.rationale}`}
            />
            <DetailBlock
              label="Typography"
              value={`${type.display} / ${type.body} — ${type.rationale}`}
            />
            <DetailBlock
              label="Persona"
              value={`${persona.name} — ${persona.description}`}
            />
            {tagline && <DetailBlock label="Tagline" value={tagline} />}
            {story && <DetailBlock label="Story" value={story} />}
            {patternIdea && <DetailBlock label="Pattern" value={patternIdea} />}
            {cta && <DetailBlock label="Campaign CTA" value={cta} />}
            {headlines && headlines.length > 0 && (
              <DetailBlock
                label="Headlines"
                value={headlines.map((h) => `· ${h}`).join("\n")}
              />
            )}
            {channelIdeas && (
              <DetailBlock
                label="Channel ideas"
                value={Object.entries(channelIdeas)
                  .filter(([, v]) => v && v.length > 0)
                  .map(
                    ([k, v]) =>
                      `${(k as MediaChannel).toUpperCase()} — ${v}`
                  )
                  .join("\n\n")}
              />
            )}
          </div>
        )}

        {tab === "brandbook" && (
          <div className="space-y-8 max-w-3xl">
            <p className="text-ash leading-relaxed">
              A one-glance summary. The full multi-page version with every
              applied visual is in the playbook ZIP.
            </p>
            <div
              className="p-10 rounded-lg"
              style={{
                background: safeHexes[0],
                color: safeHexes[2],
              }}
            >
              <p
                className="eyebrow mb-6"
                style={{ color: safeHexes[1] }}
              >
                {name} · brand book v0.1
              </p>
              <p
                className="text-6xl tracking-tightest mb-6"
                style={{
                  fontFamily: `'${type.display}', serif`,
                  color: safeHexes[2],
                }}
              >
                {tagline ?? cta ?? name}
              </p>
              <p
                className="leading-relaxed max-w-xl"
                style={{
                  fontFamily: `'${type.body}', sans-serif`,
                  color: safeHexes[2],
                  opacity: 0.85,
                }}
              >
                {story ?? persona.description}
              </p>
              <div className="flex gap-2 mt-8">
                {safeHexes.map((h) => (
                  <div
                    key={h}
                    className="w-10 h-10"
                    style={{
                      background: h,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleDownloadPlaybook}
              disabled={downloading}
              className="btn"
            >
              {downloading ? "Building…" : "Download full playbook ↓"}
            </button>
          </div>
        )}

        {tab === "export" && (
          <div className="max-w-2xl space-y-8">
            <div>
              <p className="eyebrow mb-3">Complete playbook</p>
              <p className="text-ash leading-relaxed mb-4">
                PDF + every visual asset + color tokens (CSS & JSON) + typography
                reference + the raw data dump for re-importing later.
              </p>
              <button
                onClick={handleDownloadPlaybook}
                disabled={downloading}
                className="btn"
              >
                {downloading ? "Building…" : "Download playbook ZIP ↓"}
              </button>
            </div>

            <div className="border-t border-steel pt-8">
              <p className="eyebrow mb-3">Raw data only</p>
              <p className="text-ash leading-relaxed mb-4">
                Just the JSON — useful for re-importing into BRND later or
                feeding into other tooling.
              </p>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  const payload = isCampaign ? c! : g!;
                  const blob = new Blob(
                    [JSON.stringify(payload, null, 2)],
                    { type: "application/json" }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${name
                    .toLowerCase()
                    .replace(/\s+/g, "-")}-${
                    isCampaign ? "campaign" : "brand"
                  }.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download JSON ↓
              </button>
            </div>

            <div className="border-t border-steel pt-8">
              <p className="eyebrow mb-3">Print this page</p>
              <p className="text-ash leading-relaxed mb-4">
                For a quick paper copy of the on-screen layout.
              </p>
              <button
                className="btn btn-ghost"
                onClick={() => window.print()}
              >
                Print ↗
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="px-8 mt-16 pt-8 border-t border-steel/40 max-w-7xl mx-auto flex items-center justify-between">
        <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-ash">
          {mockups.filter(Boolean).length + 1} assets · hover any mockup to
          regenerate
        </p>
        <Link
          href={isCampaign ? "/campaign" : "/brand"}
          className="font-mono text-[11px] tracking-[0.18em] uppercase text-spark hover:text-bone transition-colors"
        >
          ← Refine inputs
        </Link>
      </footer>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-steel pt-5">
      <p className="eyebrow mb-3">{label}</p>
      <p className="text-bone leading-relaxed whitespace-pre-line">{value}</p>
    </div>
  );
}
