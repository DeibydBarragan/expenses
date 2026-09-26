export const CURRENCIES = [
  { code: "COP", label: "Peso colombiano ($)", locale: "es-CO" },
  { code: "MXN", label: "Peso mexicano ($)", locale: "es-MX" },
  { code: "EUR", label: "Euro (€)", locale: "es-ES" },
  { code: "USD", label: "Dólar (US$)", locale: "en-US" },
  { code: "ARS", label: "Peso argentino ($)", locale: "es-AR" },
  { code: "CLP", label: "Peso chileno ($)", locale: "es-CL" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function formatMoney(amount: number, currency = "COP") {
  const found = CURRENCIES.find((c) => c.code === currency);
  const locale = found?.locale ?? "es-CO";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "COP" || currency === "CLP" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatDateISO(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es", { day: "numeric", month: "short" });
}
