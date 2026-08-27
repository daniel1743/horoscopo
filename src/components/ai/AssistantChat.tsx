import { useEffect, useRef, useState } from "react";
import { respondStreaming } from "@/services/ai.service";
import type { AiMessage, AiModuleMode, AiRequestContext, AiSource } from "@/types/ai";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { assistantDisclaimers, emptyStateSuggestions } from "@/config/ai/assistant";
import { aiLimits } from "@/config/ai/limits";
import { AssistantMessage } from "./AssistantMessage";
import { AssistantSourceList } from "./AssistantSourceList";
import { AssistantSafetyNotice } from "./AssistantSafetyNotice";

interface Props {
  mode?: AiModuleMode;
  context?: AiRequestContext;
  compact?: boolean;
}

export function AssistantChat({ mode = "general", context, compact = false }: Props) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [safety, setSafety] = useState<string | null>(null);
  const [sources, setSources] = useState<AiSource[]>([]);
  const [usageRemaining, setUsageRemaining] = useState<number | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, streaming]);

  async function send(rawText: string) {
    const text = rawText.trim();
    if (!text || streaming) return;
    if (text.length > aiLimits.maxInputCharacters) {
      setError(`El mensaje supera los ${aiLimits.maxInputCharacters} caracteres.`);
      return;
    }
    setError(null);
    setSafety(null);
    setSources([]);
    const userMessage: AiMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    const assistantId = crypto.randomUUID();
    const assistantPlaceholder: AiMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const envelope = await respondStreaming({
        message: text,
        mode,
        conversationId,
        context,
        signal: controller.signal,
        onChunk: (delta) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + delta } : m)),
          );
        },
      });
      if (envelope.conversationId) setConversationId(envelope.conversationId);
      setSources(envelope.sources);
      setSafety(envelope.safetyNotice ?? null);
      setUsageRemaining(envelope.usageRemaining);
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content || "Respuesta detenida." } : m,
          ),
        );
      } else {
        setError((e as Error).message || "El asistente no está disponible.");
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      }
    } finally {
      abortRef.current = null;
      setStreaming(false);
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  const showEmpty = messages.length === 0;

  return (
    <div className={`flex flex-col gap-4 ${compact ? "" : "h-full min-h-[520px]"}`}>
      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-label="Conversación con el asistente"
        className="flex-1 overflow-y-auto rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment-elevated p-4"
      >
        {showEmpty ? (
          <div className="flex flex-col gap-3">
            <p className="font-display text-[18px] text-ink">¿Qué deseas explorar?</p>
            <ul className="flex flex-col gap-2">
              {emptyStateSuggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => send(s)}
                    className="w-full rounded-[var(--radius-card-md)] border border-line-soft bg-parchment px-3 py-2 text-left font-body text-[14px] text-ink hover:border-cosmic/40"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m) => (
              <AssistantMessage key={m.id} message={m} />
            ))}
          </div>
        )}
      </div>

      {safety && <AssistantSafetyNotice notice={safety} />}
      {sources.length > 0 && <AssistantSourceList sources={sources} />}
      {error && (
        <p role="alert" className="font-body text-[14px] text-error">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="ai-composer" className="sr-only">
          Mensaje para el asistente
        </label>
        <textarea
          id="ai-composer"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Escribe tu pregunta… (Ctrl/Cmd + Enter para enviar)"
          rows={3}
          maxLength={aiLimits.maxInputCharacters}
          disabled={streaming}
          className="w-full resize-none rounded-[var(--radius-card-md)] border border-line-soft bg-parchment p-3 font-body text-[15px] text-ink outline-none focus:border-cosmic/60"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="font-body text-[12px] text-ink-soft">
            {usageRemaining !== null ? `Consultas restantes hoy: ${usageRemaining}` : ""}
          </span>
          <div className="flex items-center gap-2">
            {streaming ? (
              <Button type="button" variant="outline" onClick={stop}>
                <Icon name="close" /> Detener
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={() => send(input)}
                disabled={!input.trim()}
              >
                <Icon name="premium" /> Enviar
              </Button>
            )}
          </div>
        </div>
        <p className="font-body text-[12px] text-ink-soft">{assistantDisclaimers.chat}</p>
      </div>
    </div>
  );
}
