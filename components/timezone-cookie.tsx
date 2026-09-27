"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TIMEZONE_COOKIE } from "@/lib/tz";

/** Guarda la zona horaria del dispositivo en una cookie (una sola vez). */
export function TimezoneCookie() {
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    let tz: string | null = null;
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      tz = null;
    }
    if (!tz) return;
    const current = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${TIMEZONE_COOKIE}=`))
      ?.split("=")[1];
    if (current !== tz) {
      document.cookie = `${TIMEZONE_COOKIE}=${tz}; path=/; max-age=31536000`;
      router.refresh();
    }
  }, [router]);

  return null;
}
