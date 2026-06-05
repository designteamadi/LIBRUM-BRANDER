"use client";
import type { TypePairing } from "@/lib/types";

type Props = {
  options: TypePairing[];
  selected?: TypePairing;
  onSelect: (t: TypePairing) => void;
};

export default function TypePicker({ options, selected, onSelect }: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {options.map((t, idx) => {
        const on = selected?.display === t.display;
        const gfDisplay = t.display.replace(/\s+/g, "+");
        const gfBody = t.body.replace(/\s+/g, "+");
        return (
          <button
            key={idx}
            onClick={() => onSelect(t)}
            className={`text-left border p-6 transition-all ${
              on ? "border-spark" : "border-steel hover:border-ash"
            }`}
          >
            <link
              rel="stylesheet"
              href={`https://fonts.googleapis.com/css2?family=${gfDisplay}:wght@400;500&family=${gfBody}:wght@400;500&display=swap`}
            />
            <div className="mb-6">
              <p className="eyebrow mb-2">Display · {t.display}</p>
              <p
                className="text-5xl leading-none"
                style={{ fontFamily: `'${t.display}', serif` }}
              >
                Aa Rr 0–9
              </p>
            </div>
            <div className="mb-4">
              <p className="eyebrow mb-2">Body · {t.body}</p>
              <p
                className="text-sm text-ash leading-relaxed"
                style={{ fontFamily: `'${t.body}', sans-serif` }}
              >
                The terrain we move through is the story we end up telling.
              </p>
            </div>
            <p className="text-xs text-ash/80 leading-relaxed border-t border-steel pt-3">
              {t.rationale}
            </p>
            {on && (
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-spark">
                ● Selected
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
