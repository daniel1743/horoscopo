import { createFileRoute } from "@tanstack/react-router";
import { CommunityModerationPage } from "@/pages/admin/CommunityModerationPage";

export const Route = createFileRoute("/_authenticated/admin/comunidad")({
  head: () => ({
    meta: [
      { title: "Moderación comunitaria — Panel administrativo" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CommunityModerationPage,
});
