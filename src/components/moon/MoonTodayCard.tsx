import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { MoonPhaseVisual } from "./MoonPhaseVisual";
import { MOON_PHASE_REGISTRY, MOON_SITE_LOCALE } from "@/config/moon";
import { formatLongDate, formatShortDate } from "@/lib/moon/format";
import { routes, moonPhaseRoute } from "@/config/routes";
import type { MoonPhaseKey, MoonSnapshot } from "@/types/moon";

const PHASE_REFLECTIONS: Record<MoonPhaseKey, { why: string; question: string }> = {
  new_moon: {
    why: "La ausencia de luz visible puede servir como imagen para revisar intenciones antes de mostrar resultados.",
    question: "¿Qué intención quieres cuidar en silencio antes de compartirla?",
  },
  waxing_crescent: {
    why: "La luz que comienza a crecer recuerda que un avance pequeño también puede confirmar una dirección.",
    question: "¿Qué primer paso concreto puede darle forma a lo que estás iniciando?",
  },
  first_quarter: {
    why: "La mitad iluminada sugiere un momento de decisión: no necesitas tenerlo todo resuelto para elegir el siguiente movimiento.",
    question: "¿Qué decisión puede avanzar si aceptas que todavía habrá cosas por ajustar?",
  },
  waxing_gibbous: {
    why: "La luz que se aproxima a su plenitud invita a revisar, afinar y reconocer lo que ya está creciendo.",
    question: "¿Qué detalle merece atención para que tu esfuerzo llegue con más claridad?",
  },
  full_moon: {
    why: "La iluminación plena puede ayudarte a mirar con honestidad aquello que ya es visible en tus emociones y vínculos.",
    question: "¿Qué verdad evidente estás listo para reconocer sin exagerarla ni esconderla?",
  },
  waning_gibbous: {
    why: "La luz que comienza a retirarse propone distinguir qué aprendizaje merece conservarse y qué exceso puede soltarse.",
    question: "¿Qué puedes agradecer y dejar ir para no cargarlo en el siguiente ciclo?",
  },
  last_quarter: {
    why: "La luz a medias ofrece un buen símbolo para revisar acuerdos, límites y decisiones que necesitan una corrección.",
    question: "¿Qué ajuste honesto puede devolverte equilibrio sin borrar lo que aprendiste?",
  },
  waning_crescent: {
    why: "La luz mínima invita a bajar el ritmo y escuchar qué necesita descanso antes de volver a comenzar.",
    question: "¿Qué puedes dejar en pausa para recuperar energía y perspectiva?",
  },
};

interface Props {
  snapshot: MoonSnapshot;
  /** Compacto: para uso en Home. */
  compact?: boolean;
}

/** Tarjeta "Luna de hoy" con datos astronómicos verificables. */
export function MoonTodayCard({ snapshot, compact = false }: Props) {
  const meta = MOON_PHASE_REGISTRY[snapshot.phase_key];
  const next = snapshot.next_major_phase;
  const nextMeta = MOON_PHASE_REGISTRY[next.phase_key];
  const dateLabel = formatLongDate(snapshot.timestamp);

  return (
    <article
      aria-labelledby="moon-today-heading"
      className="relative overflow-hidden rounded-[var(--radius-card-lg)] bg-night text-ink-inverse"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(45% 60% at 20% 40%, rgba(197,164,103,0.22) 0%, rgba(23,21,38,0) 70%)",
        }}
      />
      <div
        className={`relative grid gap-8 p-6 md:gap-12 md:p-10 ${compact ? "md:grid-cols-[0.9fr_1.1fr]" : "md:grid-cols-[0.75fr_1.25fr]"}`}
      >
        <div className="mx-auto w-full max-w-[260px]">
          <MoonPhaseVisual
            fraction={snapshot.illumination_fraction}
            waxing={snapshot.waxing}
            title={`${meta.label}, iluminación ${snapshot.illumination_percentage}%`}
            className="h-auto w-full"
          />
        </div>
        <div>
          <p className="font-body text-[12px] uppercase tracking-[0.16em] text-gold">
            Luna de hoy · {dateLabel}
          </p>
          <h2
            id="moon-today-heading"
            className="mt-3 font-display text-[30px] font-semibold leading-[1.15] md:text-[40px]"
          >
            {meta.label}
          </h2>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 font-body text-[14px] text-ink-inverse-soft md:text-[15px]">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.08em]">Iluminación</dt>
              <dd className="mt-1 font-display text-[22px] text-ink-inverse">
                {snapshot.illumination_percentage}%
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.08em]">Edad lunar</dt>
              <dd className="mt-1 font-display text-[22px] text-ink-inverse">
                {snapshot.lunar_age_days.toLocaleString(MOON_SITE_LOCALE, {
                  maximumFractionDigits: 1,
                })}{" "}
                d
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[11px] uppercase tracking-[0.08em]">Próxima fase mayor</dt>
              <dd className="mt-1 text-ink-inverse">
                {nextMeta.label} · {formatShortDate(next.timestamp)}
              </dd>
            </div>
          </dl>
          {!compact && (
            <>
              <p className="mt-6 max-w-[52ch] font-body text-[15px] leading-[1.7] text-ink-inverse-soft">
                Los valores anteriores son cálculos astronómicos. La lectura simbólica se encuentra
                en la ficha editorial de la fase.
              </p>
              <div className="mt-6 max-w-[58ch] rounded-[var(--radius-control)] border border-white/10 bg-white/5 p-4">
                <h3 className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                  Qué puede aportar este momento
                </h3>
                <p className="mt-2 font-body text-[14px] leading-[1.65] text-ink-inverse-soft">
                  {PHASE_REFLECTIONS[snapshot.phase_key].why}
                </p>
                <div className="mt-4 border-l-2 border-gold/60 pl-4">
                  <p className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                    Pregunta para reflexionar hoy
                  </p>
                  <p className="mt-1 font-display text-[15px] italic leading-[1.5] text-ink-inverse">
                    {PHASE_REFLECTIONS[snapshot.phase_key].question}
                  </p>
                  <p className="mt-2 font-body text-[12px] leading-[1.5] text-ink-inverse-soft">
                    Es una pregunta para observar tu experiencia, no una predicción ni una
                    instrucción.
                  </p>
                </div>
              </div>
            </>
          )}
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="dark" size="lg">
              <Link to={moonPhaseRoute(meta.slug) as never}>
                Leer sobre {meta.label.toLowerCase()}
              </Link>
            </Button>
            {compact && (
              <Button asChild variant="link" className="text-gold">
                <Link to={routes.moonToday}>
                  Ver Luna de hoy <Icon name="forward" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
