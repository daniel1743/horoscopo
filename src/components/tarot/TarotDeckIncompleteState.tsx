import { tarotDeckConfig } from "@/config/tarot";
import { Icon } from "@/components/ui/icon";

interface Props {
  count: number;
  minimum: number;
}

export function TarotDeckIncompleteState({ count, minimum }: Props) {
  return (
    <div
      role="status"
      className="rounded-[var(--radius-card-lg)] border border-line-soft bg-parchment p-8 text-center"
    >
      <Icon name="tarot" className="mx-auto h-8 w-8 text-cosmic" />
      <h2 className="mt-4 font-display text-[22px] text-ink">Baraja en preparación</h2>
      <p className="mx-auto mt-3 max-w-md font-body text-[15px] leading-[1.6] text-ink-soft">
        {tarotDeckConfig.incompleteMessage}
      </p>
      <p className="mt-2 font-body text-[13px] text-ink-soft">
        {count} de {minimum} cartas listas.
      </p>
    </div>
  );
}
