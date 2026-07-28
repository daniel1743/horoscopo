/**
 * Servicio cliente para llamar a /api/ai/respond con streaming.
 * NO importa desde .server.ts ni contiene claves.
 */
import { supabase } from "@/integrations/supabase/client";
import type { AiRequestContext, AiRespondEnvelope, AiSource } from "@/types/ai";

interface RespondArgs {
  message: string;
  mode: "general" | "tarot" | "horoscope" | "article" | "recommendation" | "reflection";
  conversationId?: string;
  context?: AiRequestContext;
  allowMemory?: boolean;
  signal?: AbortSignal;
  onChunk: (delta: string) => void;
}

export async function respondStreaming(args: RespondArgs): Promise<AiRespondEnvelope> {
  const requestId = crypto.randomUUID();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const response = await fetch("/api/ai/respond", {
    method: "POST",
    headers,
    credentials: "include",
    signal: args.signal,
    body: JSON.stringify({
      message: args.message,
      mode: args.mode,
      conversationId: args.conversationId,
      context: args.context ?? { kind: "none" },
      allowMemory: args.allowMemory ?? false,
      requestId,
    }),
  });

  if (!response.ok) {
    let msg = `Error ${response.status}`;
    try {
      const j = await response.json();
      msg = j?.error?.message ?? msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const metaRaw = response.headers.get("X-AI-Meta");
  let meta: {
    conversationId: string | null;
    sources: AiSource[];
    safetyNotice: string | null;
    usageRemaining: number | null;
    modelAlias: string;
  } | null = null;
  if (metaRaw) {
    try {
      meta = JSON.parse(atob(metaRaw));
    } catch {
      /* ignore */
    }
  }

  if (!response.body) throw new Error("Respuesta sin cuerpo.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    args.onChunk(decoder.decode(value, { stream: true }));
  }

  return {
    conversationId: meta?.conversationId ?? null,
    messageId: null,
    sources: meta?.sources ?? [],
    safetyNotice: meta?.safetyNotice ?? null,
    usageRemaining: meta?.usageRemaining ?? null,
    memorySuggestion: null,
  };
}
