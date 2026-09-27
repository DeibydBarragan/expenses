"use server";

import { redirect } from "next/navigation";
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
