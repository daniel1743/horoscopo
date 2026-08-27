import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/layout/Placeholder";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookies — Creovision" },
      { name: "description", content: "Política de cookies y trazadores." },
      { property: "og:title", content: "Cookies — Creovision" },
      { property: "og:description", content: "Política de cookies y trazadores." },
    ],
  }),
  component: () => <Placeholder title="Cookies" description="Política de cookies y trazadores." />,
});
