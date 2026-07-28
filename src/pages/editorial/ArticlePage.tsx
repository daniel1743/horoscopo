import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { articleRoute, categoryRoute, routes } from "@/config/routes";
import { ArticleContentRenderer } from "@/components/editorial/ArticleContentRenderer";
import { ArticleMeta } from "@/components/editorial/ArticleMeta";
import { AuthorBlock } from "@/components/editorial/AuthorBlock";
import { ShareBar } from "@/components/editorial/ShareBar";
import { TableOfContents } from "@/components/editorial/TableOfContents";
import { ReadingProgress } from "@/components/editorial/ReadingProgress";
import { RelatedArticles } from "@/components/editorial/RelatedArticles";
import { disclaimers } from "@/config/editorial";
import type { ArticleWithRelations, EditorialArticle, EditorialCategory } from "@/types/editorial";

interface Props {
  article: ArticleWithRelations;
  related: EditorialArticle[];
  categoriesById: Map<string, EditorialCategory>;
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function ArticlePage({ article, related, categoriesById }: Props) {
  const disclaimer = article.disclaimerKey
    ? (disclaimers[article.disclaimerKey] ?? disclaimers.general)
    : null;

  return (
    <>
      <ReadingProgress />
      <PageShell
        width="reading"
        breadcrumbs={[
          { label: "Inicio", href: routes.home },
          { label: "Guías", href: routes.guides },
          { label: article.category.label, href: categoryRoute(article.category.slug) },
          { label: article.title, href: articleRoute(article.slug) },
        ]}
      >
        <PageHeader
          eyebrow={article.category.label}
          title={article.title}
          description={article.subtitle ?? article.excerpt}
        />

        <ArticleMeta article={article} author={article.author} category={article.category} />

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
          <article className="flex flex-col gap-8">
            {article.imageUrl && (
              <img
                src={article.imageUrl}
                alt={article.imageAlt ?? article.title}
                className="w-full rounded-[var(--radius-card-lg)]"
                loading="eager"
              />
            )}

            <ArticleContentRenderer blocks={article.content} />

            {article.sources.length > 0 && (
              <section
                aria-labelledby="sources-title"
                className="rounded-[var(--radius-card)] border border-line bg-warm-white p-5"
              >
                <h2 id="sources-title" className="font-display text-[18px] font-semibold text-ink">
                  Referencias
                </h2>
                <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 font-body text-[14px] leading-[1.6] text-ink-soft">
                  {article.sources.map((s, i) => (
                    <li key={i}>
                      {s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-brand"
                        >
                          {s.label}
                        </a>
                      ) : (
                        s.label
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {disclaimer && (
              <aside
                role="note"
                className="rounded-[var(--radius-card)] border border-dashed border-line bg-ivory p-4"
              >
                <p className="font-body text-[12px] font-medium uppercase tracking-[0.08em] text-ink-muted">
                  {disclaimer.title}
                </p>
                <p className="mt-1 font-body text-[14px] leading-[1.6] text-ink-soft">
                  {disclaimer.body}
                </p>
              </aside>
            )}

            {article.reviewDate && (
              <p className="font-body text-[13px] text-ink-muted">
                Revisado{article.reviewedBy ? ` por ${article.reviewedBy}` : ""} el{" "}
                <time dateTime={article.reviewDate}>
                  {dateFormatter.format(new Date(article.reviewDate))}
                </time>
                .
              </p>
            )}

            <ShareBar title={article.title} path={articleRoute(article.slug)} />
            <AuthorBlock author={article.author} />
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents blocks={article.content} />
            </div>
          </aside>
        </div>

        <div className="mt-16">
          <RelatedArticles articles={related} categoriesById={categoriesById} />
        </div>
      </PageShell>
    </>
  );
}
