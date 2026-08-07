import { createFileRoute } from "@tanstack/react-router";
import { SavedLunarReadingDetailPage } from "@/pages/account/SavedLunarReadingDetailPage";
import { getSavedLunarReadingByIdFn } from "@/lib/moon/moon.functions";

export const Route = createFileRoute("/_authenticated/mi-espacio/lecturas-lunares/$id")({
  head: () => ({ 
    meta: [
      { title: "Detalle de Lectura Lunar — Mi espacio" }, 
      { name: "robots", content: "noindex,nofollow" }
    ] 
  }),
  loader: async ({ params }) => {
    return getSavedLunarReadingByIdFn({ data: { id: params.id } });
  },
  component: SavedLunarReadingDetailPage,
});
