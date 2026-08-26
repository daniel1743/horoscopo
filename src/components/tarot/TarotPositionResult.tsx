import { Link } from "@tanstack/react-router";
import { FavoriteButton } from "@/components/account/FavoriteButton";
import { TarotCardVisual } from "./TarotCardVisual";
import type { TarotDrawnCard } from "@/types/tarot";
import { tarotCardRoute } from "@/config/routes";

interface Props {
  drawn: TarotDrawnCard;
  showPosition?: boolean;
  revealed?: boolean;
}

/** Resultado de UNA posición dentro de una tirada. */
export function TarotPositionResult({ drawn, showPosition = true, revealed = true }: Props) {
  const { card, position } = drawn;
  return (
    <article className="flex flex-col gap-4 rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment-elevated p-5 md:flex-row md:gap-6 md:p-6">
      <div className="mx-auto md:mx-0">
        <TarotCardVisual card={card} revealed={revealed} size="md" />
      </div>
      <div className="flex flex-1 flex-col">
        {showPosition && (
          <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-cosmic">
            {position.label}
          </p>
        )}
        <h3 className="mt-1 font-display text-[22px] text-ink">{card.name}</h3>
        <p className="mt-2 font-body text-[14px] leading-[1.6] text-ink-soft">
          {position.description}
        </p>
        <p className="mt-3 font-body text-[15px] leading-[1.7] text-ink">{card.uprightMeaning}</p>
        {card.reflectionQuestion && (
          <p className="mt-3 border-l-2 border-cosmic/40 pl-3 font-display text-[15px] italic text-ink">
            {card.reflectionQuestion}
          </p>
        )}
        {card.keywords.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {card.keywords.slice(0, 6).map((k) => (
              <li
                key={k}
                className="rounded-full border border-line-soft px-3 py-1 font-body text-[12px] text-ink-soft"
              >
                {k}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            to={tarotCardRoute(card.slug)}
            className="inline-flex w-fit items-center gap-1 font-body text-[13px] font-medium text-cosmic hover:underline"
          >
            Explorar esta carta →
          </Link>
          <FavoriteButton
            itemType="tarot_card"
            itemRef={card.slug}
            itemTitle={card.name}
            metadata={{ cardKey: card.cardKey }}
          />
        </div>
      </div>
    </article>
  );
}
