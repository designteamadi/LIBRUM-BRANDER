"use client";
import { ARCHETYPES } from "@/lib/archetypes";
import { ARCHETYPE_VISUALS } from "@/lib/archetype-visuals";
import type { ArchetypeKey } from "@/lib/types";

type Props = {
  selected: ArchetypeKey[];
  onToggle: (k: ArchetypeKey) => void;
};

export default function ArchetypePoster({ selected, onToggle }: Props) {
  return (
    <div>
      <p className="eyebrow mb-6">
        Pick up to 2 — primary + secondary
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ARCHETYPES.map((a) => {
          const v = ARCHETYPE_VISUALS[a.key];
          const on = selected.includes(a.key);
          return (
            <button
              key={a.key}
              onClick={() => onToggle(a.key)}
              className={`group relative text-left overflow-hidden border transition-all ${
                on
                  ? "border-spark"
                  : "border-steel hover:border-ash"
              }`}
              style={{ background: v.backdrop }}
            >
              {/* Visual area — poster top */}
              <div
                className="relative w-full overflow-hidden flex items-center justify-center"
                style={{ aspectRatio: "4 / 3", background: v.backdrop }}
              >
                <ArchetypeSymbol symbol={v.symbol} color={v.accent} />
                {/* corner labels */}
                <span
                  className="absolute top-3 left-3 font-mono text-[10px] tracking-[0.18em] uppercase"
                  style={{ color: v.accent }}
                >
                  / {a.key}
                </span>
                {on && (
                  <span className="absolute top-3 right-3 font-mono text-[10px] tracking-[0.18em] uppercase text-spark">
                    ● selected
                  </span>
                )}
              </div>

              {/* Type area — poster bottom */}
              <div
                className="p-6"
                style={{ background: v.backdrop, color: v.ink }}
              >
                <h2
                  className="display leading-[0.9] mb-3"
                  style={{
                    color: on ? "var(--spark)" : v.ink,
                    fontSize: "clamp(2.5rem, 4vw, 3.25rem)",
                  }}
                >
                  {a.name.toLowerCase()}
                  <span style={{ color: v.accent }}>.</span>
                </h2>
                <p
                  className="font-display italic mb-4 text-lg"
                  style={{ color: v.accent, opacity: 0.85 }}
                >
                  "{a.motto}"
                </p>
                <p
                  className="text-sm leading-relaxed mb-3"
                  style={{ color: v.ink, opacity: 0.75 }}
                >
                  {a.voice}.
                </p>
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.16em] pt-3 border-t"
                  style={{
                    color: v.accent,
                    borderColor: `${v.ink}22`,
                    opacity: 0.7,
                  }}
                >
                  like — {a.examples}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Distinct SVG composition per archetype symbol */
function ArchetypeSymbol({
  symbol,
  color,
}: {
  symbol: string;
  color: string;
}) {
  const stroke = color;
  const fill = color;
  const props = { width: "65%", height: "65%", viewBox: "0 0 200 200" };

  switch (symbol) {
    case "soft-orb":
      return (
        <svg {...props} aria-hidden="true">
          <circle cx="100" cy="100" r="60" fill={fill} opacity="0.15" />
          <circle cx="100" cy="100" r="40" fill={fill} opacity="0.35" />
          <circle cx="100" cy="100" r="22" fill={fill} />
          <line x1="20" y1="100" x2="180" y2="100" stroke={stroke} strokeWidth="0.5" opacity="0.3" />
        </svg>
      );
    case "open-eye":
      return (
        <svg {...props} aria-hidden="true">
          <path
            d="M30,100 Q100,40 170,100 Q100,160 30,100 Z"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
          />
          <circle cx="100" cy="100" r="22" fill="none" stroke={stroke} strokeWidth="2" />
          <circle cx="100" cy="100" r="8" fill={fill} />
        </svg>
      );
    case "peaks":
      return (
        <svg {...props} aria-hidden="true">
          <polygon
            points="20,160 70,60 100,110 130,30 180,160"
            fill="none"
            stroke={stroke}
            strokeWidth="2.5"
          />
          <polygon points="70,60 100,110 130,30" fill={fill} opacity="0.2" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...props} aria-hidden="true">
          <polygon
            points="110,20 60,110 100,110 80,180 150,80 105,80 130,20"
            fill={fill}
          />
        </svg>
      );
    case "stars":
      return (
        <svg {...props} aria-hidden="true">
          <g fill={fill}>
            <polygon points="100,40 108,72 140,72 114,92 124,124 100,104 76,124 86,92 60,72 92,72" />
          </g>
          <g fill={fill} opacity="0.55">
            <polygon points="50,140 54,154 70,154 56,164 62,180 50,170 38,180 44,164 30,154 46,154" />
            <polygon points="150,140 154,154 170,154 156,164 162,180 150,170 138,180 144,164 130,154 146,154" />
          </g>
        </svg>
      );
    case "rise":
      return (
        <svg {...props} aria-hidden="true">
          <path
            d="M30,170 L80,120 L110,150 L170,40"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />
          <polygon points="170,40 145,40 170,65" fill={fill} />
        </svg>
      );
    case "petal":
      return (
        <svg {...props} aria-hidden="true">
          <path
            d="M100,30 C140,60 140,140 100,170 C60,140 60,60 100,30 Z"
            fill={fill}
          />
          <path
            d="M100,30 C140,60 140,140 100,170"
            fill={fill}
            opacity="0.7"
          />
        </svg>
      );
    case "burst":
      return (
        <svg {...props} aria-hidden="true">
          <g stroke={stroke} strokeWidth="3" strokeLinecap="round">
            <line x1="100" y1="20" x2="100" y2="60" />
            <line x1="100" y1="140" x2="100" y2="180" />
            <line x1="20" y1="100" x2="60" y2="100" />
            <line x1="140" y1="100" x2="180" y2="100" />
            <line x1="40" y1="40" x2="68" y2="68" />
            <line x1="132" y1="132" x2="160" y2="160" />
            <line x1="160" y1="40" x2="132" y2="68" />
            <line x1="68" y1="132" x2="40" y2="160" />
          </g>
          <circle cx="100" cy="100" r="22" fill={fill} />
        </svg>
      );
    case "circle-grid":
      return (
        <svg {...props} aria-hidden="true">
          <g fill={fill}>
            {[40, 80, 120, 160].map((y) =>
              [40, 80, 120, 160].map((x) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="6" />
              ))
            )}
          </g>
        </svg>
      );
    case "cradle":
      return (
        <svg {...props} aria-hidden="true">
          <path
            d="M30,80 Q100,180 170,80"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="100" cy="75" r="22" fill={fill} />
        </svg>
      );
    case "crown":
      return (
        <svg {...props} aria-hidden="true">
          <polygon
            points="40,150 50,70 90,120 100,50 110,120 150,70 160,150"
            fill={fill}
          />
          <rect x="40" y="155" width="120" height="14" fill={fill} />
        </svg>
      );
    case "stroke":
      return (
        <svg {...props} aria-hidden="true">
          <path
            d="M20,160 C40,30 80,30 100,100 C120,170 160,170 180,40"
            fill="none"
            stroke={stroke}
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <svg {...props} aria-hidden="true">
          <circle cx="100" cy="100" r="50" fill={fill} />
        </svg>
      );
  }
}
