import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { CommunityPostActions } from "@/components/community/CommunityPostActions";
import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { ProfileFollowButton } from "@/components/community/ProfileFollowButton";
import { getAuraStyle } from "@/config/profile";
import { emptyCommunitySearch, routes, zodiacRoute } from "@/config/routes";
import { getZodiacBySlug } from "@/data/zodiac-signs";
import {
  listPublicProfilePosts,
  listPublicProfileReposts,
  type PublicCommunityPost,
  type PublicCommunityRepost,
  type PublicProfile,
} from "@/lib/account/repository";

interface Props {
  profile: PublicProfile | null;
  backendUnavailable?: boolean;
}

type ProfileStream = "posts" | "reposts";

export function PublicProfilePage({ profile, backendUnavailable = false }: Props) {
  if (backendUnavailable) {
    return (
      <PageShell
        breadcrumbs={[{ label: "Inicio", href: routes.home }, { label: "Perfil público" }]}
      >
        <PageHeader
          eyebrow="Perfil público"
          title="Perfil temporalmente no disponible"
          description="No pudimos conectar con el servicio de perfiles. No se muestran datos privados ni se ha asumido que el perfil sea público."
        />
        <Link
          to={routes.home}
          className="font-body text-[14px] font-medium text-brand underline underline-offset-4"
        >
          Volver al inicio
        </Link>
      </PageShell>
    );
  }

  if (!profile) {
    return (
      <PageShell breadcrumbs={[{ label: "Inicio", href: routes.home }, { label: "Perfil" }]}>
        <PageHeader
          eyebrow="Perfil público"
          title="Perfil no disponible"
          description="Puede que este perfil sea privado o que el enlace ya no exista."
        />
        <Link
          to={routes.home}
          className="font-body text-[14px] font-medium text-brand underline underline-offset-4"
        >
          Volver al inicio
        </Link>
      </PageShell>
    );
  }

  return <PublicProfileContent profile={profile} />;
}

