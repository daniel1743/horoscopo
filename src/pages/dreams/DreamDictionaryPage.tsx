import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/config/routes";
import { dreamThemeLabels } from "@/config/dreams";
import { LocalReportActions } from "@/components/astrology/LocalReportActions";
import {
  buildDreamJournalExport,
  buildDreamReflection,
  clearDreamJournal,
  createDreamJournalEntry,
  deleteDreamJournalEntry,
  dreamEmotionLabels,
  getDreamSymbolBySlug,
  loadDreamJournal,
  saveDreamJournalEntry,
  searchDreamSymbols,
} from "@/services/dreams.service";
import type { DreamEmotion, DreamJournalEntry, DreamReflection, DreamTheme } from "@/types/dreams";

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
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [emotion, setEmotion] = useState<DreamEmotion | null>(null);
  const [context, setContext] = useState("");
  const [journalTitle, setJournalTitle] = useState("");
  const [journal, setJournal] = useState<DreamJournalEntry[]>([]);
  const [journalConsent, setJournalConsent] = useState(false);
  const [journalMessage, setJournalMessage] = useState<string | null>(null);
  const symbols = useMemo(() => searchDreamSymbols(query, theme), [query, theme]);
  const selectedSymbols = useMemo(
    () =>
      selectedSlugs.map((slug) => getDreamSymbolBySlug(slug)).filter((symbol) => symbol !== null),
    [selectedSlugs],
  );
  const reflection = useMemo(
    () => buildDreamReflection(selectedSymbols, emotion, context),
    [selectedSymbols, emotion, context],
  );

  useEffect(() => {
    setJournal(loadDreamJournal());
  }, []);

  function toggleSymbol(slug: string) {
    setSelectedSlugs((current) => {
      if (current.includes(slug)) return current.filter((currentSlug) => currentSlug !== slug);
      if (current.length >= 5) return current;
      return [...current, slug];
    });
  }

  function handleSaveJournal() {
    setJournalMessage(null);
    if (!journalConsent) {
      setJournalMessage(
        "Activa el consentimiento local para guardar esta entrada en este dispositivo.",
      );
      return;
    }
    if (!reflection || selectedSlugs.length === 0) {
      setJournalMessage("Selecciona al menos un símbolo antes de guardar.");
      return;
    }
    const entry = createDreamJournalEntry({
      title: journalTitle || reflection.title,
      context,
      reflection: buildDreamReflectionExport(reflection),
      emotion,
      symbolSlugs: selectedSlugs,
    });
    if (!entry || !saveDreamJournalEntry(entry)) {
      setJournalMessage(
        "No fue posible guardar en este navegador. Puedes copiar la reflexión sin guardarla.",
      );
      return;
    }
    setJournal(loadDreamJournal());
    setJournalMessage("Entrada guardada únicamente en este dispositivo.");
  }

  function handleDeleteEntry(id: string) {
    if (!window.confirm("¿Borrar esta entrada local? Esta acción no se puede deshacer.")) return;
    if (deleteDreamJournalEntry(id)) {
      setJournal(loadDreamJournal());
      setJournalMessage("Entrada local eliminada.");
    }
  }

  function handleClearJournal() {
    if (
      !window.confirm("¿Borrar todo el diario local de Sueños? Esta acción no se puede deshacer.")
    )
      return;
    if (clearDreamJournal()) {
      setJournal([]);
      setJournalMessage("Diario local eliminado de este dispositivo.");
    }
  }

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
          <h2 className="mt-3 font-display text-[22px] text-ink">Tú decides si guardarlo</h2>
          <p className="mt-3 font-body text-[14px] leading-6 text-ink-soft">
            La búsqueda ocurre en este navegador. Solo se guarda algo si activas de forma explícita
            el diario local; no enviamos el texto a la IA ni a Supabase.
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

      <section
        aria-labelledby="dream-reflection-title"
        className="mt-8 rounded-[var(--radius-card-lg)] border border-cosmic/20 bg-cosmic/5 p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-body text-[12px] font-medium uppercase tracking-[0.16em] text-cosmic">
              Laboratorio de reflexión
            </p>
            <h2 id="dream-reflection-title" className="mt-2 font-display text-[24px] text-ink">
              Une símbolos, emoción y contexto
            </h2>
            <p className="mt-2 max-w-[70ch] font-body text-[14px] leading-6 text-ink-soft">
              Añade hasta cinco símbolos para comparar sus hilos, escribe solo el contexto que
              quieras conservar y usa la reflexión como una guía abierta. Nada se envía fuera de
              este navegador.
            </p>
          </div>
          <span className="rounded-full bg-background px-3 py-1 font-body text-[12px] font-semibold text-cosmic">
            {selectedSlugs.length}/5 seleccionados
          </span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Símbolos seleccionados">
          {selectedSymbols.length > 0 ? (
            selectedSymbols.map((symbol) => (
              <button
                key={symbol.slug}
                type="button"
                onClick={() => toggleSymbol(symbol.slug)}
                className="rounded-full border border-cosmic/30 bg-background px-3 py-1.5 font-body text-[12px] font-semibold text-cosmic hover:border-cosmic"
              >
                {symbol.name} ×
              </button>
            ))
          ) : (
            <p className="font-body text-[13px] text-ink-muted">
              Selecciona símbolos desde las tarjetas de abajo para comenzar.
            </p>
          )}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 font-body text-[13px] font-semibold text-ink">
            Emoción predominante (opcional)
            <select
              value={emotion ?? ""}
              onChange={(event) => setEmotion((event.target.value || null) as DreamEmotion | null)}
              className="h-11 rounded-xl border border-line bg-warm-white px-3 font-body text-[14px] font-normal text-ink outline-none focus:border-cosmic focus:ring-2 focus:ring-cosmic/20"
            >
              <option value="">Prefiero no indicarla</option>
              {Object.entries(dreamEmotionLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 font-body text-[13px] font-semibold text-ink">
            Título para el diario local (opcional)
            <Input
              value={journalTitle}
              onChange={(event) => setJournalTitle(event.target.value)}
              maxLength={100}
              placeholder="Ejemplo: La puerta y el camino"
            />
          </label>
        </div>
        <label className="mt-4 grid gap-2 font-body text-[13px] font-semibold text-ink">
          Contexto que quieras considerar (opcional)
          <textarea
            value={context}
            onChange={(event) => setContext(event.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="¿Qué estaba ocurriendo en tu vida o qué detalle del sueño recuerdas?"
            className="rounded-xl border border-line bg-warm-white px-3 py-3 font-body text-[14px] font-normal leading-6 text-ink outline-none focus:border-cosmic focus:ring-2 focus:ring-cosmic/20"
          />
        </label>
        {reflection && (
          <div className="mt-5 rounded-2xl border border-line/70 bg-background p-5">
            <h3 className="font-display text-[21px] text-ink">{reflection.title}</h3>
            <p className="mt-2 font-body text-[14px] leading-6 text-ink-soft">
              {reflection.overview}
            </p>
            <div className="mt-4 rounded-xl border border-line/70 bg-warm-white p-4">
              <h4 className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-cosmic">
                Hilos para observar
              </h4>
              <ul className="mt-2 grid gap-1 font-body text-[13px] leading-6 text-ink-soft">
                {reflection.sharedThemes.map((theme) => (
                  <li key={theme}>· {theme}</li>
                ))}
              </ul>
            </div>
            <div className="mt-4 grid gap-3">
              {reflection.symbolPrompts.map((prompt) => (
                <div key={prompt.symbolName} className="border-l-2 border-cosmic/30 pl-3">
                  <h4 className="font-body text-[13px] font-semibold text-ink">
                    {prompt.symbolName}
                  </h4>
                  <p className="mt-1 font-body text-[13px] leading-6 text-ink-soft">
                    {prompt.prompt}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 font-body text-[13px] leading-6 text-ink-soft">
              {reflection.contextPrompt}
            </p>
            <blockquote className="mt-4 border-l-2 border-cosmic/50 pl-4 font-body text-[14px] italic leading-6 text-ink">
              {reflection.reflectionQuestion}
            </blockquote>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 font-body text-[12px] text-ink-soft">
                <input
                  type="checkbox"
                  checked={journalConsent}
                  onChange={(event) => setJournalConsent(event.target.checked)}
                  className="h-4 w-4 accent-[var(--color-cosmic)]"
                />
                Permitir guardado local en este dispositivo
              </label>
              <button
                type="button"
                onClick={handleSaveJournal}
                className="rounded-full bg-cosmic px-4 py-2 font-body text-[12px] font-semibold text-white hover:bg-cosmic/90"
              >
                Guardar en diario local
              </button>
              <LocalReportActions
                content={buildDreamReflectionExport(reflection)}
                filename="creovision-reflexion-sueno.txt"
                label="Copiar o descargar reflexión"
              />
            </div>
            {journalMessage && (
              <p className="mt-3 font-body text-[13px] text-ink-soft" role="status">
                {journalMessage}
              </p>
            )}
          </div>
        )}
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
              <button
                type="button"
                aria-pressed={selectedSlugs.includes(symbol.slug)}
                onClick={() => toggleSymbol(symbol.slug)}
                className={`mt-4 rounded-full border px-4 py-2 font-body text-[12px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-cosmic/30 ${
                  selectedSlugs.includes(symbol.slug)
                    ? "border-cosmic bg-cosmic text-white"
                    : "border-cosmic/30 bg-background text-cosmic hover:border-cosmic"
                }`}
              >
                {selectedSlugs.includes(symbol.slug) ? "Quitar de reflexión" : "Añadir a reflexión"}
              </button>
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

      <section
        aria-labelledby="dream-journal-title"
        className="mt-10 rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment-elevated p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-body text-[12px] font-medium uppercase tracking-[0.16em] text-cosmic">
              Diario opcional
            </p>
            <h2 id="dream-journal-title" className="mt-2 font-display text-[23px] text-ink">
              Tus reflexiones en este dispositivo
            </h2>
            <p className="mt-2 max-w-[65ch] font-body text-[14px] leading-6 text-ink-soft">
              Estas entradas no pertenecen a tu cuenta, no se sincronizan y no se publican. Puedes
              exportarlas o borrarlas en cualquier momento.
            </p>
          </div>
          <span className="rounded-full bg-background px-3 py-1 font-body text-[12px] font-semibold text-cosmic">
            {journal.length} {journal.length === 1 ? "entrada" : "entradas"}
          </span>
        </div>
        {journal.length > 0 ? (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <LocalReportActions
                content={buildDreamJournalExport(journal)}
                filename="creovision-diario-suenos.txt"
                label="Exportar diario local"
              />
              <button
                type="button"
                onClick={handleClearJournal}
                className="rounded-full border border-line px-4 py-2 font-body text-[12px] font-semibold text-ink-soft hover:border-red-300 hover:text-red-700"
              >
                Borrar todo el diario
              </button>
            </div>
            <ol className="mt-5 grid gap-3">
              {journal.map((entry) => (
                <li key={entry.id} className="rounded-xl border border-line/70 bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-[19px] text-ink">{entry.title}</h3>
                      <p className="mt-1 font-body text-[12px] text-ink-muted">
                        {new Date(entry.createdAtIso).toLocaleString()} · Símbolos:{" "}
                        {entry.symbolSlugs
                          .map((slug) => getDreamSymbolBySlug(slug)?.name)
                          .filter((name): name is string => Boolean(name))
                          .join(", ")}
                        {entry.emotion ? ` · Emoción: ${dreamEmotionLabels[entry.emotion]}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="rounded-full border border-line px-3 py-1.5 font-body text-[11px] font-semibold text-ink-soft hover:border-red-300 hover:text-red-700"
                    >
                      Borrar
                    </button>
                  </div>
                  {entry.context && (
                    <div className="mt-3">
                      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                        Contexto
                      </p>
                      <p className="mt-1 whitespace-pre-wrap font-body text-[13px] leading-6 text-ink-soft">
                        {entry.context}
                      </p>
                    </div>
                  )}
                  <details className="mt-3 rounded-xl border border-line/70 bg-warm-white p-3">
                    <summary className="cursor-pointer font-body text-[12px] font-semibold text-cosmic">
                      Ver reflexión guardada
                    </summary>
                    <p className="mt-2 whitespace-pre-wrap font-body text-[13px] leading-6 text-ink-soft">
                      {entry.reflection}
                    </p>
                  </details>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-line bg-background px-4 py-4 font-body text-[13px] leading-6 text-ink-soft">
            Todavía no has guardado reflexiones. Selecciona símbolos arriba y activa el
            consentimiento local cuando quieras conservar una entrada.
          </p>
        )}
      </section>

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

function buildDreamReflectionExport(reflection: DreamReflection): string {
  return [
    `# ${reflection.title}`,
    reflection.overview,
    "",
    "## Hilos para observar",
    ...reflection.sharedThemes.map((theme) => `- ${theme}`),
    "",
    "## Preguntas por símbolo",
    ...reflection.symbolPrompts.map((prompt) => `${prompt.symbolName}: ${prompt.prompt}`),
    "",
    reflection.contextPrompt,
    "",
    `Pregunta final: ${reflection.reflectionQuestion}`,
    "",
    "Esta reflexión es simbólica y no constituye diagnóstico ni una interpretación universal.",
  ].join("\n");
}
