import { redirect } from "next/navigation";
import { FadeIn } from "@/components/animated";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { ExpensesToolbar, type SortKey } from "@/components/expenses-toolbar";
import { ExpensesPagination } from "@/components/expenses-pagination";
import {
  DEFAULT_EXPENSES_PAGE_SIZE,
  getCategories,
  getExpensesPaginated,
  getProfile,
  getSession,
} from "@/lib/queries";
import { getDictionary } from "@/lib/i18n/server";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function cleanDate(v?: string): string | undefined {
  return v && DATE_RE.test(v) ? v : undefined;
}

function gastosHref(base: Record<string, string>, page?: number): string {
  const sp = new URLSearchParams(base);
  sp.delete("page");
  if (page !== undefined && page > 1) sp.set("page", String(page));
  const s = sp.toString();
  return s ? `/gastos?${s}` : "/gastos";
}

export default async function GastosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; from?: string; to?: string; sort?: string; dir?: string; page?: string }>;
}) {
  const { user } = await getSession();
  if (!user) redirect("/login");
  const { lang, t } = await getDictionary();
  const profile = await getProfile(user.id);
  const categories = await getCategories();

  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const catRaw = sp.cat ?? "all";
  const cat: string =
    catRaw === "none" || categories.some((c) => c.id === catRaw) ? catRaw : "all";
  const from = cleanDate(sp.from);
  const to = cleanDate(sp.to);
  const sortBy = sp.sort === "amount" ? "amount" : "date";
  const sortDir = sp.dir === "asc" ? "asc" : "desc";
  const sortKey = `${sortBy}-${sortDir}` as SortKey;

  // Params saneados (sin valores por defecto) para preservar filtros al paginar.
  const base: Record<string, string> = {};
  if (q) base.q = q;
  if (cat !== "all") base.cat = cat;
  if (from) base.from = from;
  if (to) base.to = to;
  if (sortKey !== "date-desc") {
    base.sort = sortBy;
    base.dir = sortDir;
  }

  // ?page inválido → URL limpia (primera página).
  const rawPage = sp.page;
  const page = rawPage === undefined ? 1 : Number(rawPage);
  if (rawPage !== undefined && (!Number.isInteger(page) || page < 1)) {
    redirect(gastosHref(base));
  }

  const { data, count, totalPages } = await getExpensesPaginated({
    search: q || undefined,
    categoryId: cat === "all" ? undefined : cat === "none" ? null : cat,
    from,
    to,
    sortBy,
    sortDir,
    page,
    pageSize: DEFAULT_EXPENSES_PAGE_SIZE,
  });

  // ?page más allá del final → última página (mantiene filtros).
  if (totalPages > 0 && page > totalPages) {
    redirect(gastosHref(base, totalPages));
  }

  return (
    <>
      <FadeIn>
        <section>
          <h1 className="text-balance text-2xl font-semibold tracking-tight">{t.nav.expenses}</h1>
          <p className="mt-1 text-sm text-muted">{t.list.allSub}</p>
        </section>
      </FadeIn>
      <ExpenseForm categories={categories} currency={profile?.currency ?? "COP"} />
      <ExpensesToolbar
        categories={categories}
        initial={{ q, cat, from: from ?? "", to: to ?? "", sortKey }}
      />
      <p className="text-sm text-muted tabular-nums" aria-live="polite">
        {t.reports.count(count)}
      </p>
      <ExpenseList expenses={data} categories={categories} currency={profile?.currency ?? "COP"} lang={lang} t={t} />
      <ExpensesPagination page={page} totalPages={totalPages} params={base} />
    </>
  );
}
