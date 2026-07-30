import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordPage } from "@/pages/account/ResetPasswordPage";

export const Route = createFileRoute("/auth/update-password")({
  head: () => ({
    meta: [
      { title: "Actualizar contraseña - Creovision" },
      { name: "description", content: "Elige una nueva contraseña para tu cuenta." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});
