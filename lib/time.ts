import { cookies } from "next/headers";
import { DEFAULT_TZ, TIMEZONE_COOKIE } from "./tz";

export async function getTimeZone(): Promise<string> {
  const store = await cookies();
  const tz = store.get(TIMEZONE_COOKIE)?.value;
  if (!tz) return DEFAULT_TZ;
  try {
    Intl.DateTimeFormat("en-CA", { timeZone: tz });
    return tz;
  } catch {
    return DEFAULT_TZ;
  }
}

/** Fecha local YYYY-MM-DD del usuario en su zona horaria. */
export function todayISOInTZ(tz: string, now = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  } catch {
    return now.toISOString().slice(0, 10);
  }
}
