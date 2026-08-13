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
    <div className="mx-auto flex w-full max-w-[560px] flex-col items-stretch justify-center gap-2 md:max-w-none md:flex-row md:items-start md:gap-8">
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
              "flex w-full flex-1 flex-row items-center gap-3 rounded-[12px] px-2 py-1.5 transition-colors duration-300 md:max-w-[240px] md:flex-col md:gap-4 md:p-0",
              "border border-transparent",
              isCompleted && "md:opacity-100",
            )}
          >
            {/* Slot visual */}
            <div
              className={cn(
                "relative flex items-center justify-center rounded-[8px] sm:rounded-[12px] transition-all duration-300 shrink-0",
                "h-[72px] w-[46px] sm:h-[88px] sm:w-[54px] md:h-[240px] md:w-[145px]",
                !isCompleted && "border-2 border-dashed",
                !isCompleted && isNext
                  ? "border-cosmic/50 bg-cosmic/10"
                  : !isCompleted
                    ? "border-line-soft bg-black/5"
                    : "",
              )}
            >
              {!isCompleted && (
                <span className="font-display text-[18px] text-ink-soft/30 opacity-50 sm:text-[22px] md:text-[32px]">
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
            <div className="flex flex-1 flex-col justify-center md:h-auto md:min-h-[100px] md:justify-start md:text-center">
              <h3
                className={cn(
                  "font-display text-[14px] leading-tight transition-colors sm:text-[15px] md:text-[18px]",
                  isNext ? "text-cosmic font-medium" : "text-ink",
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
                <p className="mt-0.5 line-clamp-2 font-body text-[11px] leading-[1.25] text-ink-soft opacity-90 sm:text-[12px] md:mx-auto md:mt-2 md:max-w-[180px] md:text-[13px] md:opacity-80">
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
