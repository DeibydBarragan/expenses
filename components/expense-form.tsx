"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Modal,
  Spinner,
  TextField,
  toast,
} from "@heroui/react";
import { createExpense } from "@/actions/expenses";
import { AmountInput } from "@/components/amount-input";
import { CategoryAutocomplete } from "@/components/category-autocomplete";
import { ExpenseNameInput } from "@/components/expense-name-input";
import { useLang } from "@/components/language";
import type { Category, ExpenseSuggestion } from "@/lib/types";

export function ExpenseForm({
  categories,
  currency,
  suggestions,
}: {
  categories: Category[];
  currency: string;
  suggestions?: ExpenseSuggestion[];
}) {
  const { t } = useLang();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null);
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState<number | string | undefined>(undefined);

  // Fecha LOCAL del dispositivo (toISOString usa UTC y adelanta el día en la noche)
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return (
    <Modal>
      <Button fullWidth variant="primary" size="lg">
        <Plus size={17} />
        {t.expense.add.replace("+ ", "")}
      </Button>
      <Modal.Backdrop>
        <Modal.Container placement="center">
          <Modal.Dialog>
            {({ close }) => {
              function handleSuggestionSelect(sug: ExpenseSuggestion) {
                setNote(sug.name);
                if (sug.categoryId) {
                  const exists = categories.some((c) => c.id === sug.categoryId);
                  if (exists) {
                    setSelectedCategory(sug.categoryId);
                  }
                }
                if (sug.amount !== undefined && sug.amount > 0) {
                  setAmount(sug.amount);
                }
              }

              function handle(fd: FormData) {
                startTransition(async () => {
                  setError(undefined);
                  const res = await createExpense(fd);
                  if (res?.error) setError(res.error);
                  else {
                    toast.success(t.toasts.expenseSaved);
                    setNote("");
                    setSelectedCategory(null);
                    setAmount(undefined);
                    close();
                  }
                });
              }
              return (
                <>
                  <Modal.CloseTrigger />
                  <Modal.Header>
                    <Modal.Heading>{t.expense.title}</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <form action={handle} className="flex flex-col gap-4">
                      {/* 1. Nombre de primero para autocompletar categoría y monto */}
                      <ExpenseNameInput
                        label={t.expense.name}
                        placeholder={t.expense.namePh}
                        value={note}
                        onChange={setNote}
                        onSelectSuggestion={handleSuggestionSelect}
                        suggestions={suggestions}
                        categories={categories}
                        currency={currency}
                        name="note"
                        isRequired
                      />
                      {/* 2. Categoría */}
                      <CategoryAutocomplete
                        categories={categories}
                        label={t.expense.category}
                        placeholder={t.expense.choose}
                        name="category_id"
                        isRequired
                        selectedKey={selectedCategory ? String(selectedCategory) : null}
                        onSelectionChange={(key) => setSelectedCategory(key)}
                      />
                      {/* 3. Monto y Fecha */}
                      <div className="grid grid-cols-2 gap-3">
                        <AmountInput
                          label={t.expense.amount}
                          placeholder="25.000"
                          currency={currency}
                          value={amount}
                          onChange={setAmount}
                        />
                        <TextField fullWidth isRequired name="date" type="date" defaultValue={today} variant="secondary">
                          <Label>{t.expense.date}</Label>
                          <Input />
                        </TextField>
                      </div>
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
                          t.expense.save
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
