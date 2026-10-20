import { redirect } from "next/navigation";
import { Card } from "@heroui/react";
import { FadeIn } from "@/components/animated";
import { CategoryChart } from "@/components/category-chart";
import { DayPager } from "@/components/day-pager";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { StreakCard } from "@/components/streak-card";
import { formatDateISO, formatMoney } from "@/lib/currency";
import {
  getCategories,
  getExpenseSuggestions,
  getMonthExpenses,
  getProfile,
  getRecentExpenses,
  getSession,
  getStreakActivity,
} from "@/lib/queries";
import { addDaysISO, computeStreak } from "@/lib/streak";
import { getTimeZone, todayISOInTZ } from "@/lib/time";
import { getDictionary } from "@/lib/i18n/server";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function InicioPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { user } = await getSession();
  if (!user) redirect("/login");

  const { lang, t } = await getDictionary();
  const profile = await getProfile(user.id);
  const currency = profile?.currency ?? "COP";

  const todayStr = todayISOInTZ(await getTimeZone());
  const sp = await searchParams;
  const rawD = sp.d;
  const selectedDate = rawD && DATE_RE.test(rawD) && rawD <= todayStr ? rawD : todayStr;
  const isToday = selectedDate === todayStr;
  const isYesterday = selectedDate === addDaysISO(todayStr, -1);

  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;
  const [selYear, selMonth] = selectedDate.split("-").map(Number);
  const isSameMonth = selYear === nowYear && selMonth === nowMonth;

  const [monthExpenses, selectedMonthExpenses, recent, categories, activity, suggestions] =
    await Promise.all([
      getMonthExpenses(nowYear, nowMonth),
      isSameMonth ? Promise.resolve([]) : getMonthExpenses(selYear, selMonth),
      getRecentExpenses(5),
      getCategories(),
      getStreakActivity(),
      getExpenseSuggestions(),
    ]);

  const streak = computeStreak(activity, todayStr, profile?.streak_reset_at ?? null);
  const markedDates = new Set(activity.filter((a) => a.type === "mark").map((a) => a.date));
  const expenseDates = new Set(activity.filter((a) => a.type === "expense").map((a) => a.date));

  const isDateCovered = streak.coveredDays.includes(selectedDate);
  let coveredReason: "expense" | "mark" | null = null;
  if (expenseDates.has(selectedDate)) coveredReason = "expense";
  else if (markedDates.has(selectedDate)) coveredReason = "mark";

  const targetExpenses = isSameMonth ? monthExpenses : selectedMonthExpenses;
  const selectedDayExpenses = targetExpenses.filter((e) => e.date === selectedDate);
  const totalSelectedDay = selectedDayExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalMes = monthExpenses.reduce((s, e) => s + Number(e.amount), 0);

  const byCat = new Map<
    string,
    { id: string | null; name: string; color: string; icon: string; total: number; n: number }
  >();
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

  const dayCardLabel = isToday
    ? t.home.today
    : isYesterday
    ? t.dayPager.yesterday
    : formatDateISO(selectedDate, lang);

  return (
    <>
      <section className="flex flex-col gap-2">
        <p className="text-sm text-muted">
          {t.home.hello}
          {profile?.name ? `, ${profile.name}` : ""} 👋
        </p>
        <DayPager
          selectedDate={selectedDate}
          todayStr={todayStr}
          lang={lang}
          t={t}
        />
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
              <p className="text-xs text-muted truncate">{dayCardLabel}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {formatMoney(totalSelectedDay, currency, lang)}
              </p>
            </Card.Content>
          </Card>
        </section>
      </FadeIn>

      <ExpenseForm
        categories={categories}
        currency={currency}
        suggestions={suggestions}
        defaultDate={selectedDate}
      />

      {profile?.show_streak !== false && (
        <FadeIn delay={0.05}>
          <StreakCard
            streak={streak}
            t={t}
            lang={lang}
            selectedDate={selectedDate}
            todayDate={todayStr}
            isCovered={isDateCovered}
            coveredReason={coveredReason}
          />
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

      {!isToday && (
        <section>
          <h2 className="mb-2 text-sm font-medium text-muted">
            {t.dayPager.dayExpenses(selectedDayExpenses.length)}
          </h2>
          {selectedDayExpenses.length > 0 ? (
            <ExpenseList
              expenses={selectedDayExpenses}
              categories={categories}
              currency={currency}
              lang={lang}
              t={t}
              suggestions={suggestions}
            />
          ) : (
            <p className="text-xs text-muted py-2">{t.dayPager.noExpensesThisDay}</p>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-medium text-muted">{t.home.recent}</h2>
        <ExpenseList
          expenses={recent}
          categories={categories}
          currency={currency}
          lang={lang}
          t={t}
          suggestions={suggestions}
        />
      </section>
    </>
  );
}
