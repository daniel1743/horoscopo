import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/layout/Placeholder";

export const Route = createFileRoute("/terminos")({
  head: () => ({
    meta: [
      { title: "Términos — Proyecto Astral" },
      { name: "description", content: "Condiciones de uso del servicio." },
      { property: "og:title", content: "Términos — Proyecto Astral" },
      { property: "og:description", content: "Condiciones de uso del servicio." },
    ],
  }),
  component: () => <Placeholder title="Términos" description="Condiciones de uso del servicio." />,
});
