"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { getLang } from "@/lib/i18n/server";
import { getTimeZone, todayISOInTZ } from "@/lib/time";

/** Marca hoy (hora del usuario) como "sin gastos" para mantener la racha. */
export async function markNoExpenses() {
  const supabase = await createClient();
  const t = dictionaries[await getLang()];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: t.errors.saveFail };

  const { error } = await supabase
    .from("day_marks")
    .upsert({ user_id: user.id, date: todayISOInTZ(await getTimeZone()) }, { onConflict: "user_id,date" });
  if (error) return { error: t.errors.saveFail };

  revalidatePath("/inicio");
  return { ok: true, marked: t.streak.marked };
}

/** Reinicia la racha: archiva el historial (no borra gastos). Pide confirmación en UI. */
export async function resetStreak() {
  const supabase = await createClient();
  const t = dictionaries[await getLang()];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: t.errors.saveFail };

  const { error } = await supabase
    .from("profiles")
    .update({ streak_reset_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) return { error: t.errors.saveFail };

  revalidatePath("/inicio");
  revalidatePath("/ajustes");
  return { ok: true, reset: t.streak.resetDone };
}
