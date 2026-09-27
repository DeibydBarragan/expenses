export type Streak = {
  /** Racha actual (días cubiertos consecutivos, con congelamientos aplicados). */
  current: number;
  /** Mejor racha histórica. */
  best: number;
  /** Hay un congelamiento disponible para el próximo día fallado. */
  freeze: boolean;
  /** Hoy ya está cubierto (gastos o marca de "sin gastos"). */
  todayCovered: boolean;
  /** Último día cubierto (≤ hoy), o null si no hay. */
  lastCovered: string | null;
};

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function nextDayISO(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return toISODate(d);
}

function addDaysISO(iso: string, n: number): string {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return toISODate(d);
}

export type DayActivity = { date: string; createdAt: string };

/**
 * Calcula la racha a partir de la actividad (fecha + hora de creación).
 *
 * Reglas:
 * - Día cubierto: racha +1. Al iniciar racha (0→1) se otorga un congelamiento;
 *   cada 2 días seguidos cubiertos lo recarga.
 * - Día fallado (pasado): si hay racha y congelamiento, se consume y la racha
 *   se congela; si no, la racha se reinicia a 0.
 * - Hoy sin cubrir está "pendiente": no cuenta como fallo hasta mañana.
 * - `resetTs` (reinicio manual): ignora la actividad anterior a ese momento.
 */
export function computeStreak(
  activity: DayActivity[],
  todayISO: string,
  resetTs: string | null = null
): Streak {
  const maxCreated = new Map<string, string>();
  for (const a of activity) {
    const m = maxCreated.get(a.date);
    if (!m || a.createdAt > m) maxCreated.set(a.date, a.createdAt);
  }

  const resetDay = resetTs ? resetTs.slice(0, 10) : null;
  const covered = new Set<string>();
  for (const [date, mc] of maxCreated) {
    if (!resetDay || date > resetDay || (date === resetDay && resetTs && mc >= resetTs)) {
      covered.add(date);
    }
  }

  const todayCovered = covered.has(todayISO);
  const lastCovered = [...covered].filter((d) => d <= todayISO).sort().pop() ?? null;
  if (covered.size === 0) return { current: 0, best: 0, freeze: false, todayCovered: false, lastCovered: null };

  const first = [...covered].sort()[0];
  const end = todayCovered ? todayISO : addDaysISO(todayISO, -1);

  let streak = 0;
  let best = 0;
  let freeze = false;
  let consec = 0;

  for (let d = first; d <= end; d = nextDayISO(d)) {
    if (covered.has(d)) {
      const wasZero = streak === 0;
      streak += 1;
      consec += 1;
      if (wasZero || consec >= 2) freeze = true;
      if (streak > best) best = streak;
    } else {
      consec = 0;
      if (streak > 0 && freeze) {
        freeze = false; // congelado: la racha se mantiene
      } else if (streak > 0) {
        streak = 0; // 2º fallo (o sin congelamiento): reinicio
      }
    }
  }

  return { current: streak, best, freeze, todayCovered, lastCovered };
}
