import { createFileRoute } from "@tanstack/react-router";
import { PublicProfilePage } from "@/pages/profile/PublicProfilePage";
import { fetchPublicProfile } from "@/lib/account/repository";
import { buildMeta } from "@/config/seo";
import { profileRoute } from "@/config/routes";

export const Route = createFileRoute("/perfil/$username")({
  loader: async ({ params }) => ({
    profile: await fetchPublicProfile(params.username).catch(() => null),
  }),
  head: ({ params, loaderData }) => {
    const profile = loaderData?.profile;
    const title = profile?.display_name
      ? `${profile.display_name} (@${profile.username}) — Perfil público`
      : "Perfil público no disponible";
    const description = profile?.bio ?? "Perfil esotérico público de la comunidad Creovision.";
    const meta = buildMeta({
      title,
      description,
      canonical: profileRoute(params.username),
      robots: profile ? "index,follow" : "noindex,nofollow",
    });
    return { meta: meta.meta, links: meta.links };
  },
  component: PublicProfileRouteComponent,
});

function PublicProfileRouteComponent() {
  return <PublicProfilePage profile={Route.useLoaderData().profile} />;
}
