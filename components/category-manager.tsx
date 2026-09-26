"use client";

import { useState, useTransition } from "react";
import { Button, Card, Input, Label, Spinner, TextField, toast } from "@heroui/react";
import { createCategory, deleteCategory } from "@/actions/categories";
import { Stagger, StaggerItem } from "@/components/animated";
import { CategoryIcon } from "@/components/category-icon";
import { DeleteButton } from "@/components/delete-button";
import { useLang } from "@/components/language";
import type { Category } from "@/lib/types";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const { t } = useLang();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handle(fd: FormData) {
    startTransition(async () => {
      setError(undefined);
      const res = await createCategory(fd);
      if (res?.error) setError(res.error);
      else toast.success(t.toasts.categorySaved);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <Card.Content className="p-4">
          <form action={handle} className="flex gap-2">
            <TextField fullWidth isRequired name="name" aria-label={t.categories.newPh}>
              <Label className="sr-only">{t.categories.newPh}</Label>
              <Input placeholder={t.categories.newPh} maxLength={30} autoComplete="off" />
            </TextField>
            <Button variant="primary" className="shrink-0" type="submit" isDisabled={pending}>
              {pending ? <Spinner size="sm" color="current" /> : t.categories.add}
            </Button>
          </form>
          {error && (
            <p aria-live="polite" className="mt-2 text-sm text-danger">
              {error}
            </p>
          )}
        </Card.Content>
      </Card>

      {categories.length === 0 ? (
        <p className="text-center text-sm text-muted">{t.categories.empty}</p>
      ) : (
        <Stagger className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {categories.map((c) => (
            <StaggerItem key={c.id}>
              <Card className="h-full">
                <Card.Content className="relative flex h-full flex-col items-center gap-1.5 px-3 py-4 text-center">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ background: c.color + "40", color: c.color }}
                  >
                    <CategoryIcon icon={c.icon} size={19} />
                  </span>
                  <span className="w-full truncate text-sm font-medium">{c.name}</span>
                  <span className="absolute right-1 top-1">
                    <DeleteButton
                      action={deleteCategory}
                      id={c.id}
                      title={t.del.titleCategory}
                      message={t.categories.delConfirm(c.name)}
                      cancelLabel={t.del.cancel}
                      confirmLabel={t.del.confirm}
                      ariaLabel={t.categories.delLabel(c.name)}
                    />
                  </span>
                </Card.Content>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
