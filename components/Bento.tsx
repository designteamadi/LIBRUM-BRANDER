"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { Icon } from "@/lib/icon-library";
import type {
  ColorPalette,
  TypePairing,
  Persona,
  EssenceItem,
} from "@/lib/types";

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
  moodboardImages: (string | undefined)[];
  patternIdea?: string;
  headlines?: string[];
  cta?: string;
  essence: EssenceItem[];
  iconLabels: string[];
  logoImageDataUrl?: string;
  onRegenMockup?: (idx: number) => Promise<void>;
  onRegenMoodboard?: (idx: number) => Promise<void>;
};

export default function Bento(props: Props) {
  const {
    name,
    archetypeLabel,
    toneLabel,
    palette,
    type,
    persona,
    tagline,
    description,
    mockupImages,
    moodboardImages,
    headlines,
    cta,
    patternIdea,
    essence,
    iconLabels,
    logoImageDataUrl,
    onRegenMockup,
    onRegenMoodboard,
  } = props;

  const [regenMockIdx, setRegenMockIdx] = useState<number | null>(null);
  const [regenMoodIdx, setRegenMoodIdx] = useState<number | null>(null);

  const handleRegenMockup = async (i: number) => {
    if (!onRegenMockup) return;
    setRegenMockIdx(i);
    try {
      await onRegenMockup(i);
    } finally {
      setRegenMockIdx(null);
    }
  };
  const handleRegenMood = async (i: number) => {
    if (!onRegenMoodboard) return;
    setRegenMoodIdx(i);
    try {
      await onRegenMoodboard(i);
    } finally {
      setRegenMoodIdx(null);
    }
  };

  const [c0, c1, c2, c3] = [
    palette.hexes[0] || "#0a0a0a",
    palette.hexes[1] || "#d4ff3d",
    palette.hexes[2] || "#f5f0e8",
    palette.hexes[3] || "#ff3e8e",
  ];

  const tileMotion = (i: number) => ({
    initial: { opacity: 0, y: 16, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: {
      duration: 0.55,
      delay: 0.04 + i * 0.05,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  });

  const gfDisplay = type.display.replace(/\s+/g, "+");
  const gfBody = type.body.replace(/\s+/g, "+");

  return (
    <>
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?family=${gfDisplay}:wght@400;500;700&family=${gfBody}:wght@400;500&display=swap`}
      />

      {/* ============== ROW 1 ============== */}
      <div
        className="grid gap-3 mb-3"
        style={{ gridTemplateColumns: "repeat(12, 1fr)", gridAutoRows: "minmax(80px, auto)" }}
      >
        {/* Hero lockup */}
        <motion.div
          {...tileMotion(0)}
          className="rounded-lg p-8 md:p-10 flex flex-col justify-between"
          style={{
            background: c2,
            color: c0,
            gridColumn: "span 6",
            gridRow: "span 4",
            minHeight: "360px",
          }}
        >
          <div className="flex items-start gap-5">
            {logoImageDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoImageDataUrl}
                alt="Logo"
                className="w-24 h-24 object-contain"
                style={{ background: "transparent" }}
              />
            ) : (
              <Mark color={c1} />
            )}
            <div>
              <p
                className="font-mono text-[10px] tracking-[0.18em] uppercase"
                style={{ color: c0, opacity: 0.5 }}
              >
                01 / lockup
              </p>
            </div>
          </div>
          <div>
            <div
              className="text-7xl md:text-8xl tracking-tightest leading-[0.85] mb-3"
              style={{ fontFamily: `'${type.display}', serif`, color: c0 }}
            >
              {name}
              <span style={{ color: c3 }}>.</span>
            </div>
            {tagline && (
              <p
                className="font-mono text-xs tracking-[0.14em] uppercase mb-4"
                style={{ color: c3 }}
              >
                — {tagline}
              </p>
            )}
            {description && (
              <p
                className="text-sm md:text-base leading-relaxed max-w-md"
                style={{ fontFamily: `'${type.body}', sans-serif`, color: c0, opacity: 0.75 }}
              >
                {description}
              </p>
            )}
          </div>
        </motion.div>

        {/* Brand essence */}
        <motion.div
          {...tileMotion(1)}
          className="rounded-lg p-7 flex flex-col"
          style={{
            background: "#0d0d0e",
            border: "1px solid #1f2128",
            gridColumn: "span 3",
            gridRow: "span 4",
          }}
        >
          <p className="eyebrow mb-6">essence</p>
          <ul className="space-y-5 flex-1">
            {essence.slice(0, 4).map((e, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="flex-none mt-1 w-9 h-9 flex items-center justify-center rounded"
                  style={{ background: `${c1}22`, color: c1 }}
                >
                  <Icon name={e.icon} size={18} strokeWidth={2} />
                </span>
                <div>
                  <p
                    className="text-bone text-base font-medium leading-tight mb-1"
                    style={{ fontFamily: `'${type.body}', sans-serif` }}
                  >
                    {e.title}
                  </p>
                  <p className="text-ash text-xs leading-relaxed">{e.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Logo variations */}
        <motion.div
          {...tileMotion(2)}
          className="rounded-lg p-7 flex flex-col"
          style={{
            background: "#0d0d0e",
            border: "1px solid #1f2128",
            gridColumn: "span 3",
            gridRow: "span 4",
          }}
        >
          <p className="eyebrow mb-5">logo variations</p>
          <div className="grid grid-cols-2 gap-2 flex-1">
            {logoImageDataUrl ? (
              <>
                <LogoSwatch image={logoImageDataUrl} bg={c2} />
                <LogoSwatch image={logoImageDataUrl} bg={c1} />
                <LogoSwatch image={logoImageDataUrl} bg={c0} invert />
                <LogoSwatch image={logoImageDataUrl} bg={c3} invert />
              </>
            ) : (
              [c2, c1, c0, c3].map((bg, i) => (
                <div
                  key={i}
                  className="rounded flex items-center justify-center"
                  style={{ background: bg, aspectRatio: "1/1" }}
                >
                  <span
                    style={{
                      fontFamily: `'${type.display}', serif`,
                      color: contrast(bg),
                      fontSize: "1.6rem",
                    }}
                  >
                    {name.slice(0, 4)}.
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* ============== ROW 2 ============== */}
      <div
        className="grid gap-3 mb-3"
        style={{ gridTemplateColumns: "repeat(12, 1fr)", gridAutoRows: "minmax(80px, auto)" }}
      >
        {/* Color palette grid */}
        <motion.div
          {...tileMotion(3)}
          className="rounded-lg p-7 flex flex-col"
          style={{
            background: "#0d0d0e",
            border: "1px solid #1f2128",
            gridColumn: "span 5",
            gridRow: "span 3",
          }}
        >
          <p className="eyebrow mb-5">02 / color palette</p>
          <div className="grid grid-cols-4 gap-2 flex-1">
            {palette.hexes.map((h, i) => (
              <div
                key={h}
                className="rounded flex flex-col justify-end p-3"
                style={{ background: h, minHeight: "100px" }}
              >
                <p
                  className="font-mono text-[10px] uppercase tracking-widest mb-1"
                  style={{ color: contrast(h), opacity: 0.7 }}
                >
                  {tokenLabel(i)}
                </p>
                <p
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: contrast(h) }}
                >
                  {h}
                </p>
              </div>
            ))}
            {/* Extended neutrals */}
            {[
              { name: "ink", hex: "#080808" },
              { name: "carbon", hex: "#15161a" },
              { name: "ash", hex: "#6b6b73" },
              { name: "bone", hex: "#f4f0e6" },
            ].map((n) => (
              <div
                key={n.name}
                className="rounded flex flex-col justify-end p-3"
                style={{ background: n.hex, minHeight: "80px" }}
              >
                <p
                  className="font-mono text-[10px] uppercase tracking-widest mb-1"
                  style={{ color: contrast(n.hex), opacity: 0.7 }}
                >
                  {n.name}
                </p>
                <p
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: contrast(n.hex) }}
                >
                  {n.hex}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Typography */}
        <motion.div
          {...tileMotion(4)}
          className="rounded-lg p-7 flex flex-col"
          style={{
            background: "#0d0d0e",
            border: "1px solid #1f2128",
            gridColumn: "span 4",
            gridRow: "span 3",
          }}
        >
          <p className="eyebrow mb-5">03 / typography</p>
          <div className="flex items-start gap-6 mb-5">
            <p
              className="text-[8rem] leading-none text-bone tracking-tightest"
              style={{ fontFamily: `'${type.display}', serif` }}
            >
              Aa
            </p>
            <div>
              <p
                className="text-bone text-2xl mb-1"
                style={{ fontFamily: `'${type.body}', sans-serif` }}
              >
                {type.display}
              </p>
              <p className="text-ash text-sm mb-3">{type.rationale}</p>
              <div className="space-y-0.5 text-bone text-sm">
                <p className="font-medium">Bold</p>
                <p>Medium</p>
                <p className="text-ash">Regular</p>
                <p className="text-ash/70">Light</p>
              </div>
            </div>
          </div>
          <p
            className="text-ash text-[11px] font-mono tracking-widest break-all leading-relaxed border-t border-steel pt-3"
            style={{ fontFamily: `'${type.body}', sans-serif` }}
          >
            ABCDEFGHIJKLMNOPQRSTUVWXYZ
            <br />
            abcdefghijklmnopqrstuvwxyz
            <br />
            0123456789 !?@#$%&*()
          </p>
        </motion.div>

        {/* Iconography */}
        <motion.div
          {...tileMotion(5)}
          className="rounded-lg p-7 flex flex-col"
          style={{
            background: "#0d0d0e",
            border: "1px solid #1f2128",
            gridColumn: "span 3",
            gridRow: "span 3",
          }}
        >
          <p className="eyebrow mb-5">04 / iconography</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {iconLabels.slice(0, 6).map((label, i) => (
              <div
                key={`${label}-flat-${i}`}
                className="aspect-square rounded flex items-center justify-center"
                style={{ background: "#15161a" }}
              >
                <Icon name={label} size={22} strokeWidth={1.8} color={c1} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {iconLabels.slice(0, 6).map((label, i) => (
              <div
                key={`${label}-fill-${i}`}
                className="aspect-square rounded flex items-center justify-center"
                style={{
                  background: i % 2 === 0 ? c1 : c3,
                }}
              >
                <Icon
                  name={label}
                  size={22}
                  strokeWidth={2}
                  color={contrast(i % 2 === 0 ? c1 : c3)}
                  fill={contrast(i % 2 === 0 ? c1 : c3)}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ============== ROW 3 — MOCKUPS ============== */}
      <div
        className="grid gap-3 mb-3"
        style={{ gridTemplateColumns: "repeat(12, 1fr)", gridAutoRows: "minmax(80px, auto)" }}
      >
        <motion.div
          {...tileMotion(6)}
          className="rounded-lg overflow-hidden relative group"
          style={{
            gridColumn: "span 5",
            gridRow: "span 5",
            background: c0,
            minHeight: "440px",
          }}
        >
          <MockupTile
            image={mockupImages[0]}
            regenerating={regenMockIdx === 0}
            onRegen={onRegenMockup ? () => handleRegenMockup(0) : undefined}
          />
          <div className="absolute inset-0 flex flex-col justify-between p-5 pointer-events-none">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase mix-blend-difference text-bone">
              05 / brand in action
            </p>
            <p
              className="text-3xl md:text-4xl leading-none mix-blend-difference text-bone"
              style={{ fontFamily: `'${type.display}', serif` }}
            >
              {headlines?.[0] ?? tagline ?? "Made for now."}
            </p>
          </div>
        </motion.div>

        <motion.div
          {...tileMotion(7)}
          className="rounded-lg overflow-hidden relative group"
          style={{
            background: "#1a1f28",
            gridColumn: "span 4",
            gridRow: "span 5",
            minHeight: "440px",
          }}
        >
          <MockupTile
            image={mockupImages[1]}
            regenerating={regenMockIdx === 1}
            onRegen={onRegenMockup ? () => handleRegenMockup(1) : undefined}
          />
          <p className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.18em] uppercase text-bone mix-blend-difference pointer-events-none">
            in use
          </p>
        </motion.div>

        <motion.div
          {...tileMotion(8)}
          className="rounded-lg overflow-hidden relative group"
          style={{
            background: c2,
            gridColumn: "span 3",
            gridRow: "span 5",
            minHeight: "440px",
          }}
        >
          <MockupTile
            image={mockupImages[2]}
            regenerating={regenMockIdx === 2}
            onRegen={onRegenMockup ? () => handleRegenMockup(2) : undefined}
          />
          <p
            className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.18em] uppercase mix-blend-difference pointer-events-none"
            style={{ color: c0 }}
          >
            applied
          </p>
        </motion.div>
      </div>

      {/* ============== ROW 4 — PERSONA + PATTERN + HEADLINES ============== */}
      <div
        className="grid gap-3 mb-3"
        style={{ gridTemplateColumns: "repeat(12, 1fr)", gridAutoRows: "minmax(80px, auto)" }}
      >
        {/* Persona */}
        <motion.div
          {...tileMotion(9)}
          className="rounded-lg p-7 flex flex-col border"
          style={{
            background: "#0d0d0e",
            borderColor: c1,
            gridColumn: "span 5",
            gridRow: "span 3",
          }}
        >
          <p className="eyebrow mb-3">06 / persona</p>
          <p
            className="text-3xl md:text-4xl mb-3 leading-tight"
            style={{ fontFamily: `'${type.display}', serif`, color: c2 }}
          >
            {persona.name}
          </p>
          <p
            className="text-sm leading-relaxed flex-1 text-ash"
            style={{ fontFamily: `'${type.body}', sans-serif` }}
          >
            {persona.description}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {persona.traits.slice(0, 5).map((t) => (
              <span
                key={t}
                className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded"
                style={{ background: `${c1}25`, color: c1 }}
              >
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Pattern */}
        <motion.div
          {...tileMotion(10)}
          className="rounded-lg overflow-hidden relative"
          style={{
            background: c1,
            gridColumn: "span 2",
            gridRow: "span 3",
            minHeight: "240px",
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 120 240"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern
                id="pk-large"
                x="0"
                y="0"
                width="22"
                height="22"
                patternUnits="userSpaceOnUse"
              >
                <polygon
                  points="11,3 20,19 2,19"
                  fill="none"
                  stroke={c0}
                  strokeWidth="1.3"
                />
              </pattern>
            </defs>
            <rect width="120" height="240" fill="url(#pk-large)" />
          </svg>
          <p
            className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-widest"
            style={{ color: contrast(c1) }}
          >
            pattern
          </p>
        </motion.div>

        {/* Headlines or Story */}
        <motion.div
          {...tileMotion(11)}
          className="rounded-lg p-7"
          style={{
            background: headlines && headlines.length ? c3 : c0,
            color: headlines && headlines.length ? contrast(c3) : c2,
            gridColumn: "span 5",
            gridRow: "span 3",
            minHeight: "240px",
          }}
        >
          <p
            className="eyebrow mb-3"
            style={{ color: headlines && headlines.length ? contrast(c3) : c2, opacity: 0.7 }}
          >
            {headlines && headlines.length > 0 ? "headlines" : "story"}
          </p>
          {headlines && headlines.length > 0 ? (
            <div
              className="space-y-2 mt-4"
              style={{ fontFamily: `'${type.body}', sans-serif` }}
            >
              {headlines.slice(0, 5).map((h, i) => (
                <p
                  key={i}
                  className="text-lg md:text-xl leading-tight font-medium"
                  style={{ color: contrast(c3) }}
                >
                  · {h}
                </p>
              ))}
            </div>
          ) : (
            <p
              className="text-sm md:text-base leading-relaxed"
              style={{ fontFamily: `'${type.body}', sans-serif`, color: c2, opacity: 0.85 }}
            >
              {props.story?.slice(0, 380)}…
            </p>
          )}
        </motion.div>
      </div>

      {/* ============== ROW 5 — MOODBOARD ============== */}
      <motion.div
        {...tileMotion(12)}
        className="rounded-lg p-7 mb-3"
        style={{ background: "#0d0d0e", border: "1px solid #1f2128" }}
      >
        <div className="flex items-baseline justify-between mb-5">
          <p className="eyebrow">07 / moodboard</p>
          <span className="font-mono text-[10px] tracking-widest uppercase text-ash">
            {moodboardImages.filter(Boolean).length} of 6
          </span>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="relative group rounded overflow-hidden"
              style={{
                background: "#15161a",
                aspectRatio: "1 / 1",
              }}
            >
              {moodboardImages[i] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={moodboardImages[i]}
                  alt={`Moodboard ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-ash">
                  …
                </div>
              )}
              {regenMoodIdx === i && (
                <div className="absolute inset-0 bg-noir/85 flex items-center justify-center">
                  <span className="font-mono text-[9px] tracking-widest uppercase text-spark animate-pulse">
                    regen
                  </span>
                </div>
              )}
              {onRegenMoodboard && regenMoodIdx !== i && moodboardImages[i] && (
                <button
                  onClick={() => handleRegenMood(i)}
                  className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-noir/85 text-bone font-mono text-[9px] tracking-widest uppercase px-2 py-1 z-10 backdrop-blur"
                  aria-label="Regenerate moodboard tile"
                >
                  ↻
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ============== ROW 6 — CTA + DETAILS ============== */}
      <div
        className="grid gap-3 mb-3"
        style={{ gridTemplateColumns: "repeat(12, 1fr)", gridAutoRows: "minmax(80px, auto)" }}
      >
        {cta ? (
          <motion.div
            {...tileMotion(13)}
            className="rounded-lg p-7 flex items-center justify-between"
            style={{
              background: c3,
              color: contrast(c3),
              gridColumn: "span 8",
              gridRow: "span 2",
              minHeight: "120px",
            }}
          >
            <p
              className="text-4xl md:text-5xl tracking-tightest leading-none"
              style={{ fontFamily: `'${type.display}', serif` }}
            >
              {cta}
            </p>
            <span
              className="font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ color: contrast(c3) }}
            >
              campaign cta
            </span>
          </motion.div>
        ) : (
          <motion.div
            {...tileMotion(13)}
            className="rounded-lg p-7 flex flex-col justify-between"
            style={{
              background: c0,
              color: c2,
              gridColumn: "span 8",
              gridRow: "span 2",
              minHeight: "120px",
            }}
          >
            <p
              className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-60"
              style={{ color: c2 }}
            >
              voice + tone
            </p>
            <div className="flex items-baseline justify-between gap-4">
              <p
                className="text-3xl md:text-4xl tracking-tightest leading-none"
                style={{ fontFamily: `'${type.display}', serif`, color: c2 }}
              >
                {archetypeLabel}.
              </p>
              <p
                className="text-sm opacity-70 text-right max-w-xs"
                style={{ fontFamily: `'${type.body}', sans-serif`, color: c2 }}
              >
                {toneLabel}
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          {...tileMotion(14)}
          className="rounded-lg p-7 flex flex-col justify-between"
          style={{
            background: c0,
            color: c2,
            gridColumn: "span 4",
            gridRow: "span 2",
            minHeight: "120px",
          }}
        >
          <p
            className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-60"
            style={{ color: c2 }}
          >
            details
          </p>
          <div>
            <p
              className="text-sm leading-relaxed"
              style={{
                fontFamily: `'${type.body}', sans-serif`,
                color: c2,
                opacity: 0.85,
              }}
            >
              {patternIdea}
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}

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
        <img
          src={image}
          alt="Mockup"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-ash">
          generating…
        </div>
      )}
      {regenerating && (
        <div className="absolute inset-0 bg-noir/85 flex flex-col items-center justify-center z-10">
          <span className="font-mono text-[11px] tracking-widest uppercase text-spark animate-pulse mb-1">
            regenerating
          </span>
          <span className="font-mono text-[9px] tracking-widest uppercase text-ash">
            Nano Banana
          </span>
        </div>
      )}
      {onRegen && !regenerating && (
        <button
          onClick={onRegen}
          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-noir/85 hover:bg-noir text-bone font-mono text-[10px] tracking-widest uppercase px-3 py-2 z-20 backdrop-blur"
          aria-label="Regenerate this image"
        >
          ↻ regen
        </button>
      )}
    </>
  );
}

function LogoSwatch({
  image,
  bg,
  invert,
}: {
  image: string;
  bg: string;
  invert?: boolean;
}) {
  return (
    <div
      className="rounded flex items-center justify-center overflow-hidden"
      style={{ background: bg, aspectRatio: "1/1" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        className="w-3/4 h-3/4 object-contain"
        style={invert ? { filter: "invert(1) brightness(2)" } : undefined}
      />
    </div>
  );
}

function Mark({ color }: { color: string }) {
  return (
    <svg width="96" height="96" viewBox="0 0 40 40" aria-hidden="true">
      <polygon points="20,5 36,33 4,33" fill="none" stroke={color} strokeWidth="2.5" />
      <polygon points="20,16 28,30 12,30" fill={color} />
    </svg>
  );
}

function tokenLabel(i: number) {
  return ["base", "accent", "surface", "pop"][i] ?? `c${i + 1}`;
}

function contrast(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length !== 6) return "#f4f0e6";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#0a0a0a" : "#f4f0e6";
}
