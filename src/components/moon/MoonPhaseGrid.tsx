import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { MOON_PHASE_ORDER, MOON_PHASE_REGISTRY } from "@/config/moon";
import { moonPhaseRoute } from "@/config/routes";

/** Índice de las 8 fases. Usado en /luna y en /luna/fases. */
export function MoonPhaseGrid() {
  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {MOON_PHASE_ORDER.map((key) => {
        const meta = MOON_PHASE_REGISTRY[key];
        return (
          <li key={key}>
            <Link
              to={moonPhaseRoute(meta.slug) as never}
              className="group block h-full focus-visible:outline-none"
            >
              <Card className="flex h-full flex-col gap-3 p-5 transition group-hover:border-cosmic group-focus-visible:border-cosmic">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-parchment text-cosmic">
                  <Icon name={meta.iconKey} />
                </span>
                <h3 className="font-display text-[18px] text-ink">{meta.label}</h3>
                <span className="mt-auto inline-flex items-center gap-1 font-body text-[13px] text-cosmic">
                  Leer <Icon name="forward" size="sm" />
                </span>
              </Card>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
