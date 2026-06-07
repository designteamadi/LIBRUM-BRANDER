"use client";
import type { ColorPalette } from "@/lib/types";

type Props = {
  options: ColorPalette[];
  selected?: ColorPalette;
  onSelect: (p: ColorPalette) => void;
  thumbnailsLoading?: boolean;
};

export default function PalettePicker({
  options,
  selected,
  onSelect,
  thumbnailsLoading,
}: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {options.map((p, idx) => {
        const on = selected?.name === p.name;
        const hasThumb = Boolean(p.conceptImageDataUrl);
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(p)}
            aria-pressed={on}
            className={`text-left border transition-all overflow-hidden ${
              on ? "border-spark" : "border-steel hover:border-ash"
            }`}
          >
            {/* Concept thumbnail */}
            <div
              className="relative w-full bg-carbon flex items-center justify-center"
              style={{ aspectRatio: "4 / 5" }}
            >
              {hasThumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.conceptImageDataUrl}
                  alt={`Concept for ${p.name}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : thumbnailsLoading ? (
                <div className="flex flex-col items-center gap-2 text-ash">
                  <span className="font-mono text-[10px] tracking-widest uppercase animate-pulse">
                    rendering…
                  </span>
                  <span className="text-[10px] font-mono text-ash/60">
                    Nano Banana 2
                  </span>
                </div>
              ) : (
                <span className="font-mono text-[10px] tracking-widest uppercase text-ash/60">
                  preview unavailable
                </span>
              )}
              <span className="absolute top-3 left-3 font-mono text-[10px] tracking-[0.18em] uppercase text-bone/90 mix-blend-difference">
                Direction {String(idx + 1).padStart(2, "0")}
              </span>
              {on && (
                <span className="absolute top-3 right-3 font-mono text-[10px] tracking-[0.18em] uppercase text-spark">
                  ● selected
                </span>
              )}
            </div>

            {/* Color stack */}
            <div className="flex h-16">
              {p.hexes.map((h) => (
                <div
                  key={h}
                  style={{ background: h }}
                  className="flex-1 flex items-end justify-start p-2"
                >
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider"
                    style={{ color: contrastOn(h) }}
                  >
                    {h.replace("#", "")}
                  </span>
                </div>
              ))}
            </div>

            {/* Meta */}
            <div className="p-5">
              <p className="display text-2xl mb-2">{p.name}</p>
              <p className="text-sm text-ash leading-relaxed">{p.rationale}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function contrastOn(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length !== 6) return "#f4f0e6";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#1a1a1a" : "#f4f0e6";
}
