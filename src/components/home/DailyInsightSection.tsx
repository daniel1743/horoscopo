import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Container, SectionHeading } from "@/components/layout/Container";
import { homeConfig } from "@/config/home";
import { routes, zodiacRoute } from "@/config/routes";
import { getDailyHoroscope } from "@/data/home-content";
import { zodiacSigns } from "@/data/zodiac-signs";
import { moonQueries } from "@/services/moon.service";
import { getLatestHoroscope } from "@/lib/horoscope/repository";
import { MOON_PHASE_REGISTRY } from "@/config/moon";
import { formatLongDate } from "@/lib/moon/format";
import { useSelectedSign } from "./useSelectedSign";

/** Capa diaria compacta: horóscopo, luna real y carta del día. */
export function DailyInsightSection() {
  const { dailyInsight } = homeConfig;
  const { sign, setSlug } = useSelectedSign();
  const fallback = getDailyHoroscope(sign.slug);
  const { data: liveHoroscope } = useQuery({
    queryKey: ["home", "horoscope", "daily", sign.slug],
    queryFn: () => getLatestHoroscope(sign.slug, "daily"),
    staleTime: 5 * 60 * 1000,
  });
  const { data: moon, isLoading: moonLoading } = useQuery(moonQueries.today());
  const horoscope = liveHoroscope
    ? {
        summary: liveHoroscope.summary,
        focus: liveHoroscope.focus,
      }
    : fallback;
  const moonMeta = moon ? MOON_PHASE_REGISTRY[moon.phase_key] : null;
  const todayLabel = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <section aria-labelledby="daily-insight-title" className="bg-ivory py-12 md:py-18">
      <Container>
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-10">
          <SectionHeading
            eyebrow={dailyInsight.eyebrow}
            title={dailyInsight.title}
            description={dailyInsight.description}
            className="mb-0"
          />
          <p className="font-body text-[13px] text-ink-muted lg:text-right">
            Actualizado para {todayLabel}
          </p>
        </div>
        <h2 id="daily-insight-title" className="sr-only">
          {dailyInsight.title}
        </h2>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.95fr_0.9fr]">
          <article className="rounded-[var(--radius-card-lg)] border border-line-subtle bg-warm-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
                  Horóscopo de hoy
                </p>
                <h3 className="mt-2 font-display text-[24px] font-semibold leading-tight text-ink">
                  {sign.symbol} {sign.name}
                </h3>
              </div>
              <select
                value={sign.slug}
                onChange={(e) => setSlug(e.target.value)}
                aria-label="Cambiar signo del horóscopo"
                className="h-11 rounded-[var(--radius-control)] border border-line bg-warm-white px-3 font-body text-[14px] text-ink outline-none focus-visible:ring-[3px] focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                {zodiacSigns.map((s) => (
                  <option key={s.id} value={s.slug}>
                    {s.symbol} {s.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-4 line-clamp-3 font-body text-[15px] leading-[1.65] text-ink-soft">
              {horoscope.summary}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex w-fit rounded-full bg-brand-soft px-3 py-1 font-body text-[12px] font-medium uppercase tracking-[0.06em] text-brand">
                {horoscope.focus}
              </span>
              <Button asChild variant="secondary" size="md">
                <Link to={zodiacRoute(sign.slug) as string}>Leer mi horóscopo</Link>
              </Button>
            </div>
          </article>

          <article className="rounded-[var(--radius-card-lg)] border border-line-subtle bg-night p-5 text-ink-inverse shadow-sm">
            <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-gold">
              Luna de hoy
            </p>
            <h3 className="mt-2 font-display text-[24px] font-semibold leading-tight text-white drop-shadow-sm">
              {moonMeta ? moonMeta.label : moonLoading ? "Calculando luna" : "Luna actual"}
            </h3>
            <p className="mt-4 font-body text-[15px] leading-[1.65] text-ink-inverse-soft">
              {moon && moonMeta
                ? `${moon.illumination_percentage}% de iluminación · ${formatLongDate(moon.timestamp)}.`
                : "Consulta el estado lunar actual y abre tu lectura personalizada."}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild variant="dark" size="md">
                <Link to={routes.moonPersonalToday}>Consultar mi luna</Link>
              </Button>
              <Button asChild variant="link" className="justify-start p-0 text-gold">
                <Link to={routes.moonToday}>Ver Luna de hoy</Link>
              </Button>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[var(--radius-card-lg)] border border-gold/30 bg-night-elevated p-5 text-ink-inverse shadow-sm">
            <div className="relative pr-20">
              <div
                aria-hidden
                className="absolute right-0 top-[-0.25rem] flex h-24 w-16 rotate-6 items-center justify-center rounded-[var(--radius-card-md)] border border-gold/40 bg-night shadow-card"
              >
                <img
                  src="/carta%20trasera.png"
                  alt=""
                  className="h-full w-full rounded-[inherit] object-contain object-center"
                  loading="lazy"
                />
              </div>
              <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-gold">
                Carta del día
              </p>
              <h3 className="mt-2 font-display text-[24px] font-semibold leading-tight text-white drop-shadow-sm">
                Una carta te espera
              </h3>
              <p className="mt-4 font-body text-[15px] leading-[1.65] text-ink-inverse-soft">
                Tócala cuando quieras una señal breve para orientar tu momento.
              </p>
            </div>
            <Button asChild variant="premium" size="md" className="relative mt-5">
              <Link to={routes.tarotDaily}>
                <Icon name="tarot" />
                Sacar mi carta
              </Link>
            </Button>
          </article>
        </div>
      </Container>
    </section>
  );
}
