import { Link } from "@tanstack/react-router";
import { articleRoute } from "@/config/routes";
import type { EditorialArticle, EditorialCategory } from "@/types/editorial";

interface Props {
  article: EditorialArticle;
  category?: EditorialCategory | null;
  variant?: "default" | "compact";
}

/** Tarjeta editorial reutilizable para grids y listados. */
export function EditorialCard({ article, category, variant = "default" }: Props) {
  const gradient =
    "linear-gradient(135deg, var(--brand-violet) 0%, var(--bg-deep-night-elevated) 100%)";
  return (
    <Link
      to={articleRoute(article.slug) as string}
      className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card-lg)] border border-line bg-warm-white transition-all outline-none hover:-translate-y-[3px] hover:shadow-[var(--shadow-card-hover)] focus-visible:ring-[3px] focus-visible:ring-brand focus-visible:ring-offset-2"
    >
      <div
        role="img"
        aria-label={article.imageAlt ?? `Ilustración editorial de ${article.title}`}
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={
          article.imageUrl
            ? { backgroundImage: `url(${article.imageUrl})`, backgroundSize: "cover" }
            : { background: gradient }
        }
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 60% at 70% 30%, rgba(255,255,255,0.25) 0%, transparent 65%)",
          }}
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        {category && (
          <span className="inline-flex w-fit items-center rounded-full bg-brand-soft px-3 py-1 font-body text-[11px] font-medium uppercase tracking-[0.06em] text-brand">
            {category.label}
          </span>
        )}
        <h3 className="mt-3 line-clamp-2 font-display text-[19px] font-semibold leading-[1.25] text-ink group-hover:text-brand">
          {article.title}
        </h3>
        {variant !== "compact" && (
          <p className="mt-2 line-clamp-3 font-body text-[14px] leading-[1.6] text-ink-soft">
            {article.excerpt}
          </p>
        )}
        {article.readingTime && (
          <p className="mt-4 font-body text-[12px] text-ink-muted">
            {article.readingTime} min de lectura
          </p>
        )}
      </div>
    </Link>
  );
}
