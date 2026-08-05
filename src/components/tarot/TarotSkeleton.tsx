import { useEffect, useState } from "react";

export function TarotSkeleton({ label = "Preparando lectura" }: { label?: string }) {
  const [waitLevel, setWaitLevel] = useState<"normal" | "slow" | "stalled">("normal");

  useEffect(() => {
    const slowTimer = window.setTimeout(() => setWaitLevel("slow"), 2000);
    const stalledTimer = window.setTimeout(() => setWaitLevel("stalled"), 8000);
    return () => {
      window.clearTimeout(slowTimer);
      window.clearTimeout(stalledTimer);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 py-12">
      <div className="h-[240px] w-[160px] animate-pulse rounded-[var(--radius-card-md)] bg-line-soft" />
      <span className="font-body text-[13px] text-ink-soft">{label}…</span>
      {waitLevel === "slow" && (
        <span className="max-w-sm text-center font-body text-[13px] leading-[1.6] text-ink-soft">
          La conexión está tardando más de lo habitual. La vista continuará cuando llegue la
          respuesta.
        </span>
      )}
      {waitLevel === "stalled" && (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full border border-cosmic/30 px-4 py-2 font-body text-[13px] font-medium text-cosmic transition-colors hover:bg-cosmic/10"
        >
          Reintentar carga
        </button>
      )}
    </div>
  );
}
