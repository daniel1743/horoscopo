import { cn } from "@/lib/utils";
import type { ThreeCardReadingConfig } from "@/types/tarot";
import { TarotCardBack } from "./TarotCardBack";
import type { SelectedTarotCard, RevealedTarotCard, ThreeCardExperienceState } from "./types";

interface ThreeCardPositionSlotsProps {
  config: ThreeCardReadingConfig;
  state: ThreeCardExperienceState;
  selectedCards: SelectedTarotCard[];
  revealedCards: RevealedTarotCard[];
  cardBackSrc?: string;
  nextPositionId?: string;
}

export function ThreeCardPositionSlots({
  config,
  state,
  selectedCards,
  revealedCards,
  cardBackSrc,
  nextPositionId,
}: ThreeCardPositionSlotsProps) {
  // Las posiciones vienen en config.positions
  return (
    <div className="flex flex-col md:flex-row justify-center items-start gap-4 md:gap-8 w-full">
      {config.positions.map((pos) => {
        const isNext = state === "selecting" && nextPositionId === pos.key;
        const selected = selectedCards.find((c) => c.positionId === pos.key);
        const revealed = revealedCards.find((c) => c.positionId === pos.key);
        const isInterpreting = state === "interpreting";

        return (
          <div
            key={pos.key}
            className="flex flex-col items-center flex-1 w-full max-w-[200px] gap-4"
          >
            {/* Cabecera de posición */}
            <div className="text-center h-[40px] flex flex-col justify-end">
              <h3
                className={cn(
                  "font-display text-[16px] md:text-[18px] transition-colors",
                  isNext ? "text-cosmic font-medium" : "text-ink",
                )}
              >
                {pos.label}
              </h3>
            </div>

            {/* Slot visual */}
            <div
              className={cn(
                "relative flex items-center justify-center rounded-[8px] sm:rounded-[12px] transition-all duration-500",
                "w-[90px] h-[150px] sm:w-[120px] sm:h-[200px]",
                !selected && !revealed && "border-2 border-dashed",
                !selected && !revealed && isNext
                  ? "border-cosmic/50 bg-cosmic/5 ring-4 ring-cosmic/10"
                  : "border-line-soft bg-black/5",
              )}
            >
              {!selected && !revealed && (
                <span className="text-[32px] text-ink-soft/30 font-display opacity-50">
                  {pos.displayOrder}
                </span>
              )}

              {selected && !revealed && (
                <div className="absolute inset-0 animate-in fade-in zoom-in duration-300">
                  <TarotCardBack
                    cardBackSrc={cardBackSrc}
                    disabled
                    className="w-full h-full shadow-md"
                  />
                </div>
              )}

              {revealed && (
                <div className="absolute inset-0 animate-in flip-in-y duration-700 w-full h-full">
                  <img
                    src={revealed.image}
                    alt={revealed.name}
                    className="w-full h-full object-cover rounded-[8px] sm:rounded-[12px] shadow-lg"
                  />
                  {/* Overlay sutil durante la interpretación para enfocar la vista */}
                  {isInterpreting && (
                    <div className="absolute inset-0 rounded-[8px] sm:rounded-[12px] bg-black/10 animate-pulse" />
                  )}
                </div>
              )}
            </div>

            {/* Info / Descripción abajo */}
            <div className="text-center mt-2 min-h-[60px]">
              {revealed ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <span className="block font-body font-medium text-[15px] text-ink">
                    {revealed.name}
                  </span>
                </div>
              ) : (
                <p className="font-body text-[12px] text-ink-soft opacity-80 max-w-[140px] mx-auto leading-tight">
                  {pos.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
