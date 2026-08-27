import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useSession } from "@/hooks/useSession";
import { fetchPublicProfileFollowStats, setPublicProfileFollow } from "@/lib/account/repository";
import { toast } from "sonner";

export function ProfileFollowButton({ username }: { username: string }) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const statsQuery = useQuery({
    queryKey: ["community", "profile-follow-stats", username],
    queryFn: () => fetchPublicProfileFollowStats(username),
    staleTime: 1000 * 30,
  });

  if (statsQuery.isLoading || !statsQuery.data) return null;
  const stats = statsQuery.data;

  async function changeFollow(nextFollowed: boolean) {
    setBusy(true);
    try {
      const changed = await setPublicProfileFollow({ username, followed: nextFollowed });
      if (!changed) {
        toast.error("No pudimos actualizar este seguimiento.");
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: ["community", "profile-follow-stats", username],
      });
    } catch {
      toast.error("No pudimos actualizar este seguimiento.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3" aria-label={`Seguimiento de ${username}`}>
      <div className="flex gap-3 text-xs text-ink-soft">
        <span>
          <strong className="font-semibold text-ink">{stats.followers_count}</strong> seguidores
        </span>
        <span>
          <strong className="font-semibold text-ink">{stats.following_count}</strong> siguiendo
        </span>
      </div>
      {user ? (
        <Button
          type="button"
          size="sm"
          variant={stats.followed_by_viewer ? "outline" : "secondary"}
          onClick={() => void changeFollow(!stats.followed_by_viewer)}
          disabled={busy}
        >
          {busy ? "Actualizando…" : stats.followed_by_viewer ? "Siguiendo" : "Seguir"}
        </Button>
      ) : (
        <Button asChild type="button" size="sm" variant="outline">
          <Link
            to={routes.signIn}
            search={{
              redirect: typeof window !== "undefined" ? window.location.pathname : routes.community,
              mode: "signin",
            }}
          >
            Inicia sesión para seguir
          </Link>
        </Button>
      )}
    </div>
  );
}
