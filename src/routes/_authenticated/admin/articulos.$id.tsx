import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  adminGetArticle,
  adminUpdateArticle,
  adminTransitionWorkflow,
  adminPublishArticle,
  adminListRevisions,
  adminRestoreRevision,
  adminListCategoriesAndAuthors,
} from "@/lib/admin/articles.functions";
import { useAdminRoles } from "@/hooks/useAdminRoles";
import { PUBLISHER_ROLES, APPROVER_ROLES } from "@/lib/admin/roles";
import {
  WORKFLOW_LABEL,
  WORKFLOW_TRANSITIONS,
  canTransition,
  type WorkflowState,
} from "@/lib/admin/workflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/articulos/$id")({
  head: () => ({
    meta: [{ title: "Editar artículo — Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: EditArticlePage,
});

interface ArticleFormState {
  title: string;
  subtitle: string;
  excerpt: string;
  slug: string;
  categoryId: string;
  authorId: string;
  imageUrl: string;
  imageAlt: string;
  tags: string;
  featured: boolean;
  homeFeatured: boolean;
  readingTime: string | number;
}

function EditArticlePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { hasAny } = useAdminRoles();
  const canPublish = hasAny(PUBLISHER_ROLES);
  const canApprove = hasAny(APPROVER_ROLES);

  const getFn = useServerFn(adminGetArticle);
  const updateFn = useServerFn(adminUpdateArticle);
  const transitionFn = useServerFn(adminTransitionWorkflow);
  const publishFn = useServerFn(adminPublishArticle);
  const listCatsFn = useServerFn(adminListCategoriesAndAuthors);
  const listRevisionsFn = useServerFn(adminListRevisions);
  const restoreFn = useServerFn(adminRestoreRevision);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "article", id],
    queryFn: () => getFn({ data: { id } }),
  });
  const { data: catalog } = useQuery({
    queryKey: ["admin", "catalog"],
    queryFn: () => listCatsFn({ data: undefined }),
  });
  const { data: revisions, refetch: refetchRevisions } = useQuery({
    queryKey: ["admin", "article-revisions", id],
    queryFn: () => listRevisionsFn({ data: { id } }),
  });

  const [form, setForm] = useState<ArticleFormState | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [contentJson, setContentJson] = useState<string>("[]");

  useEffect(() => {
    if (data?.article && !form) {
      setForm({
        title: data.article.title,
        subtitle: data.article.subtitle ?? "",
        excerpt: data.article.excerpt,
        slug: data.article.slug,
        categoryId: data.article.category_id,
        authorId: data.article.author_id,
        imageUrl: data.article.image_url ?? "",
        imageAlt: data.article.image_alt ?? "",
        tags: (data.article.tags ?? []).join(", "),
        featured: data.article.featured,
        homeFeatured: data.article.home_featured,
        readingTime: data.article.reading_time ?? "",
      });
      setContentJson(JSON.stringify(data.article.content ?? [], null, 2));
    }
  }, [data, form]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form) throw new Error("FORM_NOT_READY");
      setErrMsg(null);
      let content: unknown;
      try {
        content = JSON.parse(contentJson);
        if (!Array.isArray(content)) throw new Error("El contenido debe ser un array de bloques.");
      } catch (e) {
        throw new Error(`BLOCKER: JSON de contenido inválido — ${(e as Error).message}`);
      }
      return updateFn({
        data: {
          id,
          expectedVersion: data!.article.version,
          expectedUpdatedAt: data!.article.updated_at,
          patch: {
            title: form.title,
            subtitle: form.subtitle || null,
            excerpt: form.excerpt,
            slug: form.slug,
            categoryId: form.categoryId,
            authorId: form.authorId,
            imageUrl: form.imageUrl || null,
            imageAlt: form.imageAlt || null,
            tags: form.tags
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean),
            featured: form.featured,
            homeFeatured: form.homeFeatured,
            readingTime: form.readingTime ? Number(form.readingTime) : null,
            content,
          },
        },
      });
    },
    onSuccess: async () => {
      setFeedback("Guardado.");
      await qc.invalidateQueries({ queryKey: ["admin", "article", id] });
      await refetch();
    },
    onError: (e: Error) => setErrMsg(e.message),
  });

  const transitionMutation = useMutation({
    mutationFn: (to: WorkflowState) => transitionFn({ data: { id, to, note: undefined } }),
    onSuccess: async () => {
      await refetch();
      setFeedback("Workflow actualizado.");
    },
    onError: (e: Error) => setErrMsg(e.message),
  });

  const publishMutation = useMutation({
    mutationFn: (overrideReason?: string) =>
      publishFn({
        data: { id, expectedVersion: data!.article.version, overrideReason },
      }),
    onSuccess: async () => {
      setFeedback("Publicado.");
      await refetch();
    },
    onError: (e: Error) => setErrMsg(e.message),
  });

  const restoreMutation = useMutation({
    mutationFn: (revisionId: string) =>
      restoreFn({
        data: { articleId: id, revisionId, expectedVersion: data!.article.version },
      }),
    onSuccess: async () => {
      setFeedback("Revisión restaurada como borrador.");
      setForm(null);
      await refetch();
      await refetchRevisions();
    },
    onError: (e: Error) => setErrMsg(e.message),
  });

  if (isLoading || !data || !form) return <p className="text-ink-soft">Cargando…</p>;
  if (error) return <p className="text-red-600">{(error as Error).message}</p>;

  const wfState = (data.workflow?.workflow_state ?? "draft") as WorkflowState;
  const nextStates = WORKFLOW_TRANSITIONS[wfState];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h2 text-ink">{data.article.title}</h1>
          <p className="text-caption text-ink-soft">
            /{data.article.slug} · versión {data.article.version} ·{" "}
            <Badge variant="neutral">{data.article.status}</Badge>{" "}
            <Badge>{WORKFLOW_LABEL[wfState]}</Badge>
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link to="/admin/articulos/$id/preview" params={{ id }} target="_blank" rel="noopener">
              Vista previa
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/articulos">Volver</Link>
          </Button>
        </div>
      </header>

      {feedback ? (
        <p className="rounded-[var(--radius-control)] bg-emerald-50 p-3 text-sm text-emerald-800">
          {feedback}
        </p>
      ) : null}
      {errMsg ? (
        <p className="rounded-[var(--radius-control)] bg-red-50 p-3 text-sm text-red-700">
          {errMsg}
        </p>
      ) : null}

      {/* Workflow controls */}
      <section
        aria-label="Flujo editorial"
        className="rounded-[var(--radius-card)] border border-line bg-warm-white p-4"
      >
        <h2 className="text-h4 text-ink">Flujo editorial</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {nextStates.map((to) => {
            if (to === "published") return null; // publish tiene botón dedicado
            const needsApprover = to === "approved";
            const disabled = needsApprover && !canApprove;
            return (
              <Button
                key={to}
                size="sm"
                variant="secondary"
                disabled={disabled || transitionMutation.isPending}
                onClick={() => transitionMutation.mutate(to)}
              >
                → {WORKFLOW_LABEL[to]}
              </Button>
            );
          })}
          {canPublish && canTransition(wfState, "published") ? (
            <Button
              size="sm"
              onClick={() => {
                if (wfState !== "approved") {
                  const reason = window.prompt(
                    "El artículo no está aprobado. Motivo obligatorio para publicar:",
                  );
                  if (!reason) return;
                  publishMutation.mutate(reason);
                } else {
                  publishMutation.mutate(undefined);
                }
              }}
              disabled={publishMutation.isPending}
            >
              Publicar
            </Button>
          ) : null}
        </div>
      </section>

      {/* Form */}
      <form
        className="space-y-4 rounded-[var(--radius-card)] border border-line bg-warm-white p-6"
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Título</span>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Slug</span>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              pattern="[a-z0-9-]{3,120}"
              required
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Subtítulo</span>
          <Input
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Excerpt</span>
          <Textarea
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            rows={3}
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Categoría</span>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="block h-9 w-full rounded-[var(--radius-control)] border border-line bg-warm-white px-3"
              required
            >
              {catalog?.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Autor</span>
            <select
              value={form.authorId}
              onChange={(e) => setForm({ ...form, authorId: e.target.value })}
              className="block h-9 w-full rounded-[var(--radius-control)] border border-line bg-warm-white px-3"
              required
            >
              {catalog?.authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium">URL de imagen</span>
            <Input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Alt de imagen</span>
            <Input
              value={form.imageAlt}
              onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Tags (separados por coma)</span>
          <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Tiempo lectura (min)</span>
            <Input
              type="number"
              min={0}
              value={form.readingTime}
              onChange={(e) => setForm({ ...form, readingTime: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Destacado
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.homeFeatured}
              onChange={(e) => setForm({ ...form, homeFeatured: e.target.checked })}
            />
            Destacado en Home
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Bloques de contenido (JSON array)</span>
          <Textarea
            value={contentJson}
            onChange={(e) => setContentJson(e.target.value)}
            rows={16}
            className="font-mono text-xs"
          />
          <span className="mt-1 block text-caption text-ink-soft">
            Estructura editorial. Un editor visual llegará en una fase posterior.
          </span>
        </label>

        <div className="flex gap-3">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      </form>

      {/* Revisiones */}
      <section
        aria-label="Historial de revisiones"
        className="rounded-[var(--radius-card)] border border-line bg-warm-white p-4"
      >
        <h2 className="text-h4 text-ink">Historial de revisiones</h2>
        <p className="text-caption text-ink-soft">
          Cada guardado crea un snapshot. Restaurar devuelve el artículo a borrador (nunca publica
          automáticamente).
        </p>
        <ul className="mt-3 divide-y divide-line">
          {(revisions ?? []).map((r) => (
            <li key={r.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <span className="font-medium">v{r.version}</span>
                <span className="ml-2 text-ink-soft">
                  {new Date(r.created_at).toLocaleString()}
                </span>
                {r.note ? <span className="ml-2 text-ink-soft">· {r.note}</span> : null}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (
                    window.confirm(
                      `Restaurar la versión ${r.version}? El estado actual se guardará como snapshot y el artículo volverá a borrador.`,
                    )
                  ) {
                    restoreMutation.mutate(r.id);
                  }
                }}
                disabled={restoreMutation.isPending}
              >
                Restaurar
              </Button>
            </li>
          ))}
          {(revisions ?? []).length === 0 ? (
            <li className="py-2 text-caption text-ink-soft">Aún no hay revisiones.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
