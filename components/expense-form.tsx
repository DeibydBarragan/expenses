"use client";

import { useState, useTransition } from "react";
import {
  Button,
  Card,
  Description,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
} from "@heroui/react";
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
    <Card>
      <Card.Content className="p-5">
        {!open ? (
          <Button fullWidth variant="primary" onPress={() => setOpen(true)}>
            + Añadir gasto
          </Button>
        ) : (
          <form action={handle} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Nuevo gasto</h2>
              <Button variant="ghost" size="sm" onPress={() => setOpen(false)}>
                Cerrar
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField fullWidth isRequired name="amount" type="number">
                <Label>Monto</Label>
                <Input min="0" step="0.01" placeholder="25000" inputMode="decimal" />
              </TextField>
              <TextField fullWidth isRequired name="date" type="date" defaultValue={today}>
                <Label>Fecha</Label>
                <Input />
              </TextField>
            </div>
            <Select fullWidth isRequired name="category_id" placeholder="Elegir…">
              <Label>Categoría</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {categories.map((c) => (
                    <ListBox.Item key={c.id} id={c.id} textValue={c.name}>
                      {c.icon} {c.name}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            <TextField fullWidth name="note">
              <Label>Nota</Label>
              <Input maxLength={120} placeholder="Café con Ana…" />
              <Description>Opcional.</Description>
            </TextField>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button fullWidth variant="primary" type="submit" isDisabled={pending}>
              {pending ? "Guardando…" : "Guardar gasto"}
            </Button>
          </form>
        )}
      </Card.Content>
    </Card>
  );
}
