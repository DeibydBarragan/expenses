"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { getLang } from "@/lib/i18n/server";
import { getTimeZone, todayISOInTZ } from "@/lib/time";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Marca un día (por defecto hoy, o un día pasado especificado) como "sin gastos" para mantener o reparar la racha. */
export async function markNoExpenses(targetDate?: string) {
  const supabase = await createClient();
  const t = dictionaries[await getLang()];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: t.errors.saveFail };

  const todayStr = todayISOInTZ(await getTimeZone());
  let dateToMark = todayStr;
  if (targetDate) {
    if (!DATE_RE.test(targetDate) || targetDate > todayStr) {
      return { error: t.errors.saveFail };
    }
    dateToMark = targetDate;
  }

  const { error } = await supabase
    .from("day_marks")
    .upsert({ user_id: user.id, date: dateToMark }, { onConflict: "user_id,date" });
  if (error) return { error: t.errors.saveFail };

  revalidatePath("/inicio");
  return { ok: true, marked: t.streak.marked };
}

/** Desmarca un día que se había marcado como "sin gastos". */
export async function unmarkNoExpenses(targetDate?: string) {
  const supabase = await createClient();
  const t = dictionaries[await getLang()];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: t.errors.saveFail };

  const todayStr = todayISOInTZ(await getTimeZone());
  let dateToUnmark = todayStr;
  if (targetDate) {
    if (!DATE_RE.test(targetDate)) {
      return { error: t.errors.saveFail };
    }
    dateToUnmark = targetDate;
  }

  const { error } = await supabase
    .from("day_marks")
    .delete()
    .eq("user_id", user.id)
    .eq("date", dateToUnmark);
  if (error) return { error: t.errors.saveFail };

  revalidatePath("/inicio");
  return { ok: true, unmarked: t.streak.unmarked };
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
