"use client";

import { useState, useTransition } from "react";
import {
  Button,
  Card,
  Description,
  Label,
  ListBox,
  Select,
  Spinner,
  toast,
} from "@heroui/react";
import { updateCurrency } from "@/actions/settings";
import { CURRENCIES } from "@/lib/currency";
import { useLang } from "@/components/language";

export function CurrencySettings({ current }: { current: string }) {
  const { t } = useLang();
  const [value, setValue] = useState<string | null>(current);
  const [msg, setMsg] = useState<{ error?: string }>({});
  const [pending, startTransition] = useTransition();

  function handle(fd: FormData) {
    startTransition(async () => {
      setMsg({});
      const res = await updateCurrency(fd);
      if (res?.error) setMsg({ error: res.error });
      else if (res?.saved) toast.success(res.saved);
    });
  }

  return (
    <Card>
      <Card.Content className="flex flex-col gap-4 p-5">
        <form action={handle} className="flex flex-col gap-4">
          <Select
            fullWidth
            name="currency"
            value={value}
            onChange={(v) => setValue(v as string)}
            placeholder={t.expense.choose}
          >
            <Label>{t.settings.currency}</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {CURRENCIES.map((c) => (
                  <ListBox.Item key={c.code} id={c.code} textValue={t.currencies[c.code]}>
                    {t.currencies[c.code]}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
            <Description>{t.settings.currencyHint}</Description>
          </Select>
          {msg.error && (
            <p aria-live="polite" className="text-sm text-danger">
              {msg.error}
            </p>
          )}
          <Button fullWidth variant="primary" type="submit" isDisabled={pending}>
            {pending ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" color="current" /> {t.settings.saving}
              </span>
            ) : (
              t.settings.save
            )}
          </Button>
        </form>
      </Card.Content>
    </Card>
  );
}
