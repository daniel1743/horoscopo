import { createFileRoute } from "@tanstack/react-router";
import { SavedReadingsPage } from "@/pages/account/SavedReadingsPage";
export const Route = createFileRoute("/_authenticated/mi-espacio/lecturas")({
  head: () => ({ meta: [{ title: "Lecturas guardadas — Mi espacio" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: SavedReadingsPage,
});
