"use client";
import { useState } from "react";
import { motion } from "motion/react";
import type {
  ColorPalette,
  TypePairing,
  Persona,
  MediaChannel,
  CampaignPlacementTile,
} from "@/lib/types";
import {
  EyebrowTag,
  AccentHeadline,
  CTASticker,
  SpeechBubble,
  GhostWordmark,
  MetaRow,
  contrast,
} from "@/components/panels";

type Props = {
  kind: "brand" | "campaign";
  name: string;
  archetypeLabel: string;
  toneLabel: string;
  palette: ColorPalette;
  type: TypePairing;
  persona: Persona;
  tagline?: string;
  story?: string;
  description?: string;
  mockupImages: (string | undefined)[];
  mockupPrompts: string[];
  /** Per-applied-surface case-study copy (brand). */
  mockupDescriptions?: string[];
  /** Channel-driven placement descriptors (campaign). */
  placements?: CampaignPlacementTile[];
  /** Kept for backwards compatibility; pattern visualization removed. */
  patternIdea?: string;
  headlines?: string[];
  cta?: string;
  channelIdeas?: Partial<Record<MediaChannel, string>>;
  /** Parent brand logo (brand: the mark; campaign: the endorsing "for X" logo). */
  logoDataUrl?: string;
  /** Campaign's own generated title logo. */
  campaignLogoDataUrl?: string;
  conceptThumbnails?: (string | undefined)[];
  onRegenMockup?: (idx: number) => Promise<void>;
};

/**
 * The elevated brand/campaign bento.
 *
 * BRAND  — a complete visualization of the brand AS A SYSTEM: identity
 *          primitives (logo, color, type, persona) plus an elevated applied
 *          gallery where every surface tile is a designed composition carrying
 *          its own case-study caption, and a deployment tile on how marketing
 *          runs the system.
 *
 * CAMPAIGN — a complete visualization of how the campaign SHOWS UP ACROSS
 *          MEDIA PLACEMENTS: its own title logo + spine specs, then one
 *          designed tile per selected channel (Location / Context / hook /
 *          CTA), going deep when few channels are picked and wide when many.
 *
 * Built defensively: every field access uses optional chaining + fallbacks so
 * a malformed AI response can never crash the page.
 */
