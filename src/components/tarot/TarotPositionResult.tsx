import { Link } from "@tanstack/react-router";
import { TarotCardVisual } from "./TarotCardVisual";
import type { TarotDrawnCard, ThreeCardPositionConfig } from "@/types/tarot";
import { tarotCardRoute } from "@/config/routes";
import { TarotContextualGuide } from "./TarotContextualGuide";
import { buildDailyTarotIntroduction } from "@/lib/tarot/daily-introduction";

interface Props {
  drawn: TarotDrawnCard;
  positionConfig?: ThreeCardPositionConfig;
  userContext?: string;
  theme?: string;
  interpretation?: {
    interpretation: string;
    positiveValue: string;
    caution: string;
    practicalFocus: string;
  };
  showPosition?: boolean;
  revealed?: boolean;
}

/** Resultado de UNA posición dentro de una tirada. */
export function TarotPositionResult({
  drawn,
  positionConfig,
  userContext,
  theme,
  interpretation,
  showPosition = true,
  revealed = true,
}: Props) {
  const { card, position } = drawn;

  const positionLabel = positionConfig?.label ?? position.label;
  const positionDescription = positionConfig
    ? positionConfig.description
    : position.key === "daily_message"
      ? buildDailyTarotIntroduction(card)
      : position.description;

  return (
    <article className="flex flex-col gap-4 rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment-elevated p-5 md:flex-row md:gap-6 md:p-6">
      <div className="mx-auto md:mx-0">
        <TarotCardVisual card={card} revealed={revealed} size="md" />
      </div>
      <div className="flex flex-1 flex-col">
        {showPosition && (
          <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-cosmic">
            {positionLabel}
          </p>
        )}
        <h3 className="mt-1 font-display text-[22px] text-ink">{card.name}</h3>
        <p className="mt-2 font-body text-[14px] leading-[1.6] text-ink-soft">
          {positionDescription}
        </p>

        {interpretation ? (
          <div className="mt-3">
            <p className="font-body text-[15px] leading-[1.8] text-ink whitespace-pre-line">
              {interpretation.interpretation}
            </p>
          </div>
        ) : (
          <p className="mt-3 font-body text-[15px] leading-[1.7] text-ink">{card.uprightMeaning}</p>
        )}

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

        {revealed && (
          <div className="mt-2">
            <TarotContextualGuide
              card={card}
              position={position}
              userContext={userContext}
              theme={theme}
              positionKey={positionConfig?.key}
              interpretationFocus={positionConfig?.interpretationFocus}
            />
          </div>
        )}

        <Link
          to={tarotCardRoute(card.slug)}
          className="mt-4 inline-flex w-fit items-center gap-1 font-body text-[13px] font-medium text-cosmic hover:underline"
        >
          Explorar esta carta →
        </Link>
      </div>
    </article>
  );
}
