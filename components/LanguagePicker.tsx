"use client";
import { LANGUAGES } from "@/lib/languages";
import type { LanguageCode } from "@/lib/types";

type Props = {
  value: LanguageCode;
  onChange: (l: LanguageCode) => void;
};

export default function LanguagePicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-3xl">
      {LANGUAGES.map((l) => {
        const on = value === l.code;
        return (
          <button
            key={l.code}
            onClick={() => onChange(l.code)}
            className={`chip p-4 border text-left transition-all ${
              on
                ? "border-spark bg-spark/5"
                : "border-steel hover:border-ash"
            }`}
          >
            <p
              className={`display text-2xl mb-1 ${
                on ? "text-spark" : "text-bone"
              }`}
            >
              {l.native}
            </p>
            <p className="font-mono text-[10px] tracking-widest uppercase text-ash">
              {l.code} · {l.name}
            </p>
          </button>
        );
      })}
    </div>
  );
}
