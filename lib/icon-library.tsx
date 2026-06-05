"use client";
import {
  Zap,
  Code,
  Settings,
  Heart,
  Star,
  Users,
  Target,
  Sparkles,
  Layers,
  Compass,
  Mountain,
  Anchor,
  Leaf,
  Flame,
  Droplet,
  Sun,
  Moon,
  Infinity as InfinityIcon,
  Eye,
  Key,
  Mic,
  Music,
  Palette,
  Pencil,
  Rocket,
  Scale,
  Search,
  Shield,
  Smile,
  Send,
  Globe,
  Wifi,
  Coffee,
  Box,
  Hammer,
  Wrench,
  Award,
  Crown,
  Feather,
  Flag,
  TrendingUp,
  Lightbulb,
  Map,
  Hexagon,
  Diamond,
  Triangle,
  Circle,
  Square,
  ShoppingBag,
  Headphones,
  Camera,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  zap: Zap,
  code: Code,
  settings: Settings,
  heart: Heart,
  star: Star,
  users: Users,
  target: Target,
  sparkles: Sparkles,
  layers: Layers,
  compass: Compass,
  mountain: Mountain,
  anchor: Anchor,
  leaf: Leaf,
  flame: Flame,
  drop: Droplet,
  droplet: Droplet,
  sun: Sun,
  moon: Moon,
  infinity: InfinityIcon,
  eye: Eye,
  key: Key,
  mic: Mic,
  music: Music,
  palette: Palette,
  pencil: Pencil,
  rocket: Rocket,
  scale: Scale,
  search: Search,
  shield: Shield,
  smile: Smile,
  send: Send,
  globe: Globe,
  wifi: Wifi,
  coffee: Coffee,
  box: Box,
  hammer: Hammer,
  wrench: Wrench,
  award: Award,
  crown: Crown,
  feather: Feather,
  flag: Flag,
  "trending-up": TrendingUp,
  lightbulb: Lightbulb,
  map: Map,
  hexagon: Hexagon,
  diamond: Diamond,
  triangle: Triangle,
  circle: Circle,
  square: Square,
  bag: ShoppingBag,
  "shopping-bag": ShoppingBag,
  headphones: Headphones,
  camera: Camera,
};

export function Icon({
  name,
  size = 24,
  className = "",
  strokeWidth = 1.5,
  color,
  fill,
}: {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
  color?: string;
  fill?: string;
}) {
  const Component = ICON_MAP[name?.toLowerCase()] || Sparkles;
  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      color={color}
      fill={fill}
    />
  );
}
