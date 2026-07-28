import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Container } from "@/components/layout/Container";
import { homeConfig } from "@/config/home";
import { routes, zodiacRoute } from "@/config/routes";
import { zodiacSigns } from "@/data/zodiac-signs";
import { useSelectedSign } from "./useSelectedSign";

/** Hero editorial oscuro con selector rápido de signo. */
export function HomeHero() {
  const { hero } = homeConfig;
  const { slug, setSlug } = useSelectedSign();

  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative overflow-hidden bg-night text-ink-inverse"
    >
      <HeroBackdrop />
      <Container className="relative py-16 md:py-24 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          {/* Texto + acciones */}
          <div className="max-w-[62ch]">
            <p className="font-body text-[12px] font-medium uppercase tracking-[0.18em] text-gold">
              {hero.eyebrow}
            </p>
            <h1
              id="home-hero-title"
              className="mt-5 font-display text-[36px] font-semibold leading-[1.06] tracking-[-0.03em] text-ink-inverse md:text-[52px] lg:text-[64px]"
              style={{ maxWidth: "18ch" }}
            >
              {hero.title}
            </h1>
            <p className="mt-5 max-w-[52ch] font-body text-[16px] leading-[1.7] text-ink-inverse-soft md:text-[18px]">
              {hero.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" fullWidth className="sm:w-auto">
                <Link to={routes[hero.primaryAction.routeKey!]}>
                  <Icon name={hero.primaryAction.icon!} />
                  {hero.primaryAction.label}
                </Link>
              </Button>
              <Button asChild size="lg" variant="dark" fullWidth className="sm:w-auto">
                <Link to={routes[hero.secondaryAction.routeKey!]}>
                  <Icon name={hero.secondaryAction.icon!} />
                  {hero.secondaryAction.label}
                </Link>
              </Button>
            </div>

            {hero.showZodiacQuickSelect && (
              <div className="mt-8 flex flex-col gap-2 sm:max-w-md">
                <label
                  htmlFor="hero-zodiac-select"
                  className="font-body text-[13px] text-ink-inverse-soft"
                >
                  {hero.quickSelectLabel}
                </label>
                <div className="flex gap-2">
                  <select
                    id="hero-zodiac-select"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="h-12 flex-1 min-w-0 rounded-[var(--radius-control)] border border-line-dark bg-night-elevated px-4 font-body text-[15px] text-ink-inverse outline-none focus-visible:ring-[3px] focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-night"
                  >
                    {zodiacSigns.map((s) => (
                      <option key={s.id} value={s.slug} className="bg-night text-ink-inverse">
                        {s.symbol} {s.name}
                      </option>
                    ))}
                  </select>
                  <Button asChild size="md" variant="primary">
                    <a href={zodiacRoute(slug)} aria-label={`Ver horóscopo de ${slug}`}>
                      <Icon name="forward" />
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Ilustración decorativa */}
          <div
            aria-hidden
            className="relative order-first h-56 w-full max-w-md justify-self-center sm:h-72 lg:order-none lg:h-[440px]"
          >
            <HeroIllustration />
            <span className="sr-only">{hero.imageAlt}</span>
          </div>
        </div>
      </Container>
    </section>
  );
}

function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 55% at 82% 32%, rgba(108,75,217,0.45) 0%, rgba(23,21,38,0) 65%), radial-gradient(50% 45% at 12% 80%, rgba(197,164,103,0.18) 0%, rgba(23,21,38,0) 70%)",
        }}
      />
    </div>
  );
}

function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      role="presentation"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <radialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="var(--bg-lunar-ivory)" stopOpacity="0.95" />
          <stop offset="70%" stopColor="var(--accent-lunar-gold)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--bg-deep-night)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ring" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-lunar-gold)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--brand-violet)" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <circle cx="220" cy="180" r="150" fill="url(#moonGlow)" />
      <circle cx="220" cy="180" r="82" fill="var(--bg-lunar-ivory)" opacity="0.94" />
      <circle cx="220" cy="180" r="82" fill="var(--bg-deep-night)" opacity="0.1" />
      <ellipse
        cx="220"
        cy="200"
        rx="170"
        ry="42"
        stroke="url(#ring)"
        strokeWidth="1.2"
        transform="rotate(-18 220 200)"
      />
      <g fill="var(--bg-lunar-ivory)">
        <circle cx="60" cy="90" r="1.6" />
        <circle cx="120" cy="60" r="1.2" />
        <circle cx="350" cy="70" r="1.8" />
        <circle cx="320" cy="330" r="1.4" />
        <circle cx="80" cy="300" r="1.6" />
        <circle cx="180" cy="360" r="1.2" />
      </g>
    </svg>
  );
}
