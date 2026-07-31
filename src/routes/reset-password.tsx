import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordPage } from "@/pages/account/ResetPasswordPage";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Restablecer contraseña — Creovision" },
      {
        name: "description",
        content: "Elige una nueva contraseña para tu cuenta.",
      },
      { property: "og:title", content: "Restablecer contraseña — Creovision" },
      { property: "og:description", content: "Elige una nueva contraseña para tu cuenta." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});
