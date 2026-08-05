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
      className="relative overflow-x-clip bg-night text-ink-inverse"
    >
      <HeroBackdrop />
      <Container className="relative py-16 md:py-24 lg:py-28">
        <div className="grid min-w-0 gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16">
          {/* Texto + acciones */}
          <div className="min-w-0 max-w-[62ch]">
            <p className="font-body text-[12px] font-medium uppercase tracking-[0.18em] text-gold">
              {hero.eyebrow}
            </p>
            <h1
              id="home-hero-title"
              className="mt-5 max-w-[12ch] break-words font-display text-[31px] font-semibold leading-[1.1] tracking-normal text-ink-inverse sm:max-w-[16ch] sm:text-[38px] md:max-w-[18ch] md:text-[52px] md:leading-[1.06] md:tracking-[-0.02em] lg:text-[64px]"
            >
              {hero.title}
            </h1>
            <p className="mt-5 max-w-full break-words font-body text-[16px] leading-[1.7] text-ink-inverse-soft md:max-w-[52ch] md:text-[18px]">
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
            className="relative order-first h-56 w-full max-w-md min-w-0 justify-self-center sm:h-72 lg:order-none lg:h-[440px]"
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
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .anim-glow-1 { animation: glow1 12s ease-in-out infinite alternate; transform-origin: 220px 180px; }
          .anim-glow-2 { animation: glow2 15s ease-in-out infinite alternate-reverse; transform-origin: 220px 180px; }
          .anim-star-1 { animation: twinkle 8s ease-in-out infinite; }
          .anim-star-2 { animation: twinkle 11s ease-in-out infinite 3s; }
          .anim-star-3 { animation: twinkle 9s ease-in-out infinite 1.5s; }
          .anim-star-4 { animation: twinkle 13s ease-in-out infinite 5s; }
          .anim-star-inter { animation: appear 14s ease-in-out infinite; }
          .anim-star-inter-2 { animation: appear 17s ease-in-out infinite 7s; }
          .anim-star-inter-3 { animation: appear 15s ease-in-out infinite 4s; }
          .anim-star-inter-4 { animation: appear 19s ease-in-out infinite 10s; }
          .anim-star-inter-5 { animation: appear 16s ease-in-out infinite 6s; }
        }
        @keyframes glow1 {
          0% { transform: scale(1); opacity: 0.95; }
          100% { transform: scale(1.02); opacity: 0.8; }
        }
        @keyframes glow2 {
          0% { transform: scale(0.97); opacity: 0.5; }
          100% { transform: scale(1.03); opacity: 0.85; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(0.85); }
        }
        @keyframes appear {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
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
        <clipPath id="front-ring-clip">
          <rect x="-100" y="200" width="600" height="200" transform="rotate(-18 220 200)" />
        </clipPath>
      </defs>

      <g>
        <g fill="var(--bg-lunar-ivory)">
          <circle
            cx="86"
            cy="132"
            r="1.6"
            className="anim-star-1"
            style={{ transformOrigin: "86px 132px" }}
          />
          <circle
            cx="116"
            cy="224"
            r="1.35"
            className="anim-star-2"
            style={{ transformOrigin: "116px 224px" }}
          />
          <circle
            cx="150"
            cy="276"
            r="1.5"
            className="anim-star-3"
            style={{ transformOrigin: "150px 276px" }}
          />
          <circle
            cx="334"
            cy="292"
            r="1.4"
            className="anim-star-4"
            style={{ transformOrigin: "334px 292px" }}
          />
          <circle
            cx="64"
            cy="266"
            r="1.15"
            className="anim-star-inter"
            opacity="0"
            style={{ transformOrigin: "64px 266px" }}
          />
          <circle
            cx="204"
            cy="118"
            r="1.25"
            className="anim-star-inter-2"
            opacity="0"
            style={{ transformOrigin: "204px 118px" }}
          />
          <circle
            cx="286"
            cy="318"
            r="1.15"
            className="anim-star-inter-3"
            opacity="0"
            style={{ transformOrigin: "286px 318px" }}
          />
          <circle
            cx="354"
            cy="154"
            r="1.2"
            className="anim-star-inter-4"
            opacity="0"
            style={{ transformOrigin: "354px 154px" }}
          />
          <circle
            cx="42"
            cy="104"
            r="1.1"
            className="anim-star-inter-5"
            opacity="0"
            style={{ transformOrigin: "42px 104px" }}
          />
        </g>
      </g>

      {/* Iluminación ambiental base e irregular */}
      <circle cx="220" cy="180" r="150" fill="url(#moonGlow)" className="anim-glow-1" />
      <circle
        cx="220"
        cy="180"
        r="120"
        fill="url(#moonGlow)"
        className="anim-glow-2"
        opacity="0.6"
      />

      {/* Anillo trasero (ocultado parcialmente por el planeta y ligeramente más tenue) */}
      <ellipse
        cx="220"
        cy="200"
        rx="170"
        ry="42"
        stroke="url(#ring)"
        strokeWidth="1.0"
        transform="rotate(-18 220 200)"
        opacity="0.6"
      />

      {/* Planeta */}
      <circle cx="220" cy="180" r="82" fill="var(--bg-lunar-ivory)" opacity="0.94" />
      <circle cx="220" cy="180" r="82" fill="var(--bg-deep-night)" opacity="0.1" />

      {/* Anillo delantero (recortado para mostrar solo la mitad inferior, más visible) */}
      <ellipse
        cx="220"
        cy="200"
        rx="170"
        ry="42"
        stroke="url(#ring)"
        strokeWidth="1.4"
        transform="rotate(-18 220 200)"
        clipPath="url(#front-ring-clip)"
        opacity="1"
      />

      <g fill="var(--bg-lunar-ivory)">
        {/* Estrellas permanentes con twinkle asíncrono */}
        <circle
          cx="60"
          cy="90"
          r="1.6"
          className="anim-star-1"
          style={{ transformOrigin: "60px 90px" }}
        />
        <circle
          cx="120"
          cy="60"
          r="1.2"
          className="anim-star-2"
          style={{ transformOrigin: "120px 60px" }}
        />
        <circle
          cx="350"
          cy="70"
          r="1.8"
          className="anim-star-3"
          style={{ transformOrigin: "350px 70px" }}
        />
        <circle
          cx="320"
          cy="330"
          r="1.4"
          className="anim-star-1"
          style={{ transformOrigin: "320px 330px" }}
        />
        <circle
          cx="80"
          cy="300"
          r="1.6"
          className="anim-star-4"
          style={{ transformOrigin: "80px 300px" }}
        />
        <circle
          cx="180"
          cy="360"
          r="1.2"
          className="anim-star-3"
          style={{ transformOrigin: "180px 360px" }}
        />

        {/* Estrellas intermitentes */}
        <circle
          cx="280"
          cy="110"
          r="1.5"
          className="anim-star-inter"
          opacity="0"
          style={{ transformOrigin: "280px 110px" }}
        />
        <circle
          cx="140"
          cy="270"
          r="1.3"
          className="anim-star-inter-2"
          opacity="0"
          style={{ transformOrigin: "140px 270px" }}
        />
        <circle
          cx="370"
          cy="230"
          r="1.2"
          className="anim-star-inter-3"
          opacity="0"
          style={{ transformOrigin: "370px 230px" }}
        />
      </g>
    </svg>
  );
}
