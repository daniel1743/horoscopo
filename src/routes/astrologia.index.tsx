import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { routes } from "@/config/routes";
import { buildMeta } from "@/config/seo";

const tools = [
  {
    title: "Carta natal",
    description:
      "Posiciones principales, ascendente y casas iguales a partir de tus datos de nacimiento.",
    to: routes.birthChart,
  },
  {
    title: "Ascendente",
    description:
      "Una referencia del signo que ascendía por el horizonte oriental en tu momento de nacimiento.",
    to: routes.ascendant,
  },
  {
    title: "Signo lunar",
    description:
      "La posición de la Luna en tu fecha de nacimiento, con aproximación explícita si falta la hora.",
    to: routes.moonSign,
  },
] as const;

export const Route = createFileRoute("/astrologia/")({
  head: () => {
    const m = buildMeta({
      title: "Astrología personal: carta natal y signos | Creovision",
      description:
        "Calcula una carta natal de referencia, tu ascendente o tu signo lunar con datos astronómicos y límites explícitos.",
      canonical: "/astrologia",
    });
    return { meta: m.meta, links: m.links };
  },
  component: AstrologyHubPage,
});

function AstrologyHubPage() {
  return (
    <PageShell breadcrumbs={[{ label: "Astrología" }]}>
      <PageHeader
        eyebrow="Astrología personal"
        title="Conoce tus símbolos de nacimiento"
        description="Tres experiencias locales para observar carta natal, ascendente y signo lunar sin promesas absolutas ni afirmaciones de causalidad científica."
      />
      <section aria-labelledby="astrology-tools-heading" className="mt-10">
        <h2
          id="astrology-tools-heading"
          className="font-display text-[24px] font-semibold text-ink"
        >
          Elige por dónde empezar
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="group rounded-[22px] border border-line bg-background p-5 transition duration-200 hover:-translate-y-0.5 hover:border-cosmic hover:shadow-[0_18px_50px_rgba(31,25,53,0.08)] focus:outline-none focus:ring-2 focus:ring-cosmic/30"
            >
              <p className="font-body text-[12px] font-semibold uppercase tracking-[0.14em] text-cosmic">
                Creovision
              </p>
              <h3 className="mt-3 font-display text-[21px] text-ink group-hover:text-cosmic">
                {tool.title}
              </h3>
              <p className="mt-2 font-body text-[14px] leading-6 text-ink-soft">
                {tool.description}
              </p>
              <span className="mt-5 inline-flex font-body text-[13px] font-semibold text-cosmic">
                Abrir experiencia →
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section
        className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]"
        aria-labelledby="astrology-method-heading"
      >
        <div className="rounded-[22px] border border-line bg-warm-white p-6">
          <h2 id="astrology-method-heading" className="font-display text-[22px] text-ink">
            Qué calcula esta sección
          </h2>
          <p className="mt-3 font-body text-[14px] leading-7 text-ink-soft">
            Astronomy Engine calcula posiciones de cuerpos del sistema solar para el instante y el
            lugar indicados. Creovision las traduce a signos tropicales de referencia; el ascendente
            se obtiene con el horizonte oriental y las casas se presentan con un sistema de casas
            iguales.
          </p>
        </div>
        <aside className="rounded-[22px] border border-accent-lunar-gold/30 bg-accent-lunar-gold/10 p-6">
          <h2 className="font-display text-[22px] text-ink">Lo que no promete</h2>
          <p className="mt-3 font-body text-[14px] leading-7 text-ink-soft">
            No sustituye asesoramiento profesional, no diagnostica, no predice hechos inevitables y
            no guarda los datos de nacimiento por defecto. Para un cálculo profesional se necesitan
            efemérides, criterios y revisión especializados.
          </p>
        </aside>
      </section>
    </PageShell>
  );
}
