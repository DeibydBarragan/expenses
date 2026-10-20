import Link from "next/link";
import { Check, CheckCircle2, Flame, Info, Snowflake } from "lucide-react";
import { Card, Chip } from "@heroui/react";
import { MarkTodayButton, UnmarkDayButton } from "@/components/mark-today";
import { formatDayLong } from "@/lib/currency";
import { addDaysISO } from "@/lib/streak";
import type { Dictionary, Lang } from "@/lib/i18n/dictionaries";
import type { Streak } from "@/lib/streak";

export function StreakCard({
  streak,
  t,
  lang,
  showLastDay = false,
  selectedDate,
  todayDate,
  isCovered,
  coveredReason,
}: {
  streak: Streak;
  t: Dictionary;
  lang: Lang;
  showLastDay?: boolean;
  selectedDate?: string;
  todayDate?: string;
  isCovered?: boolean;
  coveredReason?: "expense" | "mark" | null;
}) {
  const lit = streak.current > 0;
  const today = todayDate ?? new Date().toISOString().slice(0, 10);
  const sel = selectedDate ?? today;
  const isViewingToday = sel === today;

  // Si no se pasaron props explícitas de cobertura, usar los datos de streak
  const dayCovered =
    isCovered !== undefined
      ? isCovered
      : isViewingToday
      ? streak.todayCovered
      : streak.coveredDays?.includes(sel) ?? false;

  // Últimos 7 días terminando en hoy
  const recentDays = Array.from({ length: 7 }, (_, i) => addDaysISO(today, i - 6));
  const locale = lang === "en" ? "en-US" : "es-ES";

  return (
    <Card>
      <Card.Content className="flex flex-col gap-3.5 p-4 sm:p-5">
        {/* Cabecera de racha */}
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

        {/* Estado de congelamiento */}
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Snowflake size={14} className="text-sky-500 shrink-0" />
          <span>{streak.freeze ? t.streak.freezeReady : t.streak.freezeLocked}</span>
        </div>

        {/* Franja visual de los últimos 7 días */}
        <div className="rounded-xl bg-default/40 p-2 sm:p-2.5">
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
            {recentDays.map((dayISO) => {
              const dObj = new Date(dayISO + "T12:00:00");
              const weekday = dObj.toLocaleDateString(locale, { weekday: "narrow" });
              const dayNum = dObj.getDate();
              const isCellSelected = dayISO === sel;
              const isCellToday = dayISO === today;
              const isCellCovered = streak.coveredDays?.includes(dayISO) ?? false;
              const isCellFrozen = streak.frozenDays?.includes(dayISO) ?? false;

              const href = dayISO === today ? "/inicio" : `/inicio?d=${dayISO}`;

              return (
                <Link
                  key={dayISO}
                  href={href}
                  className={`group flex flex-col items-center justify-between rounded-lg py-1.5 px-0.5 transition ${
                    isCellSelected
                      ? "bg-accent/20 ring-1.5 ring-accent font-semibold"
                      : "hover:bg-default"
                  }`}
                  title={`${dayISO}${isCellCovered ? " · " + t.streak.covered : ""}`}
                >
                  <span className="text-[10px] text-muted uppercase group-hover:text-foreground">
                    {weekday}
                  </span>
                  <span className="text-xs tabular-nums mt-0.5">{dayNum}</span>
                  <div className="mt-1 flex h-3.5 w-3.5 items-center justify-center">
                    {isCellCovered ? (
                      <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <Check size={9} strokeWidth={3} />
                      </span>
                    ) : isCellFrozen ? (
                      <Snowflake size={11} className="text-sky-500" />
                    ) : isCellToday ? (
                      <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-muted/40 group-hover:bg-muted" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Último día cubierto (en ajustes) */}
        {showLastDay && streak.lastCovered && (
          <p className="text-xs text-muted">
            {t.streak.lastDay}:{" "}
            <span className="font-medium text-foreground">
              {formatDayLong(streak.lastCovered, lang)}
            </span>
          </p>
        )}

        {/* Sección de acción / estado según el día seleccionado */}
        {isViewingToday ? (
          !streak.todayCovered ? (
            <MarkTodayButton isToday={true} />
          ) : (
            <div className="flex items-center justify-between rounded-lg bg-default/40 px-3 py-2 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                {coveredReason === "mark"
                  ? t.streak.coveredNoSpending
                  : coveredReason === "expense"
                  ? t.streak.coveredWithExpenses
                  : t.streak.covered}
              </span>
              {coveredReason === "mark" && <UnmarkDayButton date={sel} />}
            </div>
          )
        ) : !dayCovered ? (
          <div className="flex flex-col gap-2 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-3">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Info size={15} className="text-amber-500 shrink-0" />
              <span>{t.streak.uncoveredPastDay}</span>
            </div>
            <MarkTodayButton date={sel} isToday={false} />
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg bg-default/40 px-3 py-2 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              {coveredReason === "mark"
                ? t.streak.coveredNoSpending
                : coveredReason === "expense"
                ? t.streak.coveredWithExpenses
                : t.streak.coveredDay}
            </span>
            {coveredReason === "mark" && <UnmarkDayButton date={sel} />}
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
