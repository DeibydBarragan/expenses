"use client";

import { useState, useTransition } from "react";
import { createCategory, deleteCategory } from "@/actions/categories";
import type { Category } from "@/lib/types";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handle(fd: FormData) {
    startTransition(async () => {
      setError(undefined);
      const res = await createCategory(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form action={handle} className="card p-4 flex gap-2">
        <input name="name" className="input" placeholder="Nueva categoría…" maxLength={30} required />
        <button className="btn-primary !w-auto px-5 shrink-0" disabled={pending}>
          {pending ? "…" : "Añadir"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="flex flex-col gap-2">
        {categories.map((c) => (
          <li key={c.id} className="card px-4 py-3 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: c.color + "33" }}>
              {c.icon}
            </span>
            <span className="flex-1 text-sm font-medium">{c.name}</span>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={c.id} />
              <button className="text-stone-300 hover:text-red-600 text-lg px-1" title="Eliminar" type="submit">×</button>
            </form>
          </li>
        ))}
      </ul>
      {categories.length === 0 && <p className="text-sm text-stone-400 text-center">Sin categorías.</p>}
    </div>
  );
}
