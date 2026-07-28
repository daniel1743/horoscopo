import { createFileRoute } from "@tanstack/react-router";
import { FavoritesPage } from "@/pages/account/FavoritesPage";
export const Route = createFileRoute("/_authenticated/mi-espacio/favoritos")({
  head: () => ({ meta: [{ title: "Favoritos — Mi espacio" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: FavoritesPage,
});
