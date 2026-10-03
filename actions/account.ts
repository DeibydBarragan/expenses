"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { getLang } from "@/lib/i18n/server";

/** Borra la cuenta completa (auth + cascada). Requiere confirmación en UI. */
export async function deleteAccount() {
  const supabase = await createClient();
  const t = dictionaries[await getLang()];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.rpc("delete_my_account");
  if (error) return { error: t.errors.deleteFail };

  await supabase.auth.signOut();
  redirect("/");
}

/**
 * Crea o cambia la contraseña (p. ej. cuentas de Google sin contraseña).
 * Requiere sesión activa; el email de Google ya está confirmado.
 */
export async function setPassword(formData: FormData) {
  const supabase = await createClient();
  const t = dictionaries[await getLang()];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "auth" };

  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return { error: t.errors.weakPassword };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: t.errors.saveFail };

  revalidatePath("/ajustes");
  return { ok: true, saved: t.settings.passSaved };
}
