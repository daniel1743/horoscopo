import type { ArticleContentBlock } from "@/types/editorial";

interface Props {
  blocks: ArticleContentBlock[];
}

/** Tabla de contenidos derivada de bloques heading nivel 2 y 3. */
export function TableOfContents({ blocks }: Props) {
  const items = blocks.flatMap((b) =>
    b.type === "heading" && (b.level === 2 || b.level === 3)
      ? [{ id: b.id, text: b.text, level: b.level }]
      : [],
  );
  if (items.length === 0) return null;
  return (
    <nav
      aria-label="Tabla de contenidos"
      className="rounded-[var(--radius-card)] border border-line bg-warm-white p-5"
    >
      <p className="font-body text-[12px] font-medium uppercase tracking-[0.08em] text-ink-muted">
        En este artículo
      </p>
      <ol className="mt-3 flex flex-col gap-2 font-body text-[14px] leading-[1.5]">
        {items.map((it) => (
          <li key={it.id} className={it.level === 3 ? "pl-3" : ""}>
            <a
              href={`#${it.id}`}
              className="text-ink-soft transition-colors hover:text-brand focus-visible:text-brand focus-visible:outline-none"
            >
              {it.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
