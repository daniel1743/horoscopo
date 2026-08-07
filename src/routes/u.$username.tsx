import { createFileRoute } from "@tanstack/react-router";
import { PublicProfilePage } from "@/pages/social/PublicProfilePage";

export const Route = createFileRoute("/u/$username")({
  component: PublicProfilePage,
});
