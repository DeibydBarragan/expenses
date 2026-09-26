export const CATEGORY_ICON_KEYS = [
  "food",
  "transport",
  "home",
  "health",
  "fun",
  "shopping",
  "bills",
  "other",
] as const;

export type CategoryIconKey = (typeof CATEGORY_ICON_KEYS)[number];
