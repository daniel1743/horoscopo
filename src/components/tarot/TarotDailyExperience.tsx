import { useCallback, useEffect, useState } from "react";
import { TarotSkeleton } from "@/components/tarot/TarotSkeleton";
import { TarotDeckIncompleteState } from "@/components/tarot/TarotDeckIncompleteState";
import { TarotPositionResult } from "@/components/tarot/TarotPositionResult";
import { TarotReadingDisclaimer } from "@/components/tarot/TarotReadingDisclaimer";
import { ShareReadingButton } from "@/components/community/ShareReadingButton";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useTarotDeck } from "@/hooks/useTarotDeck";
import { tarotService } from "@/services/tarot.service";
import type { TarotDrawnCard } from "@/types/tarot";

/** Carta del día — estable, se guarda solo por fecha en localStorage. */
export function TarotDailyExperience() {
  const deckQuery = useTarotDeck();
  const [drawn, setDrawn] = useState<TarotDrawnCard | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!deckQuery.data?.ready) return;
    let active = true;
    tarotService
      .getDailyCard({ deck: deckQuery.data.cards })
      .then((d) => {
        if (active) setDrawn(d);
      })
      .catch(() => {
        if (active) setDrawn(null);
      });
    return () => {
      active = false;
    };
  }, [deckQuery.data]);

  const onReveal = useCallback(() => setRevealed(true), []);

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
  if (!drawn) return <TarotSkeleton label="Preparando tu carta" />;

  const meaning = drawn.reversed
    ? (drawn.card.reversedMeaning ?? drawn.card.uprightMeaning)
    : drawn.card.uprightMeaning;
  const orientation = drawn.reversed ? "Invertida" : "Al derecho";

  return (
    <section aria-label="Carta del día" className="flex flex-col gap-6">
      {!revealed ? (
        <div className="rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment-elevated p-8 text-center">
          <p className="font-body text-[13px] uppercase tracking-[0.16em] text-cosmic">
            Carta del día
          </p>
          <h2 className="mt-2 font-display text-[26px] text-ink">Una carta te espera</h2>
          <p className="mx-auto mt-3 max-w-md font-body text-[15px] leading-[1.6] text-ink-soft">
            La misma carta te acompañará durante todo el día. Revélala cuando estés en calma para
            observar su símbolo.
          </p>
          <Button type="button" variant="premium" className="mt-6" onClick={onReveal}>
            <Icon name="premium" />
            Revelar carta
          </Button>
        </div>
      ) : (
        <>
          <TarotPositionResult drawn={drawn} showPosition={false} />
          <div className="flex flex-wrap gap-3">
            <ShareReadingButton
              postType="tarot"
              title={`Mi carta del día · ${drawn.card.name} · ${orientation}`}
              body={`${drawn.card.name} (${orientation}): ${meaning}\n\nPregunta para reflexionar: ${drawn.card.reflectionQuestion ?? "¿Qué parte de este símbolo reconoces en tu día?"}`}
              sourceRef={`tarot:daily:${drawn.card.cardKey}:${orientation.toLowerCase()}`}
              sourceTitle={`Carta del día · ${drawn.card.name}`}
              sourceUrl="/tarot/carta-del-dia"
            />
          </div>
        </>
      )}
      <TarotReadingDisclaimer />
    </section>
  );
}
