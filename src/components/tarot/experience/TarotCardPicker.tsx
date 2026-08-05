import { cn } from "@/lib/utils";
import { TarotCardBack } from "./TarotCardBack";
import type { TarotCardCandidate } from "./types";

interface TarotCardPickerProps {
  candidateCards: TarotCardCandidate[];
  selectedIds: string[];
  onSelectCard: (id: string) => void;
  cardBackSrc?: string;
  disabled?: boolean;
}

export function TarotCardPicker({
  candidateCards,
  selectedIds,
  onSelectCard,
  cardBackSrc,
  disabled,
}: TarotCardPickerProps) {
  return (
    <div className="relative w-full overflow-hidden py-8 px-4">
      {/* 
        Para móvil: Scroll horizontal (carrusel).
        Para escritorio/tablet: Flex wrap centrado imitando un abanico.
      */}
      <div 
        className={cn(
          "flex items-center gap-3 sm:gap-4 md:gap-6",
          "overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide",
          "md:flex-wrap md:justify-center md:overflow-visible md:pb-4"
        )}
      >
        {candidateCards.map((candidate, index) => {
          const isSelected = selectedIds.includes(candidate.id);
          
          return (
            <div 
              key={candidate.id} 
              className="snap-center shrink-0 transition-transform duration-300"
              style={{
                // Ligero efecto arco en escritorio si se desea, por ahora un z-index para apilamiento natural
                zIndex: isSelected ? 10 : candidateCards.length - index,
              }}
            >
              <TarotCardBack
                cardBackSrc={cardBackSrc}
                selected={isSelected}
                disabled={disabled || (isSelected)}
                compact
                onClick={() => onSelectCard(candidate.id)}
                className="w-[70px] h-[120px] sm:w-[90px] sm:h-[150px]"
              />
            </div>
          );
        })}
      </div>
      
      {/* Indicador de scroll en móvil */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-parchment to-transparent md:hidden pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-parchment to-transparent md:hidden pointer-events-none" />
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-parchment to-transparent md:hidden pointer-events-none" />
    </div>
  );
}
