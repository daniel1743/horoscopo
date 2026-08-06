import { useCallback, useEffect, useState } from "react";
import { TarotSkeleton } from "@/components/tarot/TarotSkeleton";
import { TarotDeckIncompleteState } from "@/components/tarot/TarotDeckIncompleteState";
import { TarotPositionResult } from "@/components/tarot/TarotPositionResult";
import { TarotReadingDisclaimer } from "@/components/tarot/TarotReadingDisclaimer";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useTarotDeck } from "@/hooks/useTarotDeck";
import { tarotService } from "@/services/tarot.service";
import { TarotDailyInteraction } from "@/components/tarot/TarotDailyInteraction";
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

  return (
    <section aria-label="Carta del día" className="flex flex-col gap-6">
      {!revealed ? (
        <div className="rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment-elevated p-4 sm:p-8">
          <TarotDailyInteraction onRevealComplete={onReveal} card={drawn?.card ?? null} />
        </div>
      ) : (
        <TarotPositionResult drawn={drawn} showPosition={false} />
      )}
      <TarotReadingDisclaimer />
    </section>
  );
}
