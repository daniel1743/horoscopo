import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { TarotCardVisual } from "./TarotCardVisual";
import type { IconName } from "@/config/icons";
import type { TarotCard, TarotSpreadPosition } from "@/types/tarot";

interface Props {
  card: TarotCard;
  readingContext?: string;
  position?: TarotSpreadPosition;
  userContext?: string;
  theme?: string;
  positionKey?: string;
  interpretationFocus?: string;
}

type TarotInterpretReadingType = "daily" | "single" | "three-card" | "yes-no" | "detail";

interface TarotContextualResponse {
  schemaVersion: "tarot-contextual-guide@1";
  requestId: string;
  responseMode?: "interpretation" | "conversation";
  energy: "favorable" | "caution" | "open";
  mainMessage: string;
  positiveValue: string;
  caution: string;
  practicalAdvice: string;
  reflectionQuestion: string;
  disclaimer: string;
}

function createRequestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `tarot-${Date.now()}-${Math.random()}`;
}

function inferReadingType(
  readingContext?: string,
  position?: TarotSpreadPosition,
): TarotInterpretReadingType {
  const normalizedContext = readingContext?.toLowerCase() ?? "";
  if (position?.key === "daily_message" || normalizedContext.includes("día")) return "daily";
  if (position?.key === "orientation") return "yes-no";
  if (normalizedContext.includes("biblioteca")) return "detail";
  if (position) return "three-card";
  return "single";
}

const PRIMARY_QUICK_QUESTIONS = [
  "¿Qué significa para el amor?",
  "¿Qué aspecto debo vigilar?",
  "¿Cómo puedo aplicar esta carta?",
] as const;

const SECONDARY_QUICK_QUESTIONS = [
  "¿Qué significa para el trabajo?",
  "¿Qué debo aprender hoy?",
  "¿Qué valor positivo tiene esta carta?",
] as const;

const GUIDE_RESPONSE_SECTIONS = [
  { key: "mainMessage", title: "Mensaje principal" },
  { key: "positiveValue", title: "Valor positivo" },
  { key: "caution", title: "Aspecto a vigilar" },
  { key: "practicalAdvice", title: "Consejo práctico" },
  { key: "reflectionQuestion", title: "Pregunta de reflexión" },
] as const satisfies readonly {
  key: keyof Pick<
    TarotContextualResponse,
    "mainMessage" | "positiveValue" | "caution" | "practicalAdvice" | "reflectionQuestion"
  >;
  title: string;
}[];

const ENERGY_EXPLANATIONS = {
  favorable: {
    label: "Favorable",
    description:
      "Orientación favorable: destaca recursos o actitudes que pueden ayudarte dentro de este contexto.",
    icon: "sparkles",
  },
  caution: {
    label: "De cautela",
    description: "Orientación de cautela: invita a observar y decidir sin precipitarse.",
    icon: "alertCircle",
  },
  open: {
    label: "Abierta",
    description:
      "Orientación abierta: la carta no señala una única dirección y debe leerse según el contexto.",
    icon: "gitBranch",
  },
} as const satisfies Record<
  TarotCard["yesNoTendency"],
  { label: string; description: string; icon: IconName }
>;

