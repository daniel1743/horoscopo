import type { SynastryNarrative } from "@/services/astrology-relationship.service";

interface Props {
  narrative: SynastryNarrative;
}

export function SynastryNarrativePanel({ narrative }: Props) {
  return (
    <section
      aria-labelledby="synastry-narrative-title"
      className="mt-6 rounded-2xl border border-cosmic/20 bg-cosmic/5 p-5"
    >
      <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-cosmic">
        Lectura por temas
      </p>
      <h3 id="synastry-narrative-title" className="mt-2 font-display text-[23px] text-ink">
        Dónde conversar y qué cultivar
      </h3>
      <p className="mt-3 font-body text-[14px] leading-6 text-ink-soft">{narrative.overview}</p>
      {narrative.groups.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {narrative.groups.map((group) => (
            <details key={group.key} className="rounded-xl border border-line/70 bg-background p-4">
              <summary className="cursor-pointer font-body text-[13px] font-semibold text-cosmic">
                {group.label} · {group.count} contacto{group.count === 1 ? "" : "s"}
              </summary>
              <p className="mt-3 font-body text-[13px] leading-6 text-ink-soft">{group.summary}</p>
              <p className="mt-2 font-body text-[12px] font-semibold text-ink-muted">
                Tono general: {group.toneLabel}
              </p>
              <ul className="mt-3 grid gap-3">
                {group.contacts.map((contact) => (
                  <li key={contact.key} className="border-l-2 border-cosmic/25 pl-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-body text-[12px] font-semibold text-ink">
                        {contact.title}
                      </p>
                      <span className="font-body text-[11px] text-cosmic">
                        {contact.closenessLabel}
                      </span>
                    </div>
                    <p className="mt-1 font-body text-[12px] text-ink-muted">
                      {contact.aspectLabel} · {contact.toneLabel}
                    </p>
                    <p className="mt-1 font-body text-[12px] leading-5 text-ink-soft">
                      {contact.text}
                    </p>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-line bg-background px-4 py-3 font-body text-[13px] leading-6 text-ink-soft">
          No hay contactos mayores dentro de los orbes configurados para estas cartas. La ausencia
          de un contacto no califica por sí sola una relación.
        </p>
      )}
      <div className="mt-5 rounded-xl border border-line/70 bg-background p-4">
        <h4 className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-cosmic">
          Preguntas para conversar
        </h4>
        <ul className="mt-3 grid gap-2">
          {narrative.reflectionQuestions.map((question) => (
            <li
              key={question}
              className="border-l-2 border-cosmic/40 pl-3 font-body text-[14px] italic leading-6 text-ink"
            >
              {question}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
