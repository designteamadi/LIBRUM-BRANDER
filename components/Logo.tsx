"use client";

type Props = {
  variant?: "full" | "compact" | "mark";
  showBrander?: boolean;
  className?: string;
  markColor?: string;
  textColor?: string;
};

/**
 * The Librum logo — geometric L with a flag/sail extension at the top.
 * Three variants:
 *   - full: mark + wordmark + BRANDER badge
 *   - compact: mark + wordmark only
 *   - mark: just the L symbol
 */
export default function Logo({
  variant = "full",
  showBrander = true,
  className = "",
  markColor = "currentColor",
  textColor = "currentColor",
}: Props) {
  if (variant === "mark") {
    return (
      <span className={className}>
        <LMark color={markColor} />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-baseline gap-2 ${className}`}
      style={{ color: textColor }}
    >
      <span className="inline-block translate-y-1">
        <LMark color={markColor} size={22} />
      </span>
      <span
        className="font-display text-[1.6em] tracking-tight leading-none"
        style={{ fontFamily: "var(--font-display)" }}
      >
        librum
      </span>
      {variant === "full" && showBrander && (
        <span
          className="ml-1 font-mono text-[0.4em] tracking-[0.22em] uppercase border px-1.5 py-0.5 leading-none translate-y-[-2px]"
          style={{
            borderColor: markColor,
            color: markColor,
          }}
        >
          brander
        </span>
      )}
    </span>
  );
}

/** The L mark — vertical column with a triangular flag extending right */
export function LMark({
  color = "currentColor",
  size = 32,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      {/* L body — vertical column with foot */}
      <polygon
        points="18,8 42,8 42,72 78,72 78,92 18,92"
        fill={color}
      />
      {/* Flag — triangular sail extending right from the top */}
      <polygon
        points="42,8 92,8 72,38 42,38"
        fill={color}
      />
    </svg>
  );
}
