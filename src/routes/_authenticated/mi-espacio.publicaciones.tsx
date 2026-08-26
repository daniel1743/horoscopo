import { createFileRoute } from "@tanstack/react-router";
import { MyPostsPage } from "@/pages/account/MyPostsPage";

export const Route = createFileRoute("/_authenticated/mi-espacio/publicaciones")({
  head: () => ({
    meta: [
      { title: "Mis publicaciones — Mi espacio" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: MyPostsPage,
});
