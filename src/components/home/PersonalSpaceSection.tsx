import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Container } from "@/components/layout/Container";
import { homeConfig } from "@/config/home";
import { routes } from "@/config/routes";
import { personalBenefits } from "@/data/home-content";

/** Presentación de "Mi espacio" y sus capacidades actuales. */
export function PersonalSpaceSection() {
  const { personalSpace: cfg } = homeConfig;

  return (
    <section
      aria-labelledby="personal-space-title"
      className="relative overflow-hidden bg-night text-ink-inverse"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(45% 55% at 88% 40%, rgba(108,75,217,0.35) 0%, rgba(23,21,38,0) 70%)",
        }}
      />
      <Container className="relative py-14 md:py-20">
        <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14">
          <div>
            <p className="font-body text-[12px] font-medium uppercase tracking-[0.16em] text-gold">
              {cfg.eyebrow}
            </p>
            <h2
              id="personal-space-title"
              className="mt-3 font-display text-[30px] font-semibold leading-[1.15] text-ink-inverse md:text-[40px]"
            >
              {cfg.title}
            </h2>
            <p className="mt-4 max-w-[54ch] font-body text-[16px] leading-[1.7] text-ink-inverse-soft md:text-[18px]">
              {cfg.description}
            </p>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2" role="list">
              {personalBenefits.map((b) => (
                <li
                  key={b.title}
                  className="flex items-start gap-3 rounded-[var(--radius-card)] border border-line-dark bg-white/5 p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold">
                    <Icon name={b.icon} size="md" />
                  </span>
                  <span>
                    <span className="block font-display text-[15px] font-semibold text-ink-inverse">
                      {b.title}
                    </span>
                    <span className="mt-1 block font-body text-[13px] leading-[1.5] text-ink-inverse-soft">
                      {b.description}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button asChild variant="premium" size="lg">
                <Link to={routes[cfg.action.routeKey!]}>
                  <Icon name="premium" />
                  {cfg.action.label}
                </Link>
              </Button>
              <p className="mt-3 font-body text-[12px] text-ink-inverse-soft/80">
                Disponible para guardar tus contenidos y gestionar tus preferencias en un solo
                lugar.
              </p>
            </div>
          </div>

          <div
            role="img"
            aria-label={cfg.imageAlt}
            className="relative order-first aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-card-lg)] border border-line-dark md:order-none"
            style={{
              background:
                "linear-gradient(140deg, var(--bg-deep-night-elevated) 0%, var(--brand-violet) 60%, var(--accent-lunar-gold) 130%)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 45% at 30% 30%, rgba(255,255,255,0.18) 0%, transparent 60%)",
              }}
            />
            <svg
              viewBox="0 0 320 240"
              className="absolute inset-0 h-full w-full opacity-70"
              aria-hidden
            >
              <g stroke="var(--bg-lunar-ivory)" strokeOpacity="0.35" strokeWidth="0.6" fill="none">
                <circle cx="230" cy="90" r="34" />
                <circle cx="230" cy="90" r="60" />
                <circle cx="230" cy="90" r="88" />
              </g>
              <g fill="var(--bg-lunar-ivory)">
                <circle cx="60" cy="60" r="1.6" />
                <circle cx="120" cy="180" r="1.4" />
                <circle cx="280" cy="200" r="1.5" />
                <circle cx="90" cy="140" r="1.2" />
              </g>
            </svg>
          </div>
        </div>
      </Container>
    </section>
  );
}
