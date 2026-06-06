"use client";

type Props = {
  /** full: logotype + BRANDER badge · compact: logotype only · mark: just the L symbol */
  variant?: "full" | "compact" | "mark";
  /** Whether to show the BRANDER badge (only applies to "full" variant) */
  showBrander?: boolean;
  /** Extra classes on the wrapper */
  className?: string;

  // NEW prop names (preferred)
  /** Tint applied to the logotype / logogram (PNG is recolored via CSS mask) */
  color?: string;
  /** Tint applied to the BRANDER badge — text and border */
  branderColor?: string;
  /** Height of the logotype in px (the mark variant renders as a square) */
  size?: number;

  // OLD prop names (kept as aliases so older callers don't break)
  /** @deprecated use `branderColor` — kept as alias for the L-mark / accent */
  markColor?: string;
  /** @deprecated use `color` — kept as alias for the wordmark */
  textColor?: string;
  /** @deprecated use `size` */
  height?: number;
};

// Aspect ratio of /public/librum-logotype.png (4921 × 1182)
const WORDMARK_RATIO = 4921 / 1182;

/**
 * Librum logo — uses the actual logotype.png + logogram.png assets, tintable via CSS mask.
 *
 *   <Logo />                                         → librum + BRANDER, defaults
 *   <Logo variant="compact" />                       → logotype only
 *   <Logo variant="mark" />                          → L symbol only
 *   <Logo color="#f5f0e8" branderColor="#d4ff3d" />  → preferred (new) props
 *   <Logo textColor="#f5f0e8" markColor="#d4ff3d" /> → legacy props (still work)
 *
 * The PNGs (white on transparent) are recolored via `mask-image`, so the same
 * asset works in any brand color without needing multiple files.
 */
export default function Logo({
  variant = "full",
  showBrander = true,
  className = "",
  color,
  branderColor,
  size,
  // legacy aliases
  markColor,
  textColor,
  height,
}: Props) {
  // Resolve: new prop wins; otherwise fall back to legacy alias; otherwise default.
  // textColor was used for the wordmark in the old SVG version → maps to new `color`.
  // markColor was used for the L mark / accent → maps to new `branderColor`.
  const resolvedColor = color ?? textColor ?? "#f5f0e8";
  const resolvedBrander = branderColor ?? markColor ?? "#d4ff3d";
  const resolvedSize = size ?? height ?? 22;

  const wordmarkWidth = Math.round(resolvedSize * WORDMARK_RATIO);
  const markSize = Math.round(resolvedSize * 1.15);
  const badgeFont = Math.max(9, Math.round(resolvedSize * 0.4));

  // CSS mask makes the PNG act as a tintable silhouette
  const maskStyle = (
    src: string,
    w: number,
    h: number,
    tint: string
  ): React.CSSProperties => ({
    display: "inline-block",
    width: w,
    height: h,
    backgroundColor: tint,
    WebkitMaskImage: `url("${src}")`,
    maskImage: `url("${src}")`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center left",
    maskPosition: "center left",
  });

  if (variant === "mark") {
    return (
      <span
        className={className}
        aria-label="Librum"
        role="img"
        style={maskStyle("/librum-logogram.png", markSize, markSize, resolvedBrander)}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-3 ${className}`}
      aria-label="Librum · BRANDER"
      role="img"
    >
      <span
        style={maskStyle(
          "/librum-logotype.png",
          wordmarkWidth,
          resolvedSize,
          resolvedColor
        )}
      />
      {variant === "full" && showBrander && (
        <span
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: badgeFont,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: resolvedBrander,
            border: `1px solid ${resolvedBrander}`,
            padding: "3px 7px",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          brander
        </span>
      )}
    </span>
  );
}
