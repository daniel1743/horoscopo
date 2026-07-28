import type { AiMessage } from "@/types/ai";

interface Props {
  message: AiMessage;
}

export function AssistantMessage({ message }: Props) {
  const isUser = message.role === "user";
  return (
    <article
      className={`max-w-[92%] rounded-[var(--radius-card-md)] px-4 py-3 ${
        isUser
          ? "self-end bg-cosmic/10 text-ink"
          : "self-start border border-line-soft bg-parchment text-ink"
      }`}
      aria-label={isUser ? "Tu mensaje" : "Respuesta del asistente"}
    >
      <p className="mb-1 font-body text-[11px] font-medium uppercase tracking-[0.12em] text-ink-soft">
        {isUser ? "Tú" : "Guía"}
      </p>
      <div className="whitespace-pre-wrap font-body text-[15px] leading-[1.65] text-ink">
        {message.content || (isUser ? "" : "…")}
      </div>
    </article>
  );
}
