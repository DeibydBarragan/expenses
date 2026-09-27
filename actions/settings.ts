"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CURRENCIES } from "@/lib/currency";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { getLang } from "@/lib/i18n/server";

export async function updateCurrency(formData: FormData) {
  const supabase = await createClient();
  const t = dictionaries[await getLang()];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: t.errors.saveFail };

  const currency = String(formData.get("currency") ?? "");
  if (!CURRENCIES.some((c) => c.code === currency)) return { error: t.errors.saveFail };

  const { error } = await supabase.from("profiles").update({ currency }).eq("id", user.id);
  if (error) return { error: t.errors.saveFail };

  for (const p of ["/inicio", "/gastos", "/informes", "/ajustes"]) revalidatePath(p);
  return { ok: true, saved: t.settings.saved };
}

export async function updateShowStreak(value: boolean) {
  const supabase = await createClient();
  const t = dictionaries[await getLang()];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: t.errors.saveFail };

  const { error } = await supabase.from("profiles").update({ show_streak: value }).eq("id", user.id);
  if (error) return { error: t.errors.saveFail };

  for (const p of ["/inicio", "/ajustes"]) revalidatePath(p);
  return { ok: true };
}
