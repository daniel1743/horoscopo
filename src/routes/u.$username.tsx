import { createFileRoute, notFound } from "@tanstack/react-router";
import { PublicProfilePage } from "@/pages/social/PublicProfilePage";
import { fetchPublicProfileByUsername, type PublicProfile } from "@/lib/social/queries";

export function requirePublicProfile(profile: PublicProfile | null): PublicProfile {
  if (!profile) throw notFound();
  return profile;
}

export const Route = createFileRoute("/u/$username")({
  loader: async ({ params }) => {
    const profile = await fetchPublicProfileByUsername(params.username);
    return { profile: requirePublicProfile(profile) };
  },
  component: ProfileRoute,
});

function ProfileRoute() {
  const { profile } = Route.useLoaderData();
  return <PublicProfilePage initialProfile={profile} />;
}
