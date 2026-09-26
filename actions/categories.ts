"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const PALETTE = ["#D6A99C", "#A8B8A0", "#C4B5A5", "#9CAF88", "#D4C5A9", "#B8A9C9", "#93A8AC", "#A8A29E"];

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No has iniciado sesión." };

  const name = String(formData.get("name") ?? "").trim().slice(0, 30);
  if (!name) return { error: "Escribe un nombre." };

  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("user_id", user.id);
  const color = PALETTE[(existing?.length ?? 0) % PALETTE.length];

  const { error } = await supabase
    .from("categories")
    .insert({ user_id: user.id, name, icon: "◦", color });
  if (error) return { error: "Esa categoría ya existe." };

  revalidatePath("/categorias");
  revalidatePath("/gastos");
  return { ok: true };
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/categorias");
  revalidatePath("/gastos");
}
