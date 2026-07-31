import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TarotCardVisual } from "./TarotCardVisual";
import type { TarotCard, TarotSpreadPosition } from "@/types/tarot";

interface Props {
  card: TarotCard;
  readingContext?: string;
  position?: TarotSpreadPosition;
}

const QUICK_QUESTIONS = [
  "¿Qué significa para el amor?",
  "¿Qué significa para el trabajo?",
  "¿Qué debo aprender hoy?",
  "¿Qué aspecto debo vigilar?",
  "¿Cómo puedo aplicar esta carta?",
  "¿Qué valor positivo tiene esta carta?",
];

export function TarotContextualGuide({ card, readingContext, position }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    // TODO: Implement IA fetch (Phase G)
    setTimeout(() => {
      setAnswer(
        "Esta es una respuesta simulada por ahora. La integración de IA vendrá en las siguientes fases.",
      );
      setIsLoading(false);
    }, 1000);
  };

  const handleQuickQuestion = (quickQuestion: string) => {
    setQuestion(quickQuestion);
  };

  const energyColor =
    card.yesNoTendency === "favorable"
      ? "bg-cosmic/10 text-cosmic border-cosmic/20"
      : card.yesNoTendency === "caution"
        ? "bg-gold/10 text-gold border-gold/20"
        : "bg-ink-inverse/10 text-ink-inverse border-ink-inverse/20";

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

      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-night border-line-dark text-ink-inverse flex flex-col">
        {/* Header Premium */}
        <SheetHeader className="mb-6">
          <div className="flex items-start gap-3">
            <div className="w-16 h-24 shrink-0 rounded-[var(--radius-card-sm)] overflow-hidden border border-line-dark/50">
              <TarotCardVisual card={card} revealed size="sm" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="font-display text-xl text-ink-inverse text-left">
                {card.name}
              </SheetTitle>
              <p className="mt-2 font-body text-xs uppercase tracking-widest text-ink-inverse-soft">
                {readingContext || "Consulta"} {position && `• ${position.label}`}
              </p>
            </div>
          </div>
        </SheetHeader>

        <Separator className="bg-line-dark/50" />

        {/* Energía de la carta */}
        <div className={`mt-4 p-3 rounded-[var(--radius-card-sm)] border ${energyColor} flex items-center gap-2`}>
          <Icon name="sparkles" className="h-4 w-4" />
          <span className="font-body text-sm font-medium">
            Energía:{" "}
            <span className="font-semibold">
              {card.yesNoTendency === "favorable"
                ? "Favorable"
                : card.yesNoTendency === "caution"
                  ? "De cautela"
                  : "Abierta"}
            </span>
          </span>
        </div>

        <Separator className="mt-4 bg-line-dark/50" />

        <div className="flex flex-col gap-4 mt-6 flex-1 overflow-y-auto">
          {/* Preguntas rápidas */}
          <div>
            <p className="font-body text-xs font-medium uppercase tracking-widest text-ink-inverse-soft mb-2">
              Preguntas rápidas
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

          {/* Separador antes del formulario */}
          <Separator className="bg-line-dark/50" />

          {/* Formulario de pregunta libre */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="font-body text-xs font-medium uppercase tracking-widest text-ink-inverse-soft">
              Tu pregunta
            </label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ej. ¿Qué me enseña esta carta hoy?"
              maxLength={500}
              className="min-h-[80px] resize-none bg-night-elevated border-line-dark text-ink-inverse placeholder:text-ink-inverse-soft/50 focus-visible:ring-cosmic text-sm"
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
              {isLoading ? "Consultando..." : "Enviar pregunta"}
            </Button>
          </form>

          {/* Respuesta */}
          {answer && (
            <>
              <Separator className="bg-line-dark/50" />
              <div>
                <p className="font-body text-xs font-medium uppercase tracking-widest text-ink-inverse-soft mb-2">
                  Respuesta de la guía
                </p>
                <div className="rounded-[var(--radius-card-sm)] bg-night-elevated p-4 text-ink-inverse border border-cosmic/20">
                  <div className="font-body text-sm leading-relaxed whitespace-pre-wrap">
                    {answer}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer con disclaimer */}
        <div className="mt-6 pt-4 border-t border-line-dark/50">
          <p className="font-body text-xs text-ink-inverse-soft/70 text-center">
            Interpretación simbólica para reflexión personal.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
