"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_ICON_KEYS } from "@/lib/category-icons";
import type { CategoryIconKey } from "@/lib/category-icons";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { getLang } from "@/lib/i18n/server";

const PALETTE = ["#F97316", "#2563EB", "#9333EA", "#16A34A", "#DB2777", "#0891B2", "#65A30D", "#64748B", "#EF4444", "#EAB308", "#0D9488", "#4F46E5"];

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const t = dictionaries[await getLang()].errors;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: t.saveFail };

  const name = String(formData.get("name") ?? "").trim().slice(0, 30);
  if (!name) return { error: t.needName };

  const picked = String(formData.get("icon") ?? "");

  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("user_id", user.id);
  const n = existing?.length ?? 0;

  const icon: CategoryIconKey = (CATEGORY_ICON_KEYS as readonly string[]).includes(picked)
    ? (picked as CategoryIconKey)
    : CATEGORY_ICON_KEYS[n % CATEGORY_ICON_KEYS.length];

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name,
    icon,
    color: PALETTE[n % PALETTE.length],
  });
  if (error) return { error: t.catExists };

  revalidatePath("/categorias");
  revalidatePath("/gastos");
  return { ok: true };
}

export async function updateCategory(formData: FormData) {
  const supabase = await createClient();
  const t = dictionaries[await getLang()].errors;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: t.saveFail };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim().slice(0, 30);
  const icon = String(formData.get("icon") ?? "");
  if (!id) return { error: t.saveFail };
  if (!name) return { error: t.needName };
  if (!(CATEGORY_ICON_KEYS as readonly string[]).includes(icon)) return { error: t.saveFail };

  const { error } = await supabase
    .from("categories")
    .update({ name, icon })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: t.catExists };

  revalidatePath("/categorias");
  revalidatePath("/gastos");
  revalidatePath("/informes");
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

  await supabase.from("categories").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/categorias");
  revalidatePath("/gastos");
}
