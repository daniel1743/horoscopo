/**
 * POST /api/tarot/interpret-reading
 *
 * Interpreta una lectura completa de tres cartas temática.
 * Retorna interpretación por posición + síntesis global.
 */

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { streamChatCompletion } from "@/lib/ai/gateway.server";
import { checkAndConsumeQuota, hashAnonymousKey } from "@/lib/ai/rate-limit.server";
import { readOptionalAuth } from "@/lib/ai/optional-auth.server";
import { buildThreeCardSynthesisFallback } from "@/lib/tarot/synthesis-generator";
import { checkSafety, buildSafetyResponse } from "@/server/tarot/safety-check";
import type { Database } from "@/integrations/supabase/types";
import type { TarotCard, ThreeCardReadingConfig } from "@/types/tarot";
import { threeCardReadings } from "@/config/three-card-readings";

// ============ SCHEMAS ============

export const InterpretReadingRequestSchema = z.object({
  reading: z.object({
    theme: z.enum(["general", "amor", "trabajo", "decision"]),
  }),
  cards: z
    .array(
      z.object({
        slug: z.string().min(1).max(100),
        positionKey: z.string().max(50),
      }),
    )
    .length(3),
  user: z.object({
    context: z.string().max(500).optional(),
    question: z.string().min(1).max(500).optional(),
    requestId: z.string().min(8).max(120),
  }),
  language: z.literal("es").optional(),
});

type InterpretReadingRequest = z.infer<typeof InterpretReadingRequestSchema>;
type ParsedAIPosition = {
  interpretation: unknown;
};

type ParsedAIReading = {
  positions: ParsedAIPosition[];
  synthesis: {
    text: unknown;
    reflectionQuestion: unknown;
  };
};

export const InterpretReadingResponseSchema = z.object({
  schemaVersion: z.literal("tarot-three-card-reading@1"),
  requestId: z.string(),
  positions: z
    .array(
      z.object({
        positionKey: z.string(),
        cardSlug: z.string(),
        interpretation: z.string().min(50).max(500),
      }),
    )
    .length(3),
  synthesis: z.object({
    text: z.string().min(100).max(800),
    reflectionQuestion: z.string().min(20).max(200),
  }),
  meta: z.object({
    source: z.enum(["ai", "fallback"]),
    fallbackUsed: z.boolean(),
  }),
});

export type InterpretReadingResponse = z.infer<typeof InterpretReadingResponseSchema>;

// ============ ERRORES ============

class InterpretReadingError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "InterpretReadingError";
  }
}

// ============ FUNCIONES ============

function normalizeSupabaseUrl(value: string): string {
  const url = new URL(value);
  url.pathname = url.pathname.replace(/\/(?:rest|auth|storage|functions)\/v1\/?$/, "");
  return url.toString().replace(/\/$/, "");
}

function createPublicSupabaseServerClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new InterpretReadingError(
      "Configuración de base de datos no disponible.",
      "supabase_public_config_missing",
      500,
    );
  }

  return createClient<Database>(normalizeSupabaseUrl(url), key, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function fetchCardBySlug(slug: string): Promise<TarotCard> {
  const supabase = createPublicSupabaseServerClient();
  const { data, error } = await supabase
    .from("tarot_cards")
    .select(
      "id,card_key,slug,name,arcana,number,suit,rank,summary,upright_meaning,reversed_meaning,keywords,reflection_question,yes_no_tendency,image_key,display_order,is_demo,seo_title,seo_description,published_at",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new InterpretReadingError(
      `Error de base de datos: ${error.message}`,
      "database_error",
      500,
    );
  }

  if (!data || !data.published_at || new Date(data.published_at) > new Date()) {
    throw new InterpretReadingError("Carta no disponible", "card_not_found", 404);
  }

  return {
    id: data.id,
    cardKey: data.card_key,
    slug: data.slug,
    name: data.name,
    arcana: data.arcana as "major" | "minor",
    number: data.number,
    suit: (data.suit as "wands" | "cups" | "swords" | "pentacles" | null) ?? null,
    rank: data.rank,
    summary: data.summary,
    uprightMeaning: data.upright_meaning,
    reversedMeaning: data.reversed_meaning,
    keywords: Array.isArray(data.keywords)
      ? data.keywords.filter((keyword): keyword is string => typeof keyword === "string")
      : [],
    reflectionQuestion: data.reflection_question,
    yesNoTendency: (data.yes_no_tendency as "favorable" | "caution" | "open") ?? "open",
    imageKey: data.image_key,
    displayOrder: data.display_order,
    isDemo: data.is_demo,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    publishedAt: data.published_at,
  };
}

function buildReadingPrompt(
  config: ThreeCardReadingConfig,
  cards: [TarotCard, TarotCard, TarotCard],
  userContext?: string,
  userQuestion?: string,
): string {
  const [card1, card2, card3] = cards;
  const [pos1, pos2, pos3] = config.positions;

  const situacion = [userContext, userQuestion].filter(Boolean).join(". ");

  return `Eres una lectora de tarot experimentada y empática. Has revelado tres cartas para una situación amorosa.
${situacion ? `\nSITUACIÓN: "${situacion}"\n` : ""}
CARTAS REVELADAS:

${pos1.label}
${card1.name} — ${card1.keywords.slice(0, 3).join(", ")}
Significado: ${card1.uprightMeaning}
Enfoque: ${pos1.interpretationFocus}

${pos2.label}
${card2.name} — ${card2.keywords.slice(0, 3).join(", ")}
Significado: ${card2.uprightMeaning}
Enfoque: ${pos2.interpretationFocus}

${pos3.label}
${card3.name} — ${card3.keywords.slice(0, 3).join(", ")}
Significado: ${card3.uprightMeaning}
Enfoque: ${pos3.interpretationFocus}

---

DEVUELVE ÚNICAMENTE este JSON sin texto adicional ni markdown:

{
  "positions": [
    {
      "positionKey": "${pos1.key}",
      "cardSlug": "${card1.slug}",
      "interpretation": "3-4 frases directas sobre ${card1.name} en ${pos1.shortLabel}. Qué muestra, qué luz aporta, qué sombra señala. Sin repetir el nombre de la carta más de una vez."
    },
    {
      "positionKey": "${pos2.key}",
      "cardSlug": "${card2.slug}",
      "interpretation": "3-4 frases sobre ${card2.name} en ${pos2.shortLabel}. Conecta con la posición anterior. Qué patrón o dinámica describe."
    },
    {
      "positionKey": "${pos3.key}",
      "cardSlug": "${card3.slug}",
      "interpretation": "3-4 frases sobre ${card3.name} en ${pos3.shortLabel}. Qué conviene hacer o cómo avanzar. Conecta con las dos cartas anteriores."
    }
  ],
  "synthesis": {
    "text": "Un párrafo integrado de 4-5 frases que: identifique la energía principal del conjunto, nombre la tensión o aprendizaje central entre las tres cartas, y cierre con orientación práctica. NO repetir lo ya dicho en las interpretaciones. Elevar la lectura viendo el conjunto.",
    "reflectionQuestion": "Una pregunta concreta y poderosa que conecte las tres cartas con esta situación amorosa."
  }
}

TONO: Directo, cálido, humano. Específico, no genérico. Sin frases que apliquen a cualquier situación.
ÉTICA: No afirmes lo que siente otra persona. No prometas resultados ni decisiones. Usa condicional: "sugiere", "puede indicar", "invita a".
LÍMITES: Máximo 450 caracteres por interpretation, 750 por synthesis.text, 150 por reflectionQuestion.`;
}

async function callAI(prompt: string): Promise<string> {
  const response = await streamChatCompletion({
    alias: "fast",
    messages: [{ role: "user", content: prompt }],
  });

  const reader = response.stream.getReader();
  while (true) {
    const { done } = await reader.read();
    if (done) break;
  }

  return response.getText();
}

function parseAIResponse(
  rawText: string,
  config: ThreeCardReadingConfig,
  cards: [TarotCard, TarotCard, TarotCard],
  requestId: string,
): InterpretReadingResponse {
  try {
    let jsonText = rawText;

    // Extraer JSON
    const jsonMatch = rawText.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    } else if (rawText.includes("{")) {
      const startIdx = rawText.indexOf("{");
      const endIdx = rawText.lastIndexOf("}");
      if (startIdx !== -1 && endIdx !== -1) {
        jsonText = rawText.substring(startIdx, endIdx + 1);
      }
    }

    const parsed = JSON.parse(jsonText) as ParsedAIReading;

    // Validar estructura
    return InterpretReadingResponseSchema.parse({
      schemaVersion: "tarot-three-card-reading@1",
      requestId,
      positions: parsed.positions.map((p, i) => ({
        positionKey: config.positions[i].key,
        cardSlug: cards[i].slug,
        interpretation: String(p.interpretation ?? ""),
      })),
      synthesis: {
        text: String(parsed.synthesis.text ?? ""),
        reflectionQuestion: String(parsed.synthesis.reflectionQuestion ?? ""),
      },
      meta: {
        source: "ai",
        fallbackUsed: false,
      },
    });
  } catch (error) {
    throw new InterpretReadingError("Respuesta de IA inválida", "ai_parse_error", 500);
  }
}

function buildFallbackReading(
  config: ThreeCardReadingConfig,
  cards: [TarotCard, TarotCard, TarotCard],
  requestId: string,
): InterpretReadingResponse {
  const synthesis = buildThreeCardSynthesisFallback(config, cards, config.positions);

  return {
    schemaVersion: "tarot-three-card-reading@1",
    requestId,
    positions: cards.map((card, i) => ({
      positionKey: config.positions[i].key,
      cardSlug: card.slug,
      interpretation: `${card.name} en ${config.positions[i].shortLabel}: ${card.uprightMeaning}`,
    })),
    synthesis,
    meta: {
      source: "fallback",
      fallbackUsed: true,
    },
  };
}

