import type { TransitNarrative } from "@/services/astrology-relationship.service";

interface Props {
  narrative: TransitNarrative;
}

export function TransitNarrativePanel({ narrative }: Props) {
  return (
    <section
      aria-labelledby="transit-narrative-title"
      className="mt-6 rounded-2xl border border-cosmic/20 bg-cosmic/5 p-5"
    >
      <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-cosmic">
        Lectura organizada
      </p>
      <h3 id="transit-narrative-title" className="mt-2 font-display text-[23px] text-ink">
        Qué observar primero
      </h3>
      <p className="mt-3 font-body text-[14px] leading-6 text-ink-soft">{narrative.overview}</p>
      {narrative.highlights.length > 0 && (
        <div className="mt-4 rounded-xl border border-line/70 bg-background p-4">
          <h4 className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-cosmic">
            Contactos más cercanos
          </h4>
          <ol className="mt-3 grid gap-3">
            {narrative.highlights.map((contact) => (
              <li key={contact.key} className="rounded-xl border border-line/70 bg-warm-white p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h5 className="font-display text-[17px] text-ink">{contact.title}</h5>
                  <span className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-cosmic">
                    {contact.intensityLabel}
                  </span>
                </div>
                <p className="mt-1 font-body text-[12px] text-ink-muted">
                  {contact.themeLabel} · {contact.toneLabel}
                  {contact.retrograde ? " · Retrógrado" : ""}
                </p>
                <p className="mt-2 font-body text-[13px] leading-6 text-ink-soft">{contact.text}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="mt-4 grid gap-3">
        {narrative.groups.map((group) => (
          <details key={group.key} className="rounded-xl border border-line/70 bg-background p-4">
            <summary className="cursor-pointer font-body text-[13px] font-semibold text-cosmic">
              {group.label} · {group.count} contacto{group.count === 1 ? "" : "s"}
            </summary>
            <p className="mt-3 font-body text-[13px] leading-6 text-ink-soft">{group.summary}</p>
            <ul className="mt-3 grid gap-2">
              {group.contacts.map((contact) => (
                <li key={contact.key} className="border-l-2 border-cosmic/25 pl-3">
                  <p className="font-body text-[12px] font-semibold text-ink">{contact.title}</p>
                  <p className="mt-1 font-body text-[12px] leading-5 text-ink-soft">
                    {contact.text}
                  </p>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
      <p className="mt-5 border-l-2 border-cosmic/40 pl-4 font-body text-[14px] italic leading-6 text-ink">
        {narrative.reflectionQuestion}
      </p>
    </section>
  );
}
