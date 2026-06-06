"use client";
import { ARCHETYPES } from "@/lib/archetypes";
import type { ArchetypeKey } from "@/lib/types";

type Props = {
  selected: ArchetypeKey[];
  onToggle: (k: ArchetypeKey) => void;
};

export default function ArchetypePicker({ selected, onToggle }: Props) {
  return (
    <div>
      <p className="eyebrow mb-4">
        Pick up to 2 — primary + secondary
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {ARCHETYPES.map((a) => {
          const on = selected.includes(a.key);
          return (
            <button
              key={a.key}
              type="button"
              onClick={() => onToggle(a.key)}
              aria-pressed={on}
              className={`chip text-left p-5 border transition-all ${
                on
                  ? "border-spark bg-spark/5"
                  : "border-steel hover:border-ash"
              }`}
            >
              <div className="flex items-baseline justify-between mb-3">
                <span
                  className={`display text-2xl ${
                    on ? "text-spark" : "text-bone"
                  }`}
                >
                  {a.name}
                </span>
                {on && (
                  <span className="font-mono text-[10px] tracking-[0.2em] text-spark">
                    ●
                  </span>
                )}
              </div>
              <p className="font-display italic text-ash text-sm mb-2">
                "{a.motto}"
              </p>
              <p className="text-xs text-ash/80 leading-relaxed">
                <span className="text-bone/80">Voice:</span> {a.voice}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
