import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/config/routes";
import { tarotService } from "@/services/tarot.service";
import type { TarotDrawnCard } from "@/types/tarot";
import { TarotCardVisual } from "@/components/tarot/TarotCardVisual";

/** Tarjeta de tarot para la Home. Consume el servicio real; la misma carta se mantiene todo el día. */
export function DailyTarotCard() {
  const [drawn, setDrawn] = useState<TarotDrawnCard | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "empty">("loading");

  useEffect(() => {
    let active = true;
    tarotService
      .getDailyCard()
      .then((d) => {
        if (!active) return;
        if (d) {
          setDrawn(d);
          setStatus("ready");
        } else {
          setStatus("empty");
        }
      })
      .catch(() => active && setStatus("empty"));
    return () => {
      active = false;
    };
  }, []);

  return (
    <article
      aria-labelledby="daily-tarot-title"
      className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card-lg)] border border-line-dark bg-night-elevated text-ink-inverse"
    >
      <div className="flex flex-col gap-6 p-6 md:flex-row md:p-8">
        <div className="mx-auto w-full max-w-[220px] shrink-0 md:mx-0 md:w-[42%]">
          <TarotCardVisual
            card={drawn?.card ?? null}
            revealed={revealed && !!drawn}
            reversed={drawn?.reversed ?? false}
            size="lg"
          />
        </div>

        <div className="flex flex-1 flex-col">
          <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-gold">
            Carta del día
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h3
              id="daily-tarot-title"
              className="font-display text-[24px] font-semibold text-ink-inverse md:text-[28px]"
            >
              {revealed && drawn ? drawn.card.name : "Una carta te espera"}
            </h3>
            {revealed && drawn && (
              <span className="rounded-full border border-gold/35 bg-white/5 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-gold">
                {drawn.reversed ? "Invertida" : "Al derecho"}
              </span>
            )}
          </div>
          <p className="mt-3 min-h-[4.5rem] font-body text-[15px] leading-[1.7] text-ink-inverse-soft">
            {status === "empty"
              ? "Estamos completando la baraja."
              : revealed && drawn
                ? drawn.card.summary
                : "Revélala cuando estés en calma para observar su símbolo."}
          </p>
          {revealed && drawn && (
            <div className="mt-4 rounded-[var(--radius-control)] border border-white/10 bg-white/5 p-4">
              <h4 className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                Qué puede aportar esta carta
              </h4>
              <p className="mt-2 font-body text-[14px] leading-[1.65] text-ink-inverse-soft">
                {drawn.reversed
                  ? (drawn.card.reversedMeaning ?? drawn.card.uprightMeaning)
                  : drawn.card.uprightMeaning}
              </p>
              {drawn.card.reflectionQuestion && (
                <div className="mt-4 border-l-2 border-gold/60 pl-4">
                  <p className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                    Pregunta para reflexionar hoy
                  </p>
                  <p className="mt-1 font-display text-[15px] italic leading-[1.5] text-ink-inverse">
                    {drawn.card.reflectionQuestion}
                  </p>
                  <p className="mt-2 font-body text-[12px] leading-[1.5] text-ink-inverse-soft">
                    Es una pregunta para observar tu experiencia, no una pregunta que tengas que
                    responderle al sistema.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="premium"
              onClick={() => setRevealed(true)}
              disabled={revealed || status !== "ready"}
              aria-pressed={revealed}
              className="sm:w-auto"
            >
              <Icon name="premium" />
              {revealed ? "Carta revelada" : status === "loading" ? "Preparando…" : "Revelar carta"}
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-ink-inverse hover:bg-white/10 hover:text-ink-inverse"
            >
              <Link to={routes.tarotDaily}>Realizar una lectura</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
