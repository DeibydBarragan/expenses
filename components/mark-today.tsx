"use client";

import { useTransition } from "react";
import { CircleCheck } from "lucide-react";
import { Button, Spinner, toast } from "@heroui/react";
import { markNoExpenses } from "@/actions/streak";
import { useLang } from "@/components/language";

export function MarkTodayButton() {
  const { t } = useLang();
  const [pending, startTransition] = useTransition();

  function handle() {
    startTransition(async () => {
      const res = await markNoExpenses();
      if (res?.marked) toast.success(res.marked);
    });
  }

  return (
    <Button fullWidth variant="secondary" isDisabled={pending} onPress={handle}>
      {pending ? (
        <span className="flex items-center gap-2">
          <Spinner size="sm" color="current" /> {t.streak.marking}
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <CircleCheck size={16} /> {t.streak.markNone}
        </span>
      )}
    </Button>
  );
}
