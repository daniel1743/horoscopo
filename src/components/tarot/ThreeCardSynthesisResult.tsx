import type { ThreeCardSynthesis } from "@/lib/tarot/synthesis-generator";
import type { ThreeCardReadingConfig } from "@/types/tarot";

interface Props {
  synthesis: ThreeCardSynthesis;
  config: ThreeCardReadingConfig;
}

export function ThreeCardSynthesisResult({ synthesis }: Props) {
  return (
    <section aria-label="Síntesis de la lectura" className="space-y-3">
      <div className="rounded-[var(--radius-card-md)] border border-line-soft bg-parchment p-5">
        <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-cosmic mb-3">
          Síntesis de la lectura
        </p>

        <p className="font-body text-[15px] leading-[1.8] text-ink">{synthesis.text}</p>

        <div className="mt-4 border-l-2 border-cosmic/40 pl-3">
          <p className="font-display text-[15px] italic text-ink">{synthesis.reflectionQuestion}</p>
        </div>
      </div>

      <div className="rounded-[var(--radius-card-sm)] border border-cosmic/20 bg-cosmic/5 p-4">
        <p className="font-body text-[13px] text-ink-soft leading-[1.6]">
          La lectura de tarot es una herramienta de reflexión. Los símbolos pueden significar
          diferentes cosas según tu contexto y criterio personal.
        </p>
      </div>
    </section>
  );
}
