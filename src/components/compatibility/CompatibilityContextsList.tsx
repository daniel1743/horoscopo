import { COMPATIBILITY_CONTEXTS, COMPATIBILITY_COPY } from "@/config/compatibility";
import type { CompatibilityContexts } from "@/types/compatibility";

interface Props {
  contexts: CompatibilityContexts;
}

export function CompatibilityContextsList({ contexts }: Props) {
  const items = COMPATIBILITY_CONTEXTS.filter((c) => contexts[c.key]);
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="compat-contexts" className="space-y-4">
      <h2
        id="compat-contexts"
        className="font-display text-[24px] md:text-[28px] font-semibold text-ink"
      >
        Cómo puede vivirse en distintos contextos
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((c) => (
          <article
            key={c.key}
            className="rounded-[var(--radius-card)] border border-line-subtle bg-warm-white p-5"
          >
            <h3 className="font-display text-[16px] font-semibold text-ink">{c.label}</h3>
            <p className="mt-2 font-body text-[14px] leading-[1.65] text-ink">{contexts[c.key]}</p>
          </article>
        ))}
      </div>
      <p className="font-body text-[12px] text-ink-soft italic">{COMPATIBILITY_COPY.disclaimer}</p>
    </section>
  );
}
