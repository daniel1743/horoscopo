/**
 * Adaptador DeepSeek para generación de horóscopos.
 * Implementa llamadas a la API de DeepSeek con manejo de errores y retry.
 */

import type { VariantId } from "@/types/horoscope-automation";

// =====================================================================
// Tipos
// =====================================================================

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  response_format?: { type: "json_object" };
  stream?: boolean;
}

interface DeepSeekUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: "stop" | "length" | "content_filter";
  }>;
  usage: DeepSeekUsage;
}

export interface DeepSeekGenerationOptions {
  prompt: string;
  temperature: number;
  maxTokens: number;
  variantId: VariantId;
  signSlug: string;
}

export interface DeepSeekGenerationResponse {
  summary: string;
  focus: string;
  mood: string;
  energy: 1 | 2 | 3 | 4 | 5;
  love: string | null;
  work: string | null;
  wellbeing: string | null;
  luckyNumber: number | null;
  luckyColor: string | null;
  tokensUsed: {
    input: number;
    output: number;
  };
}

// =====================================================================
// Configuración
// =====================================================================

const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Modelos disponibles
const DEEPSEEK_MODELS = {
  chat: "deepseek-chat", // Modelo general
  reasoner: "deepseek-reasoner", // Modelo con razonamiento profundo (más caro)
} as const;

// Usar modelo chat por defecto (más económico)
const DEFAULT_MODEL = DEEPSEEK_MODELS.chat;

// =====================================================================
// Validación de API Key
// =====================================================================

function validateApiKey(): void {
  if (!DEEPSEEK_API_KEY) {
    throw new Error(
      "DEEPSEEK_API_KEY no configurada. Agrega la variable de entorno en Vercel."
    );
  }
}

// =====================================================================
// Llamada a DeepSeek API
// =====================================================================

async function callDeepSeekAPI(request: DeepSeekRequest): Promise<DeepSeekResponse> {
  validateApiKey();

  const url = `${DEEPSEEK_BASE_URL}/chat/completions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let errorMessage = `DeepSeek API error: ${response.status} ${response.statusText}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      // Si no se puede parsear el error, usar el mensaje por defecto
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data as DeepSeekResponse;
}

// =====================================================================
// Parseo y Validación de Respuesta JSON
// =====================================================================

function parseHoroscopeJSON(jsonString: string): Omit<DeepSeekGenerationResponse, "tokensUsed"> {
  // Limpiar posibles markdown code blocks
  let cleaned = jsonString.trim();

  // Remover ```json ... ``` si existe
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  // Parsear JSON
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    throw new Error(`JSON inválido: ${error instanceof Error ? error.message : "parse error"}`);
  }

  // Validar campos requeridos
  if (!parsed.summary || typeof parsed.summary !== "string") {
    throw new Error("Campo 'summary' faltante o inválido");
  }

  if (!parsed.focus || typeof parsed.focus !== "string") {
    throw new Error("Campo 'focus' faltante o inválido");
  }

  if (!parsed.mood || typeof parsed.mood !== "string") {
    throw new Error("Campo 'mood' faltante o inválido");
  }

  if (typeof parsed.energy !== "number" || parsed.energy < 1 || parsed.energy > 5) {
    throw new Error("Campo 'energy' debe ser número entre 1 y 5");
  }

  // Validar campos opcionales
  const love = parsed.love === null ? null : String(parsed.love || "");
  const work = parsed.work === null ? null : String(parsed.work || "");
  const wellbeing = parsed.wellbeing === null ? null : String(parsed.wellbeing || "");

  const luckyNumber =
    typeof parsed.luckyNumber === "number"
      ? Math.max(1, Math.min(99, Math.round(parsed.luckyNumber)))
      : null;

  const luckyColor = parsed.luckyColor ? String(parsed.luckyColor) : null;

  return {
    summary: parsed.summary.trim(),
    focus: parsed.focus.trim(),
    mood: parsed.mood.trim(),
    energy: parsed.energy as 1 | 2 | 3 | 4 | 5,
    love: love && love.length > 10 ? love.trim() : null,
    work: work && work.length > 10 ? work.trim() : null,
    wellbeing: wellbeing && wellbeing.length > 10 ? wellbeing.trim() : null,
    luckyNumber,
    luckyColor,
  };
}

