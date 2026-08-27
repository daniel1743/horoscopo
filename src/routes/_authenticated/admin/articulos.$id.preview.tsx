import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetArticle } from "@/lib/admin/articles.functions";
import { ArticleContentRenderer } from "@/components/editorial/ArticleContentRenderer";
import type { ArticleContentBlock } from "@/types/editorial";

/**
 * Vista previa privada de un artículo. Reutiliza el renderer público
 * para asegurar paridad visual. noindex+nofollow por meta; la ruta ya
 * cuelga del gate _authenticated + admin, así que sólo miembros con rol
 * pueden verla. No se cachea del lado del servidor (ruta client-only).
 */
export const Route = createFileRoute("/_authenticated/admin/articulos/$id/preview")({
  head: () => ({
    meta: [
      { title: "Vista previa — Admin" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { httpEquiv: "cache-control", content: "no-store" },
    ],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  const { id } = Route.useParams();
  const getFn = useServerFn(adminGetArticle);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "article-preview", id],
    queryFn: () => getFn({ data: { id } }),
    staleTime: 0,
  });

  if (isLoading) return <p className="text-ink-soft">Cargando…</p>;
  if (error) return <p className="text-red-600">{(error as Error).message}</p>;
  if (!data) return null;

  const a = data.article;
  const blocks = Array.isArray(a.content) ? a.content : [];

  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-6 rounded-[var(--radius-control)] border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        Vista previa privada · versión {a.version} · estado <strong>{a.status}</strong>. No
        indexable. Cierra y vuelve al{" "}
        <Link to="/admin/articulos/$id" params={{ id }} className="underline">
          editor
        </Link>
        .
      </div>
      <header className="space-y-3 border-b border-line pb-6">
        <h1 className="text-h1 text-ink">{a.title}</h1>
        {a.subtitle ? <p className="text-h4 text-ink-soft">{a.subtitle}</p> : null}
        <p className="text-body text-ink-soft">{a.excerpt}</p>
      </header>
      <div className="mt-6">
        <ArticleContentRenderer blocks={blocks as unknown as ArticleContentBlock[]} />
      </div>
    </article>
  );
}
