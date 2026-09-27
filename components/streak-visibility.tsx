"use client";

import { useState, useTransition } from "react";
import { Flame } from "lucide-react";
import { Card, Switch } from "@heroui/react";
import { updateShowStreak } from "@/actions/settings";
import { useLang } from "@/components/language";

export function StreakVisibility({ current }: { current: boolean }) {
  const { t } = useLang();
  const [on, setOn] = useState(current);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function toggle(value: boolean) {
    setOn(value);
    setError(undefined);
    startTransition(async () => {
      const res = await updateShowStreak(value);
      if (res?.error) {
        setOn(!value);
        setError(res.error);
      }
    });
  }

  return (
    <Card>
      <Card.Content className="flex flex-col gap-1 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[15px] font-semibold">
              <Flame size={16} />
              {t.settings.showStreak}
            </p>
            <p className="mt-0.5 text-xs text-muted">{t.settings.showStreakHint}</p>
          </div>
          <Switch
            isSelected={on}
            onChange={toggle}
            isDisabled={pending}
            aria-label={t.settings.showStreak}
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Content>
          </Switch>
        </div>
        {error && (
          <p aria-live="polite" className="text-sm text-danger">
            {error}
          </p>
        )}
      </Card.Content>
    </Card>
  );
}
