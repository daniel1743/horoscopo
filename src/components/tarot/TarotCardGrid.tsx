import { Link } from "@tanstack/react-router";
import type { TarotCard } from "@/types/tarot";
import { tarotCardRoute } from "@/config/routes";
import { TarotCardVisual } from "./TarotCardVisual";

interface Props {
  cards: readonly TarotCard[];
}

export function TarotCardGrid({ cards }: Props) {
  if (cards.length === 0) {
    return (
      <p className="font-body text-[15px] text-ink-soft">No hay cartas publicadas por ahora.</p>
    );
  }
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => (
        <li key={card.id}>
          <Link
            to={tarotCardRoute(card.slug)}
            className="group flex h-full flex-col items-center gap-3 rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment-elevated p-4 text-center transition-colors hover:border-cosmic/40"
          >
            <TarotCardVisual card={card} revealed size="sm" />
            <div>
              <h3 className="font-display text-[16px] text-ink">{card.name}</h3>
              <p className="mt-1 line-clamp-2 font-body text-[13px] leading-[1.5] text-ink-soft">
                {card.summary}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
