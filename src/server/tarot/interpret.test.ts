import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  TarotContextualInterpretRequestSchema,
  TarotContextualResponseSchema,
} from "@/routes/api/tarot/interpret";
import { hashAnonymousKey } from "@/lib/ai/rate-limit.server";
import { buildFallbackResponse } from "@/server/generation/tarot-fallback-generator";
import { TarotRateLimitConfig } from "@/server/tarot/rate-limit-config";
import { buildSafetyResponse, checkSafety, shouldLogQuestion } from "@/server/tarot/safety-check";
import type { TarotCard } from "@/types/tarot";

const endpointSource = readFileSync(
  new URL("../../routes/api/tarot/interpret.ts", import.meta.url),
  "utf8",
);

const rateLimitSource = readFileSync(
  new URL("../../lib/ai/rate-limit.server.ts", import.meta.url),
  "utf8",
);

const mockCard: TarotCard = {
  id: "7b0f2d7e-31af-4d80-8a5e-3d33fd7082f2",
  cardKey: "the_magician",
  slug: "el-mago",
  name: "El Mago",
  arcana: "major",
  number: 1,
  suit: null,
  rank: null,
  summary: "El Mago habla de recursos. Es momento de actuar.",
  uprightMeaning: "Herramientas disponibles para materializar ideas.",
  reversedMeaning: "Falta de dirección o uso inapropiado de poder.",
  keywords: ["voluntad", "recursos", "iniciativa"],
  reflectionQuestion: "¿Cómo puedo usar mis recursos hoy?",
  yesNoTendency: "favorable",
  imageKey: "tarot_major_01_the_magician",
  displayOrder: 1,
  isDemo: false,
  seoTitle: "El Mago",
  seoDescription: "Carta mayor del Tarot",
  publishedAt: new Date().toISOString(),
};

describe("Tarot interpret endpoint contract", () => {
  it("mantiene el archivo de prueba fuera de src/routes para que el router no lo detecte", () => {
    expect(import.meta.url).toContain("/src/server/tarot/interpret.test.ts");
    expect(import.meta.url).not.toContain("/src/routes/");
  });

  it("valida el schema de entrada del endpoint", () => {
    const valid = TarotContextualInterpretRequestSchema.safeParse({
      card: { slug: "el-mago" },
      orientation: "upright",
      reading: { type: "daily" },
      user: {
        question: "¿Qué significa esta carta para el trabajo?",
        requestId: "request-123",
      },
      language: "es",
    });

    const invalid = TarotContextualInterpretRequestSchema.safeParse({
      card: { slug: "" },
      orientation: "sideways",
      reading: { type: "daily" },
      user: { question: "", requestId: "short" },
    });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });

  it("ejecuta el safety check antes de rate limit, fetch de carta y llamada IA", () => {
    const safetyIndex = endpointSource.indexOf("const safetyCheck = checkSafety");
    const rateLimitIndex = endpointSource.indexOf("await checkAndConsumeQuota");
    const cardFetchIndex = endpointSource.indexOf("await fetchCardBySlug(input.card.slug)");
    const aiIndex = endpointSource.indexOf("const aiRawResponse = await callAI");

    expect(safetyIndex).toBeGreaterThan(0);
    expect(safetyIndex).toBeLessThan(rateLimitIndex);
    expect(safetyIndex).toBeLessThan(cardFetchIndex);
    expect(safetyIndex).toBeLessThan(aiIndex);
  });

  it("mantiene el fetch de carta contra la fuente server-side real", () => {
    expect(endpointSource).toContain("await fetchCardBySlug(input.card.slug)");
    expect(endpointSource).not.toContain("fetchCardBySlugWithLocalFallback");
    expect(endpointSource).not.toContain("buildLocalCardFallback");
  });

  it("identifica fallas de cuota como error de configuración sin ocultarlas como server_error", () => {
    expect(endpointSource).toContain('"quota"');
    expect(endpointSource).toContain("logTarotInterpretError(stage, error, input.user.requestId)");
    expect(endpointSource).toContain('"rate_limit_config_error"');
    expect(rateLimitSource).toContain("RateLimitStoreError");
    expect(rateLimitSource).toContain('"read_failed"');
    expect(rateLimitSource).toContain('"update_failed"');
    expect(rateLimitSource).toContain('"insert_failed"');
  });

  it("registra errores sanitizados y no imprime nombres de secretos con valores", () => {
    expect(endpointSource).toContain("function sanitizeErrorForLog");
    expect(endpointSource).toContain("$1=[redacted]");
    expect(endpointSource).toContain("[tarot_interpret_error]");
  });

  it("expone headers de diagnostico para revisar el flujo desde F12 Network", () => {
    expect(endpointSource).toContain("X-Tarot-Request-Id");
    expect(endpointSource).toContain("X-Tarot-Stage");
    expect(endpointSource).toContain("X-Tarot-Mode");
    expect(endpointSource).toContain("X-Tarot-Error-Code");
  });
});

