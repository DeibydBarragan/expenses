"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { getLang } from "@/lib/i18n/server";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Marca hoy como "sin gastos" para mantener la racha. */
export async function markNoExpenses() {
  const supabase = await createClient();
  const t = dictionaries[await getLang()];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: t.errors.saveFail };

  const { error } = await supabase
    .from("day_marks")
    .upsert({ user_id: user.id, date: todayISO() }, { onConflict: "user_id,date" });
  if (error) return { error: t.errors.saveFail };

  revalidatePath("/inicio");
  return { ok: true, marked: t.streak.marked };
}
