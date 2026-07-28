import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/pages/account/AuthPage";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    mode:
      search.mode === "signup" || search.mode === "forgot" || search.mode === "signin"
        ? search.mode
        : "signin",
  }),
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Proyecto Astral" },
      {
        name: "description",
        content:
          "Accede a Mi espacio para guardar lecturas de tarot, favoritos y personalizar tu experiencia astrológica.",
      },
      { property: "og:title", content: "Iniciar sesión — Proyecto Astral" },
      { property: "og:description", content: "Accede a tu espacio personal en Proyecto Astral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});
