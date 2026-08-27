import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { TarotCard } from "@/types/tarot";
import { tarotCardRoute } from "@/config/routes";
import { tarotQueryKeys } from "@/hooks/useTarotDeck";
import { tarotService } from "@/services/tarot.service";
import { TarotCardVisual } from "./TarotCardVisual";

interface Props {
  card: TarotCard;
}

export function TarotRelatedCards({ card }: Props) {
  const arcana = card.arcana;
  const suit = card.arcana === "minor" ? (card.suit ?? undefined) : undefined;
  const query = useQuery({
    queryKey: tarotQueryKeys.library(arcana, suit),
    queryFn: () => tarotService.getLibrary({ arcana, suit }),
    staleTime: 1000 * 60 * 5,
  });

  const related = (query.data ?? []).filter((candidate) => candidate.id !== card.id).slice(0, 4);
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="tarot-related-title" className="mt-10">
      <div className="mb-4 flex flex-col gap-1">
        <h2 id="tarot-related-title" className="font-display text-[22px] text-ink">
          Continúa explorando
        </h2>
        <p className="text-sm text-ink-soft">
          {card.arcana === "major"
            ? "Otras cartas de los Arcanos Mayores."
            : `Otras cartas del palo de ${card.suit === "wands" ? "Bastos" : card.suit === "cups" ? "Copas" : card.suit === "swords" ? "Espadas" : "Oros"}.`}
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((relatedCard) => (
          <li key={relatedCard.id}>
            <Link
              to={tarotCardRoute(relatedCard.slug) as never}
              className="group flex h-full flex-col items-center gap-3 rounded-[var(--radius-card-md)] border border-line-soft bg-parchment-elevated p-4 text-center transition-colors hover:border-cosmic/40"
            >
              <TarotCardVisual card={relatedCard} revealed size="sm" />
              <span className="font-display text-[15px] text-ink group-hover:text-cosmic">
                {relatedCard.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
