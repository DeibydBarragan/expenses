import { Card } from "@heroui/react";
import { deleteExpense } from "@/actions/expenses";
import { Stagger, StaggerItem } from "@/components/animated";
import { CategoryIcon } from "@/components/category-icon";
import { DeleteButton } from "@/components/delete-button";
import { formatDateISO, formatMoney } from "@/lib/currency";
import type { Dictionary, Lang } from "@/lib/i18n/dictionaries";

export function ExpenseList({
  expenses,
  currency,
  lang,
  t,
}: {
  expenses: import("@/lib/types").Expense[];
  currency: string;
  lang: Lang;
  t: Dictionary;
}) {
  if (expenses.length === 0) {
    return (
      <Card>
        <Card.Content className="p-8 text-center">
          <p className="text-2xl text-muted">○</p>
          <p className="mt-2 font-medium">{t.list.emptyTitle}</p>
          <p className="mt-1 text-sm text-muted">{t.list.emptySub}</p>
        </Card.Content>
      </Card>
    );
  }
  return (
    <Stagger className="flex flex-col gap-2">
      {expenses.map((e) => (
        <StaggerItem key={e.id}>
          <Card>
            <Card.Content className="px-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: (e.categories?.color ?? "#64748B") + "40", color: e.categories?.color ?? "#64748B" }}
                  title={e.categories?.name}
                >
                  <CategoryIcon icon={e.categories?.icon ?? "other"} size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold">
                    {e.note || e.categories?.name || t.list.fallback}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                    <span
                      className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: e.categories?.color ?? "#64748B" }}
                    />
                    <span className="truncate">
                      {e.categories?.name ?? t.list.uncategorized} · {formatDateISO(e.date, lang)}
                    </span>
                  </p>
                </div>
                <span className="shrink-0 text-[15px] font-bold tabular-nums">
                  {formatMoney(Number(e.amount), currency, lang)}
                </span>
                <DeleteButton
                  action={deleteExpense}
                  id={e.id}
                  title={t.del.titleExpense}
                  message={t.list.delConfirm}
                  cancelLabel={t.del.cancel}
                  confirmLabel={t.del.confirm}
                  ariaLabel={t.list.delLabel}
                />
              </div>
            </Card.Content>
          </Card>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
