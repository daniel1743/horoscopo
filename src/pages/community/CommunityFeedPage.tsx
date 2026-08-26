import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { CommunityPostComposer } from "@/components/community/CommunityPostComposer";
import { ReportPostButton } from "@/components/community/ReportPostButton";
import { listPublicCommunityPosts } from "@/lib/account/repository";
import { routes } from "@/config/routes";

type FeedFilter = "all" | "horoscope" | "moon" | "tarot" | "reflection" | "compatibility";

const filters: readonly { value: FeedFilter; label: string }[] = [
  { value: "all", label: "Todo el muro" },
  { value: "horoscope", label: "Horóscopo" },
  { value: "moon", label: "Luna" },
  { value: "tarot", label: "Tarot" },
  { value: "reflection", label: "Reflexiones" },
  { value: "compatibility", label: "Compatibilidad" },
];

export function CommunityFeedPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FeedFilter>("all");
  const query = useQuery({
    queryKey: ["community", "public-posts"],
    queryFn: () => listPublicCommunityPosts(30),
    staleTime: 1000 * 60,
  });
  const posts = useMemo(
    () => (query.data ?? []).filter((post) => filter === "all" || post.post_type === filter),
    [filter, query.data],
  );

  return (
    <PageShell breadcrumbs={[{ label: "Inicio", href: routes.home }, { label: "Comunidad" }]}>
      <PageHeader
        eyebrow="Comunidad Creovision"
        title="Un muro para compartir lo que te hizo pensar"
        description="Publicaciones breves sobre horóscopo, Tarot, Luna y reflexión personal. Comparte solo lo que quieras hacer público."
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div
            className="flex gap-2 overflow-x-auto border-b border-line pb-3"
            role="tablist"
            aria-label="Filtrar publicaciones"
          >
            {filters.map((item) => {
              const active = filter === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(item.value)}
                  className={`shrink-0 rounded-full px-3 py-2 font-body text-[12px] font-medium transition ${
                    active
                      ? "bg-brand text-white"
                      : "border border-line text-ink-soft hover:border-brand/40 hover:text-brand"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {query.isLoading && (
            <div className="mt-6 space-y-4" aria-live="polite">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-48 animate-pulse rounded-[var(--radius-card-lg)] bg-parchment"
                />
              ))}
            </div>
          )}
          {query.isError && (
            <div className="mt-6 rounded-[var(--radius-card-lg)] border border-line bg-ivory/60 p-6">
              <h2 className="font-display text-[20px] font-semibold text-ink">
                El muro está preparando su primera conversación
              </h2>
              <p className="mt-2 font-body text-[14px] leading-[1.6] text-ink-soft">
                La comunidad todavía no está disponible en este entorno. Cuando la migración social
                esté aplicada, aquí aparecerán las publicaciones públicas.
              </p>
            </div>
          )}
          {!query.isLoading && !query.isError && posts.length === 0 && (
            <div className="mt-6 rounded-[var(--radius-card-lg)] border border-dashed border-line bg-ivory/60 p-8 text-center">
              <h2 className="font-display text-[21px] font-semibold text-ink">
                Todavía no hay publicaciones en esta vista
              </h2>
              <p className="mx-auto mt-2 max-w-[46ch] font-body text-[14px] leading-[1.6] text-ink-soft">
                Sé de las primeras personas en compartir una observación con contexto y respeto.
              </p>
            </div>
          )}
          <div className="mt-6 space-y-4">
            {posts.map((post) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                footer={
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-body text-[12px] text-ink-muted">
                      Comparte una idea, no una certeza absoluta.
                    </span>
                    <ReportPostButton postId={post.id} />
                  </div>
                }
              />
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <CommunityPostComposer
            onPublished={() =>
              queryClient.invalidateQueries({ queryKey: ["community", "public-posts"] })
            }
          />
          <div className="rounded-[var(--radius-card-lg)] border border-line bg-ivory/60 p-5">
            <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
              Acuerdos del muro
            </p>
            <h2 className="mt-2 font-display text-[20px] font-semibold text-ink">
              Una comunidad que deja espacio
            </h2>
            <p className="mt-2 font-body text-[13px] leading-[1.65] text-ink-soft">
              Comparte desde tu experiencia, evita datos privados y recuerda que una lectura
              simbólica es una invitación a reflexionar, no una orden.
            </p>
            <Link
              to={routes.method}
              className="mt-4 inline-flex font-body text-[13px] font-medium text-brand underline underline-offset-4"
            >
              Conoce nuestro método
            </Link>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
