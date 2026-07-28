export function TarotSkeleton({ label = "Preparando lectura" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 py-12">
      <div className="h-[240px] w-[160px] animate-pulse rounded-[var(--radius-card-md)] bg-line-soft" />
      <span className="font-body text-[13px] text-ink-soft">{label}…</span>
    </div>
  );
}
