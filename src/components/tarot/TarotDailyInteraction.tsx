import { useState, useEffect, useCallback } from "react";
import { TarotCardVisual } from "@/components/tarot/TarotCardVisual";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { TarotCard } from "@/types/tarot";

interface Props {
  onRevealComplete: () => void;
  card: TarotCard | null;
}

type InteractionState = "idle" | "shuffling" | "selected" | "revealing";

export function TarotDailyInteraction({ onRevealComplete, card }: Props) {
  const [state, setState] = useState<InteractionState>("idle");

  const handleDeckClick = useCallback(() => {
    if (state !== "idle") return;
    setState("shuffling");
    // Terminar de barajar después de 800ms
    setTimeout(() => {
      setState("selected");
    }, 800);
  }, [state]);

  const handleRevealClick = useCallback(() => {
    if (state !== "selected") return;
    setState("revealing");
    // El flip dura 700ms
    setTimeout(() => {
      onRevealComplete();
    }, 750);
  }, [state, onRevealComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Indicaciones iniciales */}
      <div
        className={cn(
          "mb-6 text-center transition-opacity duration-500",
          state === "idle" ? "opacity-100" : "opacity-0 h-0 overflow-hidden",
        )}
      >
        <p className="font-body text-[13px] uppercase tracking-[0.16em] text-cosmic">
          Carta del día
        </p>
        <h2 className="mt-2 font-display text-[26px] text-ink">Una carta te espera</h2>
        <p className="mt-1 text-sm text-ink-soft">Selecciona una carta del mazo</p>
      </div>

      {/* Zona del mazo / carta interactiva */}
      <div
        className="relative flex h-[300px] w-full items-center justify-center"
        style={{ perspective: "1000px" }}
      >
        {/* Contenedor principal de flip */}
        <div
          className={cn("relative h-full w-[180px] transition-transform duration-700")}
          style={{
            transformStyle: "preserve-3d",
            transform: state === "revealing" ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* REVERSO (Visible al inicio) */}
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(0deg)" }}
          >
            <div
              role="button"
              tabIndex={state === "idle" ? 0 : -1}
              aria-label={state === "idle" ? "Barajar y seleccionar carta" : "Carta seleccionada"}
              onClick={handleDeckClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleDeckClick();
                }
              }}
              className={cn(
                "relative h-full w-full transition-all duration-500",
                state === "idle" && "cursor-pointer hover:-translate-y-2",
              )}
            >
              {/* Cartas decorativas del mazo (se ocultan tras barajar) */}
              <div
                className={cn(
                  "absolute inset-0 transition-all duration-300",
                  state === "idle" ? "-rotate-6 -translate-x-3 opacity-60" : "",
                  state === "shuffling" ? "-rotate-12 -translate-x-6 opacity-30 scale-95" : "",
                  (state === "selected" || state === "revealing") && "scale-90 opacity-0",
                )}
                aria-hidden="true"
              >
                <TarotCardVisual revealed={false} size="md" className="h-full w-full" />
              </div>
              <div
                className={cn(
                  "absolute inset-0 transition-all duration-300",
                  state === "idle" ? "rotate-6 translate-x-3 opacity-60" : "",
                  state === "shuffling" ? "rotate-12 translate-x-6 opacity-30 scale-95" : "",
                  (state === "selected" || state === "revealing") && "scale-90 opacity-0",
                )}
                aria-hidden="true"
              >
                <TarotCardVisual revealed={false} size="md" className="h-full w-full" />
              </div>

              {/* Carta principal que queda seleccionada */}
              <div
                className={cn(
                  "absolute inset-0 transition-all duration-500",
                  state === "idle" && "shadow-floating",
                  state === "shuffling" && "translate-y-4 scale-105",
                  state === "selected" && "shadow-elevated",
                )}
              >
                <TarotCardVisual revealed={false} size="md" className="h-full w-full" />
              </div>
            </div>
          </div>

          {/* CARA FRONTAL (Oculta al inicio) */}
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            {card && (
              <TarotCardVisual card={card} revealed={true} size="md" className="h-full w-full" />
            )}
          </div>
        </div>
      </div>

      {/* Controles de Revelado */}
      <div
        className={cn(
          "mt-8 flex flex-col items-center justify-center transition-opacity duration-500 max-w-sm text-center",
          state === "selected"
            ? "opacity-100"
            : "pointer-events-none opacity-0 h-0 overflow-hidden",
        )}
      >
        <p className="mb-4 font-body text-[15px] leading-[1.6] text-ink-soft">
          La misma carta te acompañará durante todo el día. Revélala cuando estés en calma para
          observar su símbolo.
        </p>
        <Button
          type="button"
          variant="premium"
          onClick={handleRevealClick}
          disabled={state !== "selected"}
        >
          <Icon name="premium" />
          Revelar carta
        </Button>
      </div>
    </div>
  );
}
