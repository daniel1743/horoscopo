import { supabase } from "@/integrations/supabase/client";
import type { TarotArcana, TarotSuit } from "@/types/tarot";

const TAROT_BUCKET = "tarot";
const VALID_SUITS = new Set<TarotSuit>(["wands", "cups", "swords", "pentacles"]);

export interface TarotImageInput {
  arcana: TarotArcana | string;
  suit: TarotSuit | string | null;
  imageKey: string;
}

export type TarotImageResult =
  | {
      ok: true;
      storagePath: string;
      publicUrl: string;
    }
  | {
      ok: false;
      reason: string;
    };

export type TarotImagePathResult =
  | {
      ok: true;
      storagePath: string;
    }
  | {
      ok: false;
      reason: string;
    };

export function getTarotImageStoragePath(card: TarotImageInput): TarotImagePathResult {
  const imageKeyError = validateImageKey(card.imageKey);
  if (imageKeyError) {
    return { ok: false, reason: imageKeyError };
  }

  if (card.arcana === "major") {
    return { ok: true, storagePath: `major/${card.imageKey}.webp` };
  }

  if (card.arcana !== "minor") {
    return { ok: false, reason: `Arcana invalido: ${card.arcana}` };
  }

  if (!card.suit || !VALID_SUITS.has(card.suit as TarotSuit)) {
    return { ok: false, reason: `Suit invalido para arcano menor: ${card.suit ?? "null"}` };
  }

  return { ok: true, storagePath: `${card.suit}/${card.imageKey}.webp` };
}

export function getTarotImagePublicUrl(card: TarotImageInput): TarotImageResult {
  const pathResult = getTarotImageStoragePath(card);
  if (!pathResult.ok) {
    return pathResult;
  }

  const { data } = supabase.storage.from(TAROT_BUCKET).getPublicUrl(pathResult.storagePath);
  if (!data.publicUrl) {
    return { ok: false, reason: "No se pudo construir la URL publica de la imagen" };
  }

  return {
    ok: true,
    storagePath: pathResult.storagePath,
    publicUrl: data.publicUrl,
  };
}

function validateImageKey(imageKey: string): string | null {
  if (!imageKey || imageKey.trim().length === 0) {
    return "imageKey no puede estar vacio";
  }

  if (imageKey !== imageKey.trim()) {
    return "imageKey no puede tener espacios laterales";
  }

  if (imageKey.endsWith(".webp")) {
    return "imageKey no debe incluir extension .webp";
  }

  if (imageKey.includes("/") || imageKey.includes("\\")) {
    return "imageKey no puede contener separadores de ruta";
  }

  if (imageKey.includes("..")) {
    return "imageKey no puede contener ..";
  }

  if (imageKey.includes("?") || imageKey.includes("#")) {
    return "imageKey no puede contener query string ni fragmentos";
  }

  return null;
}
