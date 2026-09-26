"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import {
  Button,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  Spinner,
  TextField,
  toast,
} from "@heroui/react";
import { createExpense } from "@/actions/expenses";
import { AmountInput } from "@/components/amount-input";
import { CategoryIcon } from "@/components/category-icon";
import { useLang } from "@/components/language";
import type { Category } from "@/lib/types";

export function ExpenseForm({ categories, currency }: { categories: Category[]; currency: string }) {
  const { t } = useLang();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const today = new Date().toISOString().slice(0, 10);

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
              function handle(fd: FormData) {
                startTransition(async () => {
                  setError(undefined);
                  const res = await createExpense(fd);
                  if (res?.error) setError(res.error);
                  else {
                    toast.success(t.toasts.expenseSaved);
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
                      <div className="grid grid-cols-2 gap-3">
                        <AmountInput label={t.expense.amount} placeholder="25.000" currency={currency} />
                        <TextField fullWidth isRequired name="date" type="date" defaultValue={today} variant="secondary">
                          <Label>{t.expense.date}</Label>
                          <Input />
                        </TextField>
                      </div>
                      <Select fullWidth isRequired name="category_id" placeholder={t.expense.choose} variant="secondary">
                        <Label>{t.expense.category}</Label>
                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {categories.map((c) => (
                              <ListBox.Item key={c.id} id={c.id} textValue={c.name}>
                                <span className="flex items-center gap-2">
                                  <CategoryIcon icon={c.icon} size={15} />
                                  {c.name}
                                </span>
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                      <TextField fullWidth isRequired name="note" variant="secondary">
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
