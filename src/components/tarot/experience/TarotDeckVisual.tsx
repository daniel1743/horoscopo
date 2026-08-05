import { cn } from "@/lib/utils";
import { TarotCardBack } from "./TarotCardBack";

interface TarotDeckVisualProps {
  isShuffling: boolean;
  cardBackSrc?: string;
  className?: string;
}

export function TarotDeckVisual({ isShuffling, cardBackSrc, className }: TarotDeckVisualProps) {
  return (
    <div className={cn("relative flex items-center justify-center h-[220px] w-full perspective-[1000px]", className)}>
      {/* 
        Simulación de un mazo. Si está barajando, las cartas se separan y cruzan.
      */}
      <div className="relative w-[120px] h-[200px]">
        {/* Carta base (fondo) */}
        <div className={cn(
          "absolute inset-0 transition-transform duration-700",
          isShuffling ? "-translate-x-12 translate-y-4 -rotate-12" : "translate-x-0 rotate-[-2deg]"
        )}>
          <TarotCardBack cardBackSrc={cardBackSrc} disabled className="shadow-sm" />
        </div>
        
        {/* Carta media */}
        <div className={cn(
          "absolute inset-0 transition-transform duration-700 delay-75",
          isShuffling ? "translate-x-12 -translate-y-2 rotate-12" : "translate-x-1 rotate-[1deg]"
        )}>
          <TarotCardBack cardBackSrc={cardBackSrc} disabled className="shadow-md" />
        </div>
        
        {/* Carta superior */}
        <div className={cn(
          "absolute inset-0 transition-transform duration-700 delay-150 z-10",
          isShuffling ? "translate-y-8 -rotate-6 scale-105 shadow-xl" : "translate-x-0 rotate-0 shadow-lg"
        )}>
          <TarotCardBack cardBackSrc={cardBackSrc} disabled />
        </div>
      </div>
      
      {isShuffling && (
        <div className="absolute -bottom-8 font-body text-[14px] uppercase tracking-widest text-cosmic animate-pulse">
          Barajando las cartas...
        </div>
      )}
    </div>
  );
}
