import { useEffect, useState } from "react";

const INTERPRETATION_STEPS = [
  "Consultando arquetipos universales",
  "Observando principios de sincronicidad",
  "Leyendo proyecciones simbólicas",
  "Conectando las tres cartas reveladas",
  "Integrando tensión, recurso y orientación",
  "Preparando una síntesis clara",
];

interface TarotInterpretationLoadingProps {
  compact?: boolean;
}

export function TarotInterpretationLoading({ compact = false }: TarotInterpretationLoadingProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStepIndex((current) => (current + 1) % INTERPRETATION_STEPS.length);
    }, 1700);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        compact
          ? "rounded-[var(--radius-card-md)] border border-cosmic/30 bg-cosmic/5 p-5 text-center"
          : "flex flex-col items-center gap-4 animate-in fade-in duration-500 bg-cosmic/5 p-8 rounded-[16px] border border-cosmic/20 shadow-[0_18px_44px_rgba(99,63,178,0.12)]"
      }
    >
      {!compact && (
        <div className="w-12 h-12 rounded-full border-2 border-cosmic border-t-transparent animate-spin" />
      )}
      <p className="font-body text-[13px] sm:text-[15px] text-cosmic uppercase tracking-[0.14em] animate-pulse">
        {INTERPRETATION_STEPS[stepIndex]}
      </p>
      {!compact && (
        <p className="max-w-md text-center font-body text-[13px] leading-[1.6] text-ink-soft">
          La lectura está cruzando símbolos, posiciones y contexto antes de mostrar la síntesis.
        </p>
      )}
    </div>
  );
}
