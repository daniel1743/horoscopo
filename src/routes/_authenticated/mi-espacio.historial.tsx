import { createFileRoute } from "@tanstack/react-router";
import { HistoryPage } from "@/pages/account/HistoryPage";
export const Route = createFileRoute("/_authenticated/mi-espacio/historial")({
  head: () => ({ meta: [{ title: "Historial — Mi espacio" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: HistoryPage,
});
