import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";
import { TarotCardGrid } from "@/components/tarot/TarotCardGrid";
import { TarotSkeleton } from "@/components/tarot/TarotSkeleton";
import { tarotService } from "@/services/tarot.service";
import { tarotQueryKeys } from "@/hooks/useTarotDeck";
import type { TarotArcana, TarotSuit } from "@/types/tarot";

const arcanaOptions: Array<{ value: "all" | TarotArcana; label: string }> = [
  { value: "all", label: "Todos los arcanos" },
  { value: "major", label: "Arcanos mayores" },
  { value: "minor", label: "Arcanos menores" },
];

const suitOptions: Array<{ value: "all" | TarotSuit; label: string }> = [
  { value: "all", label: "Todos los palos" },
  { value: "wands", label: "Bastos" },
  { value: "cups", label: "Copas" },
  { value: "swords", label: "Espadas" },
  { value: "pentacles", label: "Oros" },
];

export function TarotLibraryPage() {
  const [arcana, setArcana] = useState<"all" | TarotArcana>("all");
  const [suit, setSuit] = useState<"all" | TarotSuit>("all");
  const selectedArcana = arcana === "all" ? undefined : arcana;
  const selectedSuit = suit === "all" ? undefined : suit;
  const q = useQuery({
    queryKey: tarotQueryKeys.library(selectedArcana, selectedSuit),
    queryFn: () => tarotService.getLibrary({ arcana: selectedArcana, suit: selectedSuit }),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <PageShell
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Tarot", href: routes.tarot },
        { label: "Biblioteca", href: routes.tarotLibrary },
      ]}
    >
      <PageHeader
        eyebrow="Tarot"
        title="Biblioteca de cartas"
        description="Explora las 78 cartas del Tarot, con significados al derecho e invertidos, palabras clave y una pregunta para llevar el símbolo a tu momento."
      />

      <section
        aria-labelledby="tarot-library-filters"
        className="mb-8 rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment-elevated p-5 md:p-6"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="tarot-library-filters" className="font-display text-[20px] text-ink">
              Explora por estructura
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Filtra la baraja sin salir de la biblioteca.
            </p>
          </div>
          <p className="text-sm text-ink-muted" aria-live="polite">
            {q.data?.length ?? 0} {q.data?.length === 1 ? "carta" : "cartas"}
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-ink">
            <span>Arcano</span>
            <select
              value={arcana}
              onChange={(event) => setArcana(event.target.value as "all" | TarotArcana)}
              className="h-10 rounded-[var(--radius-control)] border border-line bg-warm-white px-3 text-sm font-normal text-ink outline-none focus-visible:ring-2 focus-visible:ring-cosmic/50"
            >
              {arcanaOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-ink">
            <span>Palo</span>
            <select
              value={suit}
              onChange={(event) => setSuit(event.target.value as "all" | TarotSuit)}
              className="h-10 rounded-[var(--radius-control)] border border-line bg-warm-white px-3 text-sm font-normal text-ink outline-none focus-visible:ring-2 focus-visible:ring-cosmic/50"
            >
              {suitOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {q.isLoading ? (
        <TarotSkeleton label="Cargando biblioteca" />
      ) : q.isError ? (
        <p role="alert" className="font-body text-[15px] text-error">
          No se pudo cargar la biblioteca.
        </p>
      ) : (
        <TarotCardGrid cards={q.data ?? []} />
      )}
    </PageShell>
  );
}
