import { deleteExpense } from "@/actions/expenses";
import { formatDateISO, formatMoney } from "@/lib/currency";
import type { Expense } from "@/lib/types";

export function ExpenseList({ expenses, currency }: { expenses: Expense[]; currency: string }) {
  if (expenses.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-stone-400 text-2xl mb-2">○</p>
        <p className="font-medium text-stone-700">Sin gastos por aquí</p>
        <p className="text-sm text-stone-500 mt-1">Añade tu primer gasto del día.</p>
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {expenses.map((e) => (
        <li key={e.id} className="card px-4 py-3 flex items-center gap-3">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
            style={{ background: (e.categories?.color ?? "#E7E5E4") + "33" }}
            title={e.categories?.name}
          >
            {e.categories?.icon ?? "◦"}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{e.note || e.categories?.name || "Gasto"}</p>
            <p className="text-xs text-stone-500">
              {e.categories?.name ?? "Sin categoría"} · {formatDateISO(e.date)}
            </p>
          </div>
          <span className="text-sm font-semibold tabular-nums">{formatMoney(Number(e.amount), currency)}</span>
          <form action={deleteExpense}>
            <input type="hidden" name="id" value={e.id} />
            <button className="text-stone-300 hover:text-red-600 text-lg leading-none px-1" title="Eliminar" type="submit">×</button>
          </form>
        </li>
      ))}
    </ul>
  );
}
