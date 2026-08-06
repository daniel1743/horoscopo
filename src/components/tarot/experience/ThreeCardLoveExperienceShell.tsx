import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TarotDeckIncompleteState } from "@/components/tarot/TarotDeckIncompleteState";
import { TarotInterpretationLoading } from "@/components/tarot/TarotInterpretationLoading";
import { TarotQuestionInput } from "@/components/tarot/TarotQuestionInput";
import { TarotSkeleton } from "@/components/tarot/TarotSkeleton";
import { useThreeCardInterpretation } from "@/hooks/useThreeCardInterpretation";
import { useTarotDeck } from "@/hooks/useTarotDeck";
import { drawUniqueCards } from "@/lib/tarot/card-selection";
import { getTarotImagePublicUrl } from "@/lib/tarot/image-url";
import { isPublicFeatureEnabled } from "@/config/public-features";
import type { TarotCard, ThreeCardReadingConfig } from "@/types/tarot";
import { InteractiveThreeCardResult } from "./InteractiveThreeCardResult";
import { ThreeCardPositionSlots } from "./ThreeCardPositionSlots";
import { TarotCardPicker } from "./TarotCardPicker";
import { TarotDeckVisual } from "./TarotDeckVisual";
import { TarotSelectionProgress } from "./TarotSelectionProgress";
import { ThreeCardReadingActions } from "./ThreeCardReadingActions";
import { buildSynthesisText } from "./synthesis-text";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type {
  RevealedTarotCard,
  SelectedTarotCard,
  TarotCardCandidate,
  ThreeCardExperienceState,
} from "./types";

interface ThreeCardLoveExperienceShellProps {
  config: ThreeCardReadingConfig;
  cardBackSrc?: string;
}

const SHUFFLE_DURATION_MS = 1500;
const SELECTION_SETTLE_MS = 500;
const REVEAL_STEP_MS = 800;

function candidateCountForViewport(): number {
  if (typeof window === "undefined") return 22;
  if (window.matchMedia("(max-width: 639px)").matches) return 10;
  if (window.matchMedia("(max-width: 1023px)").matches) return 14;
  return 22;
}

function toCandidate(card: TarotCard): TarotCardCandidate {
  return { id: card.id, card };
}

function toRevealedCard(selected: SelectedTarotCard): RevealedTarotCard {
  const image = getTarotImagePublicUrl(selected.card);
  return {
    ...selected,
    name: selected.card.name,
    image: image.ok ? image.publicUrl : "",
  };
}

/** TODO: Reactivar la pregunta opcional únicamente cuando el contenido escrito
 *  influya realmente en la interpretación o personalización de la tirada. */
const ENABLE_TAROT_OPTIONAL_QUESTION = isPublicFeatureEnabled("tarotOptionalQuestion");

