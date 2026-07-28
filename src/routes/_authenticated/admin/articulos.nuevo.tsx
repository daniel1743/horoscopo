import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  adminCreateArticle,
  adminListCategoriesAndAuthors,
} from "@/lib/admin/articles.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/articulos/nuevo")({
  head: () => ({
    meta: [
      { title: "Nuevo artículo — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NewArticlePage,
});

function NewArticlePage() {
  const navigate = useNavigate();
  const listCatsFn = useServerFn(adminListCategoriesAndAuthors);
  const createFn = useServerFn(adminCreateArticle);

  const { data: catalog } = useQuery({
    queryKey: ["admin", "catalog"],
    queryFn: () => listCatsFn({ data: undefined }),
  });

  const [form, setForm] = useState({
    slug: "",
    title: "",
    excerpt: "",
    categoryId: "",
    authorId: "",
  });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => createFn({ data: form }),
    onSuccess: (data) => navigate({ to: "/admin/articulos/$id", params: { id: data.id } }),
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-h2 text-ink">Nuevo artículo</h1>
        <p className="text-caption text-ink-soft">
          Crea un borrador. Podrás editarlo, someterlo a revisión y publicarlo desde la
          siguiente pantalla.
        </p>
      </header>

      <form
        className="space-y-4 rounded-[var(--radius-card)] border border-line bg-warm-white p-6"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          mutation.mutate();
        }}
      >
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Título</span>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            minLength={3}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Slug</span>
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="ej: significado-luna-nueva"
            pattern="[a-z0-9-]{3,120}"
            required
          />
          <span className="mt-1 block text-caption text-ink-soft">
            Sólo minúsculas, números y guiones. Entre 3 y 120 caracteres.
          </span>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Resumen (excerpt)</span>
          <Textarea
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            required
            minLength={20}
            rows={3}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Categoría</span>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
              className="block h-9 w-full rounded-[var(--radius-control)] border border-line bg-warm-white px-3"
            >
              <option value="">Selecciona…</option>
              {catalog?.categories.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Autor</span>
            <select
              value={form.authorId}
              onChange={(e) => setForm({ ...form, authorId: e.target.value })}
              required
              className="block h-9 w-full rounded-[var(--radius-control)] border border-line bg-warm-white px-3"
            >
              <option value="">Selecciona…</option>
              {catalog?.authors.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <p className="rounded-[var(--radius-control)] bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex gap-3">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creando…" : "Crear borrador"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate({ to: "/admin/articulos" })}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
