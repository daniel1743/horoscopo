import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";

export function EditorialMethodPage() {
  return (
    <PageShell
      width="reading"
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Método editorial", href: routes.method },
      ]}
    >
      <PageHeader
        eyebrow="Cómo trabajamos"
        title="Método editorial de Creovision"
        description="Un compromiso con la claridad, el respeto por el lector y una mirada contemporánea sobre la astrología y el tarot."
      />

      <div className="flex flex-col gap-8 font-body text-[17px] leading-[1.75] text-ink-soft">
        <section aria-labelledby="principios">
          <h2 id="principios" className="font-display text-[24px] font-semibold text-ink">
            Nuestros principios
          </h2>
          <ul className="mt-4 flex list-disc flex-col gap-2 pl-5">
            <li>
              <strong className="text-ink">Claridad antes que promesa.</strong> Evitamos
              afirmaciones sobre el futuro o el destino personal.
            </li>
            <li>
              <strong className="text-ink">Contexto simbólico.</strong> Presentamos la astrología y
              el tarot como lenguajes de reflexión.
            </li>
            <li>
              <strong className="text-ink">Respeto por el lector.</strong> Todo contenido incluye
              avisos cuando corresponde y remite a fuentes cuando aplica.
            </li>
            <li>
              <strong className="text-ink">Sin sensacionalismo.</strong> Nada de titulares
              alarmistas ni de decisiones críticas basadas en un artículo.
            </li>
          </ul>
        </section>

        <section aria-labelledby="proceso">
          <h2 id="proceso" className="font-display text-[24px] font-semibold text-ink">
            Proceso editorial
          </h2>
          <ol className="mt-4 flex list-decimal flex-col gap-2 pl-5">
            <li>Definición de tema y ángulo con foco en utilidad para el lector.</li>
            <li>Redacción por autor identificado con perfil público.</li>
            <li>Revisión editorial: coherencia interna, tono, claridad y avisos.</li>
            <li>Publicación con fecha, tiempo estimado de lectura y referencias.</li>
            <li>Revisión periódica cuando el contenido lo requiere.</li>
          </ol>
        </section>

        <section aria-labelledby="alcance">
          <h2 id="alcance" className="font-display text-[24px] font-semibold text-ink">
            Alcance y límites
          </h2>
          <p className="mt-4">
            Nuestro contenido no sustituye la orientación profesional en materia médica, legal o
            financiera. Cuando un tema puede rozar decisiones sensibles, incluimos avisos
            específicos y sugerimos consultar profesionales cualificados.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