describe("Tarot safety check", () => {
  it("permite preguntas seguras", () => {
    const result = checkSafety("¿Qué significa esta carta para el amor?");

    expect(result.isSafe).toBe(true);
    expect(result.category).toBeUndefined();
    expect(shouldLogQuestion(result)).toBe(true);
  });

  it("detecta crisis mental sin teléfonos universales ni referral inventado", () => {
    const result = checkSafety("Tengo pensamientos suicidas, ¿qué me dice la carta?");
    const response = buildSafetyResponse(result);

    expect(result.isSafe).toBe(false);
    expect(result.category).toBe("mental_health");
    expect(result.referralUrl).toBeUndefined();
    expect(result.message).toContain("servicios de emergencia locales");
    expect(result.message).not.toMatch(/\b\d{2,}\b/);
    expect(result.message).not.toMatch(/crisis\s+text\s+line/i);
    expect(response?.message).toBe(result.message);
    expect(shouldLogQuestion(result)).toBe(false);
  });

  it("detecta autolesión, violencia, abuso, salud, legal y financiero", () => {
    expect(checkSafety("Quiero hacerme daño").category).toBe("self_harm");
    expect(checkSafety("¿Me dice la carta si debo atacar a alguien?").category).toBe("violence");
    expect(checkSafety("Me maltrata, ¿qué dice la carta sobre esto?").category).toBe("abuse");
    expect(checkSafety("¿Dice la carta si tengo cáncer?").category).toBe("medical");
    expect(checkSafety("¿Qué dice sobre mi juicio?").category).toBe("legal");
    expect(checkSafety("¿Debería invertir todo mi dinero en bitcoin?").category).toBe("financial");
  });

  it("es case-insensitive y normaliza acentos", () => {
    expect(checkSafety("¿TENGO PENSAMIENTOS SUICIDAS?").isSafe).toBe(false);
    expect(checkSafety("¿Debería suicidarme según la carta?").isSafe).toBe(false);
  });

  it("no bloquea palabras similares en preguntas seguras", () => {
    const result = checkSafety("¿Cuál es mi destino?");
    expect(result.isSafe).toBe(true);
  });
});

describe("Tarot fallback generator", () => {
  it("genera fallback válido para energía favorable y cumple schema de salida", () => {
    const response = buildFallbackResponse(mockCard, "upright", "request-123");

    expect(response.schemaVersion).toBe("tarot-contextual-guide@1");
    expect(response.energy).toBe("favorable");
    expect(response.mainMessage.length).toBeGreaterThanOrEqual(50);
    expect(response.mainMessage.length).toBeLessThanOrEqual(400);
    expect(TarotContextualResponseSchema.safeParse(response).success).toBe(true);
  });

  it("incluye keywords en positiveValue", () => {
    const response = buildFallbackResponse(mockCard, "upright", "request-123");

    expect(response.positiveValue.toLowerCase()).toContain("voluntad");
  });

  it("usa reflectionQuestion de la carta si existe", () => {
    const response = buildFallbackResponse(mockCard, "upright", "request-123");

    expect(response.reflectionQuestion).toContain("recursos");
  });

  it("genera energía caution para carta con yesNoTendency caution", () => {
    const response = buildFallbackResponse(
      { ...mockCard, yesNoTendency: "caution" },
      "upright",
      "request-123",
    );

    expect(response.energy).toBe("caution");
  });

  it("mantiene respuesta válida si llega orientation reversed sin ampliar la lógica de invertidas", () => {
    const response = buildFallbackResponse(mockCard, "reversed", "request-123");

    expect(TarotContextualResponseSchema.safeParse(response).success).toBe(true);
    expect(response.energy).toBe("favorable");
  });

  it("normaliza campos nulos antes de construir fallback programado", () => {
    const response = buildFallbackResponse(
      {
        ...mockCard,
        summary: null,
        uprightMeaning: null,
        reversedMeaning: null,
        keywords: null,
      } as unknown as TarotCard,
      "reversed",
      "request-123",
    );

    expect(TarotContextualResponseSchema.safeParse(response).success).toBe(true);
    expect(response.mainMessage.length).toBeGreaterThanOrEqual(50);
  });

  it("evita copy absoluto en fallback de tendencia abierta", () => {
    const response = buildFallbackResponse(
      { ...mockCard, yesNoTendency: "open" },
      "upright",
      "request-123",
    );

    expect(response.caution).not.toContain("depende completamente");
  });

  it("si DeepSeek falla en un saludo, el fallback responde neutral y breve", () => {
    const response = buildFallbackResponse(mockCard, "upright", "request-123", "hola");

    expect(response.responseMode).toBe("conversation");
    expect(TarotContextualResponseSchema.safeParse(response).success).toBe(true);
    expect(response.mainMessage).toContain(mockCard.name);
    expect(response.mainMessage.toLowerCase()).not.toContain("bienvenida");
    expect(response.mainMessage.toLowerCase()).not.toContain("bienvenido");
    expect(response.mainMessage.split(/[.!?]+/).filter(Boolean).length).toBeLessThanOrEqual(3);
  });
});

