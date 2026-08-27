import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/config/routes";
import { dreamThemeLabels } from "@/config/dreams";
import { searchDreamSymbols } from "@/services/dreams.service";
import type { DreamTheme } from "@/types/dreams";

type DreamFilter = DreamTheme | "all";

const themeOptions: Array<{ value: DreamFilter; label: string }> = [
  { value: "all", label: "Todos" },
  ...Object.entries(dreamThemeLabels).map(([value, label]) => ({
    value: value as DreamTheme,
    label,
  })),
];

export function DreamDictionaryPage() {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<DreamFilter>("all");
  const symbols = useMemo(() => searchDreamSymbols(query, theme), [query, theme]);

  return (
    <PageShell breadcrumbs={[{ label: "Inicio", href: routes.home }, { label: "Sueños" }]}>
      <PageHeader
        eyebrow="Diccionario simbólico"
        title="Explora lo que apareció en tu sueño"
        description="Busca una imagen y úsala como punto de partida para recordar tu contexto, tus emociones y las preguntas que el sueño te dejó. No existe una interpretación universal."
      />

      <section
        aria-labelledby="dream-method-title"
        className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment-elevated p-6">
          <p className="font-body text-[12px] font-medium uppercase tracking-[0.16em] text-cosmic">
            Cómo usarlo
          </p>
          <h2 id="dream-method-title" className="mt-3 font-display text-[24px] text-ink">
            El contexto personal importa más que el símbolo aislado
          </h2>
          <p className="mt-3 max-w-[65ch] font-body text-[15px] leading-7 text-ink-soft">
            Una misma imagen puede acompañar alivio, miedo, deseo, memoria o simplemente una escena
            sin significado especial. Lee las propuestas como asociaciones abiertas y conserva solo
            lo que conecte con tu experiencia.
          </p>
        </div>
        <aside className="rounded-[var(--radius-card-lg)] border border-accent-lunar-gold/30 bg-accent-lunar-gold/10 p-6">
          <p className="font-body text-[12px] font-medium uppercase tracking-[0.16em] text-cosmic">
            Privacidad
          </p>
          <h2 className="mt-3 font-display text-[22px] text-ink">No guardamos tu sueño</h2>
          <p className="mt-3 font-body text-[14px] leading-6 text-ink-soft">
            La búsqueda ocurre en este navegador. Esta página no crea un diario, no envía el texto a
            la IA y no almacena símbolos ni emociones.
          </p>
        </aside>
      </section>

      <section className="mt-8" aria-labelledby="dream-search-title">
        <div className="rounded-[var(--radius-card-lg)] border border-line-soft bg-background p-5 md:p-6">
          <h2 id="dream-search-title" className="font-display text-[22px] text-ink">
            Buscar en el diccionario
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
            <label className="grid gap-2 font-body text-[13px] font-semibold text-ink">
              Imagen, emoción o palabra relacionada
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ejemplo: agua, puerta, miedo…"
                aria-describedby="dream-result-count"
              />
            </label>
            <div>
              <span className="font-body text-[13px] font-semibold text-ink">Tema</span>
              <div
                className="mt-2 flex flex-wrap gap-2"
                role="group"
                aria-label="Filtrar sueños por tema"
              >
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={theme === option.value}
                    onClick={() => setTheme(option.value)}
                    className={`rounded-full border px-3 py-2 font-body text-[12px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-cosmic/30 ${
                      theme === option.value
                        ? "border-cosmic bg-cosmic text-white"
                        : "border-line bg-warm-white text-ink-soft hover:border-cosmic hover:text-cosmic"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p
            id="dream-result-count"
            className="mt-4 font-body text-[13px] text-ink-muted"
            aria-live="polite"
          >
            {symbols.length} {symbols.length === 1 ? "símbolo disponible" : "símbolos disponibles"}
          </p>
        </div>
      </section>

      {symbols.length > 0 ? (
        <section className="mt-8 grid gap-4 md:grid-cols-2" aria-label="Símbolos de sueños">
          {symbols.map((symbol) => (
            <article
              key={symbol.slug}
              className="rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment-elevated p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-body text-[11px] font-medium uppercase tracking-[0.16em] text-cosmic">
                    {dreamThemeLabels[symbol.theme]}
                  </p>
                  <h2 className="mt-2 font-display text-[25px] text-ink">{symbol.name}</h2>
                </div>
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cosmic/10 text-cosmic"
                >
                  <Icon name="moon" size="sm" />
                </span>
              </div>
              <p className="mt-4 font-body text-[14px] leading-6 text-ink-soft">
                {symbol.shortDescription}
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-line/70 bg-background p-4">
                  <h3 className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Lente simbólica
                  </h3>
                  <p className="mt-2 font-body text-[13px] leading-6 text-ink-soft">
                    {symbol.symbolicLens}
                  </p>
                </div>
                <div className="rounded-xl border border-line/70 bg-background p-4">
                  <h3 className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Lente emocional
                  </h3>
                  <p className="mt-2 font-body text-[13px] leading-6 text-ink-soft">
                    {symbol.emotionalLens}
                  </p>
                </div>
              </div>
              <blockquote className="mt-5 border-l-2 border-cosmic/40 pl-4 font-body text-[14px] italic leading-6 text-ink">
                {symbol.reflectionQuestion}
              </blockquote>
              <p className="mt-4 font-body text-[12px] text-ink-muted">
                También puede aparecer como: {symbol.relatedWords.join(", ")}.
              </p>
            </article>
          ))}
        </section>
      ) : (
        <section className="mt-8 rounded-[var(--radius-card-lg)] border border-dashed border-line p-10 text-center">
          <h2 className="font-display text-[22px] text-ink">No encontramos ese símbolo</h2>
          <p className="mx-auto mt-2 max-w-[50ch] font-body text-[14px] leading-6 text-ink-soft">
            Prueba con una palabra relacionada o quita el filtro. Que una imagen no aparezca aquí no
            significa que tu sueño no tenga valor: puedes escribir qué te hizo sentir y qué estaba
            ocurriendo en tu vida.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setTheme("all");
            }}
            className="mt-5 inline-flex items-center gap-2 font-body text-[13px] font-semibold text-cosmic hover:underline"
          >
            Limpiar búsqueda
            <Icon name="chevronRight" className="h-4 w-4" />
          </button>
        </section>
      )}

      <div className="mt-10 flex flex-wrap gap-4 border-t border-line-soft pt-6">
        <Link
          to={routes.guides}
          className="font-body text-[14px] font-semibold text-cosmic hover:underline"
        >
          Leer Guías editoriales →
        </Link>
        <Link
          to={routes.tarot}
          className="font-body text-[14px] font-semibold text-cosmic hover:underline"
        >
          Explorar Tarot →
        </Link>
      </div>
    </PageShell>
  );
}
