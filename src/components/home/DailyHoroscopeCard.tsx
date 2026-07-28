import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { zodiacRoute } from "@/config/routes";
import { zodiacSigns } from "@/data/zodiac-signs";
import { getDailyHoroscope } from "@/data/home-content";
import { getLatestHoroscope } from "@/lib/horoscope/repository";
import type { ZodiacSign } from "@/data/zodiac-signs";

interface Props {
  sign: ZodiacSign;
  onChangeSign: (slug: string) => void;
  todayLabel: string;
}

/** Tarjeta editorial con horóscopo diario del signo seleccionado. */
export function DailyHoroscopeCard({ sign, onChangeSign, todayLabel }: Props) {
  const mock = getDailyHoroscope(sign.slug);
  const { data: live } = useQuery({
    queryKey: ["horoscope", "daily", "latest", sign.slug],
    queryFn: () => getLatestHoroscope(sign.slug, "daily"),
    staleTime: 5 * 60 * 1000,
  });
  const entry = live
    ? {
        summary: live.summary,
        focus: live.focus,
        mood: live.mood,
        energy: live.energy,
      }
    : mock;

  return (
    <article
      aria-labelledby={`daily-horoscope-${sign.slug}`}
      className="flex h-full flex-col rounded-[var(--radius-card-lg)] border border-line bg-warm-white p-6 md:p-8"
    >
      <header className="flex items-center gap-3 text-ink-soft">
        <Icon name="sun" className="text-brand" />
        <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
          Horóscopo de hoy
        </p>
      </header>

      <div className="mt-4 flex items-baseline gap-3">
        <span aria-hidden className="font-display text-[36px] leading-none text-brand">
          {sign.symbol}
        </span>
        <h3
          id={`daily-horoscope-${sign.slug}`}
          className="font-display text-[24px] font-semibold md:text-[28px]"
        >
          {sign.name}
        </h3>
      </div>
      <p className="mt-1 font-body text-[13px] text-ink-muted">{todayLabel}</p>

      <p className="mt-5 font-body text-[15px] leading-[1.7] text-ink md:text-[16px]">
        {entry.summary}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 font-body text-[12px] font-medium uppercase tracking-[0.06em] text-brand">
          {entry.focus}
        </span>
        <span className="inline-flex items-center rounded-full bg-ivory px-3 py-1 font-body text-[12px] font-medium uppercase tracking-[0.06em] text-ink-soft">
          {entry.mood}
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-full bg-ivory px-3 py-1 font-body text-[12px] text-ink-soft"
          aria-label={`Nivel de energía ${entry.energy} de 5`}
        >
          <span aria-hidden>{"●".repeat(entry.energy)}</span>
          <span aria-hidden className="text-ink-muted">
            {"○".repeat(5 - entry.energy)}
          </span>
        </span>
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 font-body text-[13px] text-ink-soft">
          Cambiar signo
          <select
            value={sign.slug}
            onChange={(e) => onChangeSign(e.target.value)}
            className="h-10 rounded-[var(--radius-control)] border border-line bg-warm-white px-3 font-body text-[14px] text-ink outline-none focus-visible:ring-[3px] focus-visible:ring-brand focus-visible:ring-offset-2"
            aria-label="Cambiar signo del horóscopo"
          >
            {zodiacSigns.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.symbol} {s.name}
              </option>
            ))}
          </select>
        </label>
        <Button asChild variant="secondary">
          <Link to={zodiacRoute(sign.slug) as string}>Leer horóscopo completo</Link>
        </Button>
      </div>
    </article>
  );
}
