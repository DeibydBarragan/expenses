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
import { ExpenseNameInput } from "@/components/expense-name-input";
import { useLang } from "@/components/language";
import type { Category, Expense, ExpenseSuggestion } from "@/lib/types";

/**
 * Botón editar + modal con el formulario precargado.
 * Se usa en ExpenseList (inicio/gastos) y en el modal de informes.
 */
export function ExpenseEditModal({
  expense,
  categories,
  currency,
  suggestions,
  onSaved,
}: {
  expense: Expense;
  categories: Category[];
  currency: string;
  suggestions?: ExpenseSuggestion[];
  /** Se llama tras guardar (p. ej. para refrescar una lista local). */
  onSaved?: () => void;
}) {
  const { t } = useLang();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState<string | number | null>(
    expense.category_id ?? null
  );
  const [note, setNote] = useState(expense.note ?? "");

  return (
    <Modal>
      <Button variant="ghost" size="sm" isIconOnly aria-label={t.list.editLabel}>
        <Pencil size={14} />
      </Button>
      <Modal.Backdrop>
        <Modal.Container placement="center">
          <Modal.Dialog>
            {({ close }) => {
              function handleSuggestionSelect(sug: ExpenseSuggestion) {
                setNote(sug.name);
                if (sug.categoryId && (!selectedCategory || selectedCategory === "none")) {
                  const exists = categories.some((c) => c.id === sug.categoryId);
                  if (exists) {
                    setSelectedCategory(sug.categoryId);
                  }
                }
              }

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
                        selectedKey={selectedCategory ? String(selectedCategory) : null}
                        onSelectionChange={(k) => setSelectedCategory(k)}
                      />
                      <ExpenseNameInput
                        label={t.expense.name}
                        placeholder={t.expense.namePh}
                        value={note}
                        onChange={setNote}
                        onSelectSuggestion={handleSuggestionSelect}
                        suggestions={suggestions}
                        categories={categories}
                        name="note"
                        isRequired
                      />
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