export function ThreeCardLoveExperienceShell({
  config,
  cardBackSrc,
}: ThreeCardLoveExperienceShellProps) {
  const deckQuery = useTarotDeck();
  const [state, setState] = useState<ThreeCardExperienceState>("shuffling");
  const [question, setQuestion] = useState("");
  const [candidateCards, setCandidateCards] = useState<TarotCardCandidate[]>([]);
  const [selectedCards, setSelectedCards] = useState<SelectedTarotCard[]>([]);
  const [revealedCards, setRevealedCards] = useState<RevealedTarotCard[]>([]);
  const timersRef = useRef<number[]>([]);
  const runIdRef = useRef(0);
  const interpretedRunRef = useRef<number | null>(null);
  const hasAutoShuffledRef = useRef(false);

  const selectedSlugs = useMemo(
    () => selectedCards.map((selected) => selected.card.slug),
    [selectedCards],
  );
  const canInterpret = selectedSlugs.length === config.positions.length;
  const cardSlugs = (canInterpret ? selectedSlugs : ["", "", ""]) as [string, string, string];

  const {
    interpretation,
    isLoading: isInterpreting,
    error: interpretationError,
    interpret,
  } = useThreeCardInterpretation({
    config,
    cardSlugs,
    userContext: question,
  });

  const currentInterpretation =
    interpretation &&
    interpretation.positions.every((position, index) => position.cardSlug === cardSlugs[index])
      ? interpretation
      : null;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Auto-barajar al montar: cuando el mazo está listo, ejecutar el barajado
  // inicial una sola vez. El ref evita doble ejecución en React Strict Mode.
  useEffect(() => {
    if (!deckQuery.data?.ready || hasAutoShuffledRef.current) return;
    hasAutoShuffledRef.current = true;
    handleShuffle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckQuery.data?.ready]);

  useEffect(() => {
    if (state !== "interpreting" || !canInterpret) return;
    if (interpretedRunRef.current === runIdRef.current) return;

    interpretedRunRef.current = runIdRef.current;
    void interpret();
  }, [canInterpret, interpret, state]);

  useEffect(() => {
    if (state === "interpreting" && currentInterpretation) {
      setState("completed");
    }
  }, [currentInterpretation, state]);

  useEffect(() => {
    if (state === "interpreting" && interpretationError && !isInterpreting) {
      setState("error");
    }
  }, [interpretationError, isInterpreting, state]);

  const resetRunState = useCallback(() => {
    runIdRef.current += 1;
    interpretedRunRef.current = null;
    clearTimers();
    setSelectedCards([]);
    setRevealedCards([]);
  }, [clearTimers]);

  const nextPositionIndex = selectedCards.length;
  const nextPositionId =
    nextPositionIndex < config.positions.length
      ? config.positions[nextPositionIndex].key
      : undefined;
  const nextPositionLabel =
    nextPositionIndex < config.positions.length
      ? config.positions[nextPositionIndex].label
      : undefined;

  const handleShuffle = useCallback(() => {
    if (!deckQuery.data?.ready) return;

    resetRunState();
    const currentRunId = runIdRef.current;
    setState("shuffling");

    schedule(() => {
      if (runIdRef.current !== currentRunId || !deckQuery.data?.ready) return;
      const count = candidateCountForViewport();
      setCandidateCards(drawUniqueCards(deckQuery.data.cards, Math.max(3, count)).map(toCandidate));
      setState("selecting");
    }, SHUFFLE_DURATION_MS);
  }, [deckQuery.data, resetRunState, schedule]);

  const handleSelectCard = (id: string) => {
    if (state !== "selecting" || selectedCards.length >= config.positions.length) return;
    if (selectedCards.some((card) => card.id === id)) return;

    const candidate = candidateCards.find((card) => card.id === id);
    if (!candidate || !nextPositionId) return;

    const newSelected = [
      ...selectedCards,
      { id, positionId: nextPositionId, card: candidate.card },
    ];
    setSelectedCards(newSelected);

    if (newSelected.length === config.positions.length) {
      const currentRunId = runIdRef.current;
      schedule(() => {
        if (runIdRef.current !== currentRunId) return;
        setState("selected");
      }, SELECTION_SETTLE_MS);
    }
  };

  const handleReveal = () => {
    if (state !== "selected" || selectedCards.length !== config.positions.length) return;

    const currentRunId = runIdRef.current;
    clearTimers();
    setRevealedCards([]);
    setState("revealing");

    selectedCards.forEach((selected, index) => {
      schedule(
        () => {
          if (runIdRef.current !== currentRunId) return;
          setRevealedCards((current) => [...current, toRevealedCard(selected)]);
        },
        REVEAL_STEP_MS * (index + 1),
      );
    });

    schedule(
      () => {
        if (runIdRef.current !== currentRunId) return;
        setState("interpreting");
      },
      REVEAL_STEP_MS * (selectedCards.length + 1),
    );
  };

  const handleReset = () => {
    resetRunState();
    setQuestion("");
    setCandidateCards([]);
    // Volver a barajar directamente en lugar de ir al estado "preparing"
    handleShuffle();
  };

  const handleRetryInterpretation = () => {
    interpretedRunRef.current = null;
    setState("interpreting");
  };

  const handleAskGuide = () => {
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("[data-three-card-guide]")?.focus();
    });
  };

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

  const interpretations =
    currentInterpretation?.positions.map((position) => position.interpretation) ??
    config.positions.map((position) => position.interpretationFocus);
  const synthesis = currentInterpretation
    ? buildSynthesisText(currentInterpretation.synthesis)
    : "La lectura se está integrando con las tres cartas seleccionadas.";

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto items-center min-h-[60vh] pb-[calc(96px+env(safe-area-inset-bottom))]">
      {state !== "completed" && (
        <div className="w-full flex flex-col gap-6 md:gap-10">
          
          {/* Progreso en móvil (y escritorio) va arriba */}
          {(state === "selecting" || state === "selected" || state === "revealing") && (
            <div className="px-4 md:px-0">
              <TarotSelectionProgress
                currentSelectionCount={selectedCards.length}
                maxSelectionCount={config.positions.length}
                nextPositionLabel={nextPositionLabel}
              />
            </div>
          )}

          <div className="px-4 md:px-0">
            <ThreeCardPositionSlots
              config={config}
              state={state}
              selectedCards={selectedCards}
              revealedCards={revealedCards}
              nextPositionId={nextPositionId}
              cardBackSrc={cardBackSrc}
            />
          </div>

          <div className="w-full flex flex-col items-center justify-center">
            {state === "preparing" && ENABLE_TAROT_OPTIONAL_QUESTION && (
              <div className="flex flex-col gap-5 rounded-[var(--radius-card-lg)] border border-cosmic/15 bg-parchment-elevated p-6 w-full max-w-lg shadow-lg mx-4 md:mx-auto">
                <div className="text-center mb-2">
                  <p className="font-body text-[14px] text-ink-soft">{config.intro}</p>
                </div>
                <TarotQuestionInput
                  value={question}
                  onChange={setQuestion}
                  placeholder={config.userContextPlaceholder}
                />
                <div className="flex justify-center mt-2">
                  <ThreeCardReadingActions
                    state={state}
                    onShuffle={handleShuffle}
                    onReveal={handleReveal}
                    onReset={handleReset}
                  />
                </div>
              </div>
            )}

            {(state === "shuffling" ||
              state === "selecting" ||
              state === "selected" ||
              state === "revealing") && (
              <div className="flex flex-col items-center gap-6 w-full animate-in fade-in zoom-in-95 duration-500 mt-2 md:mt-4">
                {state === "shuffling" ? (
                  <TarotDeckVisual isShuffling cardBackSrc={cardBackSrc} />
                ) : state === "revealing" ? (
                  <div className="h-10" /> 
                ) : (
                  <>
                    {state === "selecting" && (
                      <>
                        <TarotCardPicker
                          candidateCards={candidateCards}
                          selectedIds={selectedCards.map((card) => card.id)}
                          onSelectCard={handleSelectCard}
                          cardBackSrc={cardBackSrc}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleShuffle}
                          className="mt-2 md:mt-4"
                          aria-label="Barajar cartas"
                        >
                          <Icon name="premium" />
                          Barajar cartas
                        </Button>
                      </>
                    )}

                    {state === "selected" && (
                      <ThreeCardReadingActions
                        state={state}
                        onShuffle={handleShuffle}
                        onReveal={handleReveal}
                        onReset={handleReset}
                      />
                    )}
                  </>
                )}
              </div>
            )}

            {state === "interpreting" && <TarotInterpretationLoading />}

            {state === "error" && (
              <div role="alert" className="flex flex-col items-center gap-4 mt-8 px-4">
                <p className="font-body text-[15px] text-error text-center">
                  {interpretationError ?? "No se pudo completar la interpretación."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button type="button" variant="primary" onClick={handleRetryInterpretation}>
                    <Icon name="sparkles" />
                    Reintentar
                  </Button>
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Barajar cartas nuevas
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {state === "completed" && (
        <div className="w-full animate-in slide-in-from-bottom-8 fade-in duration-700">
          <InteractiveThreeCardResult
            config={config}
            revealedCards={revealedCards}
            interpretations={interpretations}
            synthesis={synthesis}
            source={currentInterpretation?.meta.source}
            onReset={handleReset}
            onAskGuide={handleAskGuide}
          />
        </div>
      )}
    </div>
  );
}
