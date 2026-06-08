"use client";
import type { CSSProperties, ReactNode } from "react";

/** WCAG-ish luminance pick: dark or bone text on a given hex. */
export function contrast(hex: string): string {
  const c = (hex || "").replace("#", "");
  if (c.length !== 6) return "#f4f0e6";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#0a0a0a" : "#f4f0e6";
}

/** Add alpha to a 6-digit hex (e.g. hexA("#ff0000", 0.1)). */
export function hexA(hex: string, alpha: number): string {
  const c = (hex || "").replace("#", "");
  if (c.length !== 6) return hex;
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${c}${a}`;
}

/** The colored case-study label chip (the "ABOUT / SOCIAL GRAPHICS" device). */
export function EyebrowTag({
  label,
  bg,
  color,
  className,
}: {
  label: string;
  bg: string;
  color: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-block font-mono text-[10px] tracking-[0.22em] uppercase px-2.5 py-1 rounded-sm ${
        className ?? ""
      }`}
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}

/**
 * A two-register headline: the whole string in the display font, with one
 * word lifted into the accent color (the "Key VISUAL", "WE ADAPT the KV"
 * move). `accentWord` is matched case-insensitively; if absent, the first
 * word is accented.
 */
export function AccentHeadline({
  text,
  accentWord,
  font,
  color,
  accentColor,
  className,
  style,
}: {
  text: string;
  accentWord?: string;
  font: string;
  color: string;
  accentColor: string;
  className?: string;
  style?: CSSProperties;
}) {
  const words = (text || "").split(" ");
  const target = (accentWord ?? words[0] ?? "").toLowerCase();
  return (
    <span
      className={className}
      style={{ fontFamily: `'${font}', serif`, color, ...style }}
    >
      {words.map((w, i) => {
        const isAccent = w.toLowerCase().replace(/[.,!?]/g, "") === target;
        return (
          <span key={i} style={isAccent ? { color: accentColor } : undefined}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </span>
  );
}

/** Rotated sticker-badge CTA (the "YA MOBBI DONG!" device). */
export function CTASticker({
  text,
  bg,
  color,
  rotate = -7,
  className,
}: {
  text: string;
  bg: string;
  color: string;
  rotate?: number;
  className?: string;
}) {
  return (
    <div
      className={`font-mono font-bold uppercase tracking-wider leading-tight px-3 py-2 rounded-md shadow-xl text-[11px] text-center ${
        className ?? ""
      }`}
      style={{ background: bg, color, transform: `rotate(${rotate}deg)` }}
    >
      {text}
    </div>
  );
}

/** A contextual-question speech bubble (the "Beli mobil bekas?" device). */
export function SpeechBubble({
  text,
  bg,
  color,
  className,
}: {
  text: string;
  bg: string;
  color: string;
  className?: string;
}) {
  return (
    <div
      className={`relative inline-block max-w-[80%] rounded-2xl px-3.5 py-2 text-sm font-medium leading-snug ${
        className ?? ""
      }`}
      style={{ background: bg, color }}
    >
      {`"${text}"`}
      <span
        aria-hidden
        className="absolute -bottom-1.5 left-6 w-3 h-3 rotate-45"
        style={{ background: bg }}
      />
    </div>
  );
}

/**
 * A large faint wordmark sitting behind content — the recurring "ENGLAND"
 * watermark / repeated-name motif, generalized to any brand/campaign name.
 * Uses low-opacity fill (no WebkitTextStroke) for cross-browser safety.
 */
export function GhostWordmark({
  text,
  color,
  font,
  className,
  style,
}: {
  text: string;
  color: string;
  font?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none select-none uppercase leading-none tracking-tightest ${
        className ?? ""
      }`}
      style={{
        fontFamily: font ? `'${font}', serif` : undefined,
        color,
        opacity: 0.08,
        fontWeight: 800,
        ...style,
      }}
    >
      {text}
    </span>
  );
}

/** Small proof/feature row used on composed (radio/email) placement cards. */
export function MetaRow({
  items,
  color,
  accent,
}: {
  items: string[];
  color: string;
  accent: string;
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {items.filter(Boolean).map((it, i) => (
        <span
          key={i}
          className="font-mono text-[10px] tracking-widest uppercase flex items-center gap-1.5"
          style={{ color }}
        >
          <span style={{ color: accent }}>●</span>
          {it}
        </span>
      ))}
    </div>
  );
}

/** Generic tile shell with rounded corners + overflow clip. */
export function TileShell({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg overflow-hidden relative ${className ?? ""}`}
      style={style}
    >
      {children}
    </div>
  );
}
