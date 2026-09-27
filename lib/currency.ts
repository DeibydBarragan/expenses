import type { Lang } from "./i18n/dictionaries";

export const CURRENCIES = [
  { code: "COP", locale: "es-CO", zeroDecimals: true },
  { code: "MXN", locale: "es-MX", zeroDecimals: false },
  { code: "EUR", locale: "es-ES", zeroDecimals: false },
  { code: "USD", locale: "en-US", zeroDecimals: false },
  { code: "ARS", locale: "es-AR", zeroDecimals: false },
  { code: "CLP", locale: "es-CL", zeroDecimals: true },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function currencyMeta(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

function activeLocale(currency: string, lang: Lang): string {
  if (lang === "en") return "en-US";
  return currencyMeta(currency).locale;
}

export function formatMoney(amount: number, currency = "COP", lang: Lang = "es") {
  const meta = currencyMeta(currency);
  try {
    return new Intl.NumberFormat(activeLocale(currency, lang), {
      style: "currency",
      currency,
      maximumFractionDigits: meta.zeroDecimals ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

/** Formatea un entero para el input de monto (agrupación de miles). */
export function formatAmountInput(raw: string, currency: string, lang: Lang): string {
  if (!raw) return "";
  const [int, dec] = raw.split(".");
  const grouped = Number(int || "0").toLocaleString(activeLocale(currency, lang));
  if (dec === undefined) return grouped;
  const sep = activeLocale(currency, lang).startsWith("en") ? "." : ",";
  return `${grouped}${sep}${dec}`;
}

export function formatDateISO(dateStr: string, lang: Lang = "es") {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString(lang === "en" ? "en" : "es", { day: "numeric", month: "short" });
}

/** Fecha larga para "último día de racha" (año solo si no es el actual). */
export function formatDayLong(dateStr: string, lang: Lang = "es") {
  const d = new Date(dateStr + "T12:00:00");
  const locale = lang === "en" ? "en" : "es";
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export function formatMonthYear(year: number, month: number, lang: Lang) {
  return new Date(year, month - 1, 1).toLocaleDateString(lang === "en" ? "en" : "es", {
    month: "long",
    year: "numeric",
  });
}
