"use client";

import { useTransition } from "react";
import { CircleCheck, RotateCcw } from "lucide-react";
import { Button, Spinner, toast } from "@heroui/react";
import { markNoExpenses, unmarkNoExpenses } from "@/actions/streak";
import { useLang } from "@/components/language";

export function MarkTodayButton({
  date,
  isToday = true,
  label,
}: {
  date?: string;
  isToday?: boolean;
  label?: string;
}) {
  const { t } = useLang();
  const [pending, startTransition] = useTransition();

  function handle() {
    startTransition(async () => {
      const res = await markNoExpenses(date);
      if (res?.marked) toast.success(res.marked);
      else if (res?.error) toast(res.error);
    });
  }

  const defaultLabel = isToday ? t.streak.markNone : t.streak.markNonePast;

  return (
    <Button fullWidth variant="secondary" isDisabled={pending} onPress={handle}>
      {pending ? (
        <span className="flex items-center gap-2">
          <Spinner size="sm" color="current" /> {t.streak.marking}
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <CircleCheck size={16} /> {label ?? defaultLabel}
        </span>
      )}
    </Button>
  );
}

export function UnmarkDayButton({
  date,
}: {
  date?: string;
}) {
  const { t } = useLang();
  const [pending, startTransition] = useTransition();

  function handle() {
    startTransition(async () => {
      const res = await unmarkNoExpenses(date);
      if (res?.unmarked) toast.success(res.unmarked);
      else if (res?.error) toast(res.error);
    });
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      isDisabled={pending}
      onPress={handle}
      className="text-muted hover:text-foreground"
    >
      {pending ? (
        <span className="flex items-center gap-1.5 text-xs">
          <Spinner size="sm" color="current" /> {t.streak.unmarking}
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-xs">
          <RotateCcw size={13} /> {t.streak.unmark}
        </span>
      )}
    </Button>
  );
}
