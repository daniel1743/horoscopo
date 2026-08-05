import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import type { TarotReading, ThreeCardReadingConfig } from "@/types/tarot";

interface Props {
  reading: TarotReading;
  config: ThreeCardReadingConfig;
  userContext?: string;
}

interface ReadingQuestionResponse {
  answer: string;
  source: "ai" | "fallback";
}

function createRequestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `reading-${Date.now()}-${Math.random()}`;
}

const QUICK_QUESTIONS = [
  "¿Qué patrón principal debería observar en esta lectura?",
  "¿Cómo se relacionan estas tres cartas entre sí?",
  "¿Qué aspecto debo considerar antes de actuar?",
  "¿Qué me sugiere esta combinación de cartas?",
] as const;

export function ThreeCardReadingGuide({ reading, config, userContext }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<ReadingQuestionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const response = await fetch("/api/tarot/interpret-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reading: {
            theme: config.slug,
          },
          cards: reading.drawn.map((d, i) => ({
            slug: d.card.slug,
            positionKey: config.positions[i].key,
          })),
          user: {
            context: userContext,
            question: trimmedQuestion,
            requestId: createRequestId(),
          },
          language: "es",
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        const message =
          typeof payload?.error?.message === "string"
            ? payload.error.message
            : "No pudimos generar una respuesta ahora.";
        setError(message);
        return;
      }

      // Extraer respuesta sintetizada
      const synthesis = payload.synthesis;
      const answerText = `${synthesis.mainPattern}\n\n${synthesis.relationshipBetweenCards}\n\n${synthesis.guidance}\n\n${synthesis.reflectionQuestion}`;

      setAnswer({
        answer: answerText,
        source: payload.meta.source,
      });
      setQuestion("");
      setShowSuggestions(false);
    } catch {
      setError("No pudimos conectar con la guía en este momento. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (quickQuestion: string) => {
    setQuestion(quickQuestion);
    setShowSuggestions(false);
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleNewQuestion = () => {
    setQuestion("");
    setAnswer(null);
    setError(null);
    setShowSuggestions(true);
  };

  const shouldShowSuggestions = showSuggestions && !answer && !question.trim();
  const formLabel = answer ? "Haz otra pregunta sobre esta lectura" : "Tu pregunta";
  const submitLabel = answer ? "Enviar nueva pregunta" : "Enviar pregunta";

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className="gap-2"
        >
          <Icon name="premium" />
          Preguntar sobre esta lectura
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md overflow-hidden bg-night border-line-dark text-ink-inverse flex flex-col p-0">
        <div className="flex-1 overflow-y-auto flex flex-col p-6 pb-2">
          <SheetHeader className="mb-4 shrink-0">
            <SheetTitle className="font-display text-xl text-ink-inverse text-left">
              Guía de lectura completa
            </SheetTitle>
            <p className="mt-2 font-body text-xs text-ink-inverse-soft">
              Pregunta sobre las tres cartas en conjunto
            </p>
          </SheetHeader>

          <div className="flex flex-col gap-4 mt-4 shrink-0">
            {shouldShowSuggestions && (
              <div>
                <p className="font-body text-xs font-medium uppercase tracking-widest text-ink-inverse-soft mb-2">
                  Preguntas sugeridas
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQuickQuestion(q)}
                      disabled={isLoading}
                      className="text-left px-3 py-2 rounded-[var(--radius-card-sm)] border border-line-dark/50 bg-night-elevated hover:bg-night-elevated/80 hover:border-cosmic/40 text-ink-inverse-soft hover:text-cosmic font-body text-sm transition-colors disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mt-2 rounded-[var(--radius-card-sm)] border border-gold/30 bg-gold/10 p-3 font-body text-sm leading-relaxed text-ink-inverse"
              >
                {error}
              </div>
            )}

            {answer && (
              <div className="mt-2">
                <Separator className="bg-line-dark/50 mb-4" />
                <p className="font-body text-xs font-medium uppercase tracking-widest text-ink-inverse-soft mb-2">
                  Respuesta de la guía
                </p>
                <div className="rounded-[var(--radius-card-sm)] bg-night-elevated p-4 text-ink-inverse border border-cosmic/20">
                  <p className="font-body text-sm leading-relaxed whitespace-pre-line">
                    {answer.answer}
                  </p>
                  {answer.source === "fallback" && (
                    <p className="mt-3 font-body text-xs text-ink-inverse-soft italic">
                      Interpretación generada desde los datos de las cartas.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleNewQuestion}
                  className="mt-3 inline-flex items-center gap-1 font-body text-xs text-cosmic hover:text-cosmic/80"
                >
                  <Icon name="premium" className="h-3.5 w-3.5" />
                  Hacer otra pregunta
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-line-dark p-6 pt-4 bg-night">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label
                htmlFor="reading-question"
                className="block font-body text-xs font-medium text-ink-inverse-soft mb-2"
              >
                {formLabel}
              </label>
              <Textarea
                ref={textareaRef}
                id="reading-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ejemplo: ¿Qué patrón principal observo en estas tres cartas?"
                maxLength={500}
                rows={3}
                disabled={isLoading}
                className="bg-night-elevated border-line-dark text-ink-inverse placeholder:text-ink-inverse-soft/50"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="font-body text-xs text-ink-inverse-soft">
                  {question.length}/500
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="w-full"
            >
              {isLoading ? "Consultando..." : submitLabel}
            </Button>
          </form>

          <p className="mt-3 font-body text-xs text-ink-inverse-soft text-center">
            Consultas limitadas por día
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
