import { redirect } from "next/navigation";
import { Card } from "@heroui/react";
import { FadeIn } from "@/components/animated";
import { CategoryChart } from "@/components/category-chart";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { StreakCard } from "@/components/streak-card";
import { formatMoney } from "@/lib/currency";
import { getCategories, getMonthExpenses, getProfile, getRecentExpenses, getSession, getStreakActivity } from "@/lib/queries";
import { computeStreak } from "@/lib/streak";
import { getTimeZone, todayISOInTZ } from "@/lib/time";
import { getDictionary } from "@/lib/i18n/server";

export default async function InicioPage() {
  const { user } = await getSession();
  if (!user) redirect("/login");

  const { lang, t } = await getDictionary();
  const profile = await getProfile(user.id);
  const currency = profile?.currency ?? "COP";
  const now = new Date();
  const [monthExpenses, recent, categories, activity] = await Promise.all([
    getMonthExpenses(now.getFullYear(), now.getMonth() + 1),
    getRecentExpenses(5),
    getCategories(),
    getStreakActivity(),
  ]);
  const todayStr = todayISOInTZ(await getTimeZone());
  const streak = computeStreak(activity, todayStr, profile?.streak_reset_at ?? null);

  const totalMes = monthExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalHoy = monthExpenses
    .filter((e) => e.date === todayStr)
    .reduce((s, e) => s + Number(e.amount), 0);

  const byCat = new Map<string, { id: string | null; name: string; color: string; icon: string; total: number; n: number }>();
  for (const e of monthExpenses) {
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
  const top = [...byCat.values()].sort((a, b) => b.total - a.total).slice(0, 3);
  const monthName = now.toLocaleDateString(lang === "en" ? "en" : "es", { month: "long" });

  return (
    <>
      <section>
        <p className="text-sm text-muted">
          {t.home.hello}
          {profile?.name ? `, ${profile.name}` : ""} 👋
        </p>
        <h1 className="text-balance text-2xl font-semibold capitalize tracking-tight">{monthName}</h1>
      </section>

      <FadeIn>
        <section className="grid grid-cols-2 gap-3">
          <Card>
            <Card.Content className="p-4">
              <p className="text-xs text-muted">{t.home.thisMonth}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {formatMoney(totalMes, currency, lang)}
              </p>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="p-4">
              <p className="text-xs text-muted">{t.home.today}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {formatMoney(totalHoy, currency, lang)}
              </p>
            </Card.Content>
          </Card>
        </section>
      </FadeIn>

      <ExpenseForm categories={categories} currency={currency} />

      {profile?.show_streak !== false && (
        <FadeIn delay={0.05}>
          <StreakCard streak={streak} t={t} lang={lang} />
        </FadeIn>
      )}

      <CategoryChart
        title={t.home.top}
        emptyText={t.home.noMonth}
        rows={top}
        total={totalMes}
        currency={currency}
        lang={lang}
        defaultView="bar"
        storageKey="expenses-chart-inicio"
      />

      <section>
        <h2 className="mb-2 text-sm font-medium text-muted">{t.home.recent}</h2>
        <ExpenseList expenses={recent} categories={categories} currency={currency} lang={lang} t={t} />
      </section>
    </>
  );
}
