import type { ArchetypeKey } from "./types";

export type Archetype = {
  key: ArchetypeKey;
  name: string;
  motto: string;
  desire: string;
  voice: string;
  examples: string;
};

export const ARCHETYPES: Archetype[] = [
  {
    key: "innocent",
    name: "Innocent",
    motto: "Free to be you and me",
    desire: "Paradise, simplicity, safety",
    voice: "Optimistic, pure, honest, nostalgic",
    examples: "Dove, Coca-Cola, Aveeno",
  },
  {
    key: "sage",
    name: "Sage",
    motto: "The truth will set you free",
    desire: "Knowledge, understanding, wisdom",
    voice: "Thoughtful, expert, considered, clear",
    examples: "Google, BBC, The Economist",
  },
  {
    key: "explorer",
    name: "Explorer",
    motto: "Don't fence me in",
    desire: "Freedom, discovery, adventure",
    voice: "Restless, brave, plainspoken, vivid",
    examples: "Patagonia, Jeep, The North Face",
  },
  {
    key: "outlaw",
    name: "Outlaw",
    motto: "Rules are made to be broken",
    desire: "Revolution, rebellion, disruption",
    voice: "Defiant, raw, witty, unapologetic",
    examples: "Harley-Davidson, Liquid Death, Diesel",
  },
  {
    key: "magician",
    name: "Magician",
    motto: "I make dreams come true",
    desire: "Transformation, vision, possibility",
    voice: "Mystical, charismatic, inspiring, precise",
    examples: "Disney, Apple, Tesla",
  },
  {
    key: "hero",
    name: "Hero",
    motto: "Where there's a will, there's a way",
    desire: "Mastery, courage, triumph",
    voice: "Bold, direct, confident, motivating",
    examples: "Nike, BMW, Duracell",
  },
  {
    key: "lover",
    name: "Lover",
    motto: "I only have eyes for you",
    desire: "Intimacy, beauty, connection",
    voice: "Sensual, warm, indulgent, poetic",
    examples: "Chanel, Häagen-Dazs, Victoria's Secret",
  },
  {
    key: "jester",
    name: "Jester",
    motto: "You only live once",
    desire: "Joy, play, lightness",
    voice: "Playful, irreverent, quick, surprising",
    examples: "Old Spice, M&M's, Skittles",
  },
  {
    key: "everyman",
    name: "Everyman",
    motto: "All people are created equal",
    desire: "Belonging, connection, fairness",
    voice: "Friendly, humble, grounded, real",
    examples: "IKEA, Levi's, Target",
  },
  {
    key: "caregiver",
    name: "Caregiver",
    motto: "Love your neighbor as yourself",
    desire: "Service, protection, care",
    voice: "Warm, generous, reassuring, attentive",
    examples: "Johnson & Johnson, UNICEF, Volvo",
  },
  {
    key: "ruler",
    name: "Ruler",
    motto: "Power isn't everything, it's the only thing",
    desire: "Control, prosperity, prestige",
    voice: "Authoritative, refined, commanding, precise",
    examples: "Rolex, Mercedes-Benz, American Express",
  },
  {
    key: "creator",
    name: "Creator",
    motto: "If you can imagine it, it can be done",
    desire: "Self-expression, innovation, craft",
    voice: "Inventive, artful, considered, distinctive",
    examples: "Lego, Adobe, Crayola",
  },
];

export const archetypeByKey = (k: ArchetypeKey) =>
  ARCHETYPES.find((a) => a.key === k)!;
