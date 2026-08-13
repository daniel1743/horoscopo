import { cn } from "@/lib/utils";

interface TarotSelectionProgressProps {
  currentSelectionCount: number;
  maxSelectionCount: number;
  nextPositionLabel?: string;
  className?: string;
}

export function TarotSelectionProgress({
  currentSelectionCount,
  maxSelectionCount,
  nextPositionLabel,
  className,
}: TarotSelectionProgressProps) {
  const isComplete = currentSelectionCount >= maxSelectionCount;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)} aria-live="polite">
      <div className="font-body text-[14px] uppercase tracking-widest text-ink/70">
        Seleccionadas: <span className="text-cosmic font-medium">{currentSelectionCount}</span> de {maxSelectionCount}
      </div>
      
      {!isComplete && nextPositionLabel && (
        <div className="text-[14px] text-ink-soft animate-pulse">
          {currentSelectionCount === 0 && (
            <>Elige una carta para <span className="font-medium text-ink">{nextPositionLabel}</span></>
          )}
          {currentSelectionCount === 1 && (
            <>Ahora elige una carta para <span className="font-medium text-ink">{nextPositionLabel}</span></>
          )}
          {currentSelectionCount === 2 && (
            <>Última carta: <span className="font-medium text-ink">{nextPositionLabel}</span></>
          )}
        </div>
      )}
      
      {isComplete && (
        <div className="text-[14px] text-cosmic font-medium">
          Selección completa
        </div>
      )}
    </div>
  );
}
