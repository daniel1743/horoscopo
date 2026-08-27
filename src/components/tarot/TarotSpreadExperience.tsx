import { useState } from "react";
import { TarotSkeleton } from "@/components/tarot/TarotSkeleton";
import { TarotDeckIncompleteState } from "@/components/tarot/TarotDeckIncompleteState";
import { TarotQuestionInput } from "@/components/tarot/TarotQuestionInput";
import { TarotReadingResult } from "@/components/tarot/TarotReadingResult";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useTarotDeck } from "@/hooks/useTarotDeck";
import { tarotService } from "@/services/tarot.service";
import type { TarotReading } from "@/types/tarot";
import { detectSensitiveTopic, sensitiveMessages } from "@/lib/tarot/sensitive-question";

interface Props {
  mode: "yes_no" | "three_cards" | "decision" | "past_present_future";
}

export function TarotSpreadExperience({ mode }: Props) {
  const deckQuery = useTarotDeck();
  const [question, setQuestion] = useState("");
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [sensitive, setSensitive] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);

  async function handleDraw() {
    if (!deckQuery.data?.ready) return;
    const topic = detectSensitiveTopic(question);
    setSensitive(topic ? sensitiveMessages[topic] : null);
    setDrawing(true);
    try {
      const r =
        mode === "yes_no"
          ? await tarotService.drawYesNoCard({ question, deck: deckQuery.data.cards })
          : mode === "three_cards"
            ? await tarotService.drawThreeCards({ question, deck: deckQuery.data.cards })
            : mode === "decision"
              ? await tarotService.drawDecisionCards({ question, deck: deckQuery.data.cards })
              : await tarotService.drawPastPresentFutureCards({
                  question,
                  deck: deckQuery.data.cards,
                });
      setReading(r);
    } finally {
      setDrawing(false);
    }
  }

  function handleReset() {
    setReading(null);
  }

  if (deckQuery.isLoading) return <TarotSkeleton label="Consultando la baraja" />;
  if (deckQuery.isError) {
    return (
      <p role="alert" className="font-body text-[15px] text-error">
        No se pudo cargar la baraja. Intenta más tarde.
      </p>
    );
  }
  if (!deckQuery.data?.ready) {
    return (
      <TarotDeckIncompleteState
        count={deckQuery.data?.cards.length ?? 0}
        minimum={deckQuery.data?.minimum ?? 0}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {!reading && (
        <div className="flex flex-col gap-5 rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment-elevated p-6">
          <TarotQuestionInput value={question} onChange={setQuestion} disabled={drawing} />
          <div>
            <Button type="button" variant="primary" onClick={handleDraw} disabled={drawing}>
              <Icon name="premium" />
              {drawing
                ? "Barajando…"
                : mode === "yes_no"
                  ? "Consultar la carta"
                  : mode === "decision"
                    ? "Explorar la decisión"
                    : mode === "past_present_future"
                      ? "Observar la secuencia"
                      : "Realizar tirada"}
            </Button>
          </div>
        </div>
      )}

      {sensitive && (
        <div
          role="alert"
          className="rounded-[var(--radius-card-md)] border border-warning/50 bg-warning/10 p-4 font-body text-[14px] leading-[1.6] text-ink"
        >
          {sensitive}
        </div>
      )}

      {reading && (
        <TarotReadingResult
          reading={reading}
          onDrawAgain={handleReset}
          showSynthesis={mode !== "yes_no"}
        />
      )}
    </div>
  );
}
