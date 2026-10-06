import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  Expense,
  ExpensesFilter,
  ExpensesPage,
  ExpenseSortBy,
  ExpenseSortDir,
  Profile,
} from "@/lib/types";

const EXPENSE_SELECT =
  "id, amount, note, date, category_id, categories(id, name, icon, color)";

export const DEFAULT_EXPENSES_PAGE_SIZE = 20;
const MAX_EXPENSES_PAGE_SIZE = 100;

function monthRange(year: number, month: number): { from: string; to: string } {
  const mm = String(month).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  return { from: `${year}-${mm}-01`, to: `${year}-${mm}-${lastDay}` };
}

function sanitizePage(page?: number): number {
  if (!Number.isFinite(page)) return 1;
  return Math.max(1, Math.floor(page as number));
}

function sanitizePageSize(pageSize?: number): number {
  if (!Number.isFinite(pageSize)) return DEFAULT_EXPENSES_PAGE_SIZE;
  return Math.min(
    MAX_EXPENSES_PAGE_SIZE,
    Math.max(1, Math.floor(pageSize as number))
  );
}

function sanitizeSort(sortBy?: ExpenseSortBy, sortDir?: ExpenseSortDir) {
  const by: ExpenseSortBy =
    sortBy === "amount" || sortBy === "created_at" ? sortBy : "date";
  const ascending = sortDir === "asc";
  return { by, ascending };
}

function escapeLikePattern(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, name, currency, streak_reset_at, show_streak").eq("id", userId).single();
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

/**
 * Fase 0: query única paginada con buscador / filtros / orden.
 * - `search` filtra por `note` con `ilike`.
 * - `categoryId`: `undefined` = todas, `null` = sin categoría, `string` = esa categoría.
 * - `from`/`to`: rango de `date` inclusivo (`YYYY-MM-DD`).
 * - Orden principal + desempate estable por `created_at desc`.
 * Usa `.range()` + `count: "exact"` para no traer todo de golpe.
 */
export async function getExpensesPaginated(
  filter: ExpensesFilter = {}
): Promise<ExpensesPage> {
  const supabase = await createClient();
  const page = sanitizePage(filter.page);
  const pageSize = sanitizePageSize(filter.pageSize);
  const { by, ascending } = sanitizeSort(filter.sortBy, filter.sortDir);

  let query = supabase
    .from("expenses")
    .select(EXPENSE_SELECT, { count: "exact" });

  const search = filter.search?.trim();
  if (search) {
    query = query.ilike("note", `%${escapeLikePattern(search)}%`);
  }

  if (filter.categoryId !== undefined) {
    query =
      filter.categoryId === null
        ? query.is("category_id", null)
        : query.eq("category_id", filter.categoryId);
  }

  if (filter.from) {
    query = query.gte("date", filter.from);
  }
  if (filter.to) {
    query = query.lte("date", filter.to);
  }

  query = query.order(by, { ascending });
  if (by !== "created_at") {
    // Desempate estable para que la paginación no duplique/salte filas.
    query = query.order("created_at", { ascending: false });
  }

  const fromIdx = (page - 1) * pageSize;
  query = query.range(fromIdx, fromIdx + pageSize - 1);

  const { data, count, error } = await query;
  if (error) {
    return { data: [], count: 0, totalPages: 0, page, pageSize };
  }
  const total = count ?? 0;
  return {
    data: (data ?? []) as unknown as Expense[],
    count: total,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    page,
    pageSize,
  };
}

/**
 * Detalle para el modal de informes: gastos de una categoría dentro de un mes.
 * Reutiliza `getExpensesPaginated` para no duplicar lógica de filtros/orden.
 */
export async function getCategoryMonthExpenses(
  year: number,
  month: number,
  categoryId: string | null,
  limit = 100
): Promise<Expense[]> {
  const { from, to } = monthRange(year, month);
  const { data } = await getExpensesPaginated({
    categoryId,
    from,
    to,
    sortBy: "date",
    sortDir: "desc",
    page: 1,
    pageSize: limit,
  });
  return data;
}

/** Actividad para la racha: días con gastos + marcas, con hora de creación. */
export async function getStreakActivity(): Promise<{ date: string; createdAt: string }[]> {
  const supabase = await createClient();
  const [exp, marks] = await Promise.all([
    supabase.from("expenses").select("date, created_at"),
    supabase.from("day_marks").select("date, created_at"),
  ]);
  const out: { date: string; createdAt: string }[] = [];
  for (const r of (exp.data ?? []) as { date: string; created_at: string }[])
    out.push({ date: r.date, createdAt: r.created_at });
  for (const r of (marks.data ?? []) as { date: string; created_at: string }[])
    out.push({ date: r.date, createdAt: r.created_at });
  return out;
}
