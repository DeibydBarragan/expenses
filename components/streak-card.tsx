import { Flame, Snowflake } from "lucide-react";
import { Card, Chip } from "@heroui/react";
import { MarkTodayButton } from "@/components/mark-today";
import { formatDayLong } from "@/lib/currency";
import type { Dictionary, Lang } from "@/lib/i18n/dictionaries";
import type { Streak } from "@/lib/streak";

export function StreakCard({
  streak,
  t,
  lang,
  showLastDay = false,
}: {
  streak: Streak;
  t: Dictionary;
  lang: Lang;
  showLastDay?: boolean;
}) {
  const lit = streak.current > 0;
  return (
    <Card>
      <Card.Content className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={
                lit
                  ? { background: "#F9731640", color: "#F97316" }
                  : { background: "var(--default)", color: "var(--muted)" }
              }
            >
              <Flame size={22} strokeWidth={2.2} />
            </span>
            <div>
              <p className="text-2xl font-bold leading-none tabular-nums">{streak.current}</p>
              <p className="mt-1 text-xs text-muted">
                {t.streak.label} · {streak.current === 1 ? t.streak.oneDay : t.streak.days}
              </p>
            </div>
          </div>
          <Chip size="sm">
            {t.streak.best}: {streak.best}
          </Chip>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Snowflake size={14} />
          {streak.freeze ? t.streak.freezeReady : t.streak.freezeLocked}
        </div>

        {showLastDay && streak.lastCovered && (
          <p className="text-xs text-muted">
            {t.streak.lastDay}:{" "}
            <span className="font-medium text-foreground">
              {formatDayLong(streak.lastCovered, lang)}
            </span>
          </p>
        )}

        {!streak.todayCovered && <MarkTodayButton />}
      </Card.Content>
    </Card>
  );
}
