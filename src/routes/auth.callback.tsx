import { createFileRoute } from "@tanstack/react-router";
import { AuthCallbackPage } from "@/pages/account/AuthCallbackPage";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Verificando… — Proyecto Astral" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthCallbackPage,
});
