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

/** Fechas cubiertas para la racha: días con gastos + días marcados "sin gastos". */
export async function getCoveredDates(): Promise<Set<string>> {
  const supabase = await createClient();
  const [exp, marks] = await Promise.all([
    supabase.from("expenses").select("date"),
    supabase.from("day_marks").select("date"),
  ]);
  const set = new Set<string>();
  for (const r of (exp.data ?? []) as { date: string }[]) set.add(r.date);
  for (const r of (marks.data ?? []) as { date: string }[]) set.add(r.date);
  return set;
}
