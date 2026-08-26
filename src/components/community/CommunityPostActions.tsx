import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/icon";
import { useSession } from "@/hooks/useSession";
import { toggleCommunityPostLike, toggleCommunityPostRepost } from "@/lib/account/repository";
import { routes } from "@/config/routes";
import { toast } from "sonner";

interface Props {
  postId: string;
  likesCount: number;
  repostsCount: number;
  likedByViewer: boolean;
  repostedByViewer: boolean;
  onChanged?: () => void;
}

export function CommunityPostActions({
  postId,
  likesCount,
  repostsCount,
  likedByViewer,
  repostedByViewer,
  onChanged,
}: Props) {
  const { user } = useSession();
  const [liked, setLiked] = useState(likedByViewer);
  const [reposted, setReposted] = useState(repostedByViewer);
  const [likes, setLikes] = useState(likesCount);
  const [reposts, setReposts] = useState(repostsCount);
  const [busy, setBusy] = useState<"like" | "repost" | null>(null);

  const requireSession = () => {
    toast("Inicia sesión para interactuar con una publicación.", {
      action: { label: "Iniciar sesión", onClick: () => (window.location.href = routes.auth) },
    });
  };

  const handleLike = async () => {
    if (!user) {
      requireSession();
      return;
    }
    const previous = liked;
    setLiked(!previous);
    setLikes((count) => count + (previous ? -1 : 1));
    setBusy("like");
    try {
      await toggleCommunityPostLike({ postId, userId: user.id, liked: previous });
      onChanged?.();
    } catch {
      setLiked(previous);
      setLikes((count) => count + (previous ? 1 : -1));
      toast.error("No pudimos actualizar tu me gusta.");
    } finally {
      setBusy(null);
    }
  };

  const handleRepost = async () => {
    if (!user) {
      requireSession();
      return;
    }
    const previous = reposted;
    setReposted(!previous);
    setReposts((count) => count + (previous ? -1 : 1));
    setBusy("repost");
    try {
      await toggleCommunityPostRepost({ postId, userId: user.id, reposted: previous });
      onChanged?.();
      toast.success(
        previous ? "Republicación retirada." : "Publicación añadida a tus republicaciones.",
      );
    } catch {
      setReposted(previous);
      setReposts((count) => count + (previous ? 1 : -1));
      toast.error("No pudimos actualizar tu republicación.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleLike}
        disabled={busy !== null}
        aria-pressed={liked}
        className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 font-body text-[12px] font-medium transition ${
          liked
            ? "border-brand bg-brand-soft text-brand"
            : "border-line text-ink-soft hover:border-brand/40 hover:text-brand"
        }`}
      >
        <Icon name="favorite" size="sm" aria-hidden />
        {liked ? "Te gusta" : "Me gusta"} · {likes}
      </button>
      <button
        type="button"
        onClick={handleRepost}
        disabled={busy !== null}
        aria-pressed={reposted}
        className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 font-body text-[12px] font-medium transition ${
          reposted
            ? "border-cosmic bg-cosmic/10 text-cosmic"
            : "border-line text-ink-soft hover:border-cosmic/40 hover:text-cosmic"
        }`}
      >
        <Icon name="share" size="sm" aria-hidden />
        {reposted ? "Republicada" : "Republicar"} · {reposts}
      </button>
      {!user && (
        <Link
          to={routes.auth}
          className="font-body text-[12px] text-ink-muted underline underline-offset-2"
        >
          Inicia sesión para guardar tu actividad
        </Link>
      )}
    </div>
  );
}
