import type { ArchetypeKey } from "./types";

/** Visual signature for each archetype — color + SVG composition that captures its mood */
export const ARCHETYPE_VISUALS: Record<
  ArchetypeKey,
  { accent: string; backdrop: string; ink: string; symbol: string }
> = {
  innocent: {
    accent: "#f4f0e6",
    backdrop: "#1a1a1a",
    ink: "#f4f0e6",
    symbol: "soft-orb",
  },
  sage: {
    accent: "#a9b8c9",
    backdrop: "#0e1418",
    ink: "#f4f0e6",
    symbol: "open-eye",
  },
  explorer: {
    accent: "#d4ff3d",
    backdrop: "#0f1419",
    ink: "#f4f0e6",
    symbol: "peaks",
  },
  outlaw: {
    accent: "#ff3e8e",
    backdrop: "#0a0a0a",
    ink: "#f4f0e6",
    symbol: "bolt",
  },
  magician: {
    accent: "#b990ff",
    backdrop: "#15102a",
    ink: "#f4f0e6",
    symbol: "stars",
  },
  hero: {
    accent: "#1fc9d7",
    backdrop: "#0a1518",
    ink: "#f4f0e6",
    symbol: "rise",
  },
  lover: {
    accent: "#ff6b8b",
    backdrop: "#1c0e12",
    ink: "#f4f0e6",
    symbol: "petal",
  },
  jester: {
    accent: "#ffd23f",
    backdrop: "#181615",
    ink: "#1a1a1a",
    symbol: "burst",
  },
  everyman: {
    accent: "#7ad19b",
    backdrop: "#0f1612",
    ink: "#f4f0e6",
    symbol: "circle-grid",
  },
  caregiver: {
    accent: "#ffb84d",
    backdrop: "#1a140e",
    ink: "#f4f0e6",
    symbol: "cradle",
  },
  ruler: {
    accent: "#d4b85a",
    backdrop: "#0d0d0d",
    ink: "#f4f0e6",
    symbol: "crown",
  },
  creator: {
    accent: "#54d4c3",
    backdrop: "#0a1818",
    ink: "#f4f0e6",
    symbol: "stroke",
  },
};
