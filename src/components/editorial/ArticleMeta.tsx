import type { EditorialArticle, EditorialAuthor, EditorialCategory } from "@/types/editorial";
import { AuthorBlock } from "./AuthorBlock";
import { Link } from "@tanstack/react-router";
import { categoryRoute } from "@/config/routes";

interface Props {
  article: EditorialArticle;
  author: EditorialAuthor;
  category: EditorialCategory;
}

const formatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function ArticleMeta({ article, author, category }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-body text-[13px] text-ink-muted">
      <Link
        to={categoryRoute(category.slug) as string}
        className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-brand hover:text-brand-dark"
      >
        {category.label}
      </Link>
      <AuthorBlock author={author} compact />
      {article.publishedAt && (
        <time dateTime={article.publishedAt}>
          {formatter.format(new Date(article.publishedAt))}
        </time>
      )}
      {article.readingTime && <span>{article.readingTime} min de lectura</span>}
      {article.isDemo && (
        <span className="rounded-full bg-accent-lunar-gold/20 px-2 py-0.5 text-[11px] font-medium text-ink">
          Demostración
        </span>
      )}
    </div>
  );
}
