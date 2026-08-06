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
    <div className="flex flex-col md:flex-row justify-center items-stretch md:items-start gap-4 md:gap-8 w-full">
      {config.positions.map((pos) => {
        const isNext = state === "selecting" && nextPositionId === pos.key;
        const selected = selectedCards.find((c) => c.positionId === pos.key);
        const revealed = revealedCards.find((c) => c.positionId === pos.key);
        const isInterpreting = state === "interpreting";
        const isCompleted = !!selected || !!revealed;

        return (
          <div
            key={pos.key}
            className={cn(
              "flex flex-row md:flex-col items-center flex-1 w-full md:max-w-[200px] gap-4 p-3 md:p-0 rounded-[12px] transition-colors duration-300",
              isNext ? "bg-cosmic/5 border border-cosmic/20" : "border border-transparent",
              isCompleted && "md:opacity-100" // We can add visual styles for completed if needed
            )}
          >
            {/* Slot visual */}
            <div
              className={cn(
                "relative flex items-center justify-center rounded-[8px] sm:rounded-[12px] transition-all duration-300 shrink-0",
                "w-[72px] h-[112px] sm:w-[120px] sm:h-[200px]",
                !isCompleted && "border-2 border-dashed",
                !isCompleted && isNext
                  ? "border-cosmic/50 bg-cosmic/10"
                  : !isCompleted ? "border-line-soft bg-black/5" : ""
              )}
            >
              {!isCompleted && (
                <span className="text-[24px] sm:text-[32px] text-ink-soft/30 font-display opacity-50">
                  {pos.displayOrder}
                </span>
              )}

              {selected && !revealed && (
                <div className="absolute inset-0 animate-in fade-in zoom-in duration-300">
                  <TarotCardBack
                    cardBackSrc={cardBackSrc}
                    disabled
                    className="w-full h-full shadow-md"
                    compact
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

            {/* Info / Descripción (a la derecha en móvil, abajo en escritorio) */}
            <div className="flex flex-col md:text-center md:h-auto flex-1 md:min-h-[100px] justify-center md:justify-start">
              <h3
                className={cn(
                  "font-display text-[16px] md:text-[18px] transition-colors leading-tight",
                  isNext ? "text-cosmic font-medium" : "text-ink"
                )}
              >
                {pos.label}
              </h3>

              {revealed ? (
                <div className="mt-1 md:mt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <span className="block font-body font-medium text-[14px] md:text-[15px] text-ink">
                    {revealed.name}
                  </span>
                </div>
              ) : (
                <p className="mt-1 md:mt-2 font-body text-[13px] md:text-[12px] text-ink-soft opacity-90 md:opacity-80 md:max-w-[140px] md:mx-auto leading-[1.3]">
                  {pos.description}
                </p>
              )}

              {isNext && !isCompleted && (
                <span className="mt-2 text-[12px] font-medium text-cosmic block md:hidden">
                  ← Selecciona esta carta
                </span>
              )}
              {isCompleted && !revealed && (
                <span className="mt-2 text-[12px] font-medium text-ink-soft block md:hidden">
                  ✓ Posición lista
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
