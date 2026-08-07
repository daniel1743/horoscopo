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
    <>
      <style>{`
        @keyframes deal-card-fan {
          from {
            opacity: 0;
            transform: translate(-50%, 150px) rotate(0deg) scale(0.5);
          }
          to {
            opacity: 1;
            transform: var(--final-transform);
          }
        }
        .animate-deal-card {
          opacity: 0;
          animation: deal-card-fan 700ms cubic-bezier(.2, .8, .2, 1) forwards;
          animation-delay: var(--delay);
        }
        
        .desktop-tarot-card {
          position: absolute;
          left: 50%;
          bottom: 0;
          /* The transform origin is the very bottom center of the card */
          transform-origin: 50% 100%;
          transition: transform 500ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 300ms, filter 300ms;
          will-change: transform, opacity;
        }
        
        /* Efecto hover: sacar la carta radialmente y agrandarla */
        .desktop-tarot-card:not(.is-selected):not(.is-muted):hover {
          z-index: 100 !important;
          filter: brightness(1.1);
        }
        .desktop-tarot-card:not(.is-selected):not(.is-muted):hover > .card-hover-wrapper {
           transform: translateY(-30px) scale(1.1);
        }
        
        /* Animación suave para el wrapper interno */
        .card-hover-wrapper {
          transition: transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        
        /* Estado seleccionado: vuela al centro y desaparece gradualmente */
        .desktop-tarot-card.is-selected {
          z-index: 200 !important;
          transform: translate(-50%, -200px) rotate(0deg) scale(1.3) !important;
          opacity: 0 !important;
          pointer-events: none;
        }
        
        /* Estado silenciado: el resto de cartas cuando hay una seleccionada */
        .desktop-tarot-card.is-muted {
          opacity: 0.25 !important;
          pointer-events: none;
        }
      `}</style>
      
      <div className="relative w-full overflow-hidden md:overflow-visible py-2 md:py-8">
        {/* --- VISTA MÓVIL: Carrusel Horizontal --- */}
        <div 
          className={cn(
            "flex md:hidden items-center gap-3 sm:gap-4",
            "overflow-x-auto pb-4 snap-x snap-mandatory px-4",
            "scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          )}
        >
          {candidateCards.map((candidate, index) => {
            const isSelected = selectedIds.includes(candidate.id);
            
            return (
              <div 
                key={candidate.id} 
                className="snap-start sm:snap-center shrink-0 transition-transform duration-300"
                style={{
                  zIndex: isSelected ? 10 : candidateCards.length - index,
                }}
              >
                <TarotCardBack
                  cardBackSrc={cardBackSrc}
                  selected={isSelected}
                  disabled={disabled || isSelected}
                  compact
                  onClick={() => onSelectCard(candidate.id)}
                  className="w-[70px] h-[120px] sm:w-[90px] sm:h-[150px]"
                />
              </div>
            );
          })}
        </div>
        
        {/* Indicadores de scroll en móvil sutil */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-parchment to-transparent md:hidden pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-parchment to-transparent md:hidden pointer-events-none" />


        {/* --- VISTA ESCRITORIO: Abanico Interactivo --- */}
        <div className="hidden md:block relative w-full h-[320px] max-w-[900px] mx-auto mt-4">
          {candidateCards.map((candidate, index) => {
            const isSelected = selectedIds.includes(candidate.id);
            // Desactivamos isMuted para que el mazo siga interactivo para las siguientes selecciones
            const isMuted = false;
            const total = candidateCards.length;
            
            // Cálculos trigonométricos para el arco
            const progress = total > 1 ? index / (total - 1) : 0.5;
            // Un arco de -40 a +40 grados suele verse muy natural
            const angle = -42 + (progress * 84);
            const radians = (angle * Math.PI) / 180;
            const radius = 600; // Radio del círculo imaginario
            
            // Calculamos X e Y en base al radio
            const x = Math.sin(radians) * radius;
            const y = radius - (Math.cos(radians) * radius);
            
            // La transformación final compone el centrado (-50%), la posición en el arco y la rotación.
            const finalTransform = `translate(-50%, 0) translate(${x}px, ${y}px) rotate(${angle}deg)`;

            return (
              <div
                key={candidate.id}
                className={cn(
                  "desktop-tarot-card animate-deal-card",
                  isSelected && "is-selected",
                  isMuted && "is-muted"
                )}
                style={{
                  "--delay": `${index * 25}ms`,
                  "--final-transform": finalTransform,
                  zIndex: isSelected ? 200 : index,
                } as React.CSSProperties}
              >
                <div className="card-hover-wrapper">
                  <TarotCardBack
                    cardBackSrc={cardBackSrc}
                    selected={isSelected}
                    disabled={disabled || isSelected || isMuted}
                    onClick={() => onSelectCard(candidate.id)}
                    className="w-[110px] h-[180px] shadow-[0_8px_20px_rgba(0,0,0,0.4)] pointer-events-auto hover:!translate-y-0"
                    // Deshabilitamos el hover interno de TarotCardBack para que no interfiera con card-hover-wrapper
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
