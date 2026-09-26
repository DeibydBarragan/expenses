"use client";

import { useState, useTransition } from "react";
import { createExpense } from "@/actions/expenses";
import type { Category } from "@/lib/types";

export function ExpenseForm({ categories }: { categories: Category[] }) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  function handle(fd: FormData) {
    startTransition(async () => {
      setError(undefined);
      const res = await createExpense(fd);
      if (res?.error) setError(res.error);
      else setOpen(false);
    });
  }

  return (
    <div className="card p-5">
      {!open ? (
        <button onClick={() => setOpen(true)} className="btn-primary">
          + Añadir gasto
        </button>
      ) : (
        <form action={handle} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Nuevo gasto</h2>
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-stone-400 hover:text-stone-700">Cerrar</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="label" htmlFor="amount">Monto</label>
              <input className="input" id="amount" name="amount" type="number" min="0" step="0.01" required placeholder="25000" inputMode="decimal" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label" htmlFor="date">Fecha</label>
              <input className="input" id="date" name="date" type="date" required defaultValue={today} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="category_id">Categoría</label>
            <select className="input" id="category_id" name="category_id" required defaultValue="">
              <option value="" disabled>Elegir…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="note">Nota <span className="font-normal">(opcional)</span></label>
            <input className="input" id="note" name="note" type="text" maxLength={120} placeholder="Café con Ana…" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary" disabled={pending}>{pending ? "Guardando…" : "Guardar gasto"}</button>
        </form>
      )}
    </div>
  );
}
