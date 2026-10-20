"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/components/language";
import { addDaysISO } from "@/lib/streak";

const pagerBtnClass =
  "flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-default hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const disabledBtnClass =
  "flex h-9 w-9 items-center justify-center rounded-full text-muted/30 cursor-not-allowed";

export function DayPager({
  selectedDate,
  todayStr,
}: {
  selectedDate: string;
  todayStr: string;
}) {
  const router = useRouter();
  const { lang, t } = useLang();

  const isToday = selectedDate === todayStr;
  const yesterdayStr = addDaysISO(todayStr, -1);
  const isYesterday = selectedDate === yesterdayStr;

  const prevDate = addDaysISO(selectedDate, -1);
  const nextDate = addDaysISO(selectedDate, 1);
  const canGoNext = selectedDate < todayStr;

  const d = new Date(selectedDate + "T12:00:00");
  const locale = lang === "en" ? "en-US" : "es-ES";
  const dateFormatted = d.toLocaleDateString(locale, { day: "numeric", month: "short" });

  let mainLabel = dateFormatted;
  if (isToday) {
    mainLabel = `${t.home.today} · ${dateFormatted}`;
  } else if (isYesterday) {
    mainLabel = `${t.dayPager.yesterday} · ${dateFormatted}`;
  } else {
    const weekday = d.toLocaleDateString(locale, { weekday: "short" });
    mainLabel = `${weekday}, ${dateFormatted}`;
  }

  const prevHref = prevDate === todayStr ? "/inicio" : `/inicio?d=${prevDate}`;
  const nextHref = nextDate === todayStr ? "/inicio" : `/inicio?d=${nextDate}`;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex w-full items-center justify-between">
        <Link
          href={prevHref}
          aria-label={t.dayPager.prevDay}
          className={pagerBtnClass}
        >
          <ChevronLeft size={18} />
        </Link>

        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-semibold capitalize tracking-tight text-center">
            {mainLabel}
          </h1>

          <label
            className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted transition hover:bg-default hover:text-foreground"
            title={t.dayPager.pickDate}
          >
            <Calendar size={17} />
            <input
              type="date"
              max={todayStr}
              value={selectedDate}
              onChange={(e) => {
                const val = e.target.value;
                if (val && val <= todayStr) {
                  router.push(val === todayStr ? "/inicio" : `/inicio?d=${val}`);
                }
              }}
              className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
              aria-label={t.dayPager.pickDate}
            />
          </label>
        </div>

        {canGoNext ? (
          <Link
            href={nextHref}
            aria-label={t.dayPager.nextDay}
            className={pagerBtnClass}
          >
            <ChevronRight size={18} />
          </Link>
        ) : (
          <span className={disabledBtnClass} aria-hidden>
            <ChevronRight size={18} />
          </span>
        )}
      </div>

      {!isToday && (
        <Link
          href="/inicio"
          className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent-foreground hover:bg-accent/25 transition"
        >
          <span>← {t.dayPager.backToToday}</span>
        </Link>
      )}
    </div>
  );
}
