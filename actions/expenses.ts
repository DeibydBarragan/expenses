"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getExpensesPaginated } from "@/lib/queries";
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

export async function updateExpense(formData: FormData) {
  const supabase = await createClient();
  const t = dictionaries[await getLang()].errors;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: t.saveFail };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: t.saveFail };

  const parsed = expenseSchema(await getLang()).safeParse({
    amount: formData.get("amount"),
    category_id: formData.get("category_id"),
    note: formData.get("note") ?? "",
    date: formData.get("date"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? t.saveFail };

  const { error } = await supabase
    .from("expenses")
    .update({
      amount: parsed.data.amount,
      category_id: parsed.data.category_id || null,
      note: parsed.data.note?.trim() || null,
      date: parsed.data.date,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: t.saveFail };
  revalidatePath("/inicio");
  revalidatePath("/gastos");
  revalidatePath("/informes");
  return { ok: true };
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const categoryPageSchema = z.object({
  categoryId: z.string().uuid().nullable(),
  from: z.string().regex(DATE_RE).optional(),
  to: z.string().regex(DATE_RE).optional(),
  search: z.string().trim().max(80).optional(),
  sortBy: z.enum(["date", "amount", "created_at"]).default("date"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

/**
 * Página de gastos de una categoría para el modal de detalle
 * (informes y categorías). Reutiliza la query paginada de Fase 0.
 */
export async function fetchCategoryExpensesPage(input: z.input<typeof categoryPageSchema>) {
  const supabase = await createClient();
  const t = dictionaries[await getLang()].errors;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: t.saveFail };

  const parsed = categoryPageSchema.safeParse(input);
  if (!parsed.success) return { error: t.saveFail };

  const { categoryId, from, to, search, sortBy, sortDir, page, pageSize } = parsed.data;
  const res = await getExpensesPaginated({
    search: search || undefined,
    categoryId,
    from,
    to,
    sortBy,
    sortDir,
    page,
    pageSize,
  });
  return { ok: true as const, ...res };
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
