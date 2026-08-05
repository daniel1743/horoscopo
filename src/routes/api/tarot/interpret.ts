/**
 * FASE G: Endpoint contextual de Tarot
 * POST /api/tarot/interpret
 *
 * Flujo:
 * 1. Valida entrada (Fase D schema)
 * 2. Busca carta en Supabase
 * 3. Verifica published_at
 * 4. Construye contexto seguro
 * 5. Llama IA con prompt (Fase F)
 * 6. Valida respuesta (Fase E schema)
 * 7. Devuelve JSON estructurado
 */

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { streamChatCompletion } from "@/lib/ai/gateway.server";
import { checkAndConsumeQuota, hashAnonymousKey } from "@/lib/ai/rate-limit.server";
import { readOptionalAuth } from "@/lib/ai/optional-auth.server";
import { buildFallbackResponse } from "@/server/generation/tarot-fallback-generator";
import { checkSafety, buildSafetyResponse } from "@/server/tarot/safety-check";
import type { Database } from "@/integrations/supabase/types";
import type { TarotCard } from "@/types/tarot";

// ============ SCHEMAS (Fase D - Entrada) ============

export const TarotContextualInterpretRequestSchema = z.object({
  card: z.object({
    id: z.string().uuid().optional(),
    slug: z.string().min(1).max(100),
  }),

  orientation: z.enum(["upright", "reversed"]),

  reading: z.object({
    type: z.enum(["daily", "single", "three-card", "yes-no", "detail"]),
    positionName: z.string().max(50).optional(),
    positionKey: z.string().max(50).optional(),
    theme: z.enum(["general", "amor", "trabajo", "decision"]).optional(),
    interpretationFocus: z.string().max(300).optional(),
  }),

  user: z.object({
    question: z.string().min(1).max(500),
    requestId: z.string().min(8).max(120),
    context: z.string().max(500).optional(),
  }),

  language: z.literal("es").optional(),
});

type TarotContextualInterpretRequest = z.infer<typeof TarotContextualInterpretRequestSchema>;

// ============ SCHEMAS (Fase E - Salida) ============

export const TarotContextualResponseSchema = z.object({
  schemaVersion: z.literal("tarot-contextual-guide@1"),
  requestId: z.string().min(8).max(120),
  responseMode: z.enum(["interpretation", "conversation"]).optional(),
  energy: z.enum(["favorable", "caution", "open"]),
  mainMessage: z.string().min(50).max(400),
  positiveValue: z.string().min(30).max(250),
  caution: z.string().min(30).max(250),
  practicalAdvice: z.string().min(30).max(250),
  reflectionQuestion: z.string().min(20).max(150),
  disclaimer: z.string().min(5).max(100),
});

export type TarotContextualResponse = z.infer<typeof TarotContextualResponseSchema>;

// ============ ERRORES ============

class TarotInterpretError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "TarotInterpretError";
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
    throw new TarotInterpretError(
      "La lectura de cartas no está configurada en el servidor.",
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
    throw new TarotInterpretError(`BD error: ${error.message}`, "database_error", 500);
  }

  if (!data) {
    throw new TarotInterpretError("La carta solicitada no está disponible", "card_not_found", 404);
  }

  // Validar published_at
  if (!data.published_at || new Date(data.published_at) > new Date()) {
    throw new TarotInterpretError(
      "La carta solicitada no está disponible",
      "card_not_published",
      404,
    );
  }

  // Mapear a TarotCard
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

function buildPromptContext(
  card: TarotCard,
  orientation: "upright" | "reversed",
  reading: {
    type: string;
    positionName?: string;
    positionKey?: string;
    theme?: string;
    interpretationFocus?: string;
  },
  question: string,
  userContext?: string,
): string {
  const selectedMeaning =
    orientation === "reversed" ? card.reversedMeaning || card.uprightMeaning : card.uprightMeaning;

  const keywordsStr = card.keywords.slice(0, 5).join(", ");

  let contextSection = `CONTEXTO ACTUAL:

Carta: ${card.name} (${card.arcana === "major" ? "Arcano Mayor" : `Arcano Menor - ${card.suit}`})
Orientación: ${orientation === "upright" ? "Derecha" : "Invertida"}

Resumen: "${card.summary}"

Significado seleccionado: "${selectedMeaning}"

Palabras clave: ${keywordsStr}
Tendencia simbólica: ${
    card.yesNoTendency === "favorable"
      ? "Favorable"
      : card.yesNoTendency === "caution"
        ? "Cautela"
        : "Abierta"
  }

Tipo de lectura: ${reading.type}${reading.positionName ? ` (${reading.positionName})` : ""}`;

  if (reading.theme) {
    contextSection += `\nTema de lectura: ${reading.theme}`;
  }

  if (reading.interpretationFocus) {
    contextSection += `\nFoco de interpretación: ${reading.interpretationFocus}`;
  }

  if (userContext) {
    contextSection += `\nContexto del usuario: "${userContext}"`;
  }

  contextSection += `\nPregunta del usuario: "${question}"
Tipo de interacción: ${isConversationalGreeting(question) ? "saludo simple o apertura conversacional" : "pregunta interpretativa"}

---

INTERPRETA ESTA CARTA EN EL CONTEXTO DE LA PREGUNTA Y DEVUELVE JSON VÁLIDO.`;

  return contextSection;
}

