"use client";

import { useEffect, useState } from "react";
import { ChartColumn, ChartPie } from "lucide-react";
import { Button, Card, ProgressBar } from "@heroui/react";
import { PieChart } from "@/components/pie-chart";
import { useLang } from "@/components/language";
import { formatMoney } from "@/lib/currency";
import type { Lang } from "@/lib/i18n/dictionaries";

export type ChartRow = {
  name: string;
  color: string;
  total: number;
  n: number;
};

type View = "bar" | "pie";

export function CategoryChart({
  title,
  totalText,
  emptyText,
  rows,
  total,
  currency,
  lang,
  defaultView,
  storageKey,
}: {
  title: string;
  totalText?: string;
  emptyText?: string;
  rows: ChartRow[];
  total: number;
  currency: string;
  lang: Lang;
  defaultView: View;
  storageKey: string;
}) {
  const { t } = useLang();
  // Vista por defecto fija para coincidir con el servidor; se restaura la guardada tras hidratar.
  const [view, setView] = useState<View>(defaultView);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "bar" || saved === "pie") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setView(saved);
      }
    } catch {
      // almacenamiento no disponible
    }
    setMounted(true);
  }, [storageKey]);

  function switchView(v: View) {
    setView(v);
    try {
      localStorage.setItem(storageKey, v);
    } catch {
      // almacenamiento no disponible
    }
  }

  const shown: View = mounted ? view : defaultView;

  return (
    <Card>
      <Card.Content className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-muted">{title}</h2>
          <div className="flex items-center gap-2">
            {totalText && <p className="font-semibold tabular-nums">{totalText}</p>}
            <div
              className="flex items-center gap-0.5 rounded-full bg-default p-0.5"
              role="group"
              aria-label={title}
            >
              <Button
                variant={shown === "bar" ? "primary" : "ghost"}
                size="sm"
                isIconOnly
                aria-label={t.chart.barLabel}
                aria-pressed={shown === "bar"}
                onPress={() => switchView("bar")}
              >
                <ChartColumn size={15} />
              </Button>
              <Button
                variant={shown === "pie" ? "primary" : "ghost"}
                size="sm"
                isIconOnly
                aria-label={t.chart.pieLabel}
                aria-pressed={shown === "pie"}
                onPress={() => switchView("pie")}
              >
                <ChartPie size={15} />
              </Button>
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-muted">{emptyText ?? t.reports.empty}</p>
        ) : shown === "bar" ? (
          <div className="flex flex-col gap-4">
            {rows.map((c) => {
              const pct = total ? Math.round((c.total / total) * 100) : 0;
              return (
                <div key={c.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                      {c.name}
                    </span>
                    <span className="font-medium tabular-nums">
                      {formatMoney(c.total, currency, lang)}
                    </span>
                  </div>
                  <ProgressBar value={pct} minValue={0} maxValue={100} aria-label={c.name}>
                    <ProgressBar.Track>
                      <ProgressBar.Fill style={{ width: `${pct}%`, background: c.color }} />
                    </ProgressBar.Track>
                  </ProgressBar>
                </div>
              );
            })}
          </div>
        ) : (
          <PieChart
            slices={rows}
            total={total}
            currency={currency}
            lang={lang}
            label={title}
          />
        )}
      </Card.Content>
    </Card>
  );
}
