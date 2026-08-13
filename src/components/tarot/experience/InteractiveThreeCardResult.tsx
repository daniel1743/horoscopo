import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { NextBestAction } from "@/components/layout/NextBestAction";
import type { ThreeCardReadingConfig } from "@/types/tarot";
import type { RevealedTarotCard } from "./types";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/useSession";
import { routes } from "@/config/routes";
import {
  PENDING_TAROT_READING_SAVE_KEY,
  fetchPrivacySettings,
  logActivity,
  saveTarotReading,
  type SavedReadingCard,
} from "@/lib/account/repository";
import { toast } from "sonner";

function intentFromReadingSlug(slug: ThreeCardReadingConfig["slug"]) {
  if (slug === "amor") return "love";
  if (slug === "trabajo") return "work";
  if (slug === "decision") return "decision";
  return "general";
}

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
  const { user } = useSession();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const loggedReadingRef = useRef<string | null>(null);

  const synthesisParagraphs = (synthesis || "")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .reduce<string[]>((paragraphs, sentence, index) => {
      const paragraphIndex = Math.floor(index / 2);
      paragraphs[paragraphIndex] = [paragraphs[paragraphIndex], sentence].filter(Boolean).join(" ");
      return paragraphs;
    }, []);
  const savedCards = useMemo<SavedReadingCard[]>(
    () =>
      config.positions
        .map((position) => {
          const card = revealedCards.find((revealed) => revealed.positionId === position.key);
          if (!card) return null;
          return {
            slug: card.card.slug,
            name: card.card.name,
            position: position.label,
            positionKey: position.key,
            theme: config.slug,
            reversed: false,
          };
        })
        .filter((card): card is SavedReadingCard => Boolean(card)),
    [config.positions, config.slug, revealedCards],
  );
  const interpretationText = useMemo(() => {
    const positionText = config.positions
      .map((position, index) => {
        const card = revealedCards.find((revealed) => revealed.positionId === position.key);
        const text = interpretations[index];
        return card && text ? `${position.label} - ${card.card.name}: ${text}` : null;
      })
      .filter(Boolean)
      .join("\n\n");

    return [positionText, synthesis ? `Síntesis: ${synthesis}` : null].filter(Boolean).join("\n\n");
  }, [config.positions, interpretations, revealedCards, synthesis]);

  useEffect(() => {
    if (!user || savedCards.length !== 3) return;
    const logKey = `${config.slug}:${savedCards.map((card) => card.slug).join("|")}`;
    if (loggedReadingRef.current === logKey) return;
    loggedReadingRef.current = logKey;

    void logActivity({
      userId: user.id,
      type: "tarot_reading",
      refType: "tarot_reading",
      refId: logKey,
      metadata: {
        service: "tarot",
        subtype: "three_cards",
        intent: intentFromReadingSlug(config.slug),
        spread_type: "three_cards",
        theme: config.slug,
        card_slugs: savedCards.map((card) => card.slug),
        position_keys: savedCards.map((card) => card.positionKey).filter(Boolean),
      },
    });
  }, [config.slug, savedCards, user]);

  async function handleSaveReading() {
    if (saving || saved) return;
    setSaveError(null);

    const pendingPayload = {
      spreadType: "three_cards" as const,
      cards: savedCards,
      interpretation: interpretationText || null,
      createdAt: new Date().toISOString(),
    };

    if (!user) {
      sessionStorage.setItem(PENDING_TAROT_READING_SAVE_KEY, JSON.stringify(pendingPayload));
      toast.info(
        "Inicia sesión para guardar esta lectura. Conservaremos la intención de guardarla.",
      );
      navigate({ to: routes.signIn, search: { redirect: routes.savedReadings } });
      return;
    }

    setSaving(true);
    try {
      const privacy = await fetchPrivacySettings(user.id);
      if (!privacy.save_readings_allowed) {
        setSaveError("Guardar lecturas está desactivado en tus preferencias de privacidad.");
        toast.error("Guardar lecturas está desactivado.");
        return;
      }

      await saveTarotReading({
        userId: user.id,
        spreadType: pendingPayload.spreadType,
        cards: pendingPayload.cards,
        interpretation: pendingPayload.interpretation,
      });
      setSaved(true);
      toast.success("Lectura guardada en Mi espacio.");
    } catch (error) {
      console.error(error);
      setSaveError("No pudimos guardar la lectura. Inténtalo nuevamente.");
      toast.error("No pudimos guardar la lectura.");
    } finally {
      setSaving(false);
    }
  }

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
      <section
        aria-label="Sugerencias para continuar"
        className="rounded-[var(--radius-card-lg)] border border-cosmic/20 bg-cosmic/5 p-6 text-center md:p-8"
      >
        <h2 className="font-display text-[20px] font-semibold text-ink md:text-[22px]">
          Integra la lectura
        </h2>
        <p className="mx-auto mt-2 max-w-[42ch] font-body text-[15px] text-ink-soft">
          Esta síntesis profunda puede guardarse para referencia futura.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            type="button"
            size="lg"
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => void handleSaveReading()}
            disabled={saving || saved}
          >
            <Icon name="favorite" className="mr-2 h-4 w-4" />
            {saving ? "Guardando..." : saved ? "Lectura guardada" : "Guardar esta lectura"}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onAskGuide}
          >
            <Icon name="message" className="mr-2 h-4 w-4" />
            Preguntar sobre esta lectura
          </Button>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onReset}
            className="font-body text-[14px] font-medium text-ink-soft hover:text-ink hover:underline"
          >
            Hacer otra tirada
          </button>
        </div>

        {(saving || saved || saveError) && (
          <p
            role={saveError ? "alert" : "status"}
            className={cn("mt-4 font-body text-[14px]", saveError ? "text-error" : "text-ink-soft")}
          >
            {saveError ?? (saved ? "Lectura guardada" : "Guardando...")}
          </p>
        )}
      </section>

      <NextBestAction
        context={{ source: "tarot_three_cards", tarotTopic: config.slug }}
        className="mt-0"
      />
    </div>
  );
}
