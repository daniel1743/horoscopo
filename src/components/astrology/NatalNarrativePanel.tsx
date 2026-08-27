import type { NatalNarrative } from "@/services/astrology-narrative.service";

interface Props {
  narrative: NatalNarrative;
}

export function NatalNarrativePanel({ narrative }: Props) {
  return (
    <section
      aria-labelledby="natal-narrative-title"
      className="mt-6 rounded-2xl border border-line-soft bg-parchment-elevated p-5"
    >
      <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-cosmic">
        Lectura estructurada
      </p>
      <h3 id="natal-narrative-title" className="mt-2 font-display text-[23px] text-ink">
        Cómo se relacionan tus símbolos
      </h3>
      <p className="mt-3 font-body text-[15px] leading-7 text-ink">{narrative.overview}</p>
      <div className="mt-4 rounded-xl border border-cosmic/15 bg-cosmic/5 p-4">
        <h4 className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-cosmic">
          Patrón general
        </h4>
        <p className="mt-2 font-body text-[14px] leading-6 text-ink-soft">
          {narrative.patternText}
        </p>
      </div>

      <details className="mt-5 rounded-xl border border-line/70 bg-background p-4" open>
        <summary className="cursor-pointer font-body text-[13px] font-semibold text-cosmic">
          Diez placements en contexto
        </summary>
        <ol className="mt-4 grid gap-3">
          {narrative.placements.map((placement) => (
            <li key={placement.body} className="rounded-xl border border-line/70 bg-warm-white p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h5 className="font-display text-[18px] text-ink">{placement.title}</h5>
                <span className="font-body text-[12px] font-semibold text-cosmic">
                  {placement.placement} · {placement.houseText}
                </span>
              </div>
              <p className="mt-2 font-body text-[13px] leading-6 text-ink-soft">{placement.text}</p>
            </li>
          ))}
        </ol>
      </details>

      <details className="mt-4 rounded-xl border border-line/70 bg-background p-4">
        <summary className="cursor-pointer font-body text-[13px] font-semibold text-cosmic">
          Aspectos ordenados por cercanía ({narrative.aspects.length})
        </summary>
        {narrative.aspects.length > 0 ? (
          <ol className="mt-4 grid gap-3">
            {narrative.aspects.map((aspect) => (
              <li key={aspect.key} className="rounded-xl border border-line/70 bg-warm-white p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h5 className="font-display text-[18px] text-ink">{aspect.title}</h5>
                  <span className="font-body text-[12px] font-semibold text-cosmic">
                    {aspect.closeness}
                  </span>
                </div>
                <p className="mt-1 font-body text-[12px] uppercase tracking-[0.1em] text-ink-muted">
                  Tema: {aspect.theme}
                </p>
                <p className="mt-2 font-body text-[13px] leading-6 text-ink-soft">{aspect.text}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 font-body text-[13px] leading-6 text-ink-soft">
            No hay aspectos dentro de los orbes configurados para esta carta.
          </p>
        )}
      </details>

      <p className="mt-5 border-l-2 border-cosmic/40 pl-4 font-body text-[14px] italic leading-6 text-ink">
        {narrative.reflectionQuestion}
      </p>
    </section>
  );
}
