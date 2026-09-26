"use client";

import { useState, useTransition } from "react";
import { Button, Card, Input, Label, TextField } from "@heroui/react";
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
      <Card>
        <Card.Content className="p-4">
          <form action={handle} className="flex gap-2">
            <TextField fullWidth isRequired name="name" aria-label="Nueva categoría">
              <Label className="sr-only">Nueva categoría</Label>
              <Input placeholder="Nueva categoría…" maxLength={30} />
            </TextField>
            <Button variant="primary" className="shrink-0" type="submit" isDisabled={pending}>
              {pending ? "…" : "Añadir"}
            </Button>
          </form>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </Card.Content>
      </Card>

      <ul className="flex flex-col gap-2">
        {categories.map((c) => (
          <Card key={c.id}>
            <Card.Content className="flex items-center gap-3 px-4 py-3">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: c.color + "33" }}
              >
                {c.icon}
              </span>
              <span className="flex-1 text-sm font-medium">{c.name}</span>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <Button variant="ghost" size="sm" isIconOnly type="submit" aria-label={`Eliminar ${c.name}`}>
                  ×
                </Button>
              </form>
            </Card.Content>
          </Card>
        ))}
      </ul>
      {categories.length === 0 && <p className="text-center text-sm text-muted">Sin categorías.</p>}
    </div>
  );
}
