"use client";

import { useState, useTransition } from "react";
import { KeyRound } from "lucide-react";
import { Button, Card, Description, Input, Label, Spinner, TextField, toast } from "@heroui/react";
import { setPassword } from "@/actions/account";
import { useLang } from "@/components/language";

export function PasswordSettings({ hasPassword }: { hasPassword: boolean }) {
  const { t } = useLang();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handle(fd: FormData) {
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password !== confirm) {
      setError(t.settings.passMismatch);
      return;
    }
    startTransition(async () => {
      setError(undefined);
      const res = await setPassword(fd);
      if (res?.error) setError(res.error === "auth" ? t.errors.saveFail : res.error);
      else if (res?.saved) toast.success(res.saved);
    });
  }

  return (
    <Card>
      <Card.Content className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-2">
          <KeyRound size={16} />
          <h2 className="text-[15px] font-semibold">
            {hasPassword ? t.settings.passChange : t.settings.passCreate}
          </h2>
        </div>
        <form action={handle} className="flex flex-col gap-4">
          <TextField fullWidth isRequired name="password" type="password">
            <Label>{t.settings.passNew}</Label>
            <Input placeholder="••••••••" autoComplete="new-password" />
            <Description>
              {hasPassword ? t.settings.passHintChange : t.settings.passHintNew}
            </Description>
          </TextField>
          <TextField fullWidth isRequired name="confirm" type="password">
            <Label>{t.settings.passConfirm}</Label>
            <Input placeholder="••••••••" autoComplete="new-password" />
          </TextField>
          {error && (
            <p aria-live="polite" className="text-sm text-danger">
              {error}
            </p>
          )}
          <Button fullWidth variant="primary" type="submit" isDisabled={pending}>
            {pending ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" color="current" /> {t.settings.saving}
              </span>
            ) : hasPassword ? (
              t.settings.passChange
            ) : (
              t.settings.passCreate
            )}
          </Button>
        </form>
      </Card.Content>
    </Card>
  );
}
