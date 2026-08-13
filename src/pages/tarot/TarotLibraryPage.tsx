import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";
import { TarotCardGrid } from "@/components/tarot/TarotCardGrid";
import { TarotSkeleton } from "@/components/tarot/TarotSkeleton";
import { tarotService } from "@/services/tarot.service";
import { tarotQueryKeys } from "@/hooks/useTarotDeck";
import { cn } from "@/lib/utils";

type FilterType = "all" | "major" | "minor";

export function TarotLibraryPage() {
  const [filter, setFilter] = useState<FilterType>("all");

  const q = useQuery({
    queryKey: tarotQueryKeys.library(),
    queryFn: () => tarotService.getLibrary(),
    staleTime: 1000 * 60 * 5,
  });

  const filteredCards = useMemo(() => {
    if (!q.data) return [];
    if (filter === "all") return q.data;
    return q.data.filter((card) => card.arcana === filter);
  }, [q.data, filter]);

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
        description="Explora las 78 cartas del mazo, desde los Arcanos Mayores hasta los Menores."
      />

      <div className="mb-8 flex flex-wrap gap-2 justify-center sm:justify-start">
        {(
          [
            { value: "all", label: "Todas" },
            { value: "major", label: "Arcanos Mayores" },
            { value: "minor", label: "Arcanos Menores" },
          ] as const
        ).map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full px-4 py-2 font-display text-[15px] transition-colors",
              filter === f.value
                ? "bg-cosmic text-warm-white"
                : "border border-line-soft bg-warm-white text-ink hover:border-cosmic hover:text-cosmic"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {q.isLoading ? (
        <TarotSkeleton label="Cargando biblioteca" />
      ) : q.isError ? (
        <p role="alert" className="font-body text-[15px] text-error">
          No se pudo cargar la biblioteca.
        </p>
      ) : (
        <TarotCardGrid cards={filteredCards} />
      )}
    </PageShell>
  );
}
