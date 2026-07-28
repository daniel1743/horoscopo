import { tarotDisclaimer } from "@/config/tarot";
import { Icon } from "@/components/ui/icon";

export function TarotReadingDisclaimer() {
  return (
    <aside
      role="note"
      className="mt-8 flex items-start gap-3 rounded-[var(--radius-card-md)] border border-line-soft bg-parchment p-4"
    >
      <Icon name="premium" className="mt-[2px] h-4 w-4 shrink-0 text-cosmic" />
      <p className="font-body text-[13px] leading-[1.6] text-ink-soft">{tarotDisclaimer}</p>
    </aside>
  );
}
