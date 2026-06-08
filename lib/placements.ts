import type { MediaChannel } from "./types";

/**
 * Channel metadata for the campaign bento / playbook.
 *
 * `visual`  — true if a generated Nano-Banana image makes sense for this
 *             channel. `radio` and `email` are non-visual: they render as
 *             code-composed cards (a script snippet / an inbox mock) built
 *             from the channel-idea copy, costing zero image generations.
 * `aspect`  — the generation aspect ratio for this channel's placement tiles.
 * `variants`— suffix labels used when a single channel receives more than one
 *             tile (the "go deep on one channel" case), and as the human label
 *             on each placement.
 */
export const CHANNEL_META: Record<
  MediaChannel,
  { label: string; aspect: string; visual: boolean; variants: string[] }
> = {
  instagram: {
    label: "instagram",
    aspect: "4:5",
    visual: true,
    variants: ["feed post", "carousel frame", "story", "grid hero"],
  },
  tiktok: {
    label: "tiktok",
    aspect: "9:16",
    visual: true,
    variants: ["in-feed", "cover frame", "duet split", "hook frame"],
  },
  youtube: {
    label: "youtube",
    aspect: "16:9",
    visual: true,
    variants: ["thumbnail", "bumper", "masthead", "end card"],
  },
  ooh: {
    label: "out of home",
    aspect: "16:9",
    visual: true,
    variants: ["billboard", "transit", "building wrap", "3D anamorphic"],
  },
  print: {
    label: "print",
    aspect: "2:3",
    variants: ["magazine spread", "poster", "press ad", "insert"],
    visual: true,
  },
  web: {
    label: "web",
    aspect: "16:9",
    visual: true,
    variants: ["hero banner", "landing header", "takeover", "tile ad"],
  },
  email: {
    label: "email",
    aspect: "4:5",
    visual: false,
    variants: ["newsletter", "promo blast"],
  },
  radio: {
    label: "radio",
    aspect: "1:1",
    visual: false,
    variants: ["spot script", "live read"],
  },
};

export type PlacementImageSpec = {
  channel: MediaChannel;
  /** which execution variant (0-based) of this channel this tile represents */
  execIndex: number;
  label: string;
  aspect: string;
};

/**
 * Decide how many generated-image tiles each selected channel gets, honoring:
 *   - 1 visual channel selected  → go DEEP: up to 8 distinct cases of it.
 *   - many channels selected      → go WIDE: one (or a few) per channel,
 *                                    total capped at 12 generated images.
 * The total interpolates 8 (n=1) → 12 (n=8) and never exceeds 12.
 * Non-visual channels (radio/email) are NOT included here — they become
 * code-composed cards downstream.
 */
export function planCampaignImageTiles(
  channels: MediaChannel[]
): PlacementImageSpec[] {
  const visual = channels.filter((c) => CHANNEL_META[c]?.visual);

  // Edge case: only non-visual channels (or none) selected. Still give the
  // campaign one generated key-visual tile so the bento isn't bare.
  if (visual.length === 0) {
    const fallback = channels[0] ?? "web";
    return [
      {
        channel: fallback,
        execIndex: 0,
        label: "campaign · key visual",
        aspect: CHANNEL_META[fallback]?.aspect ?? "16:9",
      },
    ];
  }

  const n = visual.length;

  // Total generated image tiles.
  let total: number;
  if (n === 1) {
    total = 8; // go deep on the single channel
  } else {
    // linear 8→12 across n = 2..8, clamped
    const raw = Math.round(8 + ((n - 1) * (12 - 8)) / (8 - 1));
    total = Math.min(12, Math.max(n, raw));
  }
  total = Math.min(12, total);

  // Distribute `total` tiles across the n channels as evenly as possible.
  const base = Math.floor(total / n);
  const rem = total % n;
  const counts = visual.map((_, i) => base + (i < rem ? 1 : 0));

  const specs: PlacementImageSpec[] = [];
  visual.forEach((ch, i) => {
    const meta = CHANNEL_META[ch];
    const count = Math.max(1, counts[i]);
    for (let v = 0; v < count; v++) {
      const variant = meta.variants[v % meta.variants.length];
      specs.push({
        channel: ch,
        execIndex: v,
        label: count > 1 ? `${meta.label} · ${variant}` : meta.label,
        aspect: meta.aspect,
      });
    }
  });

  return specs.slice(0, 12);
}

/** The non-visual channels (radio/email) that become code-composed cards. */
export function nonVisualChannels(channels: MediaChannel[]): MediaChannel[] {
  return channels.filter((c) => CHANNEL_META[c] && !CHANNEL_META[c].visual);
}
