"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Chip } from "@heroui/react";
import { formatMoney } from "@/lib/currency";
import type { Lang } from "@/lib/i18n/dictionaries";

export type PieSlice = {
  name: string;
  color: string;
  total: number;
  n: number;
};

const CX = 21;
const CY = 21;
const R = 18;

function wedgePath(startAngle: number, endAngle: number): string {
  const large = endAngle - startAngle > Math.PI ? 1 : 0;
  const x1 = CX + R * Math.cos(startAngle);
  const y1 = CY + R * Math.sin(startAngle);
  const x2 = CX + R * Math.cos(endAngle);
  const y2 = CY + R * Math.sin(endAngle);
  return `M ${CX} ${CY} L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;
}

export function PieChart({
  slices,
  total,
  currency,
  lang,
  label,
}: {
  slices: PieSlice[];
  total: number;
  currency: string;
  lang: Lang;
  label: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [chartHover, setChartHover] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const boxRef = useRef<HTMLDivElement>(null);

  const segs = slices.reduce<
    { name: string; color: string; total: number; n: number; start: number; end: number; frac: number }[]
  >((out, s) => {
    const prevEnd = out.length ? out[out.length - 1].end : -Math.PI / 2;
    const frac = total ? s.total / total : 0;
    const start = prevEnd;
    return [...out, { ...s, start, end: start + frac * Math.PI * 2, frac }];
  }, []);

  function trackCursor(e: React.MouseEvent) {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    setCursor({ x: e.clientX - box.left, y: e.clientY - box.top });
  }

  const activeSeg = active !== null ? segs[active] : null;

  return (
    <div ref={boxRef} className="relative" onMouseMove={trackCursor}>
      <motion.div
        className="flex items-center justify-center py-2"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <svg
          viewBox="0 0 42 42"
          className="h-48 w-48"
          role="img"
          aria-label={label}
          onMouseEnter={() => setChartHover(true)}
          onMouseLeave={() => {
            setChartHover(false);
            setActive(null);
          }}
        >
          {segs.map((s, i) => {
            const dimmed = active !== null && active !== i;
            const full = s.frac >= 0.9999;
            const common = {
              fill: s.color,
              opacity: dimmed ? 0.3 : 1,
              style: { transition: "opacity 0.15s ease", cursor: "pointer" },
              onMouseEnter: () => setActive(i),
              onClick: () => setActive(active === i ? null : i),
              onFocus: () => setActive(i),
              onBlur: () => setActive(null),
              tabIndex: 0,
            };
            return full ? (
              <circle key={s.name} cx={CX} cy={CY} r={R} {...common} />
            ) : (
              <path key={s.name} d={wedgePath(s.start, s.end)} {...common} />
            );
          })}
        </svg>
      </motion.div>

      {activeSeg && chartHover && (
        <div
          className="pointer-events-none absolute z-10 flex -translate-x-1/2 -translate-y-[130%] items-center gap-2 rounded-full bg-foreground px-3 py-1.5 text-sm whitespace-nowrap text-background shadow-lg"
          style={{ left: cursor.x, top: cursor.y }}
          aria-hidden
        >
          <span className="h-2 w-2 rounded-full" style={{ background: activeSeg.color }} />
          {activeSeg.name}
          <span className="font-semibold tabular-nums">
            {formatMoney(activeSeg.total, currency, lang)}
          </span>
        </div>
      )}

      <ul className="flex flex-col gap-2.5 pt-1">
        {segs.map((s, i) => {
          const pct = total ? Math.round((s.total / total) * 100) : 0;
          const dimmed = active !== null && active !== i;
          return (
            <li key={s.name}>
              <div
                className="flex items-center justify-between gap-2 text-sm"
                style={{ opacity: dimmed ? 0.45 : 1, transition: "opacity 0.15s ease" }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                  <span className="truncate">{s.name}</span>
                  <Chip size="sm">{s.n}</Chip>
                </span>
                <span className="shrink-0 tabular-nums">
                  <span className="font-medium">{formatMoney(s.total, currency, lang)}</span>{" "}
                  <span className="text-muted">{pct}%</span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
