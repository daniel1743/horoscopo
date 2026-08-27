import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/config/routes";
import { lifePathProfiles, numerologyDisclaimer } from "@/config/numerology";
import { calculateLifePath } from "@/services/numerology.service";
import type { LifePathCalculation } from "@/types/numerology";

export function LifePathPage() {
  const [birthDate, setBirthDate] = useState("");
  const [calculation, setCalculation] = useState<LifePathCalculation | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      setCalculation(calculateLifePath(birthDate));
    } catch (cause) {
      setCalculation(null);
      setError(cause instanceof Error ? cause.message : "No pudimos calcular ese resultado.");
    }
  }

  const profile = calculation ? lifePathProfiles[calculation.lifePath] : null;

  return (
    <PageShell
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Numerología", href: routes.numerologyLifePath },
      ]}
    >
      <PageHeader
        eyebrow="Numerología simbólica"
        title="Descubre tu número de camino de vida"
        description="Una lectura breve para observar temas de iniciativa, vínculos, estructura y aprendizaje a partir de tu fecha de nacimiento. El cálculo ocurre en este dispositivo y no se guarda."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
        <section
          aria-labelledby="life-path-form-title"
          className="rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment-elevated p-6 md:p-8"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-soft text-cosmic">
            <Icon name="premium" />
          </div>
          <h2 id="life-path-form-title" className="mt-5 font-display text-[24px] text-ink">
            Calcula sin crear una cuenta
          </h2>
          <p className="mt-3 font-body text-[15px] leading-[1.7] text-ink-soft">
            Introduce solo tu fecha. No la enviaremos a una API ni la añadiremos a tu perfil, a tu
            carta natal o a la Comunidad.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label
              className="block font-body text-sm font-medium text-ink"
              htmlFor="life-path-date"
            >
              Fecha de nacimiento
            </label>
            <Input
              id="life-path-date"
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              required
              max={new Date().toISOString().slice(0, 10)}
              aria-describedby="life-path-date-help"
            />
            <p
              id="life-path-date-help"
              className="font-body text-[12px] leading-[1.6] text-ink-soft"
            >
              Se conserva 11, 22 y 33 como números maestros al reducir cada parte de la fecha.
            </p>
            {error ? (
              <p role="alert" className="font-body text-sm text-error">
                {error}
              </p>
            ) : null}
            <Button type="submit" disabled={!birthDate} className="w-full sm:w-auto">
              <Icon name="premium" />
              Ver mi lectura
            </Button>
          </form>
        </section>

        <section aria-live="polite" aria-labelledby="life-path-result-title">
          {calculation && profile ? (
            <article className="rounded-[var(--radius-card-lg)] border border-cosmic/25 bg-warm-white p-6 shadow-[var(--shadow-card)] md:p-8">
              <p className="font-body text-[12px] font-medium uppercase tracking-[0.16em] text-cosmic">
                Tu resultado simbólico
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 id="life-path-result-title" className="font-display text-[34px] text-ink">
                    Camino de vida {calculation.lifePath}
                  </h2>
                  <p className="mt-1 font-body text-[16px] font-medium text-brand">
                    {profile.label}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2" aria-label="Palabras clave">
                  {profile.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-brand-soft px-3 py-1 font-body text-[12px] font-medium text-brand"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="Pasos del cálculo">
                <CalculationStep label="Mes reducido" value={calculation.reducedMonth} />
                <CalculationStep label="Día reducido" value={calculation.reducedDay} />
                <CalculationStep label="Año reducido" value={calculation.reducedYear} />
              </div>

              <div className="mt-7 space-y-5 border-t border-line-soft pt-6">
                <div>
                  <h3 className="font-display text-[21px] text-ink">Qué puede poner en foco</h3>
                  <p className="mt-2 font-body text-[15px] leading-[1.75] text-ink-soft">
                    {profile.summary}
                  </p>
                </div>
                <div className="rounded-[var(--radius-card-md)] bg-parchment p-4">
                  <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-cosmic">
                    Una práctica para hoy
                  </p>
                  <p className="mt-2 font-body text-[15px] leading-[1.7] text-ink">
                    {profile.practice}
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-[21px] text-ink">Pregunta para llevarte</h3>
                  <p className="mt-2 font-body text-[15px] italic leading-[1.7] text-ink-soft">
                    {profile.reflectionQuestion}
                  </p>
                </div>
              </div>
            </article>
          ) : (
            <div className="flex min-h-[280px] items-center justify-center rounded-[var(--radius-card-lg)] border border-dashed border-line bg-parchment p-8 text-center">
              <div className="max-w-[38ch]">
                <p className="font-display text-[22px] text-ink">Tu lectura aparecerá aquí</p>
                <p className="mt-2 font-body text-[15px] leading-[1.7] text-ink-soft">
                  Elige una fecha para convertir el cálculo en una conversación contigo, no en una
                  sentencia sobre quién eres.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <section
        aria-labelledby="numerology-next-title"
        className="mt-12 rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment p-6 md:p-8"
      >
        <h2 id="numerology-next-title" className="font-display text-[24px] text-ink">
          Sigue explorando
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            to={routes.tarot}
            className="rounded-[var(--radius-card-md)] border border-line-soft bg-warm-white p-4 font-body text-sm font-medium text-ink transition-colors hover:border-brand hover:text-brand focus-visible:ring-[3px] focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <span className="block font-display text-[18px]">Tarot con contexto</span>
            <span className="mt-1 block font-normal text-ink-soft">
              Formula una pregunta y observa sus matices.
            </span>
          </Link>
          <Link
            to={routes.guides}
            className="rounded-[var(--radius-card-md)] border border-line-soft bg-warm-white p-4 font-body text-sm font-medium text-ink transition-colors hover:border-brand hover:text-brand focus-visible:ring-[3px] focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <span className="block font-display text-[18px]">Leer las guías</span>
            <span className="mt-1 block font-normal text-ink-soft">
              Aprende a distinguir símbolo, contexto y decisión.
            </span>
          </Link>
        </div>
      </section>

      <p className="mt-8 font-body text-[12px] leading-[1.65] text-ink-soft">
        {numerologyDisclaimer}
      </p>
    </PageShell>
  );
}

function CalculationStep({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--radius-card-md)] border border-line-soft bg-parchment p-3">
      <p className="font-body text-[11px] uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-[24px] text-ink">{value}</p>
    </div>
  );
}