export default function Bento(props: Props) {
  const {
    kind,
    name,
    archetypeLabel,
    toneLabel,
    palette,
    type,
    persona,
    tagline,
    story,
    description,
    mockupImages,
    mockupDescriptions,
    placements,
    headlines,
    cta,
    channelIdeas,
    logoDataUrl,
    campaignLogoDataUrl,
    onRegenMockup,
  } = props;

  const [regenIdx, setRegenIdx] = useState<number | null>(null);
  const handleRegen = async (i: number) => {
    if (!onRegenMockup) return;
    setRegenIdx(i);
    try {
      await onRegenMockup(i);
    } finally {
      setRegenIdx(null);
    }
  };

  // ---------- Safe palette / persona / type defaults ----------
  const hexes = palette?.hexes ?? [];
  const [c0, c1, c2, c3] = [
    hexes[0] || "#0a0a0a",
    hexes[1] || "#c8ff3e",
    hexes[2] || "#f5f0e8",
    hexes[3] || "#ff3e8e",
  ];
  const personaName = persona?.name ?? "—";
  const personaDescription = persona?.description ?? "";
  const personaTraits = Array.isArray(persona?.traits) ? persona!.traits : [];
  const displayFont = type?.display ?? "serif";
  const bodyFont = type?.body ?? "sans-serif";

  const toneList = (toneLabel || "").split(/,\s*/).filter(Boolean);
  const defaults = ["considered", "deliberate", "honest", "specific"];
  const principles: { word: string; descriptor: string; tint: string }[] = [
    { word: toneList[0] ?? defaults[0], descriptor: "How we move.", tint: c1 },
    { word: toneList[1] ?? defaults[1], descriptor: "How we think.", tint: c3 },
    { word: toneList[2] ?? defaults[2], descriptor: "How we speak.", tint: "#1fc9d7" },
    { word: toneList[3] ?? defaults[3], descriptor: "How we ship.", tint: c2 },
  ];

  const tileMotion = (i: number) => ({
    initial: { opacity: 0, y: 18, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: {
      duration: 0.6,
      delay: 0.04 + i * 0.035,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  });

  const gfDisplay = displayFont.replace(/\s+/g, "+");
  const gfBody = bodyFont.replace(/\s+/g, "+");

  // Accent rotation so panels don't all share one accent.
  const accents = [c1, c3, "#1fc9d7", c2];

  return (
    <>
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?family=${gfDisplay}:wght@400;500;700&family=${gfBody}:wght@400;500;600&display=swap`}
      />

      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: "repeat(12, 1fr)",
          gridAutoRows: "minmax(120px, auto)",
          gridAutoFlow: "dense",
        }}
      >
        {/* ============ 01 / HERO LOCKUP ============ */}
        <motion.div
          {...tileMotion(0)}
          className="rounded-lg p-8 md:p-10 flex flex-col justify-between relative overflow-hidden"
          style={{
            background: c0,
            color: c2,
            gridColumn: "span 8",
            gridRow: "span 3",
            minHeight: "420px",
          }}
        >
          {/* Ghost wordmark motif behind the lockup */}
          <GhostWordmark
            text={name}
            color={c2}
            font={displayFont}
            className="absolute -right-6 bottom-0 text-[160px] md:text-[220px]"
            style={{ lineHeight: 0.8 }}
          />
          <svg
            aria-hidden
            className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern id="heroDots" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
                <circle cx="18" cy="18" r="1" fill={c1} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#heroDots)" />
          </svg>

          <div className="relative z-10 flex items-start justify-between">
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: c2, opacity: 0.55 }}>
              {kind} system · v0.1
            </p>
            <div className="flex items-center gap-3">
              {kind === "campaign" && logoDataUrl && (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] tracking-[0.22em] uppercase" style={{ color: c2, opacity: 0.5 }}>
                    for
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoDataUrl} alt="Parent brand" className="h-7 w-auto object-contain" style={{ maxWidth: 80 }} />
                </div>
              )}
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: c1 }}>
                ● ready
              </span>
            </div>
          </div>

          <div className="relative z-10 flex items-end gap-5 md:gap-7">
            {/* Brand: brand logo. Campaign: the campaign's own title logo. */}
            {kind === "brand" && logoDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoDataUrl}
                alt={`${name} logo`}
                className="h-16 md:h-24 w-auto object-contain shrink-0"
                style={{ maxWidth: 120 }}
              />
            )}
            {kind === "campaign" && campaignLogoDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={campaignLogoDataUrl}
                alt={`${name} campaign logo`}
                className="h-20 md:h-28 w-auto object-contain shrink-0"
                style={{ maxWidth: 260 }}
              />
            )}
            {/* When the campaign has its own logo, the name sits as a small
                caption under it; otherwise the typographic name carries the lockup. */}
            {!(kind === "campaign" && campaignLogoDataUrl) && (
              <h2
                className="text-6xl md:text-8xl tracking-tightest leading-none"
                style={{
                  fontFamily: `'${displayFont}', serif`,
                  color: c2,
                  fontWeight: kind === "campaign" ? 700 : 400,
                  letterSpacing: kind === "campaign" ? "-0.02em" : undefined,
                }}
              >
                {name}
                <span style={{ color: c1 }}>.</span>
              </h2>
            )}
          </div>

          <div className="relative z-10 max-w-2xl">
            {kind === "campaign" && campaignLogoDataUrl && (
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: c2, opacity: 0.6 }}>
                {name} · campaign
              </p>
            )}
            {tagline && (
              <p
                className="text-xl md:text-2xl mb-3 leading-snug"
                style={{ fontFamily: `'${displayFont}', serif`, fontStyle: "italic", color: c2 }}
              >
                {tagline}
              </p>
            )}
            {kind === "campaign" && !tagline && headlines?.[0] && (
              <p
                className="text-xl md:text-2xl mb-3 leading-snug"
                style={{ fontFamily: `'${displayFont}', serif`, fontStyle: "italic", color: c2 }}
              >
                {headlines[0]}
              </p>
            )}
            {(description || story) && (
              <p
                className="text-sm md:text-base leading-relaxed opacity-80 max-w-xl"
                style={{ fontFamily: `'${bodyFont}', sans-serif`, color: c2 }}
              >
                {(description || story || "").slice(0, 180)}
                {(description || story || "").length > 180 && "…"}
              </p>
            )}
          </div>
        </motion.div>

        {/* ============ 02 / ESSENCE ============ */}
        <motion.div
          {...tileMotion(1)}
          className="rounded-lg p-6 md:p-7 flex flex-col"
          style={{
            background: "#0d0d0e",
            border: "1px solid #1f2128",
            gridColumn: "span 4",
            gridRow: "span 3",
            minHeight: "420px",
          }}
        >
          <p className="eyebrow mb-5">02 / {kind === "campaign" ? "campaign essence" : "brand essence"}</p>
          <div className="flex-1 space-y-5">
            {principles.map((pr, i) => (
              <div key={i} className="flex items-start gap-4">
                <div
                  className="shrink-0 w-9 h-9 rounded flex items-center justify-center"
                  style={{ background: `${pr.tint}15`, border: `1px solid ${pr.tint}40` }}
                >
                  <PrincipleIcon idx={i} color={pr.tint} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-bone text-base font-medium capitalize leading-tight"
                    style={{ fontFamily: `'${bodyFont}', sans-serif` }}
                  >
                    {pr.word}.
                  </p>
                  <p className="text-ash text-xs leading-snug mt-0.5">{pr.descriptor}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-steel">
            <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-ash">
              Principles · operating tone
            </p>
          </div>
        </motion.div>

        {/* ============ 03 / LOGO SYSTEM ============ */}
        <motion.div
          {...tileMotion(2)}
          className="rounded-lg p-6 md:p-7"
          style={{
            background: "#0d0d0e",
            border: "1px solid #1f2128",
            gridColumn: "span 12",
            gridRow: "span 1",
            minHeight: "220px",
          }}
        >
          <div className="flex items-baseline justify-between mb-4">
            <p className="eyebrow">
              03 / {kind === "campaign" ? "campaign mark · 4 lockup variants" : "logo system · 4 lockup variants"}
            </p>
            <p className="font-mono text-[10px] tracking-widest uppercase text-ash">
              {kind === "campaign" ? "campaign title logo lockup" : "clear space = 1× cap-height of mark"}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 h-[140px]">
            {kind === "campaign" && campaignLogoDataUrl ? (
              <>
                <LogoVariant background={c0} accent={c1} logo={campaignLogoDataUrl} label="primary · dark" />
                <LogoVariant background={c2} accent={c0} logo={campaignLogoDataUrl} label="inverted · light" />
                <LogoVariant background={c1} accent={c0} logo={campaignLogoDataUrl} label="accent" textColor={c0} />
                <LogoVariant background="transparent" accent={c2} logo={campaignLogoDataUrl} label="monochrome" outline />
              </>
            ) : kind === "campaign" || !logoDataUrl ? (
              <>
                <WordmarkVariant background={c0} textColor={c2} accent={c1} text={name} font={displayFont} label="primary · dark" />
                <WordmarkVariant background={c2} textColor={c0} accent={c3} text={name} font={displayFont} label="inverted · light" />
                <WordmarkVariant background={c1} textColor={c0} accent={c0} text={name} font={displayFont} label="accent" />
                <WordmarkVariant background="transparent" textColor={c2} accent={c2} text={name} font={displayFont} label="monochrome" outline />
              </>
            ) : (
              <>
                <LogoVariant background={c0} accent={c1} logo={logoDataUrl} label="primary · dark" />
                <LogoVariant background={c2} accent={c0} logo={logoDataUrl} label="inverted · light" />
                <LogoVariant background={c1} accent={c0} logo={logoDataUrl} label="accent" textColor={c0} />
                <LogoVariant background="transparent" accent={c2} logo={logoDataUrl} label="monochrome" outline />
              </>
            )}
          </div>
        </motion.div>

        {/* ============ 04 / COLOR SYSTEM ============ */}
        <motion.div
          {...tileMotion(3)}
          className="rounded-lg overflow-hidden flex flex-col"
          style={{
            background: "#0d0d0e",
            border: "1px solid #1f2128",
            gridColumn: "span 4",
            gridRow: "span 2",
            minHeight: "300px",
          }}
        >
          <div className="p-6 pb-3">
            <p className="eyebrow">04 / color system</p>
            <p className="text-bone text-lg leading-tight mt-1" style={{ fontFamily: `'${displayFont}', serif` }}>
              {palette?.name ?? "—"}
            </p>
            {palette?.rationale && (
              <p className="text-ash text-xs leading-relaxed mt-1.5 line-clamp-2">{palette.rationale}</p>
            )}
          </div>
          <div className="flex-1 grid grid-cols-2 grid-rows-2 min-h-[160px]">
            <ColorCell hex={c0} role="base" />
            <ColorCell hex={c1} role="accent" />
            <ColorCell hex={c2} role="surface" />
            <ColorCell hex={c3} role="pop" />
          </div>
        </motion.div>

        {/* ============ 05 / TYPOGRAPHY ============ */}
        <motion.div
          {...tileMotion(4)}
          className="rounded-lg p-6 flex flex-col"
          style={{
            background: "#0d0d0e",
            border: "1px solid #1f2128",
            gridColumn: "span 4",
            gridRow: "span 2",
            minHeight: "300px",
          }}
        >
          <p className="eyebrow mb-4">05 / typography</p>
          <div className="flex items-start gap-6 mb-4">
            <p
              className="text-[88px] leading-none tracking-tightest text-bone"
              style={{ fontFamily: `'${displayFont}', serif` }}
            >
              Aa
            </p>
            <div className="flex-1 pt-2">
              <p className="text-bone text-xl leading-tight mb-1" style={{ fontFamily: `'${displayFont}', serif` }}>
                {displayFont}
              </p>
              <p className="text-ash text-xs leading-relaxed" style={{ fontFamily: `'${bodyFont}', sans-serif` }}>
                Display · headlines, titles, marquee moments.
              </p>
              <div className="mt-4 pt-3 border-t border-steel">
                <p className="text-bone text-base leading-tight" style={{ fontFamily: `'${bodyFont}', sans-serif`, fontWeight: 500 }}>
                  {bodyFont}
                </p>
                <p className="text-ash text-xs leading-relaxed mt-0.5" style={{ fontFamily: `'${bodyFont}', sans-serif` }}>
                  Body · paragraphs, UI, captions.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-auto pt-3 border-t border-steel">
            <p className="text-ash text-[11px] leading-relaxed tracking-tight" style={{ fontFamily: `'${bodyFont}', sans-serif` }}>
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
              <br />
              abcdefghijklmnopqrstuvwxyz
              <br />
              0123456789 !?@#$%&*()
            </p>
          </div>
        </motion.div>

        {/* ============ 06 / PERSONA ============ */}
        <motion.div
          {...tileMotion(5)}
          className="rounded-lg p-6 flex flex-col border"
          style={{
            background: "#0d0d0e",
            borderColor: c1,
            gridColumn: "span 4",
            gridRow: "span 2",
            minHeight: "300px",
          }}
        >
          <div className="flex items-baseline justify-between mb-3">
            <p className="eyebrow">06 / persona</p>
            <p className="font-mono text-[10px] tracking-widest uppercase text-ash truncate ml-2">
              {archetypeLabel}
            </p>
          </div>
          <p className="text-4xl md:text-5xl leading-none tracking-tightest mb-3" style={{ fontFamily: `'${displayFont}', serif`, color: c2 }}>
            {personaName}
          </p>
          <p
            className="text-sm leading-relaxed flex-1 text-ash overflow-hidden"
            style={{
              fontFamily: `'${bodyFont}', sans-serif`,
              display: "-webkit-box",
              WebkitLineClamp: 5,
              WebkitBoxOrient: "vertical",
            }}
          >
            {personaDescription}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {personaTraits.slice(0, 6).map((t) => (
              <span
                key={t}
                className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded"
                style={{ background: `${c1}1a`, color: c1, border: `1px solid ${c1}40` }}
              >
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ============ APPLIED GALLERY ============ */}
        {kind === "brand"
          ? renderBrandApplied()
          : renderCampaignPlacements()}

        {/* ============ HEADLINES (campaign) ============ */}
        {kind === "campaign" && headlines && headlines.length > 0 && (
          <motion.div
            {...tileMotion(20)}
            className="rounded-lg p-6 relative overflow-hidden"
            style={{
              background: c1,
              color: contrast(c1),
              gridColumn: "span 8",
              gridRow: "span 2",
              minHeight: "280px",
            }}
          >
            <GhostWordmark text="MESSAGE" color={contrast(c1)} className="absolute right-2 -bottom-4 text-[120px]" />
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-4 opacity-70 relative z-10" style={{ color: contrast(c1) }}>
              messaging · headlines
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10" style={{ fontFamily: `'${displayFont}', serif` }}>
              {headlines.slice(0, 4).map((h, i) => (
                <p key={i} className="text-xl md:text-2xl leading-tight" style={{ color: contrast(c1) }}>
                  <span className="opacity-50 mr-2 text-base">{String(i + 1).padStart(2, "0")}</span>
                  {h}
                </p>
              ))}
            </div>
          </motion.div>
        )}

        {/* ============ CTA (campaign) ============ */}
        {kind === "campaign" && cta && (
          <motion.div
            {...tileMotion(21)}
            className="rounded-lg p-6 flex flex-col justify-between relative overflow-hidden"
            style={{
              background: c3,
              color: contrast(c3),
              gridColumn: "span 4",
              gridRow: "span 2",
              minHeight: "280px",
            }}
          >
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-70" style={{ color: contrast(c3) }}>
              call to action
            </p>
            <div className="relative">
              <p className="text-3xl md:text-4xl tracking-tightest leading-none" style={{ fontFamily: `'${displayFont}', serif`, color: contrast(c3) }}>
                {cta}
              </p>
            </div>
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-50" style={{ color: contrast(c3) }}>
              primary cta · use on accent
            </p>
          </motion.div>
        )}

        {/* ============ CHANNELS index (campaign) ============ */}
        {kind === "campaign" &&
          channelIdeas &&
          Object.entries(channelIdeas).filter(([, v]) => v && v.length > 0).length > 0 && (
            <motion.div
              {...tileMotion(22)}
              className="rounded-lg p-6"
              style={{
                background: "#0d0d0e",
                border: "1px solid #1f2128",
                gridColumn: "span 12",
                gridRow: "span 2",
                minHeight: "200px",
              }}
            >
              <p className="eyebrow mb-5">channels · activation ideas</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                {Object.entries(channelIdeas)
                  .filter(([, v]) => v && v.length > 0)
                  .slice(0, 9)
                  .map(([ch, idea]) => (
                    <div key={ch} className="border-t border-steel pt-3">
                      <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: c1 }}>
                        {ch}
                      </p>
                      <p className="text-sm leading-snug text-ash">{idea}</p>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

        {/* ============ DETAILS BAR ============ */}
        <motion.div
          {...tileMotion(23)}
          className="rounded-lg p-6 flex flex-wrap items-center justify-between gap-y-4"
          style={{
            background: c0,
            color: c2,
            gridColumn: "span 12",
            gridRow: "span 1",
            minHeight: "120px",
          }}
        >
          <DetailBlock label="archetypes" value={archetypeLabel} color={c2} accent={c1} />
          <DetailBlock label="tone" value={toneLabel || "—"} color={c2} accent={c1} />
          <DetailBlock label="display type" value={displayFont} color={c2} accent={c1} />
          <DetailBlock label="body type" value={bodyFont} color={c2} accent={c1} />
          <DetailBlock label="palette" value={palette?.name ?? "—"} color={c2} accent={c1} />
          <DetailBlock
            label={kind === "campaign" ? "placements" : "surfaces"}
            value={
              kind === "campaign"
                ? `${(placements ?? []).length} placements`
                : "8 applied"
            }
            color={c2}
            accent={c1}
          />
        </motion.div>
      </div>
    </>
  );

  // ============================================================
  // BRAND applied gallery — elevated surface tiles + deployment
  // ============================================================
  function renderBrandApplied() {
    const slots: {
      idx: number;
      label: string;
      col: number;
      row: number;
      minHeight: number;
      bg: string;
      accent: string;
    }[] = [
      { idx: 0, label: "hero · product application", col: 5, row: 4, minHeight: 640, bg: c3, accent: c1 },
      { idx: 2, label: "print · poster", col: 4, row: 4, minHeight: 640, bg: c2, accent: c3 },
      { idx: 1, label: "social · feed post", col: 3, row: 2, minHeight: 300, bg: "#1a1f28", accent: c1 },
      { idx: 5, label: "photography · brand direction", col: 3, row: 2, minHeight: 300, bg: "#0d0d0e", accent: c1 },
      { idx: 3, label: "ooh · billboard in situ", col: 8, row: 2, minHeight: 320, bg: c1, accent: c0 },
      { idx: 4, label: "brand collateral · print", col: 4, row: 2, minHeight: 320, bg: "#1a1f28", accent: c1 },
      { idx: 6, label: "editorial banner · web marquee", col: 8, row: 2, minHeight: 320, bg: c0, accent: c1 },
      { idx: 7, label: "brand environment · retail space", col: 4, row: 2, minHeight: 320, bg: c3, accent: c1 },
    ];
    return (
      <>
        {slots.map((s, i) => (
          <AppliedTile
            key={s.idx}
            motionProps={tileMotion(6 + i)}
            image={mockupImages[s.idx]}
            regenerating={regenIdx === s.idx}
            onRegen={onRegenMockup ? () => handleRegen(s.idx) : undefined}
            eyebrow={s.label}
            eyebrowBg={accents[i % accents.length]}
            description={mockupDescriptions?.[s.idx]}
            displayFont={displayFont}
            bodyFont={bodyFont}
            ink={c2}
            col={s.col}
            row={s.row}
            minHeight={s.minHeight}
            bg={s.bg}
          />
        ))}
        {/* Deployment tile — how marketing runs the system */}
        <motion.div
          {...tileMotion(15)}
          className="rounded-lg p-6 md:p-7 relative overflow-hidden"
          style={{
            background: c0,
            color: c2,
            gridColumn: "span 12",
            gridRow: "span 1",
            minHeight: "160px",
          }}
        >
          <GhostWordmark text={name} color={c2} font={displayFont} className="absolute -right-4 -bottom-6 text-[140px]" />
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-4 relative z-10" style={{ color: c1 }}>
            deployment · how marketing runs this
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {[
              { h: "Lead with the mark.", p: "Every surface opens with the logo or wordmark in clear space — recognition before message." },
              { h: "Hold the palette.", p: `Base ${c0.toUpperCase()}, accent for one decisive moment per layout. Never split attention across all four.` },
              { h: "One voice, two registers.", p: `${displayFont} for the headline moment, ${bodyFont} for everything that has to be read.` },
            ].map((d, i) => (
              <div key={i} className="border-t pt-3" style={{ borderColor: `${c2}22` }}>
                <p className="text-base font-medium leading-tight mb-1" style={{ fontFamily: `'${displayFont}', serif`, color: c2 }}>
                  {d.h}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: c2, opacity: 0.7, fontFamily: `'${bodyFont}', sans-serif` }}>
                  {d.p}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </>
    );
  }

  // ============================================================
  // CAMPAIGN placement gallery — one designed tile per placement
  // ============================================================
  function renderCampaignPlacements() {
    const list = placements ?? [];
    if (list.length === 0) {
      return (
        <motion.div
          {...tileMotion(6)}
          className="rounded-lg p-8 flex items-center justify-center"
          style={{ background: "#0d0d0e", border: "1px solid #1f2128", gridColumn: "span 12", gridRow: "span 2", minHeight: "240px" }}
        >
          <p className="font-mono text-xs tracking-widest uppercase text-ash">
            select channels to generate placement visuals
          </p>
        </motion.div>
      );
    }
    return (
      <>
        {list.map((pl, i) => {
          const span = spanForAspect(pl.aspect, i === 0);
          const accent = accents[i % accents.length];
          if (pl.composed) {
            return (
              <ComposedPlacementCard
                key={i}
                motionProps={tileMotion(6 + i)}
                placement={pl}
                displayFont={displayFont}
                bodyFont={bodyFont}
                c0={c0}
                ink={c2}
                accent={accent}
                col={span.col}
                row={span.row}
                minHeight={span.minHeight}
              />
            );
          }
          return (
            <AppliedTile
              key={i}
              motionProps={tileMotion(6 + i)}
              image={mockupImages[i]}
              regenerating={regenIdx === i}
              onRegen={onRegenMockup ? () => handleRegen(i) : undefined}
              eyebrow={`launch · ${pl.label}`}
              eyebrowBg={accent}
              description={pl.rationale}
              hook={pl.hook}
              cta={cta}
              location={pl.location}
              context={pl.context}
              displayFont={displayFont}
              bodyFont={bodyFont}
              ink={c2}
              col={span.col}
              row={span.row}
              minHeight={span.minHeight}
              bg={accent}
            />
          );
        })}
      </>
    );
  }
}

// ============================================================
// Layout helpers
// ============================================================

function spanForAspect(aspect: string, hero: boolean): { col: number; row: number; minHeight: number } {
  // portrait
  if (aspect === "9:16" || aspect === "2:3" || aspect === "4:5") {
    return hero ? { col: 5, row: 4, minHeight: 640 } : { col: 4, row: 3, minHeight: 480 };
  }
  // wide
  if (aspect === "16:9") {
    return { col: 8, row: 2, minHeight: 320 };
  }
  // square / default
  return hero ? { col: 6, row: 3, minHeight: 460 } : { col: 4, row: 2, minHeight: 320 };
}

// ============================================================
// Applied / placement image tile (shared by brand + campaign)
// ============================================================

function AppliedTile({
  motionProps,
  image,
  regenerating,
  onRegen,
  eyebrow,
  eyebrowBg,
  description,
  hook,
  cta,
  location,
  context,
  displayFont,
  bodyFont,
  ink,
  col,
  row,
  minHeight,
  bg,
}: {
  motionProps: Record<string, unknown>;
  image?: string;
  regenerating?: boolean;
  onRegen?: () => void;
  eyebrow: string;
  eyebrowBg: string;
  description?: string;
  hook?: string;
  cta?: string;
  location?: string;
  context?: string;
  displayFont: string;
  bodyFont: string;
  ink: string;
  col: number;
  row: number;
  minHeight: number;
  bg: string;
}) {
  const tagInk = contrast(eyebrowBg);
  return (
    <motion.div
      {...motionProps}
      className="rounded-lg overflow-hidden relative group"
      style={{ gridColumn: `span ${col}`, gridRow: `span ${row}`, background: bg, minHeight: `${minHeight}px` }}
    >
      <MockupTile image={image} regenerating={regenerating} onRegen={onRegen} />

      {/* top chrome: eyebrow tag + optional contextual hook */}
      <div className="absolute inset-x-0 top-0 p-4 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-start justify-between gap-2">
          <EyebrowTag label={eyebrow} bg={eyebrowBg} color={tagInk} />
          {cta && (
            <CTASticker text={cta} bg={eyebrowBg} color={tagInk} className="max-w-[44%]" />
          )}
        </div>
        {hook && (
          <SpeechBubble text={hook} bg="#f5f0e8" color="#0a0a0a" className="mt-1" />
        )}
      </div>

      {/* bottom chrome: location/context + case-study description */}
      {(description || location || context) && (
        <div
          className="absolute inset-x-0 bottom-0 p-4 pt-10 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(7,7,7,0.92), rgba(7,7,7,0.0))" }}
        >
          {(location || context) && (
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase mb-1" style={{ color: "#f5f0e8", opacity: 0.85 }}>
              {[location, context].filter(Boolean).join(" · ")}
            </p>
          )}
          {description && (
            <p
              className="text-sm leading-snug max-w-[92%]"
              style={{
                color: "#f5f0e8",
                fontFamily: `'${bodyFont}', sans-serif`,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// Composed (radio/email) placement card — no generated image
// ============================================================

function ComposedPlacementCard({
  motionProps,
  placement,
  displayFont,
  bodyFont,
  c0,
  ink,
  accent,
  col,
  row,
  minHeight,
}: {
  motionProps: Record<string, unknown>;
  placement: CampaignPlacementTile;
  displayFont: string;
  bodyFont: string;
  c0: string;
  ink: string;
  accent: string;
  col: number;
  row: number;
  minHeight: number;
}) {
  const isRadio = placement.channel === "radio";
  return (
    <motion.div
      {...motionProps}
      className="rounded-lg p-6 flex flex-col relative overflow-hidden"
      style={{
        background: "#0d0d0e",
        border: `1px solid ${accent}55`,
        gridColumn: `span ${Math.max(col, 4)}`,
        gridRow: `span ${row}`,
        minHeight: `${minHeight}px`,
      }}
    >
      <GhostWordmark text={placement.channel.toUpperCase()} color={accent} className="absolute -right-2 -bottom-4 text-[110px]" />
      <div className="relative z-10 flex items-center justify-between mb-3">
        <EyebrowTag label={`launch · ${placement.label}`} bg={accent} color={contrast(accent)} />
        <span className="font-mono text-[10px] tracking-widest uppercase text-ash">
          {isRadio ? "audio" : "inbox"}
        </span>
      </div>

      {placement.hook && (
        <p className="relative z-10 text-2xl md:text-3xl leading-tight mb-3" style={{ fontFamily: `'${displayFont}', serif`, color: ink }}>
          {`"${placement.hook}"`}
        </p>
      )}

      {/* channel-specific composed body */}
      {isRadio ? (
        <div className="relative z-10 rounded-md p-4 flex-1" style={{ background: "#070707", border: "1px solid #1f2128" }}>
          <p className="font-mono text-[10px] tracking-widest uppercase text-ash mb-2">30s spot · script</p>
          <p className="text-sm leading-relaxed text-bone" style={{ fontFamily: `'${bodyFont}', sans-serif` }}>
            {placement.rationale || "VO: a single clear line, then the mnemonic and the call to action."}
          </p>
        </div>
      ) : (
        <div className="relative z-10 rounded-md overflow-hidden flex-1" style={{ background: "#070707", border: "1px solid #1f2128" }}>
          <div className="px-4 py-2 border-b border-steel flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: accent }} />
            <span className="font-mono text-[10px] tracking-widest uppercase text-ash truncate">
              subject: {placement.context || placement.hook || "campaign"}
            </span>
          </div>
          <div className="p-4">
            <p className="text-sm leading-relaxed text-bone" style={{ fontFamily: `'${bodyFont}', sans-serif` }}>
              {placement.rationale || "Preheader, hero line, one decisive CTA button."}
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 mt-3">
        <MetaRow items={[placement.location, placement.context].filter(Boolean) as string[]} color="#6b7280" accent={accent} />
      </div>
    </motion.div>
  );
}

// ============================================================
// Sub-components (unchanged primitives)
// ============================================================

function MockupTile({
  image,
  regenerating,
  onRegen,
}: {
  image?: string;
  regenerating?: boolean;
  onRegen?: () => void;
}) {
  return (
    <>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="Mockup" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono text-xs text-ash gap-1">
          <span>generating…</span>
          <span className="text-[9px] tracking-widest uppercase opacity-60">Nano Banana 2</span>
        </div>
      )}
      {regenerating && (
        <div className="absolute inset-0 bg-noir/85 flex flex-col items-center justify-center z-30">
          <span className="font-mono text-[11px] tracking-widest uppercase text-spark animate-pulse mb-1">
            regenerating
          </span>
          <span className="font-mono text-[9px] tracking-widest uppercase text-ash">Nano Banana 2</span>
        </div>
      )}
      {onRegen && !regenerating && (
        <button
          type="button"
          onClick={onRegen}
          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-noir/85 hover:bg-noir text-bone font-mono text-[10px] tracking-widest uppercase px-3 py-2 z-40 backdrop-blur rounded"
          aria-label="Regenerate this image"
        >
          ↻ regen
        </button>
      )}
    </>
  );
}

function LogoVariant({
  background,
  accent,
  logo,
  label,
  textColor,
  outline,
}: {
  background: string;
  accent: string;
  logo?: string;
  label: string;
  textColor?: string;
  outline?: boolean;
}) {
  return (
    <div
      className="flex flex-col p-3 rounded relative"
      style={{ background, border: outline ? `1px dashed ${accent}80` : `1px solid #1f2128` }}
    >
      <div className="flex-1 flex items-center justify-center min-h-0">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt="Logo variant"
            className="max-w-[80%] max-h-full object-contain"
            style={
              outline
                ? { filter: "grayscale(1) invert(1) contrast(1.2)", opacity: 0.85 }
                : background === "transparent"
                ? { filter: "grayscale(1)" }
                : undefined
            }
          />
        ) : (
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: accent, opacity: 0.5 }}>
            no logo
          </span>
        )}
      </div>
      <p className="font-mono text-[9px] tracking-widest uppercase mt-2 text-center" style={{ color: textColor || "#6b6b73" }}>
        {label}
      </p>
    </div>
  );
}

