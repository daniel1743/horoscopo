import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@tanstack/react-router";
import { MOON_PHASE_REGISTRY } from "@/config/moon";
import { moonPhaseRoute } from "@/config/routes";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { MoonCalendarDay } from "@/types/moon";

interface Props {
  year: number;
  month: number;
  days: MoonCalendarDay[];
  todayKey: string;
}

const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"] as const;

/** Cuadrícula mensual (lunes-primero) con indicador de fases mayores. */
export function MoonCalendar({ year, month, days, todayKey }: Props) {
  const [selected, setSelected] = useState<MoonCalendarDay | null>(null);
  const grid = useMemo(() => buildGrid(year, month, days), [year, month, days]);

  return (
    <>
      <div
        role="grid"
        aria-label={`Calendario lunar de ${month}/${year}`}
        className="grid grid-cols-7 gap-1.5 md:gap-2"
      >
        {WEEKDAY_LABELS.map((wd) => (
          <div
            key={wd}
            role="columnheader"
            className="pb-1 text-center font-body text-[11px] uppercase tracking-[0.1em] text-ink-soft"
          >
            {wd}
          </div>
        ))}
        {grid.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} aria-hidden />;
          }
          const meta = MOON_PHASE_REGISTRY[cell.phase_key];
          const isToday = cell.date_key === todayKey;
          const hasEvent = Boolean(cell.major_event);
          const dayNumber = Number(cell.date_key.slice(-2));
          return (
            <button
              key={cell.date_key}
              role="gridcell"
              type="button"
              onClick={() => setSelected(cell)}
              aria-label={`${dayNumber} · ${meta.label}, ${cell.illumination_percentage}% iluminada${hasEvent ? " (fase mayor)" : ""}`}
              className={cn(
                "group relative flex aspect-square min-h-[54px] flex-col items-center justify-center rounded-[var(--radius-card)] border transition",
                "border-ink/10 bg-parchment-elevated hover:border-cosmic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic",
                isToday && "border-cosmic ring-1 ring-cosmic",
                hasEvent && "bg-brand-soft",
              )}
            >
              <span className="absolute right-1.5 top-1 font-body text-[11px] text-ink-soft">
                {dayNumber}
              </span>
              <span
                aria-hidden
                className={cn("text-ink-soft", hasEvent && "text-cosmic")}
              >
                <Icon name={meta.iconKey} size="md" />
              </span>
              <span className="mt-0.5 font-body text-[10px] text-ink-soft">
                {cell.illumination_percentage}%
              </span>
            </button>
          );
        })}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {MOON_PHASE_REGISTRY[selected.phase_key].label}
                </DialogTitle>
                <DialogDescription>
                  {selected.date_key} · {selected.illumination_percentage}% iluminada · edad{" "}
                  {selected.lunar_age_days.toFixed(1)} d
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {selected.major_event && (
                  <p className="rounded-[var(--radius-card)] bg-brand-soft px-4 py-3 font-body text-[14px] text-ink">
                    Este día se produce {" "}
                    <strong>
                      {MOON_PHASE_REGISTRY[selected.major_event.phase_key].label.toLowerCase()}
                    </strong>
                    .
                  </p>
                )}
                <Link
                  to="/luna/fases/$slug"
                  params={{ slug: MOON_PHASE_REGISTRY[selected.phase_key].slug, phaseKey: selected.phase_key }}
                  onClick={() => setSelected(null)}
                  className="inline-flex items-center gap-1 font-body text-[14px] text-cosmic hover:underline"
                >
                  Leer sobre esta fase <Icon name="forward" size="sm" />
                </Link>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Rejilla lunes-primero con celdas vacías al inicio y al final. */
function buildGrid(year: number, month: number, days: MoonCalendarDay[]): (MoonCalendarDay | null)[] {
  if (!days.length) return [];
  // Weekday del día 1 en UTC (aproximación aceptable para maquetación).
  const firstUtc = new Date(Date.UTC(year, month - 1, 1));
  // Lunes = 0
  const weekday = (firstUtc.getUTCDay() + 6) % 7;
  const cells: (MoonCalendarDay | null)[] = [];
  for (let i = 0; i < weekday; i += 1) cells.push(null);
  for (const d of days) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
