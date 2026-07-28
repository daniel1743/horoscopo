import { Link } from "@tanstack/react-router";
import { zodiacRoute } from "@/config/routes";
import { zodiacSigns } from "@/data/zodiac-signs";
import { cn } from "@/lib/utils";

interface Props {
  activeSlug?: string;
  className?: string;
}

/** Selector horizontal de los doce signos. Accesible y responsive. */
export function SignQuickSelector({ activeSlug, className }: Props) {
  return (
    <nav
      aria-label="Elegir signo"
      className={cn(
        "-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "md:mx-0 md:grid md:grid-cols-6 md:gap-3 md:overflow-visible md:px-0 lg:grid-cols-12",
        className,
      )}
    >
      {zodiacSigns.map((s) => {
        const isActive = s.slug === activeSlug;
        return (
          <Link
            key={s.id}
            to={zodiacRoute(s.slug) as string}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "snap-start shrink-0 min-w-[92px] md:min-w-0",
              "flex flex-col items-center gap-1 rounded-[var(--radius-card)] border px-3 py-3 text-center transition-colors",
              "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand focus-visible:ring-offset-2",
              isActive
                ? "border-brand bg-brand-soft text-brand"
                : "border-line bg-warm-white text-ink-soft hover:border-brand hover:text-brand",
            )}
          >
            <span aria-hidden className="font-display text-[22px] leading-none">
              {s.symbol}
            </span>
            <span className="font-body text-[12px] font-medium">{s.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
