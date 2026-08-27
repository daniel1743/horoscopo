import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";
import { TarotCardGrid } from "@/components/tarot/TarotCardGrid";
import { TarotSkeleton } from "@/components/tarot/TarotSkeleton";
import { tarotService } from "@/services/tarot.service";
import { tarotQueryKeys } from "@/hooks/useTarotDeck";

export function TarotLibraryPage() {
  const q = useQuery({
    queryKey: tarotQueryKeys.library(),
    queryFn: () => tarotService.getLibrary(),
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
