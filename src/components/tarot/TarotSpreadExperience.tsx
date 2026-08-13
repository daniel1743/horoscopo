import { useEffect, useRef, useState } from "react";
import { TarotSkeleton } from "@/components/tarot/TarotSkeleton";
import { TarotDeckIncompleteState } from "@/components/tarot/TarotDeckIncompleteState";
import { TarotQuestionInput } from "@/components/tarot/TarotQuestionInput";
import { TarotReadingResult } from "@/components/tarot/TarotReadingResult";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useTarotDeck } from "@/hooks/useTarotDeck";
import { tarotService } from "@/services/tarot.service";
import { useSession } from "@/hooks/useSession";
import { logActivity } from "@/lib/account/repository";
import type { TarotReading, ThreeCardReadingConfig } from "@/types/tarot";
import { detectSensitiveTopic, sensitiveMessages } from "@/lib/tarot/sensitive-question";

interface Props {
  mode: "yes_no" | "three_cards";
  readingConfig?: ThreeCardReadingConfig;
}

export function TarotSpreadExperience({ mode, readingConfig }: Props) {
  const deckQuery = useTarotDeck();
  const { user } = useSession();
  const [question, setQuestion] = useState("");
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [sensitive, setSensitive] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const loggedReadingRef = useRef<string | null>(null);
  const isYesNo = mode === "yes_no";
  const trimmedQuestion = question.trim();

  async function handleDraw() {
    if (!deckQuery.data?.ready) return;
    if (isYesNo && !trimmedQuestion) {
      setQuestionError("Escribe una pregunta concreta antes de sacar la carta.");
      return;
    }
    setQuestionError(null);
    const topic = detectSensitiveTopic(trimmedQuestion);
    setSensitive(topic ? sensitiveMessages[topic] : null);
    setDrawing(true);
    try {
      const r = isYesNo
        ? await tarotService.drawYesNoCard({
            question: trimmedQuestion,
            deck: deckQuery.data.cards,
          })
        : await tarotService.drawThreeCards({
            question: trimmedQuestion,
            deck: deckQuery.data.cards,
          });
      setReading(r);
    } finally {
      setDrawing(false);
    }
  }

  function handleReset() {
    setReading(null);
    setSensitive(null);
    setQuestionError(null);
  }

  useEffect(() => {
    if (!user || !reading) return;
    const logKey = `${reading.spread}:${reading.drawnAtIso}`;
    if (loggedReadingRef.current === logKey) return;
    loggedReadingRef.current = logKey;

    const isThreeCards = reading.spread === "three_cards";
    void logActivity({
      userId: user.id,
      type: "tarot_reading",
      refType: "tarot_reading",
      refId: reading.drawnAtIso,
      metadata: {
        service: "tarot",
        subtype: isThreeCards ? "three_cards" : "yes_no",
        intent: isThreeCards ? "general" : undefined,
        spread_type: reading.spread,
        has_question: Boolean(reading.question),
        card_slugs: reading.drawn.map((drawn) => drawn.card.slug),
        position_keys: reading.drawn.map((drawn) => drawn.position.key),
      },
    });
  }, [reading, user]);

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
          {isYesNo && (
            <div>
              <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-cosmic">
                Pregunta
              </p>
              <p className="mt-2 font-body text-[14px] leading-[1.6] text-ink-soft">
                Escribe una pregunta concreta. La carta no decide por ti; ofrece una orientación
                simbólica para mirar la situación con más claridad.
              </p>
            </div>
          )}
          {!isYesNo && readingConfig && (
            <div>
              <label className="block font-body text-[12px] font-medium uppercase tracking-[0.14em] text-cosmic mb-2">
                {readingConfig.userContextLabel}
              </label>
              <p className="font-body text-[14px] text-ink-soft mb-3">{readingConfig.intro}</p>
            </div>
          )}
          {isYesNo && (
            <TarotQuestionInput
              value={question}
              onChange={(value) => {
                setQuestion(value);
                if (questionError && value.trim()) setQuestionError(null);
              }}
              label="¿Qué quieres preguntar?"
              placeholder="Escribe una pregunta concreta..."
              hint="La pregunta se usa para esta tirada y no se guarda en tu cuenta."
              error={questionError ?? undefined}
              required
              disabled={drawing}
            />
          )}
          <div>
            <Button type="button" variant="primary" onClick={handleDraw} disabled={drawing}>
              <Icon name="premium" />
              {drawing ? "Barajando…" : isYesNo ? "Hacer mi pregunta" : "Realizar tirada"}
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
          readingConfig={readingConfig}
          userContext={reading.question ?? question}
          onDrawAgain={handleReset}
          showSynthesis={mode === "three_cards"}
        />
      )}
    </div>
  );
}
