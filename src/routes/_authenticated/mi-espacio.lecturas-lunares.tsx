import { createFileRoute } from "@tanstack/react-router";
import { SavedLunarReadingsPage } from "@/pages/account/SavedLunarReadingsPage";

export const Route = createFileRoute("/_authenticated/mi-espacio/lecturas-lunares")({
  head: () => ({ 
    meta: [
      { title: "Mis lecturas — Mi espacio" }, 
      { name: "robots", content: "noindex,nofollow" }
    ] 
  }),
  component: SavedLunarReadingsPage,
});
