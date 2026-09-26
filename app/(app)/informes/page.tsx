import { redirect } from "next/navigation";
import { Card, Chip, ProgressBar } from "@heroui/react";
import { MonthPager } from "@/components/month-pager";
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
        <MonthPager prevHref={`/informes?y=${prev.y}&m=${prev.m}`} nextHref={`/informes?y=${next.y}&m=${next.m}`}>
          <div className="text-center">
            <h1 className="text-2xl font-semibold capitalize tracking-tight">{monthLabel(year, month)}</h1>
            <p className="text-sm text-muted">{count} gastos</p>
          </div>
        </MonthPager>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <Card>
          <Card.Content className="p-4">
            <p className="text-xs text-muted">Total</p>
            <p className="mt-1 font-semibold tabular-nums">{formatMoney(total, currency)}</p>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content className="p-4">
            <p className="text-xs text-muted">Nº gastos</p>
            <p className="mt-1 font-semibold tabular-nums">{count}</p>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content className="p-4">
            <p className="text-xs text-muted">Promedio</p>
            <p className="mt-1 font-semibold tabular-nums">{formatMoney(avg, currency)}</p>
          </Card.Content>
        </Card>
      </section>

      <Card>
        <Card.Content className="flex flex-col gap-4 p-5">
          <h2 className="text-sm font-medium text-muted">Por categoría</h2>
          {rows.length === 0 ? (
            <p className="text-sm text-muted">Sin gastos este mes.</p>
          ) : (
            rows.map((c) => {
              const pct = total ? Math.round((c.total / total) * 100) : 0;
              return (
                <div key={c.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>
                      {c.icon} {c.name} <Chip size="sm">{c.n}</Chip>
                    </span>
                    <span className="font-medium tabular-nums">
                      {formatMoney(c.total, currency)}{" "}
                      <span className="font-normal text-muted">{pct}%</span>
                    </span>
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
    </>
  );
}
