import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { ThreeCardReadingConfig } from "@/types/tarot";
import type { RevealedTarotCard } from "./types";
import { cn } from "@/lib/utils";

interface InteractiveThreeCardResultProps {
  config: ThreeCardReadingConfig;
  revealedCards: RevealedTarotCard[];
  interpretations: string[];
  synthesis?: string;
  source?: string;
  onReset: () => void;
  onAskGuide: () => void;
}

export function InteractiveThreeCardResult({
  config,
  revealedCards,
  interpretations,
  synthesis,
  onReset,
  onAskGuide,
}: InteractiveThreeCardResultProps) {
  const synthesisParagraphs = (synthesis || "")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .reduce<string[]>((paragraphs, sentence, index) => {
      const paragraphIndex = Math.floor(index / 2);
      paragraphs[paragraphIndex] = [paragraphs[paragraphIndex], sentence].filter(Boolean).join(" ");
      return paragraphs;
    }, []);

  return (
    <div className="flex flex-col gap-10">
      <div className="text-center mb-4">
        <h2 className="font-display text-[28px] text-ink">Tu Lectura</h2>
        <p className="font-body text-[15px] text-ink-soft max-w-2xl mx-auto mt-2">
          Esta es la integración de las energías que rigen tu situación actual.
        </p>
      </div>

      {/* Grid de 3 columnas en desktop, 1 en mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
        {config.positions.map((pos, index) => {
          const card = revealedCards.find((c) => c.positionId === pos.key);
          const interpretation = interpretations[index];

          if (!card) return null;

          return (
            <div
              key={pos.key}
              className={cn(
                "flex flex-col md:items-center rounded-[16px] bg-parchment-elevated p-6 shadow-lg",
                "transition-all duration-500 tarot-result-card",
              )}
            >
              <div className="flex flex-row md:flex-col gap-6 md:gap-4 items-start md:items-center w-full">
                {/* Imagen */}
                <div className="shrink-0 w-[90px] h-[150px] sm:w-[110px] sm:h-[180px] rounded-[8px] sm:rounded-[12px] overflow-hidden shadow-xl border border-cosmic/30">
                  <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                </div>

                {/* Texto */}
                <div className="flex flex-col md:items-center md:text-center w-full">
                  <span className="font-body text-[11px] font-bold uppercase tracking-[0.15em] text-cosmic mb-1">
                    {pos.label}
                  </span>
                  <h3 className="font-display text-[18px] text-ink mb-3">{card.name}</h3>
                  <p className="font-body text-[14px] leading-[1.6] text-ink-soft">
                    {interpretation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Síntesis Corta */}
      <div className="rounded-[16px] border border-cosmic/15 bg-cosmic/5 p-6 sm:p-8 max-w-[820px] mx-auto w-full">
        <h3 className="font-body text-[12px] font-bold uppercase tracking-[0.14em] text-cosmic mb-4">
          Síntesis de la lectura
        </h3>
        <div className="space-y-4 font-body text-[16px] leading-[1.75] text-ink">
          {(synthesisParagraphs.length > 0
            ? synthesisParagraphs
            : ["La lectura está lista para observarse con calma desde las tres cartas reveladas."]
          ).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Acciones Finales */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
        <Button type="button" variant="primary" onClick={onAskGuide} className="w-full sm:w-auto">
          <Icon name="message" />
          Preguntar sobre esta lectura
        </Button>
        <Button type="button" variant="outline" onClick={onReset} className="w-full sm:w-auto">
          <Icon name="premium" />
          Realizar otra lectura
        </Button>
      </div>
    </div>
  );
}
