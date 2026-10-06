"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Modal,
  Spinner,
  TextField,
  toast,
} from "@heroui/react";
import { updateExpense } from "@/actions/expenses";
import { AmountInput } from "@/components/amount-input";
import { CategoryAutocomplete } from "@/components/category-autocomplete";
import { useLang } from "@/components/language";
import type { Category, Expense } from "@/lib/types";

/**
 * Botón editar + modal con el formulario precargado.
 * Se usa en ExpenseList (inicio/gastos) y en el modal de informes.
 */
export function ExpenseEditModal({
  expense,
  categories,
  currency,
  onSaved,
}: {
  expense: Expense;
  categories: Category[];
  currency: string;
  /** Se llama tras guardar (p. ej. para refrescar una lista local). */
  onSaved?: () => void;
}) {
  const { t } = useLang();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  return (
    <Modal>
      <Button variant="ghost" size="sm" isIconOnly aria-label={t.list.editLabel}>
        <Pencil size={14} />
      </Button>
      <Modal.Backdrop>
        <Modal.Container placement="center">
          <Modal.Dialog>
            {({ close }) => {
              function handle(fd: FormData) {
                startTransition(async () => {
                  setError(undefined);
                  const res = await updateExpense(fd);
                  if (res?.error) setError(res.error);
                  else {
                    toast.success(t.toasts.expenseUpdated);
                    onSaved?.();
                    close();
                  }
                });
              }
              return (
                <>
                  <Modal.CloseTrigger />
                  <Modal.Header>
                    <Modal.Heading>{t.expense.editTitle}</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <form action={handle} className="flex flex-col gap-4">
                      <input type="hidden" name="id" value={expense.id} />
                      <div className="grid grid-cols-2 gap-3">
                        <AmountInput
                          label={t.expense.amount}
                          placeholder="25.000"
                          currency={currency}
                          defaultValue={expense.amount}
                        />
                        <TextField fullWidth isRequired name="date" type="date" defaultValue={expense.date} variant="secondary">
                          <Label>{t.expense.date}</Label>
                          <Input />
                        </TextField>
                      </div>
                      <CategoryAutocomplete
                        categories={categories}
                        label={t.expense.category}
                        placeholder={t.expense.choose}
                        name="category_id"
                        isRequired
                        defaultSelectedKey={expense.category_id ?? undefined}
                      />
                      <TextField fullWidth isRequired name="note" variant="secondary" defaultValue={expense.note ?? ""}>
                        <Label>{t.expense.name}</Label>
                        <Input maxLength={80} placeholder={t.expense.namePh} autoComplete="off" />
                      </TextField>
                      {error && (
                        <p aria-live="polite" className="text-sm text-danger">
                          {error}
                        </p>
                      )}
                      <Button fullWidth variant="primary" type="submit" isDisabled={pending}>
                        {pending ? (
                          <span className="flex items-center gap-2">
                            <Spinner size="sm" color="current" /> {t.expense.saving}
                          </span>
                        ) : (
                          t.expense.saveChanges
                        )}
                      </Button>
                    </form>
                  </Modal.Body>
                </>
              );
            }}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
