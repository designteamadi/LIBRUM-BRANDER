"use client";

type Props = {
  /** full: logotype + BRANDER badge · compact: logotype only · mark: just the L symbol */
  variant?: "full" | "compact" | "mark";
  /** Whether to show the BRANDER badge (only applies to "full" variant) */
  showBrander?: boolean;
  /** Extra classes on the wrapper */
  className?: string;
  /** Tint applied to the logotype / logogram (PNG is recolored via CSS mask) */
  color?: string;
  /** Tint applied to the BRANDER badge — text and border */
  branderColor?: string;
  /** Height of the logotype in px (the mark variant renders as a square ~size × size) */
  size?: number;
};

// Aspect ratio of /public/librum-logotype.png (4921 × 1182)
const WORDMARK_RATIO = 4921 / 1182;

/**
 * Librum logo — uses the actual logotype.png + logogram.png assets, tintable via CSS mask.
 *
 *   <Logo />                                    → librum + BRANDER badge, defaults
 *   <Logo variant="compact" />                  → librum wordmark only
 *   <Logo variant="mark" />                     → the L symbol only
 *   <Logo color="#ffffff" branderColor="#d4ff3d" /> → white wordmark + lime BRANDER
 *
 * The PNGs (white on transparent) are recolored via `mask-image`, so the
 * same asset works in any brand color without needing multiple files.
 */
export default function Logo({
  variant = "full",
  showBrander = true,
  className = "",
  color = "#f5f0e8",
  branderColor = "#d4ff3d",
  size = 22,
}: Props) {
  const wordmarkWidth = Math.round(size * WORDMARK_RATIO);
  const markSize = Math.round(size * 1.15);
  const badgeFont = Math.max(9, Math.round(size * 0.4));

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
        style={maskStyle("/librum-logogram.png", markSize, markSize, color)}
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
        style={maskStyle("/librum-logotype.png", wordmarkWidth, size, color)}
      />
      {variant === "full" && showBrander && (
        <span
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: badgeFont,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: branderColor,
            border: `1px solid ${branderColor}`,
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
