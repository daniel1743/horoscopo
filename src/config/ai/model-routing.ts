import type { AiModuleMode } from "@/types/ai";

/**
 * Alias de modelo por modo. El servidor traduce el alias a un id concreto de
 * proveedor leyendo variables de entorno (AI_MODEL_FAST / AI_MODEL_REASONING).
 */
export type AiModelAlias = "fast" | "reasoning" | "safety";

export function pickModelAlias(mode: AiModuleMode, cardCount?: number): AiModelAlias {
  if (mode === "reflection") return "reasoning";
  if (mode === "tarot" && (cardCount ?? 1) >= 3) return "reasoning";
  return "fast";
}

/** Modelos por defecto en el gateway Lovable (server-only en runtime). */
export const defaultModelIds = {
  fast: "google/gemini-3.6-flash",
  reasoning: "google/gemini-3.1-pro-preview",
  safety: "google/gemini-3.1-flash-lite",
} as const;
