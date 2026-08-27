import { createFileRoute } from "@tanstack/react-router";
import { AccountSettingsPage } from "@/pages/account/AccountSettingsPage";
export const Route = createFileRoute("/_authenticated/mi-espacio/configuracion")({
  head: () => ({
    meta: [
      { title: "Configuración — Mi espacio" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AccountSettingsPage,
});
