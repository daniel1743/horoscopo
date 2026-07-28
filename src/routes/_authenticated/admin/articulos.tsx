import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  adminListArticles,
  adminListCategoriesAndAuthors,
} from "@/lib/admin/articles.functions";
import { WORKFLOW_LABEL, type WorkflowState } from "@/lib/admin/workflow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/articulos")({
  head: () => ({
    meta: [
      { title: "Artículos — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ArticlesListPage,
});

function ArticlesListPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"all" | "draft" | "published" | "archived">("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const listFn = useServerFn(adminListArticles);
  const query = useQuery({
    queryKey: ["admin", "articles", { page, status, search }],
    queryFn: () => listFn({ data: { page, pageSize: 20, status, search } }),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h2 text-ink">Artículos</h1>
          <p className="text-caption text-ink-soft">
            Gestión editorial. Los cambios se guardan como borrador y siguen el
            flujo de revisión antes de publicarse.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/articulos/nuevo">Nuevo artículo</Link>
        </Button>
      </header>

      <form
        className="flex flex-wrap items-center gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(searchInput);
          setPage(1);
        }}
      >
        <Input
          placeholder="Buscar por título o slug…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as any);
            setPage(1);
          }}
          className="h-9 rounded-[var(--radius-control)] border border-line bg-warm-white px-3 text-sm"
        >
          <option value="all">Todos</option>
          <option value="draft">Borradores</option>
          <option value="published">Publicados</option>
          <option value="archived">Archivados</option>
        </select>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
      </form>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-warm-white">
        <table className="w-full text-sm">
          <thead className="bg-brand-soft/40 text-left text-caption uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="p-3">Título</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Workflow</th>
              <th className="p-3">Actualizado</th>
              <th className="p-3">v</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {query.isLoading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-ink-soft">
                  Cargando…
                </td>
              </tr>
            ) : query.error ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-red-600">
                  {(query.error as Error).message}
                </td>
              </tr>
            ) : (query.data?.items ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-ink-soft">
                  Sin resultados.
                </td>
              </tr>
            ) : (
              query.data!.items.map((a: any) => (
                <tr key={a.id} className="border-t border-line">
                  <td className="p-3">
                    <div className="font-medium text-ink">{a.title}</div>
                    <div className="text-caption text-ink-soft">/{a.slug}</div>
                  </td>
                  <td className="p-3">
                    <Badge variant={a.status === "published" ? "blue" : "neutral"}>
                      {a.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-ink-soft">
                    {WORKFLOW_LABEL[a.workflow_state as WorkflowState] ?? a.workflow_state}
                  </td>
                  <td className="p-3 text-ink-soft">
                    {new Date(a.updated_at).toLocaleString()}
                  </td>
                  <td className="p-3 tabular-nums text-ink-soft">{a.version}</td>
                  <td className="p-3 text-right">
                    <Link
                      to="/admin/articulos/$id"
                      params={{ id: a.id }}
                      className="text-brand-strong hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-ink-soft">
        <span>
          Página {query.data?.page ?? 1} · {query.data?.total ?? 0} artículos
        </span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={
              !query.data ||
              query.data.page * query.data.pageSize >= (query.data.total ?? 0)
            }
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