describe("Tarot conversational contract", () => {
  it("expone responseMode opcional para distinguir conversación de interpretación", () => {
    const response = TarotContextualResponseSchema.safeParse({
      schemaVersion: "tarot-contextual-guide@1",
      requestId: "request-123",
      responseMode: "conversation",
      energy: "open",
      mainMessage:
        "Hola, qué gusto acompañarte. Estoy aquí para explorar esta carta contigo desde una mirada simbólica.",
      positiveValue: "La carta puede ayudarte a mirar tu momento con más calma y claridad.",
      caution:
        "No voy a afirmar certezas ni decidir por ti; puedo ayudarte a ordenar posibilidades.",
      practicalAdvice:
        "Puedes contarme qué tema quieres explorar: amor, trabajo o una decisión concreta.",
      reflectionQuestion: "¿Qué tema te gustaría mirar con esta carta ahora?",
      disclaimer: "Interpretación simbólica para reflexión personal.",
    });

    expect(response.success).toBe(true);
  });

  it("permite que los saludos lleguen al proveedor IA sin respuesta hardcodeada", () => {
    const greetingMetadataIndex = endpointSource.indexOf("isConversationalGreeting(question) ?");
    const aiIndex = endpointSource.indexOf("const aiRawResponse = await callAI");

    expect(greetingMetadataIndex).toBeGreaterThan(0);
    expect(greetingMetadataIndex).toBeLessThan(aiIndex);
    expect(endpointSource).not.toContain("function buildConversationalGreetingResponse");
    expect(endpointSource).not.toContain("conversation_response");
  });

  it("pide español natural y evita palabras concatenadas en el prompt", () => {
    expect(endpointSource).toContain("sin palabras truncadas, concatenadas o inventadas");
    expect(endpointSource).toContain("elecciones afectivas");
  });

  it("pide a la IA saludos breves, neutrales y conectados a la carta", () => {
    expect(endpointSource).toContain("neutral en género");
    expect(endpointSource).toContain("menciona de forma sutil la carta actual");
    expect(endpointSource).toContain("limita la respuesta inicial a 2 o 3 frases");
    expect(endpointSource).toContain(
      'Prefiere fórmulas neutrales como "Hola, qué gusto acompañarte"',
    );
  });
});

describe("Tarot rate limit aislable", () => {
  it("documenta límites y consumo esperado para Tarot", () => {
    expect(TarotRateLimitConfig.limits.guestDaily).toBe(3);
    expect(TarotRateLimitConfig.limits.userDaily).toBe(15);
    expect(TarotRateLimitConfig.consumption.fallback).toBe(0);
  });

  it("hashea la clave anónima de forma determinística sin exponer el valor original", () => {
    const first = hashAnonymousKey("anon-user");
    const second = hashAnonymousKey("anon-user");
    const other = hashAnonymousKey("other-user");

    expect(first).toBe(second);
    expect(first).not.toBe("anon-user");
    expect(first).not.toBe(other);
  });

  it("desactiva el consumo de cuota en desarrollo antes de importar Supabase admin", () => {
    const devBypassIndex = rateLimitSource.indexOf("isDevelopmentRuntime()");
    const adminImportIndex = rateLimitSource.indexOf(
      'await import("@/integrations/supabase/client.server")',
    );

    expect(rateLimitSource).toContain('process.env.NODE_ENV !== "production"');
    expect(devBypassIndex).toBeGreaterThan(0);
    expect(adminImportIndex).toBeGreaterThan(0);
    expect(devBypassIndex).toBeLessThan(adminImportIndex);
  });
});
