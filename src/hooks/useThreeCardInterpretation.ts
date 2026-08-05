import { useState } from "react";
import type { ThreeCardReadingConfig } from "@/types/tarot";
import type { InterpretReadingResponse } from "@/routes/api/tarot/interpret-reading";

interface UseThreeCardInterpretationParams {
  config: ThreeCardReadingConfig;
  cardSlugs: [string, string, string];
  userContext?: string;
}

export function useThreeCardInterpretation({
  config,
  cardSlugs,
  userContext,
}: UseThreeCardInterpretationParams) {
  const [interpretation, setInterpretation] = useState<InterpretReadingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const interpret = async () => {
    setIsLoading(true);
    setError(null);
    setInterpretation(null);

    try {
      const response = await fetch("/api/tarot/interpret-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reading: {
            theme: config.slug,
          },
          cards: cardSlugs.map((slug, i) => ({
            slug,
            positionKey: config.positions[i].key,
          })),
          user: {
            context: userContext,
            requestId: crypto.randomUUID(),
          },
          language: "es",
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        const message =
          typeof payload?.error?.message === "string"
            ? payload.error.message
            : "No pudimos generar la interpretación completa.";
        setError(message);
        return;
      }

      setInterpretation(payload as InterpretReadingResponse);
    } catch {
      setError("No pudimos conectar con el servidor. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    interpretation,
    isLoading,
    error,
    interpret,
  };
}
