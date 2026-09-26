import {
  Bike,
  HeartPulse,
  House,
  Receipt,
  ShoppingBag,
  Sparkles,
  Tag,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { CATEGORY_ICON_KEYS } from "@/lib/category-icons";

const BY_KEY: Record<string, LucideIcon> = {
  food: UtensilsCrossed,
  transport: Bike,
  home: House,
  health: HeartPulse,
  fun: Sparkles,
  shopping: ShoppingBag,
  bills: Receipt,
  other: Tag,
};

/** Emojis antiguos (semilla inicial) → iconos Lucide. */
const LEGACY_EMOJI: Record<string, LucideIcon> = {
  "🍽": UtensilsCrossed,
  "🚲": Bike,
  "⌂": House,
  "＋": HeartPulse,
  "☆": Sparkles,
  "○": ShoppingBag,
  "◌": Receipt,
  "◦": Tag,
};

export { CATEGORY_ICON_KEYS };

export function CategoryIcon({ icon, size = 18 }: { icon: string; size?: number }) {
  const Cmp = BY_KEY[icon] ?? LEGACY_EMOJI[icon] ?? Tag;
  return <Cmp size={size} strokeWidth={2.2} aria-hidden />;
}
