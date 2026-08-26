import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AccountShell } from "@/components/account/AccountShell";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import {
  deleteCommunityPost,
  listOwnCommunityPosts,
  updateCommunityPostStatus,
  type CommunityPost,
} from "@/lib/account/repository";
import { communityPostTypeLabels } from "@/config/community";
import { routes } from "@/config/routes";
import { toast } from "sonner";

function statusLabel(post: CommunityPost) {
  if (post.status === "hidden") return "Oculta";
  if (post.visibility === "private") return "Privada";
  return "Publicada";
}

export function MyPostsPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["community", "my-posts", user?.id],
    queryFn: () => listOwnCommunityPosts(user!.id),
    enabled: !!user,
    staleTime: 1000 * 30,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["community", "my-posts", user?.id] });
  const changeStatus = async (post: CommunityPost, status: "published" | "hidden") => {
    if (!user) return;
    try {
      await updateCommunityPostStatus(user.id, post.id, status);
      toast.success(
        status === "hidden" ? "Publicación ocultada." : "Publicación visible en el muro.",
      );
      refresh();
    } catch {
      toast.error("No pudimos actualizar esta publicación.");
    }
  };
  const remove = async (post: CommunityPost) => {
    if (!user || !window.confirm("¿Eliminar esta publicación? Esta acción no se puede deshacer."))
      return;
    try {
      await deleteCommunityPost(user.id, post.id);
      toast.success("Publicación eliminada.");
      refresh();
    } catch {
      toast.error("No pudimos eliminar esta publicación.");
    }
  };

  return (
    <AccountShell
      title="Mis publicaciones"
      description="Revisa y controla lo que decidiste compartir con la comunidad."
    >
      <div className="mb-6 rounded-[var(--radius-card)] border border-brand/20 bg-brand-soft/30 p-4">
        <p className="font-body text-[13px] leading-[1.6] text-ink-soft">
          Publicar es voluntario. Puedes ocultar una publicación para retirarla del muro sin
          perderla de tu espacio, o eliminarla definitivamente.
        </p>
        <Link
          to={routes.community}
          className="mt-3 inline-flex font-body text-[13px] font-medium text-brand underline underline-offset-4"
        >
          Ir al muro comunitario
        </Link>
      </div>
      {query.isLoading && (
        <p className="font-body text-[14px] text-ink-soft">Cargando tus publicaciones…</p>
      )}
      {query.isError && (
        <p className="rounded-[var(--radius-card)] border border-line bg-ivory/60 p-5 font-body text-[14px] text-ink-soft">
          Tus publicaciones todavía no están disponibles en este entorno. Comprueba que la migración
          social esté aplicada.
        </p>
      )}
      {!query.isLoading && !query.isError && query.data?.length === 0 && (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-ivory/60 p-6">
          <h2 className="font-display text-[20px] font-semibold text-ink">
            Todavía no has publicado
          </h2>
          <p className="mt-2 font-body text-[14px] leading-[1.6] text-ink-soft">
            Cuando quieras compartir una lectura o reflexión, podrás gestionarla desde aquí.
          </p>
        </div>
      )}
      <div className="space-y-4">
        {query.data?.map((post) => (
          <article
            key={post.id}
            className="rounded-[var(--radius-card)] border border-line bg-warm-white p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-brand-soft px-2.5 py-1 font-body text-[11px] font-medium uppercase tracking-[0.08em] text-brand">
                {communityPostTypeLabels[post.post_type]}
              </span>
              <span className="font-body text-[12px] text-ink-muted">{statusLabel(post)}</span>
            </div>
            {post.title && (
              <h2 className="mt-4 font-display text-[20px] font-semibold text-ink">{post.title}</h2>
            )}
            <p className="mt-2 whitespace-pre-wrap font-body text-[14px] leading-[1.7] text-ink">
              {post.body}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {post.status === "published" && post.visibility === "public" ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => changeStatus(post, "hidden")}
                >
                  Ocultar del muro
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => changeStatus(post, "published")}
                >
                  Volver a publicar
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={() => remove(post)}>
                Eliminar
              </Button>
            </div>
          </article>
        ))}
      </div>
    </AccountShell>
  );
}
