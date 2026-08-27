import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { routes } from "@/config/routes";
import { useSession } from "@/hooks/useSession";
import {
  createCommunityComment,
  deleteOwnCommunityComment,
  listPublicCommunityComments,
} from "@/lib/account/repository";
import { ReportCommentButton } from "@/components/community/ReportCommentButton";
import { toast } from "sonner";

export function CommunityPostComments({ postId }: { postId: string }) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const commentsQuery = useQuery({
    queryKey: ["community", "comments", postId],
    queryFn: () => listPublicCommunityComments(postId),
    enabled: open,
    staleTime: 1000 * 30,
  });

  async function submit() {
    if (!user) return;
    setBusy(true);
    try {
      await createCommunityComment({ postId, userId: user.id, body });
      setBody("");
      await queryClient.invalidateQueries({ queryKey: ["community", "comments", postId] });
      toast.success("Comentario publicado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No pudimos publicar el comentario.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(commentId: string) {
    if (!user) return;
    setBusy(true);
    try {
      await deleteOwnCommunityComment({ commentId, userId: user.id });
      await queryClient.invalidateQueries({ queryKey: ["community", "comments", postId] });
      toast.success("Comentario eliminado");
    } catch {
      toast.error("No pudimos eliminar el comentario.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border-t border-line/70 pt-3" aria-label="Comentarios de la publicación">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        {open ? "Ocultar comentarios" : "Ver comentarios"}
        {open && commentsQuery.data ? ` · ${commentsQuery.data.length}` : ""}
      </Button>
      {open && (
        <div className="mt-3 space-y-4">
          {commentsQuery.isLoading && (
            <p className="text-xs text-ink-muted">Cargando comentarios…</p>
          )}
          {commentsQuery.isError && (
            <p className="rounded-xl border border-dashed border-line px-3 py-2 text-xs leading-5 text-ink-soft">
              Los comentarios estarán disponibles cuando la configuración social esté aplicada en
              Supabase.
            </p>
          )}
          {!commentsQuery.isLoading &&
            !commentsQuery.isError &&
            commentsQuery.data?.length === 0 && (
              <p className="text-xs text-ink-muted">
                Todavía no hay comentarios. Abre la conversación.
              </p>
            )}
          <ul className="space-y-3">
            {(commentsQuery.data ?? []).map((comment) => (
              <li key={comment.id} className="rounded-xl bg-ivory/70 px-3 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link
                    to={`/perfil/${comment.author_username}` as never}
                    className="text-xs font-semibold text-ink hover:text-brand"
                  >
                    {comment.author_display_name || `@${comment.author_username}`}
                  </Link>
                  <time dateTime={comment.created_at} className="text-[11px] text-ink-muted">
                    {new Date(comment.created_at).toLocaleString()}
                  </time>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink-soft">
                  {comment.body}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {user && comment.owned_by_viewer && (
                    <button
                      type="button"
                      className="text-[11px] font-medium text-ink-muted underline underline-offset-2 hover:text-ink"
                      onClick={() => void remove(comment.id)}
                      disabled={busy}
                    >
                      Eliminar
                    </button>
                  )}
                  <ReportCommentButton commentId={comment.id} />
                </div>
              </li>
            ))}
          </ul>
          {user ? (
            <div className="space-y-2">
              <label htmlFor={`comment-${postId}`} className="text-xs font-medium text-ink">
                Añadir comentario
              </label>
              <Textarea
                id={`comment-${postId}`}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Aporta una observación respetuosa…"
                maxLength={1000}
                rows={3}
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-ink-muted">{body.length}/1000</span>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => void submit()}
                  disabled={busy || !body.trim()}
                >
                  {busy ? "Publicando…" : "Publicar comentario"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs leading-5 text-ink-soft">
              <Link
                to={routes.signIn}
                search={{
                  redirect:
                    typeof window !== "undefined" ? window.location.pathname : routes.community,
                  mode: "signin",
                }}
                className="font-medium text-brand underline underline-offset-2"
              >
                Inicia sesión
              </Link>{" "}
              para participar en la conversación.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
