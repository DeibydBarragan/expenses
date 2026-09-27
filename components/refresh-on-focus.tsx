"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Revalida la página al volver a la pestaña (p. ej. al día siguiente). */
export function RefreshOnFocus() {
  const router = useRouter();

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") router.refresh();
    }
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [router]);

  return null;
}
