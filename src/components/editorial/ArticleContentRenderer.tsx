import type { ArticleContentBlock } from "@/types/editorial";
import { calloutStyles, disclaimers } from "@/config/editorial";
import { cn } from "@/lib/utils";

interface Props {
  blocks: ArticleContentBlock[];
}

/** Renderer único para bloques de contenido estructurado. */
export function ArticleContentRenderer({ blocks }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((b, i) => (
        <BlockRenderer key={i} block={b} />
      ))}
    </div>
  );
}

function BlockRenderer({ block }: { block: ArticleContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p className="font-body text-[17px] leading-[1.75] text-ink-soft">{block.text}</p>;
    case "heading": {
      const Tag = `h${block.level}` as unknown as keyof React.JSX.IntrinsicElements;
      const size =
        block.level === 2
          ? "text-[26px] md:text-[30px]"
          : block.level === 3
            ? "text-[21px] md:text-[24px]"
            : "text-[18px] md:text-[20px]";
      return (
        <Tag id={block.id} className={cn("scroll-mt-24 font-display font-semibold text-ink", size)}>
          {block.text}
        </Tag>
      );
    }
    case "list": {
      const Tag = block.style === "ordered" ? "ol" : "ul";
      return (
        <Tag
          className={cn(
            "ml-5 flex flex-col gap-2 font-body text-[17px] leading-[1.7] text-ink-soft",
            block.style === "ordered" ? "list-decimal" : "list-disc",
          )}
        >
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </Tag>
      );
    }
    case "quote":
      return (
        <blockquote className="border-l-4 border-l-brand pl-5 font-display text-[19px] italic leading-[1.55] text-ink">
          <p>{block.text}</p>
          {block.attribution && (
            <cite className="mt-2 block font-body text-[13px] not-italic text-ink-muted">
              — {block.attribution}
            </cite>
          )}
        </blockquote>
      );
    case "callout": {
      const style = calloutStyles[block.variant] ?? calloutStyles.context;
      return (
        <aside
          className={cn(
            "rounded-[var(--radius-card)] border border-line bg-ivory p-5 border-l-4",
            style.border,
          )}
        >
          <p className="font-body text-[12px] font-medium uppercase tracking-[0.08em] text-ink-muted">
            {block.title ?? style.label}
          </p>
          <p className="mt-2 font-body text-[16px] leading-[1.65] text-ink-soft">{block.content}</p>
        </aside>
      );
    }
    case "image":
      return (
        <figure className="flex flex-col gap-2">
          <img
            src={block.image_url}
            alt={block.alt}
            loading="lazy"
            className="w-full rounded-[var(--radius-card)]"
          />
          {(block.caption || block.credit) && (
            <figcaption className="font-body text-[13px] text-ink-muted">
              {block.caption}
              {block.credit ? ` — ${block.credit}` : ""}
            </figcaption>
          )}
        </figure>
      );
    case "divider":
      return <hr className="border-line" />;
    case "key_points":
      return (
        <aside className="rounded-[var(--radius-card)] border border-line bg-warm-white p-5">
          {block.title && (
            <p className="font-display text-[16px] font-semibold text-ink">{block.title}</p>
          )}
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 font-body text-[15px] leading-[1.65] text-ink-soft">
            {block.items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        </aside>
      );
    case "disclaimer": {
      const d = disclaimers[block.disclaimer_key] ?? disclaimers.general;
      return (
        <aside
          role="note"
          className="rounded-[var(--radius-card)] border border-dashed border-line bg-ivory p-4"
        >
          <p className="font-body text-[12px] font-medium uppercase tracking-[0.08em] text-ink-muted">
            {d.title}
          </p>
          <p className="mt-1 font-body text-[14px] leading-[1.6] text-ink-soft">{d.body}</p>
        </aside>
      );
    }
    default:
      return null;
  }
}
