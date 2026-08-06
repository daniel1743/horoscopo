import type { InterpretReadingResponse } from "@/routes/api/tarot/interpret-reading";

export function buildSynthesisText(synthesis: InterpretReadingResponse["synthesis"]): string {
  return [synthesis.text, synthesis.reflectionQuestion]
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n\n");
}
