import { useEffect, useState } from "react";
import { readReversalsPreference, writeReversalsPreference } from "@/lib/tarot/card-selection";

/** Preferencias no sensibles del dispositivo; no se sincronizan ni se envían a analytics. */
export function TarotPreferences() {
  const [reversalsEnabled, setReversalsEnabled] = useState(true);

  useEffect(() => {
    setReversalsEnabled(readReversalsPreference());
  }, []);

  const handleChange = (enabled: boolean) => {
    setReversalsEnabled(enabled);
    writeReversalsPreference(enabled);
  };

  return (
    <section
      aria-labelledby="tarot-preferences-title"
      className="rounded-[var(--radius-card-lg)] border border-line-soft bg-warm-white p-5 md:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="tarot-preferences-title" className="font-display text-[20px] text-ink">
            Personaliza tu lectura
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
            Las cartas invertidas añaden una segunda perspectiva simbólica. Puedes cambiar esta
            opción cuando quieras; se guarda únicamente en este dispositivo.
          </p>
        </div>
        <label className="inline-flex shrink-0 cursor-pointer items-center gap-3 text-sm font-medium text-ink">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-line accent-cosmic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic/50"
            checked={reversalsEnabled}
            onChange={(event) => handleChange(event.target.checked)}
          />
          <span>Usar cartas invertidas</span>
        </label>
      </div>
      <p className="mt-4 text-xs text-ink-muted" aria-live="polite">
        {reversalsEnabled
          ? "Las tiradas pueden mostrar cartas al derecho o invertidas."
          : "Las tiradas mostrarán todas las cartas al derecho."}
      </p>
    </section>
  );
}
