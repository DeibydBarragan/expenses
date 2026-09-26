"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const expenseSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  category_id: z.string().uuid("Elige una categoría").or(z.string().min(1, "Elige una categoría")),
  note: z.string().max(120).optional(),
  date: z.string().min(1, "Elige una fecha"),
});

export async function createExpense(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No has iniciado sesión." };

  const parsed = expenseSchema.safeParse({
    amount: formData.get("amount"),
    category_id: formData.get("category_id"),
    note: formData.get("note") ?? "",
    date: formData.get("date"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    amount: parsed.data.amount,
    category_id: parsed.data.category_id || null,
    note: parsed.data.note?.trim() || null,
    date: parsed.data.date,
  });

  if (error) return { error: "No se pudo guardar el gasto." };
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
