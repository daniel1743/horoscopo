import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";
import { TarotCardVisual } from "@/components/tarot/TarotCardVisual";
import { TarotContextualGuide } from "@/components/tarot/TarotContextualGuide";
import { TarotReadingDisclaimer } from "@/components/tarot/TarotReadingDisclaimer";
import { TarotSkeleton } from "@/components/tarot/TarotSkeleton";
import { tarotService } from "@/services/tarot.service";
import { tarotQueryKeys } from "@/hooks/useTarotDeck";
import { yesNoLabels } from "@/config/tarot";

interface Props {
  slug: string;
}

export function TarotCardDetailPage({ slug }: Props) {
  const q = useQuery({
    queryKey: tarotQueryKeys.card(slug),
    queryFn: () => tarotService.getCardBySlug(slug),
    staleTime: 1000 * 60 * 5,
  });

  if (q.isLoading)
    return (
      <PageShell>
        <TarotSkeleton label="Cargando carta" />
      </PageShell>
    );
  if (q.isError || !q.data) {
    return (
      <PageShell
        breadcrumbs={[
          { label: "Inicio", href: routes.home },
          { label: "Tarot", href: routes.tarot },
          { label: "Biblioteca", href: routes.tarotLibrary },
        ]}
      >
        <PageHeader eyebrow="Tarot" title="Carta no encontrada" />
        <p className="font-body text-[15px] text-ink-soft">
          Puede que aún no esté publicada. Vuelve a la{" "}
          <Link to={routes.tarotLibrary} className="text-cosmic hover:underline">
            biblioteca
          </Link>
          .
        </p>
      </PageShell>
    );
  }

  const card = q.data;
  const yesNo = yesNoLabels[card.yesNoTendency];

  return (
    <PageShell
      breadcrumbs={[
        { label: "Inicio", href: routes.home },
        { label: "Tarot", href: routes.tarot },
        { label: "Biblioteca", href: routes.tarotLibrary },
        { label: card.name },
      ]}
    >
      <PageHeader 
        eyebrow={card.arcana === "major" ? "Arcano Mayor" : "Arcano Menor"} 
        title={card.name} 
        description={card.summary} 
      />
      <div className="grid gap-8 md:grid-cols-[minmax(0,220px)_1fr]">
        <div className="mx-auto md:mx-0 flex flex-col items-center">
          <TarotCardVisual card={card} revealed size="lg" />
          <div className="mt-4 w-full">
            <TarotContextualGuide card={card} readingContext="Biblioteca" />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="font-display text-[20px] text-ink">Significado</h2>
            <p className="mt-2 font-body text-[15px] leading-[1.7] text-ink">
              {card.uprightMeaning}
            </p>
          </section>
          {card.keywords.length > 0 && (
            <section>
              <h2 className="font-display text-[18px] text-ink">Palabras clave</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {card.keywords.map((k) => (
                  <li
                    key={k}
                    className="rounded-full border border-line-soft px-3 py-1 font-body text-[12px] text-ink-soft"
                  >
                    {k}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h2 className="font-display text-[18px] text-ink">Tendencia en preguntas sí/no</h2>
            <p className="mt-2 font-body text-[15px] leading-[1.6] text-ink-soft">
              <strong className="text-ink">{yesNo.display}.</strong> {yesNo.description}
            </p>
          </section>
          {card.reflectionQuestion && (
            <section>
              <h2 className="font-display text-[18px] text-ink">Pregunta para reflexionar</h2>
              <p className="mt-2 border-l-2 border-cosmic/40 pl-3 font-display text-[16px] italic text-ink">
                {card.reflectionQuestion}
              </p>
            </section>
          )}
        </div>
      </div>
      <TarotReadingDisclaimer />
    </PageShell>
  );
}
