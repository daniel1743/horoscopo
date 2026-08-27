import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { AstrologyBirthForm } from "@/components/astrology/AstrologyBirthForm";
import { routes } from "@/config/routes";
import type { ReactNode } from "react";

type AstrologyMode = "natal" | "ascendant" | "moon";

interface Props {
  mode: AstrologyMode;
}

const pageCopy = {
  natal: {
    eyebrow: "Astrología personal",
    title: "Carta natal, con contexto y límites",
    description:
      "Observa las posiciones de los principales cuerpos, tu ascendente y las doce casas desde un cálculo local y transparente.",
  },
  ascendant: {
    eyebrow: "Astrología personal",
    title: "Ascendente, calculado con hora y lugar",
    description:
      "El ascendente es sensible a la hora y la ubicación. Introduce coordenadas para obtener una referencia reproducible.",
  },
  moon: {
    eyebrow: "Astrología personal",
    title: "Signo lunar, sin convertirlo en una etiqueta",
    description:
      "La Luna muestra una posición astronómica que aquí se presenta como símbolo de reflexión. Con hora desconocida, el resultado se marca como aproximado.",
  },
} as const;

function SecondaryNav({ mode }: { mode: AstrologyMode }) {
  const links: Array<{ label: string; to: string; current: boolean }> = [
    { label: "Carta natal", to: routes.birthChart, current: mode === "natal" },
    { label: "Ascendente", to: routes.ascendant, current: mode === "ascendant" },
    { label: "Signo lunar", to: routes.moonSign, current: mode === "moon" },
  ];
  return (
    <nav aria-label="Secciones de astrología personal" className="mb-8 flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          aria-current={link.current ? "page" : undefined}
          className={`rounded-full border px-4 py-2 font-body text-[13px] transition-colors ${
            link.current
              ? "border-cosmic bg-cosmic text-white"
              : "border-line bg-background text-ink-soft hover:border-cosmic hover:text-cosmic"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function MethodNote({ children }: { children: ReactNode }) {
  return (
    <aside
      className="mt-10 rounded-2xl border border-accent-lunar-gold/30 bg-accent-lunar-gold/10 p-5"
      aria-label="Nota de método"
    >
      <p className="font-body text-[12px] font-semibold uppercase tracking-[0.14em] text-ink">
        Método y cuidado
      </p>
      <div className="mt-2 font-body text-[13px] leading-6 text-ink-soft">{children}</div>
    </aside>
  );
}

export function AstrologyPage({ mode }: Props) {
  const content = pageCopy[mode];
  return (
    <PageShell
      breadcrumbs={[{ label: "Astrología", to: routes.astrology }, { label: content.title }]}
    >
      <PageHeader
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
      />
      <SecondaryNav mode={mode} />
      <AstrologyBirthForm mode={mode} />
      <MethodNote>
        La experiencia calcula en el navegador y no requiere una cuenta. Las posiciones y el
        ascendente dependen de los datos introducidos; las casas se expresan con el sistema de casas
        iguales. No se trata de una carta profesional, una predicción determinista ni una afirmación
        científica.
      </MethodNote>
    </PageShell>
  );
}
