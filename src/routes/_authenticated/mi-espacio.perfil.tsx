import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/pages/account/ProfilePage";
export const Route = createFileRoute("/_authenticated/mi-espacio/perfil")({
  head: () => ({
    meta: [{ title: "Perfil — Mi espacio" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: ProfilePage,
});
