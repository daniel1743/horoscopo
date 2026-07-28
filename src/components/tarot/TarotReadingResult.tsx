import { TarotPositionResult } from "./TarotPositionResult";
import { TarotReadingDisclaimer } from "./TarotReadingDisclaimer";
import { tarotThreeCardsSynthesis, yesNoLabels } from "@/config/tarot";
import type { TarotReading } from "@/types/tarot";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ContextualAiButton } from "@/components/ai/ContextualAiButton";
import { isFeatureEnabled } from "@/config/features";

interface Props {
  reading: TarotReading;
  onDrawAgain?: () => void;
  showSynthesis?: boolean;
}

/** Resultado agregado de una tirada (1 o 3 cartas). */
export function TarotReadingResult({ reading, onDrawAgain, showSynthesis }: Props) {
  const yesNo =
    reading.spread === "yes_no" ? yesNoLabels[reading.drawn[0].card.yesNoTendency] : null;

  return (
    <section aria-label="Resultado de la lectura" className="mt-8 flex flex-col gap-4">
      {yesNo && (
        <div className="rounded-[var(--radius-card-md)] border border-cosmic/30 bg-cosmic/5 p-5">
          <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-cosmic">
            Orientación
          </p>
          <h3 className="mt-1 font-display text-[22px] text-ink">{yesNo.display}</h3>
          <p className="mt-2 font-body text-[14px] leading-[1.6] text-ink-soft">
            {yesNo.description}
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {reading.drawn.map((d, i) => (
          <TarotPositionResult
            key={`${d.card.id}-${i}`}
            drawn={d}
            showPosition={reading.spread !== "yes_no"}
          />
        ))}
      </div>

      {showSynthesis && reading.spread === "three_cards" && (
        <div className="rounded-[var(--radius-card-md)] border border-line-soft bg-parchment p-5">
          <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-cosmic">
            Cómo integrar la lectura
          </p>
          <p className="mt-2 font-body text-[15px] leading-[1.7] text-ink">
            {tarotThreeCardsSynthesis}
          </p>
        </div>
      )}

      {onDrawAgain && (
        <div>
          <Button type="button" variant="outline" onClick={onDrawAgain}>
            <Icon name="premium" />
            Realizar otra lectura
          </Button>
        </div>
      )}

      {isFeatureEnabled("aiTarotInterpretation") && (
        <ContextualAiButton
          mode="tarot"
          label="Interpretar con IA"
          context={{
            kind: "tarot",
            tarot: {
              spreadKey: reading.spread,
              cardKeys: reading.drawn.map((d) => d.card.cardKey),
              positionKeys: reading.drawn.map((d) => d.position.key),
              question: reading.question,
            },
          }}
        />
      )}

      <TarotReadingDisclaimer />
    </section>
  );
}
