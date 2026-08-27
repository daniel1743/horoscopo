import { useEffect } from "react";
import { TarotPositionResult } from "./TarotPositionResult";
import { TarotReadingDisclaimer } from "./TarotReadingDisclaimer";
import { tarotSpreads, yesNoLabels } from "@/config/tarot";
import type { TarotReading } from "@/types/tarot";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ContextualAiButton } from "@/components/ai/ContextualAiButton";
import { isFeatureEnabled } from "@/config/features";
import { SaveReadingButton } from "@/components/account/SaveReadingButton";
import { ShareReadingButton } from "@/components/community/ShareReadingButton";
import { routes } from "@/config/routes";
import { useSession } from "@/hooks/useSession";
import { logActivity } from "@/lib/account/repository";
import { buildTarotSynthesis } from "@/services/tarot-synthesis.service";
import type { TarotSynthesis } from "@/types/tarot";

interface Props {
  reading: TarotReading;
  onDrawAgain?: () => void;
  showSynthesis?: boolean;
}

/** Resultado agregado de una tirada (1 o 3 cartas). */
export function TarotReadingResult({ reading, onDrawAgain, showSynthesis }: Props) {
  const { user } = useSession();

  useEffect(() => {
    if (!user) return;
    void logActivity({
      userId: user.id,
      type: "tarot_reading",
      refType: "tarot_spread",
      refId: reading.spread,
      metadata: {
        cards: reading.drawn.map(({ card, reversed }) => ({ cardKey: card.cardKey, reversed })),
      },
    });
  }, [reading, user]);

  const yesNo =
    reading.spread === "yes_no" ? yesNoLabels[reading.drawn[0].card.yesNoTendency] : null;
  const synthesis = buildTarotSynthesis(reading);

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

      {showSynthesis && <TarotSynthesisPanel synthesis={synthesis} />}

      <div className="flex flex-wrap items-center gap-3">
        <SaveReadingButton
          spreadType={reading.spread}
          cards={reading.drawn.map(({ card, position, reversed }) => ({
            slug: card.slug,
            position: position.key,
            reversed,
          }))}
          interpretation={[
            yesNo?.description,
            ...reading.drawn.map((drawn) => describeDrawnCard(drawn)),
            ...(showSynthesis
              ? [
                  ...synthesis.positions.map(
                    (position) => `${position.positionLabel}: ${position.text}`,
                  ),
                  synthesis.relationshipText,
                  synthesis.synthesis,
                  synthesis.reflectionQuestion,
                ]
              : []),
          ]
            .filter(Boolean)
            .join("\n\n")}
        />
        <ShareReadingButton
          postType="tarot"
          title={`Mi lectura de Tarot · ${tarotSpreads[reading.spread].label}`}
          body={[
            reading.drawn.map((drawn) => describeDrawnCard(drawn)).join("\n"),
            yesNo?.description,
            ...(showSynthesis
              ? [synthesis.relationshipText, synthesis.synthesis, synthesis.reflectionQuestion]
              : []),
          ]
            .filter(Boolean)
            .join("\n\n")}
          sourceRef={`tarot:${reading.spread}:${reading.drawn.map(({ card }) => card.cardKey).join(",")}`}
          sourceTitle="Lectura de Tarot"
          sourceUrl={routes.tarot}
        />
        {onDrawAgain && (
          <Button type="button" variant="outline" onClick={onDrawAgain}>
            <Icon name="premium" />
            Realizar otra lectura
          </Button>
        )}
      </div>

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

function describeDrawnCard({ card, reversed }: TarotReading["drawn"][number]): string {
  const meaning = reversed ? (card.reversedMeaning ?? card.uprightMeaning) : card.uprightMeaning;
  return `${card.name} (${reversed ? "Invertida" : "Al derecho"}): ${meaning}`;
}

function TarotSynthesisPanel({ synthesis }: { synthesis: TarotSynthesis }) {
  return (
    <section
      aria-labelledby="tarot-synthesis-title"
      className="rounded-[var(--radius-card-md)] border border-cosmic/20 bg-cosmic/5 p-5"
    >
      <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-cosmic">
        Lectura integrada
      </p>
      <h3 id="tarot-synthesis-title" className="mt-1 font-display text-[22px] text-ink">
        {synthesis.title}
      </h3>
      <p className="mt-2 font-body text-[14px] leading-[1.6] text-ink-soft">{synthesis.overview}</p>
      <ol className="mt-5 grid gap-3" aria-label="Lectura por posición">
        {synthesis.positions.map((position) => (
          <li
            key={position.positionKey}
            className="rounded-xl border border-line/70 bg-background p-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="font-display text-[18px] text-ink">{position.positionLabel}</h4>
              <span className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-cosmic">
                {position.cardName} · {position.orientationLabel}
              </span>
            </div>
            <p className="mt-2 font-body text-[14px] leading-6 text-ink-soft">{position.text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-5 rounded-xl border border-line/70 bg-background p-4">
        <h4 className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          {synthesis.relationshipLabel}
        </h4>
        <p className="mt-2 font-body text-[14px] leading-6 text-ink-soft">
          {synthesis.relationshipText}
        </p>
      </div>
      <p className="mt-5 font-body text-[15px] font-medium leading-7 text-ink">
        {synthesis.synthesis}
      </p>
      <p className="mt-4 border-l-2 border-cosmic/40 pl-4 font-body text-[14px] italic leading-6 text-ink">
        {synthesis.reflectionQuestion}
      </p>
    </section>
  );
}
