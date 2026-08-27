/**
 * Cliente para el gateway de Lovable AI. SERVER-ONLY.
 * Nunca importar desde el navegador. La API key vive en process.env.LOVABLE_API_KEY.
 */
import { defaultModelIds, type AiModelAlias } from "@/config/ai/model-routing";
import { aiLimits, readIntEnv } from "@/config/ai/limits";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export type ChatMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string };

export function resolveModelId(alias: AiModelAlias): string {
  const envKey =
    alias === "fast"
      ? "AI_MODEL_FAST"
      : alias === "reasoning"
        ? "AI_MODEL_REASONING"
        : "AI_MODEL_SAFETY";
  const fromEnv = typeof process !== "undefined" ? process.env?.[envKey]?.trim() : undefined;
  return fromEnv || defaultModelIds[alias];
}

export interface GatewayStreamOptions {
  alias: AiModelAlias;
  messages: ChatMessage[];
  signal?: AbortSignal;
  maxTokens?: number;
}

export interface GatewayError {
  status: number;
  message: string;
  retryable: boolean;
}

/**
 * Realiza una llamada streaming al gateway y devuelve un ReadableStream de texto
 * (solo el delta.content concatenado en Server-Sent Events del formato OpenAI).
 */
export async function streamChatCompletion(
  options: GatewayStreamOptions,
): Promise<{ stream: ReadableStream<Uint8Array>; getText: () => string }> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    throw {
      status: 500,
      message: "LOVABLE_API_KEY no configurado en el servidor.",
      retryable: false,
    } satisfies GatewayError;
  }

  const model = resolveModelId(options.alias);
  const maxTokens =
    options.maxTokens ?? readIntEnv("AI_MAX_OUTPUT_TOKENS", aiLimits.defaultMaxOutputTokens);

  const upstream = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      max_tokens: maxTokens,
      stream: true,
    }),
    signal: options.signal,
  });

  if (!upstream.ok || !upstream.body) {
    let msg = `AI gateway status ${upstream.status}`;
    try {
      const j = await upstream.json();
      msg = typeof j?.error?.message === "string" ? j.error.message : msg;
    } catch {
      /* ignore */
    }
    throw {
      status: upstream.status,
      message: msg,
      retryable: upstream.status === 429 || upstream.status >= 500,
    } satisfies GatewayError;
  }

  let accumulatedText = "";
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = upstream.body.getReader();

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const parsed = JSON.parse(payload);
          const delta = parsed?.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta.length > 0) {
            accumulatedText += delta;
            controller.enqueue(encoder.encode(delta));
          }
        } catch {
          /* ignore malformed keep-alive frames */
        }
      }
    },
    cancel(reason) {
      reader.cancel(reason).catch(() => {});
    },
  });

  return { stream, getText: () => accumulatedText };
}
