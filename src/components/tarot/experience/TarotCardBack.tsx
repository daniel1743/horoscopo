import { cn } from "@/lib/utils";

const DEFAULT_CARD_BACK_SRC = "/carta%20trasera.png";

interface TarotCardBackProps {
  cardBackSrc?: string;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  compact?: boolean;
}

export function TarotCardBack({
  cardBackSrc,
  selected,
  disabled,
  className,
  onClick,
  compact = false,
}: TarotCardBackProps) {
  const resolvedCardBackSrc = cardBackSrc ?? DEFAULT_CARD_BACK_SRC;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "relative overflow-hidden rounded-[8px] sm:rounded-[12px] shadow-md transition-all duration-300 ease-out flex-shrink-0",
        "border-[2px] border-line focus:outline-none focus:ring-2 focus:ring-cosmic",
        // Aspect ratio for tarot cards (typically ~1:1.6 to 1:1.7, 70x120 or similar)
        compact ? "w-[60px] h-[100px]" : "w-[90px] h-[150px] sm:w-[120px] sm:h-[200px]",
        // Interactive states
        !disabled && "hover:-translate-y-2 hover:shadow-lg cursor-pointer hover:border-cosmic/50",
        selected && "-translate-y-4 shadow-xl border-cosmic ring-2 ring-cosmic/50",
        disabled && !selected && "cursor-not-allowed",
        className,
      )}
    >
      {resolvedCardBackSrc ? (
        <img
          src={resolvedCardBackSrc}
          alt="Reverso de carta de Tarot"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full bg-slate-900 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 p-2 sm:p-3 relative flex items-center justify-center">
          {/* Marco doble */}
          <div className="absolute inset-[4px] sm:inset-[6px] border border-cosmic/30 rounded-[4px] sm:rounded-[8px]" />
          <div className="absolute inset-[8px] sm:inset-[12px] border border-cosmic/10 rounded-[2px] sm:rounded-[4px]" />

          {/* Patrón central sutil */}
          <div className="w-8 h-8 sm:w-12 sm:h-12 rotate-45 border-[1px] border-cosmic/40 flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 border-[1px] border-cosmic/20 rounded-full" />
          </div>

          {/* Overlay de brillo */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
        </div>
      )}
    </button>
  );
}
