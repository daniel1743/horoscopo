import { createFileRoute } from "@tanstack/react-router";
import { AccountDashboardPage } from "@/pages/account/AccountDashboardPage";

export const Route = createFileRoute("/_authenticated/mi-espacio")({
  head: () => ({
    meta: [
      { title: "Mi espacio — Proyecto Astral" },
      { name: "description", content: "Tu área personal en Proyecto Astral." },
      { property: "og:title", content: "Mi espacio — Proyecto Astral" },
      { property: "og:description", content: "Perfil, favoritos, lecturas y privacidad." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AccountDashboardPage,
});
