"use client";
import type { LogoStyle } from "@/lib/types";

const OPTIONS: { key: LogoStyle; name: string; hint: string }[] = [
  { key: "wordmark", name: "Wordmark", hint: "Just the name, custom-set." },
  { key: "symbol", name: "Symbol", hint: "A single mark, no text." },
  { key: "combination", name: "Combination", hint: "Mark beside the name." },
  { key: "mascot", name: "Mascot", hint: "A character figure with the name." },
];

type Props = {
  selected: LogoStyle;
  onSelect: (s: LogoStyle) => void;
};

export default function LogoStylePicker({ selected, onSelect }: Props) {
  return (
    <div className="grid md:grid-cols-4 gap-3">
      {OPTIONS.map((o) => {
        const on = selected === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onSelect(o.key)}
            aria-pressed={on}
            className={`chip p-5 border text-left transition-all ${
              on ? "border-spark bg-spark/5" : "border-steel hover:border-ash"
            }`}
          >
            <div className="h-16 mb-3 flex items-center justify-center text-bone/80">
              <LogoStylePreview style={o.key} active={on} />
            </div>
            <p
              className={`display text-xl mb-1 ${
                on ? "text-spark" : "text-bone"
              }`}
            >
              {o.name}
            </p>
            <p className="text-xs text-ash">{o.hint}</p>
          </button>
        );
      })}
    </div>
  );
}

function LogoStylePreview({
  style,
  active,
}: {
  style: LogoStyle;
  active: boolean;
}) {
  const color = active ? "#c8ff3e" : "#f4f0e6";
  if (style === "wordmark")
    return (
      <span
        className="text-3xl tracking-tighter"
        style={{ fontFamily: "var(--font-display)", color }}
      >
        Aria.
      </span>
    );
  if (style === "symbol")
    return (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <polygon
          points="20,5 35,32 5,32"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
      </svg>
    );
  if (style === "combination")
    return (
      <div className="flex items-center gap-2">
        <svg width="22" height="22" viewBox="0 0 40 40">
          <polygon points="20,5 35,32 5,32" fill={color} />
        </svg>
        <span
          className="text-2xl"
          style={{ fontFamily: "var(--font-display)", color }}
        >
          Aria
        </span>
      </div>
    );
  return (
    <div className="flex items-center gap-2">
      <svg width="26" height="26" viewBox="0 0 40 40">
        <circle cx="20" cy="18" r="9" fill="none" stroke={color} strokeWidth="2" />
        <circle cx="17" cy="17" r="1.5" fill={color} />
        <circle cx="23" cy="17" r="1.5" fill={color} />
        <path d="M14,22 Q20,26 26,22" fill="none" stroke={color} strokeWidth="1.5" />
      </svg>
      <span
        className="text-xl"
        style={{ fontFamily: "var(--font-display)", color }}
      >
        Aria
      </span>
    </div>
  );
}