function normalizeUserText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¡!¿?.,;:()[\]{}"'`´]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isConversationalGreeting(question: string): boolean {
  const normalized = normalizeUserText(question);
  if (!normalized) return false;

  const greetingPatterns = [
    /^hola$/,
    /^hola\s+(guia|buenas|como estas|que tal)$/,
    /^buenas$/,
    /^buenos dias$/,
    /^buenas tardes$/,
    /^buenas noches$/,
    /^hey$/,
    /^holi$/,
    /^saludos$/,
    /^como estas$/,
    /^que tal$/,
  ];

  return greetingPatterns.some((pattern) => pattern.test(normalized));
}

async function callAI(promptContext: string): Promise<string> {
  const systemPrompt = `Eres la Guía Contextual de Tarot de Creovision.

Tu función es interpretar y contextualizar la carta real que el sistema proporciona.
No calculas, no seleccionas cartas y no inventas datos.

Usas ÚNICAMENTE lo que recibes: nombre, orientación, significado, palabras clave, pregunta.

Devuelve SOLO JSON válido con estos 6 campos:
{
  "responseMode": "interpretation|conversation",
  "mainMessage": "Explica la energía (2-4 frases)",
  "positiveValue": "Fortaleza que aporta (1-2 frases)",
  "caution": "Aspecto a vigilar (1-2 frases)",
  "practicalAdvice": "Acción concreta (1-2 frases)",
  "reflectionQuestion": "Pregunta para reflexión (1 frase)",
  "energy": "favorable|caution|open"
}

JAMÁS afirmes:
- Hechos futuros ("ganarás", "perderás")
- Sobre otras personas ("te engaña", "volverá")
- Certezas ("definitivamente", "está seguro")
- Diagnósticos ("tienes depresión", "es cáncer")

SIEMPRE:
- Usa "invita a", "sugiere", "puede indicar"
- Ofrece alternativas, no certezas
- Empodera, no asustes
- Redacta en español natural, sin palabras truncadas, concatenadas o inventadas. Si hablas de Los Enamorados en amor, usa "elecciones afectivas" y no deformes esa expresión.
- Si el usuario solo saluda o conversa de forma simple, responde con una bienvenida breve, natural y neutral en género.
- En saludos simples, menciona de forma sutil la carta actual y ofrece ayudar a explorar amor, trabajo, decisiones, emociones o aplicación práctica.
- En saludos simples, no inventes una interpretación extensa si todavía no hay una pregunta concreta.
- En saludos simples, limita la respuesta inicial a 2 o 3 frases.
- Mantén una personalidad de guía esotérica, serena, cálida y reflexiva, sin exagerar.
- No uses "bienvenido" o "bienvenida" salvo que el usuario haya indicado explícitamente cómo quiere ser tratado.
- Prefiere fórmulas neutrales como "Hola, qué gusto acompañarte".`;

  const messages = [{ role: "user" as const, content: promptContext }];

  const response = await streamChatCompletion({
    alias: "fast",
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  });

  const reader = response.stream.getReader();
  while (true) {
    const { done } = await reader.read();
    if (done) break;
  }

  return response.getText();
}

function validateForbiddenContent(text: string): boolean {
  const forbidden = [
    "definitivamente",
    "está seguro",
    "ocurrirá",
    "sucederá",
    "ganarás",
    "perderás",
    "maldito",
    "maleficio",
    "debes",
    "tienes que",
    "abandona",
    "morirás",
    "cáncer",
    "covid",
    "engaña",
    "volverá",
    "alma gemela",
    "estás destinado",
    "no tienes salida",
  ];

  const lower = text.toLowerCase();
  return !forbidden.some((word) => lower.includes(word));
}

