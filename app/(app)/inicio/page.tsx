import { redirect } from "next/navigation";
import { Card, ProgressBar } from "@heroui/react";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { formatMoney } from "@/lib/currency";
import { getCategories, getMonthExpenses, getProfile, getRecentExpenses, getSession } from "@/lib/queries";

export default async function InicioPage() {
  const { user } = await getSession();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  const currency = profile?.currency ?? "COP";
  const now = new Date();
  const [monthExpenses, recent, categories] = await Promise.all([
    getMonthExpenses(now.getFullYear(), now.getMonth() + 1),
    getRecentExpenses(5),
    getCategories(),
  ]);

  const totalMes = monthExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const todayStr = now.toISOString().slice(0, 10);
  const totalHoy = monthExpenses
    .filter((e) => e.date === todayStr)
    .reduce((s, e) => s + Number(e.amount), 0);

  const byCat = new Map<string, { name: string; color: string; total: number }>();
  for (const e of monthExpenses) {
    const key = e.categories?.name ?? "Otros";
    const prev = byCat.get(key) ?? { name: key, color: e.categories?.color ?? "#A8A29E", total: 0 };
    prev.total += Number(e.amount);
    byCat.set(key, prev);
  }
  const top = [...byCat.values()].sort((a, b) => b.total - a.total).slice(0, 3);
  const monthName = now.toLocaleDateString("es", { month: "long" });

  return (
    <>
      <section>
        <p className="text-sm text-muted">Hola{profile?.name ? `, ${profile.name}` : ""} 👋</p>
        <h1 className="text-2xl font-semibold capitalize tracking-tight">{monthName}</h1>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Card>
          <Card.Content className="p-4">
            <p className="text-xs text-muted">Este mes</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{formatMoney(totalMes, currency)}</p>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content className="p-4">
            <p className="text-xs text-muted">Hoy</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{formatMoney(totalHoy, currency)}</p>
          </Card.Content>
        </Card>
      </section>

      <ExpenseForm categories={categories} />

      <Card>
        <Card.Content className="flex flex-col gap-4 p-5">
          <h2 className="text-sm font-medium text-muted">Top categorías del mes</h2>
          {top.length === 0 ? (
            <p className="text-sm text-muted">Aún no hay gastos este mes.</p>
          ) : (
            top.map((c) => {
              const pct = totalMes ? Math.round((c.total / totalMes) * 100) : 0;
              return (
                <div key={c.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                      {c.name}
                    </span>
                    <span className="font-medium tabular-nums">{formatMoney(c.total, currency)}</span>
                  </div>
                  <ProgressBar value={pct} minValue={0} maxValue={100} aria-label={c.name}>
                    <ProgressBar.Track>
                      <ProgressBar.Fill style={{ width: `${pct}%`, background: c.color }} />
                    </ProgressBar.Track>
                  </ProgressBar>
                </div>
              );
            })
          )}
        </Card.Content>
      </Card>

      <section>
        <h2 className="mb-2 text-sm font-medium text-muted">Recientes</h2>
        <ExpenseList expenses={recent} currency={currency} />
      </section>
    </>
  );
}
