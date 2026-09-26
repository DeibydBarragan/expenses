import { redirect } from "next/navigation";
import { formatMoney } from "@/lib/currency";
import { getMonthExpenses, getProfile, getSession } from "@/lib/queries";

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString("es", { month: "long", year: "numeric" });
}

export default async function InformesPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const { user } = await getSession();
  if (!user) redirect("/login");
  const profile = await getProfile(user.id);
  const currency = profile?.currency ?? "COP";

  const sp = await searchParams;
  const now = new Date();
  const year = Number(sp.y ?? now.getFullYear());
  const month = Number(sp.m ?? now.getMonth() + 1);

  const expenses = await getMonthExpenses(year, month);
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const count = expenses.length;
  const avg = count ? total / count : 0;

  const byCat = new Map<string, { name: string; color: string; icon: string; total: number; n: number }>();
  for (const e of expenses) {
    const key = e.categories?.name ?? "Sin categoría";
    const prev = byCat.get(key) ?? {
      name: key,
      color: e.categories?.color ?? "#A8A29E",
      icon: e.categories?.icon ?? "◦",
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
      <section className="flex items-center justify-between">
        <a href={`/informes?y=${prev.y}&m=${prev.m}`} className="text-sm text-stone-500 hover:text-stone-900 px-2 py-1">←</a>
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight capitalize">{monthLabel(year, month)}</h1>
          <p className="text-sm text-stone-500">{count} gastos</p>
        </div>
        <a href={`/informes?y=${next.y}&m=${next.m}`} className="text-sm text-stone-500 hover:text-stone-900 px-2 py-1">→</a>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <div className="card p-4">
          <p className="text-xs text-stone-500">Total</p>
          <p className="font-semibold tabular-nums mt-1">{formatMoney(total, currency)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-stone-500">Nº gastos</p>
          <p className="font-semibold tabular-nums mt-1">{count}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-stone-500">Promedio</p>
          <p className="font-semibold tabular-nums mt-1">{formatMoney(avg, currency)}</p>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-medium text-stone-500 mb-4">Por categoría</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-stone-400">Sin gastos este mes.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {rows.map((c) => {
              const pct = total ? Math.round((c.total / total) * 100) : 0;
              return (
                <div key={c.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{c.icon} {c.name} <span className="text-stone-400">· {c.n}</span></span>
                    <span className="font-medium tabular-nums">{formatMoney(c.total, currency)} <span className="text-stone-400 font-normal">{pct}%</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: c.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
