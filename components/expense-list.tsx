import { Button, Card } from "@heroui/react";
import { deleteExpense } from "@/actions/expenses";
import { formatDateISO, formatMoney } from "@/lib/currency";
import type { Expense } from "@/lib/types";

export function ExpenseList({ expenses, currency }: { expenses: Expense[]; currency: string }) {
  if (expenses.length === 0) {
    return (
      <Card>
        <Card.Content className="p-8 text-center">
          <p className="text-2xl text-muted">○</p>
          <p className="mt-2 font-medium">Sin gastos por aquí</p>
          <p className="mt-1 text-sm text-muted">Añade tu primer gasto del día.</p>
        </Card.Content>
      </Card>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {expenses.map((e) => (
        <Card key={e.id}>
          <Card.Content className="flex items-center gap-3 px-4 py-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base"
              style={{ background: (e.categories?.color ?? "#E7E5E4") + "33" }}
              title={e.categories?.name}
            >
              {e.categories?.icon ?? "◦"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{e.note || e.categories?.name || "Gasto"}</p>
              <p className="text-xs text-muted">
                {e.categories?.name ?? "Sin categoría"} · {formatDateISO(e.date)}
              </p>
            </div>
            <span className="text-sm font-semibold tabular-nums">
              {formatMoney(Number(e.amount), currency)}
            </span>
            <form action={deleteExpense}>
              <input type="hidden" name="id" value={e.id} />
              <Button variant="ghost" size="sm" isIconOnly type="submit" aria-label="Eliminar gasto">
                ×
              </Button>
            </form>
          </Card.Content>
        </Card>
      ))}
    </ul>
  );
}
