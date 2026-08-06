import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/layout/Container";
import { homeConfig } from "@/config/home";
import { routes } from "@/config/routes";

/** Guías destacadas: obtiene los artículos publicados (home_featured) desde Supabase. */
export function FeaturedGuidesSection() {
  const { featuredGuides: cfg } = homeConfig;

  // El backend query se mantiene comentado/removido hasta que haya artículos reales
  // para evitar errores de variables sin usar (TS).

  const placeholders = [0, 1, 2, 3];

  return (
    <Section tone="ivory" aria-labelledby="guides-title">
      <Container>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <SectionHeading
            eyebrow={cfg.eyebrow}
            title={cfg.title}
            description={cfg.description}
            className="mb-0"
          />
          <div className="hidden md:block">
            <Button asChild variant="secondary">
              <Link to={routes[cfg.action.routeKey!]}>{cfg.action.label}</Link>
            </Button>
          </div>
        </div>
        <h2 id="guides-title" className="sr-only">
          {cfg.title}
        </h2>

        <>
          {/* Móvil */}
          <ul
            className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden"
            role="list"
          >
            {placeholders.map((i) => (
              <li
                key={`mobile-placeholder-${i}`}
                className="snap-start shrink-0"
                style={{ width: "82vw", maxWidth: 320 }}
              >
                <PlaceholderGuideCard />
              </li>
            ))}
          </ul>

          {/* Tablet/Desktop */}
          <ul className="mt-10 hidden grid-cols-2 gap-6 md:grid lg:grid-cols-4" role="list">
            {placeholders.map((i) => (
              <li key={`desktop-placeholder-${i}`}>
                <PlaceholderGuideCard />
              </li>
            ))}
          </ul>
        </>

        <div className="mt-8 md:hidden">
          <Button asChild variant="secondary" fullWidth>
            <Link to={routes[cfg.action.routeKey!]}>{cfg.action.label}</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}

function PlaceholderGuideCard() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card-lg)] border border-line bg-warm-white transition-all opacity-90">
      <div
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={{
          backgroundImage: "url(/PROXIMAMENTE.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(60% 60% at 70% 30%, rgba(255,255,255,0.25) 0%, transparent 65%)",
          }}
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="inline-flex w-fit items-center rounded-full bg-brand-soft px-3 py-1 font-body text-[11px] font-medium uppercase tracking-[0.06em] text-brand">
          Próximamente
        </span>
        <h3 className="mt-3 line-clamp-2 font-display text-[19px] font-semibold leading-[1.25] text-ink-soft">
          Nueva guía en desarrollo
        </h3>
        <p className="mt-2 line-clamp-3 font-body text-[14px] leading-[1.6] text-ink-muted">
          Estamos preparando nuevos artículos para ayudarte a comprender mejor los astros y el tarot.
        </p>
      </div>
    </div>
  );
}