// =====================================================================
// Función Principal: Generar Horóscopo con DeepSeek
// =====================================================================

export async function generateWithDeepSeek(
  options: DeepSeekGenerationOptions
): Promise<DeepSeekGenerationResponse> {
  const { prompt, temperature, maxTokens, variantId, signSlug } = options;

  // Construir mensajes
  const messages: DeepSeekMessage[] = [
    {
      role: "system",
      content:
        "Eres un astrólogo profesional experto. Respondes ÚNICAMENTE con JSON válido, sin texto adicional.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  // Construir request
  const request: DeepSeekRequest = {
    model: DEFAULT_MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
    top_p: 0.95,
    frequency_penalty: 0.2, // Reduce repetición
    presence_penalty: 0.1, // Fomenta diversidad de temas
    response_format: { type: "json_object" }, // Forzar JSON
    stream: false,
  };

  console.log(
    `[DeepSeek] Generando ${signSlug} variante ${variantId} (temp: ${temperature}, maxTokens: ${maxTokens})`
  );

  // Llamar a API
  const startTime = Date.now();
  const response = await callDeepSeekAPI(request);
  const duration = Date.now() - startTime;

  // Verificar respuesta
  if (!response.choices || response.choices.length === 0) {
    throw new Error("DeepSeek no devolvió choices");
  }

  const choice = response.choices[0];

  if (choice.finish_reason !== "stop") {
    console.warn(
      `[DeepSeek] Respuesta terminó con '${choice.finish_reason}' (puede estar truncada)`
    );
  }

  const rawContent = choice.message.content;

  // Parsear JSON
  const horoscope = parseHoroscopeJSON(rawContent);

  console.log(
    `[DeepSeek] ✓ ${signSlug} variante ${variantId} generado en ${duration}ms (${response.usage.total_tokens} tokens)`
  );

  return {
    ...horoscope,
    tokensUsed: {
      input: response.usage.prompt_tokens,
      output: response.usage.completion_tokens,
    },
  };
}

// =====================================================================
// Funciones de Utilidad
// =====================================================================

/**
 * Estima el costo de generación basado en tokens.
 * Precios aproximados de DeepSeek (verificar precios actuales en su web).
 */
export function estimateCost(inputTokens: number, outputTokens: number): number {
  // Precios aproximados (USD por millón de tokens)
  const INPUT_COST_PER_MILLION = 0.14;
  const OUTPUT_COST_PER_MILLION = 0.28;

  const inputCost = (inputTokens / 1_000_000) * INPUT_COST_PER_MILLION;
  const outputCost = (outputTokens / 1_000_000) * OUTPUT_COST_PER_MILLION;

  return inputCost + outputCost;
}

/**
 * Verifica la salud de la API de DeepSeek.
 */
export async function healthCheck(): Promise<{ healthy: boolean; message: string }> {
  try {
    validateApiKey();

    // Hacer una llamada de prueba muy pequeña
    const response = await callDeepSeekAPI({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "user",
          content: "Di 'ok'",
        },
      ],
      max_tokens: 5,
      temperature: 0,
    });

    if (response.choices && response.choices.length > 0) {
      return {
        healthy: true,
        message: "DeepSeek API funcionando correctamente",
      };
    }

    return {
      healthy: false,
      message: "DeepSeek API respondió pero sin choices",
    };
  } catch (error) {
    return {
      healthy: false,
      message: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Obtiene información sobre modelos disponibles.
 */
export function getAvailableModels() {
  return {
    default: DEFAULT_MODEL,
    available: DEEPSEEK_MODELS,
    configured: !!DEEPSEEK_API_KEY,
  };
}
