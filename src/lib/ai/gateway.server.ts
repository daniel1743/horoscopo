/**
 * Cliente server-only para proveedores IA compatibles con Chat Completions.
 * Nunca importar desde el navegador. Las API keys viven solo en process.env.
 */
import { defaultModelIds, type AiModelAlias } from "@/config/ai/model-routing";
import { aiLimits, readIntEnv } from "@/config/ai/limits";

const LOVABLE_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEEPSEEK_DEFAULT_BASE_URL = "https://api.deepseek.com";

type AiProvider = "deepseek" | "lovable";

export type ChatMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string };

export function resolveModelId(alias: AiModelAlias): string {
  const provider = resolveAiProvider();
  if (provider === "deepseek") {
    return resolveDeepSeekModelId(alias);
  }

  const envKey =
    alias === "fast"
      ? "AI_MODEL_FAST"
      : alias === "reasoning"
        ? "AI_MODEL_REASONING"
        : "AI_MODEL_SAFETY";
  const fromEnv = typeof process !== "undefined" ? process.env?.[envKey]?.trim() : undefined;
  return fromEnv || defaultModelIds[alias];
}

export function resolveAiProvider(): AiProvider {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (explicit === "deepseek" || explicit === "lovable") return explicit;
  return process.env.DEEPSEEK_API_KEY?.trim() ? "deepseek" : "lovable";
}

function resolveDeepSeekModelId(alias: AiModelAlias): string {
  const envKey =
    alias === "fast"
      ? "DEEPSEEK_MODEL_FAST"
      : alias === "reasoning"
        ? "DEEPSEEK_MODEL_REASONING"
        : "DEEPSEEK_MODEL_SAFETY";
  const fromEnv = process.env[envKey]?.trim() || process.env.DEEPSEEK_MODEL?.trim();
  if (fromEnv) return fromEnv;
  return alias === "reasoning" ? "deepseek-v4-pro" : "deepseek-v4-flash";
}

function resolveDeepSeekUrl(): string {
  const configured = process.env.DEEPSEEK_BASE_URL?.trim() || DEEPSEEK_DEFAULT_BASE_URL;
  const base = configured.replace(/\/+$/, "");
  return base.endsWith("/chat/completions") ? base : `${base}/chat/completions`;
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
  const provider = resolveAiProvider();
  const apiKey =
    provider === "deepseek" ? process.env.DEEPSEEK_API_KEY : process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    throw {
      status: 500,
      message:
        provider === "deepseek"
          ? "DEEPSEEK_API_KEY no configurado en el servidor."
          : "LOVABLE_API_KEY no configurado en el servidor.",
      retryable: false,
    } satisfies GatewayError;
  }

  const model = resolveModelId(options.alias);
  const maxTokens =
    options.maxTokens ?? readIntEnv("AI_MAX_OUTPUT_TOKENS", aiLimits.defaultMaxOutputTokens);
  const url = provider === "deepseek" ? resolveDeepSeekUrl() : LOVABLE_GATEWAY_URL;
  const headers =
    provider === "deepseek"
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        }
      : {
          "Content-Type": "application/json",
          "Lovable-API-Key": apiKey,
        };

  const upstream = await fetch(url, {
    method: "POST",
    headers,
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
    async start(controller) {
      try {
        while (true) {
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
        }
      } catch (error) {
        controller.error(error);
      }
    },
    cancel(reason) {
      reader.cancel(reason).catch(() => {});
    },
  });

  return { stream, getText: () => accumulatedText };
}
