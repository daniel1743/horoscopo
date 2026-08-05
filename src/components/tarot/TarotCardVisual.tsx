import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { TarotCard } from "@/types/tarot";
import { Icon } from "@/components/ui/icon";
import { getTarotImagePublicUrl } from "@/lib/tarot/image-url";

interface Props {
  card?: TarotCard | null;
  revealed?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap: Record<NonNullable<Props["size"]>, string> = {
  sm: "aspect-[7/12] w-[120px]",
  md: "aspect-[7/12] w-[180px]",
  lg: "aspect-[7/12] w-full max-w-[240px]",
};

const TAROT_CARD_BACK_SRC = "/carta%20trasera.png";

export function TarotCardVisual({ card, revealed = true, size = "md", className }: Props) {
  const showFace = revealed && !!card;
  const [imageFailed, setImageFailed] = useState(false);
  const imageResult = useMemo(
    () =>
      card
        ? getTarotImagePublicUrl({
            arcana: card.arcana,
            suit: card.suit,
            imageKey: card.imageKey,
          })
        : null,
    [card],
  );
  const canShowImage = showFace && imageResult?.ok === true && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [card?.imageKey]);

  useEffect(() => {
    if (showFace && imageResult && !imageResult.ok && import.meta.env.DEV) {
      console.warn("[TarotCardVisual] Imagen invalida", {
        card: card?.name,
        reason: imageResult.reason,
      });
    }
  }, [card?.name, imageResult, showFace]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-card-md)] border border-gold/40 bg-night-elevated shadow-elevated",
        sizeMap[size],
        className,
      )}
      aria-hidden={!showFace}
    >
      {canShowImage ? (
        <img
          src={imageResult.publicUrl}
          alt={card.name}
          className="h-full w-full bg-night-elevated object-contain"
          loading="lazy"
          onError={() => {
            setImageFailed(true);
            if (import.meta.env.DEV) {
              console.warn("[TarotCardVisual] No se pudo cargar la imagen", {
                card: card.name,
                storagePath: imageResult.storagePath,
              });
            }
          }}
        />
      ) : (
        <TarotCardFallback showFace={showFace} />
      )}
    </div>
  );
}

function TarotCardFallback({ showFace }: { showFace: boolean }) {
  if (!showFace) {
    return (
      <img
        src={TAROT_CARD_BACK_SRC}
        alt="Reverso de carta de Tarot"
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-night-elevated via-night to-night-elevated">
      <div className={cn("rounded-full border border-gold/40 p-3", showFace && "bg-night/60")}>
        <Icon name="tarot" className="h-6 w-6 text-gold" />
      </div>
    </div>
  );
}