export function TarotContextualGuide({
  card,
  readingContext,
  position,
  userContext,
  theme,
  positionKey,
  interpretationFocus,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<TarotContextualResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showMoreSuggestions, setShowMoreSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const response = await fetch("/api/tarot/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card: {
            id: card.id,
            slug: card.slug,
          },
          orientation: "upright",
          reading: {
            type: inferReadingType(readingContext, position),
            ...(position?.label ? { positionName: position.label } : {}),
            ...(positionKey ? { positionKey } : {}),
            ...(theme ? { theme } : {}),
            ...(interpretationFocus ? { interpretationFocus } : {}),
          },
          user: {
            question: trimmedQuestion,
            requestId: createRequestId(),
            ...(userContext ? { context: userContext } : {}),
          },
          language: "es",
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        const message =
          typeof payload?.error?.message === "string"
            ? payload.error.message
            : "No pudimos generar una interpretación ahora.";
        setError(message);
        return;
      }

      setAnswer(payload as TarotContextualResponse);
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
    setShowMoreSuggestions(false);
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const energyType = card.yesNoTendency as "favorable" | "caution" | "open";
  const energyInfo = ENERGY_EXPLANATIONS[energyType];

  const symbolicTrendColor =
    energyType === "favorable"
      ? "bg-cosmic/10 text-cosmic border-cosmic/20"
      : energyType === "caution"
        ? "bg-gold/10 text-gold border-gold/20"
        : "bg-ink-inverse/10 text-ink-inverse border-ink-inverse/20";

  const shouldShowSuggestions = showSuggestions && !answer && !question.trim();
  const formLabel = answer ? "Haz otra pregunta sobre esta carta" : "Tu pregunta personalizada";
  const submitLabel = answer ? "Enviar nueva pregunta" : "Enviar pregunta";

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4 gap-2 text-gold hover:text-gold/80 hover:bg-gold/10"
        >
          <Icon name="premium" className="h-4 w-4" />
          Preguntar a la guía
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md overflow-hidden bg-night border-line-dark text-ink-inverse flex flex-col p-0">
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col p-6 pb-2">
          <SheetHeader className="mb-4 shrink-0">
            <div className="flex items-start gap-3">
              <TarotCardVisual 
                card={card} 
                revealed 
                size="sm" 
                className="w-14 shrink-0 shadow-none" 
              />
              <div className="flex-1 min-w-0">
                <SheetTitle className="font-display text-xl text-ink-inverse text-left">
                  {card.name}
                </SheetTitle>
                <p className="mt-2 font-body text-xs uppercase tracking-widest text-ink-inverse-soft">
                  {readingContext || "Consulta"} {position && `• ${position.label}`}
                </p>
                <p className="mt-2 font-body text-xs text-ink-inverse-soft">
                  Consultas limitadas por día
                </p>
              </div>
            </div>
          </SheetHeader>

          <div
            className={`shrink-0 rounded-[var(--radius-card-sm)] border px-3 py-2 ${symbolicTrendColor}`}
          >
            <div className="flex items-center gap-2">
              <Icon name={energyInfo.icon} className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="flex-1 font-body text-xs leading-relaxed text-ink-inverse-soft">
                <span className="font-semibold text-ink-inverse">Tendencia simbólica:</span>{" "}
                {energyInfo.description}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-6 shrink-0">
            {shouldShowSuggestions && (
              <div>
                <p className="font-body text-xs font-medium uppercase tracking-widest text-ink-inverse-soft mb-2">
                  Preguntas rápidas
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {PRIMARY_QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQuickQuestion(q)}
                      disabled={isLoading}
                      className="text-left px-3 py-2 rounded-[var(--radius-card-sm)] border border-line-dark/50 bg-night-elevated hover:bg-night-elevated/80 hover:border-cosmic/40 text-ink-inverse-soft hover:text-cosmic font-body text-sm transition-colors disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                  {showMoreSuggestions &&
                    SECONDARY_QUICK_QUESTIONS.map((q) => (
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
                <button
                  type="button"
                  onClick={() => setShowMoreSuggestions((value) => !value)}
                  className="mt-3 inline-flex items-center gap-1 font-body text-xs text-cosmic hover:text-cosmic/80"
                >
                  {showMoreSuggestions ? "Ocultar preguntas" : "Ver más preguntas"}
                  <Icon
                    name={showMoreSuggestions ? "chevronUp" : "expand"}
                    className="h-3.5 w-3.5"
                  />
                </button>
              </div>
            )}

            {/* Respuesta y Error (Movidos ARRIBA del input) */}
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
                  {answer.responseMode === "conversation" ? (
                    <p className="font-body text-sm leading-relaxed">{answer.mainMessage}</p>
                  ) : (
                    <div className="space-y-4">
                      {GUIDE_RESPONSE_SECTIONS.map((section) => (
                        <section key={section.key}>
                          <h3 className="font-body text-xs font-semibold uppercase tracking-widest text-cosmic">
                            {section.title}
                          </h3>
                          <p className="mt-1 font-body text-sm leading-relaxed text-ink-inverse">
                            {answer[section.key]}
                          </p>
                        </section>
                      ))}
                      {answer.disclaimer && (
                        <p className="border-t border-line-dark/50 pt-3 font-body text-xs text-ink-inverse-soft">
                          Orientación simbólica para reflexión personal.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleNewQuestion}
                  className="mt-3 gap-2 text-cosmic hover:bg-cosmic/10 hover:text-cosmic"
                >
                  <Icon name="sparkles" className="h-4 w-4" />
                  Nueva pregunta
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ZONA FIJA AL FONDO */}
        <div className="shrink-0 p-6 pt-4 border-t border-line-dark/50 bg-night z-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="font-body text-xs font-medium uppercase tracking-widest text-ink-inverse-soft">
              {formLabel}
            </label>
            <Textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (e.target.value.trim()) setShowSuggestions(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
              placeholder="Ej. ¿Cómo se relaciona esta carta con mis preocupaciones actuales?"
              maxLength={500}
              className="min-h-[80px] resize-none bg-night-elevated border-line-dark text-ink-inverse placeholder:text-ink-inverse-soft/50 focus-visible:ring-cosmic text-sm scrollbar-hide"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between text-xs text-ink-inverse-soft/70">
              <span>{question.length}/500</span>
            </div>
            <Button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="w-full bg-cosmic text-white hover:bg-cosmic/90"
            >
              {isLoading ? "Consultando..." : submitLabel}
            </Button>
          </form>

          {!answer && (
            <div className="mt-4">
              <p className="font-body text-xs text-ink-inverse-soft/70 text-center">
                Orientación simbólica para reflexión personal.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
