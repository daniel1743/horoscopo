import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { AuthPage } from "@/pages/account/AuthPage";

type AuthMode = "signin" | "signup" | "forgot";

export interface AuthSearch {
  redirect?: string;
  mode?: AuthMode;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => {
    const mode =
      search.mode === "signup" || search.mode === "forgot" || search.mode === "signin"
        ? search.mode
        : undefined;

    return {
      redirect: typeof search.redirect === "string" ? search.redirect : undefined,
      mode,
    };
  },
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Creovision" },
      {
        name: "description",
        content:
          "Accede a Mi espacio para guardar lecturas de tarot, favoritos y personalizar tu experiencia astrológica.",
      },
      { property: "og:title", content: "Iniciar sesión — Creovision" },
      { property: "og:description", content: "Accede a tu espacio personal en Creovision." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthRouteComponent,
});

function AuthRouteComponent() {
  const location = useLocation();
  return location.pathname === "/auth" ? <AuthPage /> : <Outlet />;
}
