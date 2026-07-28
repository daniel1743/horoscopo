import { Icon } from "@/components/ui/icon";
import { MOON_SCIENCE_COPY } from "@/config/moon-science";

interface Props {
  isDemo?: boolean;
}

export function MoonDisclaimer({ isDemo }: Props) {
  return (
    <aside
      role="note"
      className="mt-10 rounded-[var(--radius-card)] border border-ink/10 bg-parchment px-5 py-4"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-ink-soft">
          <Icon name="warning" size="sm" />
        </span>
        <div className="text-[13px] leading-[1.6] font-body text-ink-soft">
          <p>{MOON_SCIENCE_COPY.distinction.text}</p>
          {isDemo && (
            <p className="mt-2 text-ink-soft/80">
              Contenido editorial de demostración. Será revisado y ampliado por el equipo editorial.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
