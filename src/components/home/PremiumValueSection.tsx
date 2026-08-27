import { Link } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/config/routes";

const valuePillars = [
  {
    icon: "sun" as const,
    eyebrow: "Claridad",
    title: "Entiende antes de interpretar",
    description:
      "Una lectura que separa la señal, el contexto y aquello que puedes observar en tu vida real.",
  },
  {
    icon: "moon" as const,
    eyebrow: "Ritmo",
    title: "Mira tu momento completo",
    description:
      "Horóscopo, Tarot y ciclos lunares reunidos para que no tengas que saltar entre respuestas aisladas.",
  },
  {
    icon: "premium" as const,
    eyebrow: "Continuidad",
    title: "Vuelve cuando algo cambie",
    description:
      "Guarda tus lecturas, sigue tus temas y construye una relación más consciente con tus propios ciclos.",
  },
];

const realTools = [
  {
    label: "Tarot para una decisión",
    description: "Dos cartas para ordenar lo que conviene valorar y un siguiente paso posible.",
    to: routes.tarotDecision,
  },
  {
    label: "Tránsitos astrológicos",
    description: "Observa el cielo del día frente a una carta de referencia calculada en memoria.",
    to: routes.transits,
  },
  {
    label: "Camino de Vida",
    description: "Calcula un número simbólico a partir de tu fecha sin guardar tus datos.",
    to: routes.numerologyLifePath,
  },
] as const;

const steps = [
  {
    number: "01",
    icon: "sun" as const,
    title: "Elige lo que quieres comprender",
    description: "Empieza por tu signo, una carta, la Luna o una pregunta concreta.",
  },
  {
    number: "02",
    icon: "tarot" as const,
    title: "Recibe una lectura con contexto",
    description: "Observa el significado sin órdenes absolutas ni promesas imposibles.",
  },
  {
    number: "03",
    icon: "premium" as const,
    title: "Llévalo a tu experiencia",
    description: "Guarda, reflexiona y vuelve a consultar cuando tu momento cambie.",
  },
];

/** Sección de valor premium: convierte la home en una narrativa de producto, no solo en un índice. */
export function PremiumValueSection() {
  return (
    <section
      aria-labelledby="premium-value-title"
      className="relative overflow-hidden bg-parchment-elevated py-20 md:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-brand-violet/10 blur-3xl"
      />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-20">
          <div className="max-w-[42ch]">
            <p className="font-body text-[12px] font-medium uppercase tracking-[0.18em] text-cosmic">
              Una lectura con intención
            </p>
            <h2
              id="premium-value-title"
              className="mt-4 font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.025em] text-ink md:text-[46px]"
            >
              No necesitas más ruido. Necesitas entender tu momento.
            </h2>
            <p className="mt-5 font-body text-[16px] leading-[1.75] text-ink-soft md:text-[18px]">
              Explora lo simbólico con una experiencia que te ayuda a hacer mejores preguntas, ver
              tus ciclos con más perspectiva y decidir qué merece tu atención hoy.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg">
                <Link to={routes.horoscopeToday}>
                  <Icon name="sun" />
                  Descubre tu lectura de hoy
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={routes.method}>Conoce nuestro método</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {valuePillars.map((pillar) => (
              <article
                key={pillar.title}
                className="rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment p-5 shadow-[0_16px_40px_rgba(31,24,50,0.05)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-soft text-cosmic">
                  <Icon name={pillar.icon} size="md" />
                </div>
                <p className="mt-5 font-body text-[11px] font-medium uppercase tracking-[0.16em] text-cosmic">
                  {pillar.eyebrow}
                </p>
                <h3 className="mt-2 font-display text-[20px] font-semibold leading-[1.2] text-ink">
                  {pillar.title}
                </h3>
                <p className="mt-3 font-body text-[14px] leading-[1.65] text-ink-soft">
                  {pillar.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <nav
          aria-labelledby="real-tools-title"
          className="mt-12 rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment p-6 md:mt-16 md:p-8"
        >
          <div className="max-w-[54ch]">
            <p className="font-body text-[12px] font-medium uppercase tracking-[0.18em] text-cosmic">
              Explora también
            </p>
            <h3
              id="real-tools-title"
              className="mt-3 font-display text-[26px] font-semibold text-ink"
            >
              Herramientas para distintos momentos
            </h3>
            <p className="mt-3 font-body text-[15px] leading-7 text-ink-soft">
              Son experiencias independientes y reflexivas: no combinan ni guardan tus datos natales
              automáticamente.
            </p>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {realTools.map((tool) => (
              <Link
                key={tool.to}
                to={tool.to}
                className="rounded-2xl border border-line bg-background p-4 transition hover:-translate-y-0.5 hover:border-cosmic focus:outline-none focus:ring-2 focus:ring-cosmic/30"
              >
                <h4 className="font-display text-[19px] text-ink">{tool.label}</h4>
                <p className="mt-2 font-body text-[13px] leading-6 text-ink-soft">
                  {tool.description}
                </p>
                <span className="mt-3 inline-flex font-body text-[13px] font-semibold text-cosmic">
                  Abrir herramienta →
                </span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="mt-16 rounded-[var(--radius-card-lg)] bg-night px-6 py-8 text-ink-inverse md:mt-24 md:px-10 md:py-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-body text-[12px] font-medium uppercase tracking-[0.18em] text-gold">
                Cómo funciona
              </p>
              <h3 className="mt-3 font-display text-[26px] font-semibold leading-[1.15] md:text-[34px]">
                Una pausa breve. Una mirada más completa.
              </h3>
            </div>
            <p className="max-w-[38ch] font-body text-[14px] leading-[1.65] text-ink-inverse-soft">
              Cada herramienta abre una puerta distinta, pero la decisión siempre vuelve a ti.
            </p>
          </div>

          <div className="mt-8 grid gap-8 border-t border-line-dark pt-8 md:grid-cols-3 md:gap-6">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="flex items-center gap-3">
                  <span className="font-body text-[12px] font-medium tracking-[0.16em] text-gold">
                    {step.number}
                  </span>
                  <Icon name={step.icon} size="sm" className="text-gold" />
                </div>
                <h4 className="mt-4 font-display text-[20px] font-semibold text-ink-inverse">
                  {step.title}
                </h4>
                <p className="mt-2 font-body text-[14px] leading-[1.65] text-ink-inverse-soft">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
