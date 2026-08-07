import { createFileRoute } from "@tanstack/react-router";
import { EspectroProfilePage } from "@/pages/social/EspectroProfilePage";

export const Route = createFileRoute("/_authenticated/mi-espacio/")({
  head: () => ({
    meta: [
      { title: "Espectro Astral — Creovision" },
      { name: "description", content: "Tu perfil astral social." },
      { property: "og:title", content: "Espectro Astral — Creovision" },
      { property: "og:description", content: "Tu energía astral del día." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: EspectroProfilePage,
});
