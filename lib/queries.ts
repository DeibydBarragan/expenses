import { createClient } from "@/lib/supabase/server";
import type { Category, Expense, Profile } from "@/lib/types";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, name, currency").eq("id", userId).single();
  return data as Profile | null;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("id, name, icon, color").order("name");
  return (data ?? []) as Category[];
}

export async function getRecentExpenses(limit = 30): Promise<Expense[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("expenses")
    .select("id, amount, note, date, category_id, categories(id, name, icon, color)")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as Expense[];
}

export async function getMonthExpenses(year: number, month: number): Promise<Expense[]> {
  const supabase = await createClient();
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const toDate = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${toDate}`;
  const { data } = await supabase
    .from("expenses")
    .select("id, amount, note, date, category_id, categories(id, name, icon, color)")
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: false });
  return (data ?? []) as unknown as Expense[];
}
