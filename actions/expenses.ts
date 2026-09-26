"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { getLang } from "@/lib/i18n/server";

function expenseSchema(lang: "es" | "en") {
  const t = dictionaries[lang].errors;
  return z.object({
    amount: z.coerce.number().positive(t.amountPositive),
    category_id: z.string().uuid(t.needCategory).or(z.string().min(1, t.needCategory)),
    note: z.string().trim().min(1, t.needExpenseName).max(80),
    date: z.string().min(1, t.needDate),
  });
}

export async function createExpense(formData: FormData) {
  const supabase = await createClient();
  const t = dictionaries[await getLang()].errors;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: t.saveFail };

  const parsed = expenseSchema(await getLang()).safeParse({
    amount: formData.get("amount"),
    category_id: formData.get("category_id"),
    note: formData.get("note") ?? "",
    date: formData.get("date"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? t.saveFail };

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    amount: parsed.data.amount,
    category_id: parsed.data.category_id || null,
    note: parsed.data.note?.trim() || null,
    date: parsed.data.date,
  });

  if (error) return { error: t.saveFail };
  revalidatePath("/inicio");
  revalidatePath("/gastos");
  revalidatePath("/informes");
  return { ok: true };
}

export async function deleteExpense(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("expenses").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/inicio");
  revalidatePath("/gastos");
  revalidatePath("/informes");
}