function parseAIResponse(rawText: string, requestId: string): TarotContextualResponse {
  try {
    // Buscar JSON en la respuesta (podría estar envuelto en markdown)
    let jsonText = rawText;

    // Si está en markdown code block
    const jsonMatch = rawText.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    } else if (rawText.includes("{")) {
      // Extraer JSON directo
      const startIdx = rawText.indexOf("{");
      const endIdx = rawText.lastIndexOf("}");
      if (startIdx !== -1 && endIdx !== -1) {
        jsonText = rawText.substring(startIdx, endIdx + 1);
      }
    }

    const parsed = JSON.parse(jsonText);

    // Validar contenido prohibido
    const allText = Object.values(parsed).join(" ");
    if (!validateForbiddenContent(allText)) {
      throw new Error("Respuesta contiene contenido prohibido");
    }

    // Validar schema
    return TarotContextualResponseSchema.parse({
      schemaVersion: "tarot-contextual-guide@1",
      requestId,
      responseMode: parsed.responseMode === "conversation" ? "conversation" : "interpretation",
      energy: parsed.energy,
      mainMessage: parsed.mainMessage,
      positiveValue: parsed.positiveValue,
      caution: parsed.caution,
      practicalAdvice: parsed.practicalAdvice,
      reflectionQuestion: parsed.reflectionQuestion,
      disclaimer: parsed.disclaimer || "Interpretación simbólica para reflexión personal.",
    });
  } catch (error) {
    throw new TarotInterpretError("Respuesta de IA inválida", "ai_parse_error", 500);
  }
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

function sanitizeErrorForLog(error: unknown) {
  if (error instanceof TarotInterpretError) {
    return {
      name: error.name,
      code: error.code,
      status: error.status,
      message: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message.replace(
        /(SUPABASE_SERVICE_ROLE_KEY|SUPABASE_URL|SUPABASE_PUBLISHABLE_KEY|DEEPSEEK_API_KEY|LOVABLE_API_KEY)=\S+/g,
        "$1=[redacted]",
      ),
    };
  }

  return { name: "UnknownError", message: String(error) };
}

function logTarotInterpretError(stage: string, error: unknown, requestId?: string): void {
  console.error("[tarot_interpret_error]", {
    stage,
    requestId,
    error: sanitizeErrorForLog(error),
  });
}

function logTarotInterpretEvent(
  event: string,
  details: Record<string, string | number | boolean | null | undefined>,
): void {
  console.info("[tarot_interpret_event]", { event, ...details });
}

function setDiagnosticHeaders(
  headers: Headers,
  data: {
    requestId?: string;
    stage?: string;
    mode?: "interpretation" | "conversation" | "fallback" | "error";
    errorCode?: string;
  },
): Headers {
  if (data.requestId) headers.set("X-Tarot-Request-Id", data.requestId);
  if (data.stage) headers.set("X-Tarot-Stage", data.stage);
  if (data.mode) headers.set("X-Tarot-Mode", data.mode);
  if (data.errorCode) headers.set("X-Tarot-Error-Code", data.errorCode);
  return headers;
}

// ============ ENDPOINT ============

