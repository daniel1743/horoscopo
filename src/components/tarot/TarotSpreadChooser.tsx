import { Link } from "@tanstack/react-router";
import { enabledSpreadKeys, tarotSpreads } from "@/config/tarot";
import { routes } from "@/config/routes";
import { Icon } from "@/components/ui/icon";

export function TarotSpreadChooser() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {enabledSpreadKeys.map((key) => {
        const s = tarotSpreads[key];
        return (
          <li key={s.key}>
            <Link
              to={routes[s.routeKey]}
              className="group flex h-full flex-col rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment-elevated p-6 transition-colors hover:border-cosmic/50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cosmic/10 text-cosmic">
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                <h3 className="font-display text-[20px] text-ink">{s.label}</h3>
              </div>
              <p className="mt-3 font-body text-[14px] leading-[1.6] text-ink-soft">
                {s.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-body text-[13px] font-medium text-cosmic">
                Comenzar
                <Icon name="chevronRight" className="h-4 w-4" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
