import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordPage } from "@/pages/account/ResetPasswordPage";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Restablecer contraseña — Proyecto Astral" },
      {
        name: "description",
        content: "Elige una nueva contraseña para tu cuenta.",
      },
      { property: "og:title", content: "Restablecer contraseña — Proyecto Astral" },
      { property: "og:description", content: "Elige una nueva contraseña para tu cuenta." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});
