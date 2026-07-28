import { Link } from "@tanstack/react-router";
import { authorRoute } from "@/config/routes";
import type { EditorialAuthor } from "@/types/editorial";

interface Props {
  author: EditorialAuthor;
  compact?: boolean;
}

export function AuthorBlock({ author, compact }: Props) {
  if (compact) {
    return (
      <Link
        to={authorRoute(author.slug) as string}
        className="inline-flex items-center gap-2 font-body text-[13px] text-ink-muted hover:text-brand"
      >
        <span
          aria-hidden
          className="grid size-7 place-items-center rounded-full bg-brand-soft font-display text-[12px] font-semibold text-brand"
        >
          {author.name.slice(0, 1)}
        </span>
        {author.name}
      </Link>
    );
  }
  return (
    <aside className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-warm-white p-5 sm:flex-row sm:items-center">
      <span
        aria-hidden
        className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-soft font-display text-[20px] font-semibold text-brand"
      >
        {author.name.slice(0, 1)}
      </span>
      <div className="flex-1">
        <Link
          to={authorRoute(author.slug) as string}
          className="font-display text-[18px] font-semibold text-ink hover:text-brand"
        >
          {author.name}
        </Link>
        {author.roleLabel && (
          <p className="font-body text-[13px] text-ink-muted">{author.roleLabel}</p>
        )}
        {author.bio && (
          <p className="mt-2 font-body text-[14px] leading-[1.6] text-ink-soft">{author.bio}</p>
        )}
      </div>
    </aside>
  );
}
