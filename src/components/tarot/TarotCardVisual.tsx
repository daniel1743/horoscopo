import { cn } from "@/lib/utils";
import type { TarotCard } from "@/types/tarot";
import { Icon } from "@/components/ui/icon";

interface Props {
  card?: TarotCard | null;
  revealed?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap: Record<NonNullable<Props["size"]>, string> = {
  sm: "aspect-[2/3] w-[120px]",
  md: "aspect-[2/3] w-[180px]",
  lg: "aspect-[2/3] w-full max-w-[240px]",
};

/**
 * Visual simbólico y neutral: gradiente, número y nombre.
 * No usa imágenes de barajas comerciales.
 */
export function TarotCardVisual({ card, revealed = true, size = "md", className }: Props) {
  const showFace = revealed && !!card;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-card-md)] border border-gold/40 shadow-elevated",
        sizeMap[size],
        className,
      )}
      aria-hidden={!showFace}
    >
      {showFace ? (
        <div className="flex h-full w-full flex-col justify-between bg-gradient-to-b from-night to-night-elevated p-4 text-ink-inverse">
          <div className="flex items-start justify-between font-body text-[11px] uppercase tracking-[0.16em] text-gold">
            <span>{card!.arcana === "major" ? "Arcano" : "Menor"}</span>
            {card!.number !== null && <span>{romanize(card!.number)}</span>}
          </div>
          <div className="flex flex-col items-center gap-3">
            <Icon name="tarot" className="h-8 w-8 text-gold" />
            <p className="text-center font-display text-[18px] leading-tight">{card!.name}</p>
          </div>
          <div className="text-center font-body text-[10px] tracking-[0.18em] text-gold/80">✦</div>
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-night-elevated via-night to-night-elevated">
          <div className="rounded-full border border-gold/40 p-3">
            <Icon name="tarot" className="h-6 w-6 text-gold" />
          </div>
        </div>
      )}
    </div>
  );
}

function romanize(n: number): string {
  if (n === 0) return "0";
  const map: Array<[number, string]> = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let out = "";
  let x = n;
  for (const [v, s] of map) {
    while (x >= v) {
      out += s;
      x -= v;
    }
  }
  return out;
}
