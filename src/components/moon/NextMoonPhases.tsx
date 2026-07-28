import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { MOON_PHASE_REGISTRY } from "@/config/moon";
import { moonPhaseRoute } from "@/config/routes";
import { formatShortDate, formatTimeShort } from "@/lib/moon/format";
import type { MoonPhaseEvent } from "@/types/moon";

interface Props {
  events: MoonPhaseEvent[];
  limit?: number;
}

/** Lista compacta de próximas fases mayores. */
export function NextMoonPhases({ events, limit = 4 }: Props) {
  const items = events.slice(0, limit);
  if (!items.length) {
    return (
      <p className="font-body text-[14px] text-ink-soft">
        No hay próximas fases mayores disponibles.
      </p>
    );
  }
  return (
    <ol className="grid gap-3 md:grid-cols-2">
      {items.map((ev) => {
        const meta = MOON_PHASE_REGISTRY[ev.phase_key];
        return (
          <li key={ev.timestamp}>
            <Card className="flex items-center gap-4 p-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-parchment text-cosmic">
                <Icon name={meta.iconKey} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[16px] text-ink">{meta.label}</p>
                <p className="font-body text-[13px] text-ink-soft">
                  {formatShortDate(ev.timestamp)} · {formatTimeShort(ev.timestamp)}
                </p>
              </div>
              <Link
                to={moonPhaseRoute(meta.slug)}
                className="text-[13px] font-body text-cosmic hover:underline focus-visible:underline"
                aria-label={`Leer sobre ${meta.label}`}
              >
                Leer
              </Link>
            </Card>
          </li>
        );
      })}
    </ol>
  );
}