export const Route = createFileRoute("/api/tarot/interpret")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const responseHeaders = new Headers({
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        });

        let input: TarotContextualInterpretRequest | null = null;
        let card: TarotCard | null = null;
        let stage = "init";

        try {
          stage = "parse_request";
          // Parse request
          let body: unknown;
          try {
            body = await request.json();
          } catch {
            return jsonErrorResponse(
              400,
              "invalid_json",
              "Cuerpo inválido.",
              setDiagnosticHeaders(responseHeaders, {
                stage,
                mode: "error",
                errorCode: "invalid_json",
              }),
            );
          }

          stage = "validate_request";
          // Validate schema (Fase D)
          const parsed = TarotContextualInterpretRequestSchema.safeParse(body);
          if (!parsed.success) {
            return jsonErrorResponse(
              400,
              "validation_error",
              "Entrada inválida.",
              setDiagnosticHeaders(responseHeaders, {
                stage,
                mode: "error",
                errorCode: "validation_error",
              }),
            );
          }

          input = parsed.data;

          stage = "safety_check";
          // FASE L: Verificar seguridad ANTES de todo
          const safetyCheck = checkSafety(input.user.question);
          if (!safetyCheck.isSafe) {
            const safetyResponse = buildSafetyResponse(safetyCheck);
            return jsonResponse(
              {
                error: {
                  code: "content_unsafe",
                  message: safetyResponse?.message || "No podemos procesar esta pregunta.",
                  referralUrl: safetyResponse?.referralUrl,
                },
              },
              400,
              setDiagnosticHeaders(responseHeaders, {
                requestId: input.user.requestId,
                stage,
                mode: "error",
                errorCode: "content_unsafe",
              }),
            );
          }

          stage = "optional_auth";
          // Auth & Rate limit
          const auth = await readOptionalAuth(request);
          const anonymousHash = auth.userId
            ? null
            : getOrCreateAnonymousHash(request, responseHeaders);

          stage = "quota";
          let rl;
          try {
            rl = await checkAndConsumeQuota({
              userId: auth.userId,
              anonymousHash,
            });
          } catch (error) {
            logTarotInterpretError(stage, error, input.user.requestId);
            return jsonErrorResponse(
              500,
              "rate_limit_config_error",
              "El control de consultas no está configurado en el servidor.",
              setDiagnosticHeaders(responseHeaders, {
                requestId: input.user.requestId,
                stage,
                mode: "error",
                errorCode: "rate_limit_config_error",
              }),
            );
          }

          if (!rl.allowed) {
            return jsonErrorResponse(
              429,
              "quota_exceeded",
              "Has alcanzado tu límite de consultas.",
              setDiagnosticHeaders(responseHeaders, {
                requestId: input.user.requestId,
                stage,
                mode: "error",
                errorCode: "quota_exceeded",
              }),
            );
          }

          stage = "fetch_card";
          // Fetch card (Fase D - validación en BD)
          const fetchedCard = await fetchCardBySlug(input.card.slug);
          card = fetchedCard;

          stage = "build_prompt";
          // Build prompt context (Fase F)
          const promptContext = buildPromptContext(
            fetchedCard,
            input.orientation,
            input.reading,
            input.user.question,
            input.user.context,
          );

          stage = "call_ai";
          // Call AI (Fase F)
          const aiRawResponse = await callAI(promptContext);
          logTarotInterpretEvent("ai_response_received", {
            requestId: input.user.requestId,
            stage,
            responseLength: aiRawResponse.length,
          });

          stage = "parse_ai";
          // Parse & validate AI response (Fase E)
          const response = parseAIResponse(aiRawResponse, input.user.requestId);
          logTarotInterpretEvent("ai_response_validated", {
            requestId: input.user.requestId,
            stage,
            mode: response.responseMode ?? "interpretation",
            energy: response.energy,
          });

          return jsonResponse(
            response,
            200,
            setDiagnosticHeaders(responseHeaders, {
              requestId: input.user.requestId,
              stage,
              mode: response.responseMode ?? "interpretation",
            }),
          );
        } catch (error) {
          if (error instanceof TarotInterpretError) {
            if (error.code !== "ai_parse_error") {
              logTarotInterpretError(stage, error, input?.user.requestId);
              return jsonErrorResponse(
                error.status,
                error.code,
                error.message,
                setDiagnosticHeaders(responseHeaders, {
                  requestId: input?.user.requestId,
                  stage,
                  mode: "error",
                  errorCode: error.code,
                }),
              );
            }
          }

          logTarotInterpretError(stage, error, input?.user.requestId);

          // IA error → usar fallback (Fase H)
          try {
            if (!card || !input) {
              return jsonErrorResponse(
                500,
                "server_error",
                "Error procesando tu pregunta.",
                setDiagnosticHeaders(responseHeaders, {
                  requestId: input?.user.requestId,
                  stage,
                  mode: "error",
                  errorCode: "server_error",
                }),
              );
            }
            const fallbackResponse = buildFallbackResponse(
              card,
              input.orientation,
              input.user.requestId,
              input.user.question,
            );
            logTarotInterpretEvent("fallback_response_built", {
              requestId: input.user.requestId,
              stage,
              cardSlug: card.slug,
              sourceError:
                error instanceof TarotInterpretError
                  ? error.code
                  : error instanceof Error
                    ? error.name
                    : "unknown",
            });
            return jsonResponse(
              fallbackResponse,
              200,
              setDiagnosticHeaders(responseHeaders, {
                requestId: input.user.requestId,
                stage: "fallback",
                mode: "fallback",
              }),
            );
          } catch (fallbackError) {
            logTarotInterpretError("fallback", fallbackError, input?.user.requestId);
            // Fallback también falló → error genérico
            return jsonErrorResponse(
              500,
              "server_error",
              "Error procesando tu pregunta.",
              setDiagnosticHeaders(responseHeaders, {
                requestId: input?.user.requestId,
                stage: "fallback",
                mode: "error",
                errorCode: "server_error",
              }),
            );
          }
        }
      },
    },
  },
});
