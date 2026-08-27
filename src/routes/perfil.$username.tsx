import { createFileRoute } from "@tanstack/react-router";
import { PublicProfilePage } from "@/pages/profile/PublicProfilePage";
import { fetchPublicProfile } from "@/lib/account/repository";
import { buildMeta } from "@/config/seo";
import { profileRoute } from "@/config/routes";

export const Route = createFileRoute("/perfil/$username")({
  loader: async ({ params }) => {
    try {
      return { profile: await fetchPublicProfile(params.username), backendUnavailable: false };
    } catch {
      return { profile: null, backendUnavailable: true };
    }
  },
  head: ({ params, loaderData }) => {
    const profile = loaderData?.profile;
    const backendUnavailable = loaderData?.backendUnavailable ?? false;
    const title = profile?.display_name
      ? `${profile.display_name} (@${profile.username}) — Perfil público`
      : "Perfil público no disponible";
    const description = profile?.bio ?? "Perfil esotérico público de la comunidad Creovision.";
    const meta = buildMeta({
      title,
      description,
      canonical: profileRoute(params.username),
      robots: profile && !backendUnavailable ? "index,follow" : "noindex,nofollow",
    });
    return { meta: meta.meta, links: meta.links };
  },
  component: PublicProfileRouteComponent,
});

function PublicProfileRouteComponent() {
  const loaderData = Route.useLoaderData();
  return (
    <PublicProfilePage
      profile={loaderData.profile}
      backendUnavailable={loaderData.backendUnavailable}
    />
  );
}