function getOrCreateAnonymousHash(request: Request, headers: Headers): string {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/ai_anon_id=([^;]+)/);
  let raw = match?.[1];
  if (!raw) {
    raw = crypto.randomUUID();
    headers.append(
      "Set-Cookie",
      `ai_anon_id=${raw}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
    );
  }
  return hashAnonymousKey(raw);
}

function jsonResponse(data: unknown, status = 200, headers?: Headers): Response {
  const finalHeaders = new Headers(headers);
  finalHeaders.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), {
    status,
    headers: finalHeaders,
  });
}

function jsonErrorResponse(
  status: number,
  code: string,
  message: string,
  headers?: Headers,
): Response {
  return jsonResponse({ error: { code, message } }, status, headers);
}

// ============ ENDPOINT ============

export const Route = createFileRoute("/api/tarot/interpret-reading")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const responseHeaders = new Headers({
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        });

        let input: InterpretReadingRequest | null = null;
        let stage = "init";

        try {
          stage = "parse_request";
          let body: unknown;
          try {
            body = await request.json();
          } catch {
            return jsonErrorResponse(400, "invalid_json", "Cuerpo inválido.", responseHeaders);
          }

          stage = "validate_request";
          const parsed = InterpretReadingRequestSchema.safeParse(body);
          if (!parsed.success) {
            return jsonErrorResponse(400, "validation_error", "Entrada inválida.", responseHeaders);
          }

          input = parsed.data;

          // Verificar que no haya cartas duplicadas
          const slugs = input.cards.map((c) => c.slug);
          if (new Set(slugs).size !== 3) {
            return jsonErrorResponse(
              400,
              "duplicate_cards",
              "Cartas duplicadas no permitidas.",
              responseHeaders,
            );
          }

          // Obtener configuración
          const config = threeCardReadings[input.reading.theme];
          if (!config || !config.enabled) {
            return jsonErrorResponse(
              400,
              "theme_not_available",
              "Tema no disponible.",
              responseHeaders,
            );
          }

          // Verificar posiciones válidas
          const validKeys = config.positions.map((p) => p.key);
          for (const cardInput of input.cards) {
            if (!validKeys.includes(cardInput.positionKey)) {
              return jsonErrorResponse(
                400,
                "invalid_position",
                "Posición inválida para este tema.",
                responseHeaders,
              );
            }
          }

          stage = "safety_check";
          if (input.user.question) {
            const safetyCheck = checkSafety(input.user.question);
            if (!safetyCheck.isSafe) {
              const safetyResponse = buildSafetyResponse(safetyCheck);
              return jsonResponse(
                {
                  error: {
                    code: "content_unsafe",
                    message: safetyResponse?.message || "No podemos procesar esta pregunta.",
                  },
                },
                400,
                responseHeaders,
              );
            }
          }

          stage = "optional_auth";
          const auth = await readOptionalAuth(request);
          const anonymousHash = getOrCreateAnonymousHash(request, responseHeaders);

          stage = "rate_limit";
          const rateLimitKey = auth?.userId || anonymousHash;
          await checkAndConsumeQuota({
            identityKey: rateLimitKey,
            feature: "tarot",
            cost: 1,
            isAuthenticated: !!auth?.userId,
          });

          stage = "fetch_cards";
          const cards: [TarotCard, TarotCard, TarotCard] = [
            await fetchCardBySlug(input.cards[0].slug),
            await fetchCardBySlug(input.cards[1].slug),
            await fetchCardBySlug(input.cards[2].slug),
          ];

          stage = "build_prompt";
          const prompt = buildReadingPrompt(config, cards, input.user.context, input.user.question);

          stage = "call_ai";
          try {
            const aiRawResponse = await callAI(prompt);

            stage = "parse_ai";
            const response = parseAIResponse(aiRawResponse, config, cards, input.user.requestId);

            responseHeaders.set("X-Tarot-Stage", stage);
            responseHeaders.set("X-Tarot-Source", "ai");
            return jsonResponse(response, 200, responseHeaders);
          } catch (aiError) {
            console.warn("[tarot_reading_ai_fallback]", aiError);

            stage = "fallback";
            const fallbackResponse = buildFallbackReading(config, cards, input.user.requestId);

            responseHeaders.set("X-Tarot-Stage", stage);
            responseHeaders.set("X-Tarot-Source", "fallback");
            return jsonResponse(fallbackResponse, 200, responseHeaders);
          }
        } catch (error) {
          console.error("[tarot_reading_error]", { stage, error });

          if (error instanceof InterpretReadingError) {
            return jsonErrorResponse(error.status, error.code, error.message, responseHeaders);
          }

          return jsonErrorResponse(
            500,
            "internal_error",
            "Error interno del servidor.",
            responseHeaders,
          );
        }
      },
    },
  },
});