function PublicProfileContent({ profile }: { profile: PublicProfile }) {
  const queryClient = useQueryClient();
  const [stream, setStream] = useState<ProfileStream>("posts");
  const postsQuery = useQuery({
    queryKey: ["community", "profile-posts", profile.username],
    queryFn: () => listPublicProfilePosts(profile.username, 30),
    staleTime: 1000 * 60,
  });
  const repostsQuery = useQuery({
    queryKey: ["community", "profile-reposts", profile.username],
    queryFn: () => listPublicProfileReposts(profile.username, 30),
    staleTime: 1000 * 60,
    enabled: stream === "reposts",
  });
  const activeQuery = stream === "reposts" ? repostsQuery : postsQuery;
  const posts = stream === "reposts" ? (repostsQuery.data ?? []) : (postsQuery.data ?? []);
  const aura = getAuraStyle(profile.aura_style);
  const sign = profile.preferred_sign ? getZodiacBySlug(profile.preferred_sign) : null;
  const displayName = profile.display_name?.trim() || profile.username;

  const refresh = () => {
    void queryClient.invalidateQueries({
      queryKey: ["community", "profile-posts", profile.username],
    });
    void queryClient.invalidateQueries({
      queryKey: ["community", "profile-reposts", profile.username],
    });
  };

  return (
    <PageShell breadcrumbs={[{ label: "Inicio", href: routes.home }, { label: "Perfil público" }]}>
      <section className="overflow-hidden rounded-[var(--radius-card-lg)] border border-line bg-warm-white shadow-card">
        <div className={`relative h-36 bg-gradient-to-r ${aura.className} md:h-48`}>
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 78% 26%, white 0 1px, transparent 2px), radial-gradient(circle at 62% 64%, white 0 1px, transparent 2px), radial-gradient(circle at 36% 28%, white 0 1px, transparent 2px)",
              backgroundSize: "72px 58px, 96px 74px, 110px 86px",
            }}
          />
        </div>
        <div className="relative px-5 pb-6 md:px-8 md:pb-8">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-warm-white bg-night text-3xl font-semibold text-ink-inverse shadow-card sm:h-32 sm:w-32">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={`Avatar de ${displayName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="pb-1">
                <h1 className="font-display text-[28px] font-semibold text-ink md:text-[36px]">
                  {displayName}
                </h1>
                <p className="font-body text-[13px] text-ink-muted">@{profile.username}</p>
              </div>
            </div>
            {sign && (
              <Link
                to={zodiacRoute(sign.slug) as never}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-line px-3 py-2 font-body text-[13px] font-medium text-ink-soft hover:border-brand/40 hover:text-brand"
              >
                <span aria-hidden>{sign.symbol}</span> {sign.name}
              </Link>
            )}
          </div>

          <div className="mt-6 max-w-[68ch]">
            {profile.bio ? (
              <p className="font-body text-[16px] leading-[1.7] text-ink">{profile.bio}</p>
            ) : (
              <p className="font-body text-[15px] text-ink-soft">
                Este perfil todavía está encontrando sus palabras.
              </p>
            )}
            <p className="mt-3 font-body text-[12px] uppercase tracking-[0.12em] text-brand">
              Aura · {aura.label}
            </p>
            {profile.city && (
              <p className="mt-1 font-body text-[13px] text-ink-muted">{profile.city}</p>
            )}
          </div>
          <div className="mt-5">
            <ProfileFollowButton username={profile.username} />
          </div>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="public-wall-title">
        <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-body text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
              Espacio público
            </p>
            <h2
              id="public-wall-title"
              className="mt-1 font-display text-[24px] font-semibold text-ink"
            >
              Muro de {displayName}
            </h2>
          </div>
          <Link
            to={routes.community}
            search={emptyCommunitySearch}
            className="font-body text-[13px] font-medium text-brand underline underline-offset-4"
          >
            Ver comunidad
          </Link>
        </div>
        <div className="mt-5 flex gap-2" role="tablist" aria-label="Contenido del perfil">
          {[
            { value: "posts" as const, label: "Publicaciones" },
            { value: "reposts" as const, label: "Republicaciones" },
          ].map((item) => {
            const active = stream === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStream(item.value)}
                className={`rounded-full px-3 py-2 font-body text-[12px] font-medium transition ${
                  active
                    ? "bg-night text-ink-inverse"
                    : "border border-line text-ink-soft hover:border-night/40 hover:text-ink"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {activeQuery.isLoading && (
          <div
            className="mt-5 h-48 animate-pulse rounded-[var(--radius-card-lg)] bg-parchment"
            aria-live="polite"
          />
        )}
        {activeQuery.isError && (
          <p className="mt-5 rounded-[var(--radius-card-lg)] border border-line bg-ivory/60 p-6 font-body text-[14px] leading-[1.6] text-ink-soft">
            Este muro todavía está preparando sus publicaciones.
          </p>
        )}
        {!activeQuery.isLoading && !activeQuery.isError && posts.length === 0 && (
          <div className="mt-5 rounded-[var(--radius-card-lg)] border border-dashed border-line bg-ivory/60 p-7 text-center">
            <p className="font-display text-[20px] font-semibold text-ink">
              {stream === "reposts"
                ? "Todavía no ha republicado contenido"
                : "Todavía no hay publicaciones"}
            </p>
            <p className="mx-auto mt-2 max-w-[46ch] font-body text-[14px] leading-[1.6] text-ink-soft">
              Cuando decida compartir parte de su recorrido, aparecerá aquí con el control de
              visibilidad que eligió.
            </p>
          </div>
        )}
        <div className="mt-5 space-y-4">
          {posts.map((post) => {
            const repost = "reposter_username" in post ? (post as PublicCommunityRepost) : null;
            return (
              <CommunityPostCard
                key={`${stream}-${post.id}-${"reposter_username" in post ? post.reposter_username : "original"}`}
                post={post as PublicCommunityPost}
                footer={
                  <div className="space-y-3">
                    {stream === "reposts" && repost && (
                      <p className="font-body text-[12px] text-ink-muted">
                        Republicada por{" "}
                        <strong className="font-semibold text-ink">
                          {repost.reposter_display_name || `@${repost.reposter_username}`}
                        </strong>
                      </p>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <CommunityPostActions
                        postId={post.id}
                        likesCount={post.likes_count}
                        repostsCount={post.reposts_count}
                        likedByViewer={post.liked_by_viewer}
                        repostedByViewer={post.reposted_by_viewer}
                        onChanged={refresh}
                      />
                      <span className="font-body text-[12px] text-ink-muted">
                        Comparte una idea, no una certeza absoluta.
                      </span>
                    </div>
                  </div>
                }
              />
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
