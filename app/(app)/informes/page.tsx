import { redirect } from "next/navigation";
import { Card } from "@heroui/react";
import { FadeIn } from "@/components/animated";
import { CategoryChart } from "@/components/category-chart";
import { MonthPager } from "@/components/month-pager";
import { formatMonthYear, formatMoney } from "@/lib/currency";
import { getCategories, getMonthExpenses, getProfile, getSession } from "@/lib/queries";
import { getDictionary } from "@/lib/i18n/server";

export default async function InformesPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const { user } = await getSession();
  if (!user) redirect("/login");
  const { lang, t } = await getDictionary();
  const profile = await getProfile(user.id);
  const currency = profile?.currency ?? "COP";

  const sp = await searchParams;
  const now = new Date();
  const year = Number(sp.y ?? now.getFullYear());
  const month = Number(sp.m ?? now.getMonth() + 1);

  const [expenses, categories] = await Promise.all([
    getMonthExpenses(year, month),
    getCategories(),
  ]);
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const count = expenses.length;
  const daysInMonth = new Date(year, month, 0).getDate();
  const dayAvg = total / daysInMonth;

  const byCat = new Map<string, { id: string | null; name: string; color: string; icon: string; total: number; n: number }>();
  for (const e of expenses) {
    const id = e.category_id;
    const key = id ?? "__uncategorized";
    const prev = byCat.get(key) ?? {
      id,
      name: e.categories?.name ?? t.list.uncategorized,
      color: e.categories?.color ?? "#64748B",
      icon: e.categories?.icon ?? "other",
      total: 0,
      n: 0,
    };
    prev.total += Number(e.amount);
    prev.n += 1;
    byCat.set(key, prev);
  }
  const rows = [...byCat.values()].sort((a, b) => b.total - a.total);

  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };

  return (
    <>
      <FadeIn>
        <section className="flex items-center justify-between">
          <MonthPager
            prevHref={`/informes?y=${prev.y}&m=${prev.m}`}
            nextHref={`/informes?y=${next.y}&m=${next.m}`}
            prevLabel={t.reports.prev}
            nextLabel={t.reports.next}
          >
            <div className="text-center">
              <h1 className="text-balance text-2xl font-semibold capitalize tracking-tight">
                {formatMonthYear(year, month, lang)}
              </h1>
              <p className="text-sm text-muted">{t.reports.count(count)}</p>
            </div>
          </MonthPager>
        </section>
      </FadeIn>

      <FadeIn delay={0.05}>
        <section className="grid grid-cols-3 gap-3">
        <Card>
          <Card.Content className="p-4">
            <p className="text-xs text-muted">{t.reports.total}</p>
            <p className="mt-1 font-semibold tabular-nums">{formatMoney(total, currency, lang)}</p>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content className="p-4">
            <p className="text-xs text-muted">{t.reports.num}</p>
            <p className="mt-1 font-semibold tabular-nums">{count}</p>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content className="p-4">
            <p className="text-xs text-muted">{t.reports.dayAvg}</p>
            <p className="mt-1 font-semibold tabular-nums">{formatMoney(dayAvg, currency, lang)}</p>
          </Card.Content>
        </Card>
      </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <CategoryChart
          title={t.reports.byCat}
          totalText={formatMoney(total, currency, lang)}
          rows={rows}
          total={total}
          currency={currency}
          lang={lang}
          defaultView="pie"
          storageKey="expenses-chart-informes"
          scope={{ kind: "month", year, month }}
          categories={categories}
        />
      </FadeIn>
    </>
  );
}
