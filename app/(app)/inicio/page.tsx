import { redirect } from "next/navigation";
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
        <p className="text-sm text-stone-500">Hola{profile?.name ? `, ${profile.name}` : ""} 👋</p>
        <h1 className="text-2xl font-semibold tracking-tight capitalize">{monthName}</h1>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="text-xs text-stone-500">Este mes</p>
          <p className="text-xl font-semibold tabular-nums mt-1">{formatMoney(totalMes, currency)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-stone-500">Hoy</p>
          <p className="text-xl font-semibold tabular-nums mt-1">{formatMoney(totalHoy, currency)}</p>
        </div>
      </section>

      <ExpenseForm categories={categories} />

      <section className="card p-5">
        <h2 className="text-sm font-medium text-stone-500 mb-3">Top categorías del mes</h2>
        {top.length === 0 ? (
          <p className="text-sm text-stone-400">Aún no hay gastos este mes.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {top.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                    {c.name}
                  </span>
                  <span className="font-medium tabular-nums">{formatMoney(c.total, currency)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${totalMes ? Math.round((c.total / totalMes) * 100) : 0}%`, background: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium text-stone-500 mb-2">Recientes</h2>
        <ExpenseList expenses={recent} currency={currency} />
      </section>
    </>
  );
}