function WordmarkVariant({
  background,
  textColor,
  accent,
  text,
  font,
  label,
  outline,
}: {
  background: string;
  textColor: string;
  accent: string;
  text: string;
  font: string;
  label: string;
  outline?: boolean;
}) {
  const len = (text || "").length;
  const size = len > 14 ? 18 : len > 9 ? 22 : 28;
  return (
    <div
      className="flex flex-col p-3 rounded relative"
      style={{
        background: background === "transparent" ? "#0a0a0a" : background,
        border: outline ? `1px dashed ${accent}80` : `1px solid #1f2128`,
      }}
    >
      <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
        <span
          className="leading-none tracking-tightest text-center"
          style={{ fontFamily: `'${font}', serif`, color: textColor, fontSize: size, fontWeight: 700, letterSpacing: "-0.02em" }}
        >
          {text}
          <span style={{ color: accent }}>.</span>
        </span>
      </div>
      <p className="font-mono text-[9px] tracking-widest uppercase mt-2 text-center" style={{ color: "#6b6b73" }}>
        {label}
      </p>
    </div>
  );
}

function ColorCell({ hex, role }: { hex: string; role: string }) {
  const text = contrast(hex);
  return (
    <div className="flex flex-col justify-between p-3" style={{ background: hex, color: text }}>
      <p className="font-mono text-[9px] tracking-widest uppercase opacity-70" style={{ color: text }}>
        {role}
      </p>
      <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color: text }}>
        {hex.toUpperCase()}
      </p>
    </div>
  );
}

function DetailBlock({
  label,
  value,
  color,
  accent,
}: {
  label: string;
  value: string;
  color: string;
  accent: string;
}) {
  return (
    <div className="min-w-[120px] max-w-[200px]">
      <p className="font-mono text-[9px] tracking-[0.22em] uppercase mb-1" style={{ color: accent }}>
        {label}
      </p>
      <p className="text-sm leading-tight truncate" style={{ color, opacity: 0.92 }}>
        {value || "—"}
      </p>
    </div>
  );
}

function PrincipleIcon({ idx, color }: { idx: number; color: string }) {
  const sw = 1.8;
  if (idx === 0)
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={sw} strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    );
  if (idx === 1)
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="3" fill={color} fillOpacity="0.85" />
      </svg>
    );
  if (idx === 2)
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={sw} strokeLinejoin="round">
        <path d="M12 2 C 14 7 19 11 19 16 a 7 7 0 0 1 -14 0 c 0 -5 5 -9 7 -14 z" />
      </svg>
    );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={sw} strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
