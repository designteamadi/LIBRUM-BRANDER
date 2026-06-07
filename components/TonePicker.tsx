"use client";
import { useState } from "react";

const PRESETS = [
  "bold",
  "plainspoken",
  "warm",
  "irreverent",
  "precise",
  "restless",
  "sensual",
  "considered",
  "raw",
  "optimistic",
  "deadpan",
  "authoritative",
  "poetic",
  "witty",
  "earnest",
  "playful",
];

type Props = {
  selected: string[];
  onToggle: (t: string) => void;
};

export default function TonePicker({ selected, onToggle }: Props) {
  const [custom, setCustom] = useState("");

  const allOptions = Array.from(
    new Set([...PRESETS, ...selected.filter((s) => !PRESETS.includes(s))])
  );

  return (
    <div>
      <p className="eyebrow mb-4">Pick any that fit — or add your own</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {allOptions.map((t) => {
          const on = selected.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => onToggle(t)}
              aria-pressed={on}
              className={`chip px-5 py-2 border text-sm transition-all ${
                on
                  ? "border-spark text-spark bg-spark/5"
                  : "border-steel text-ash hover:text-bone hover:border-ash"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3 max-w-md">
        <input
          type="text"
          placeholder="Add a custom tone…"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && custom.trim()) {
              // Consume the event here so StepShell's outer Enter-to-continue
              // handler doesn't ALSO fire and advance the wizard.
              e.preventDefault();
              e.stopPropagation();
              onToggle(custom.trim().toLowerCase());
              setCustom("");
            }
          }}
          className="flex-1 bg-transparent border-b border-steel py-2 text-bone outline-none focus:border-spark transition-colors text-sm"
        />
        <button
          type="button"
          onClick={() => {
            if (custom.trim()) {
              onToggle(custom.trim().toLowerCase());
              setCustom("");
            }
          }}
          className="font-mono text-[11px] tracking-[0.16em] uppercase text-ash hover:text-spark transition-colors"
        >
          Add ↵
        </button>
      </div>
    </div>
  );
}
