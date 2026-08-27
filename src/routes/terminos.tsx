import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/layout/Placeholder";

export const Route = createFileRoute("/terminos")({
  head: () => ({
    meta: [
      { title: "Términos — Creovision" },
      { name: "description", content: "Condiciones de uso del servicio." },
      { property: "og:title", content: "Términos — Creovision" },
      { property: "og:description", content: "Condiciones de uso del servicio." },
    ],
  }),
  component: () => <Placeholder title="Términos" description="Condiciones de uso del servicio." />,
});
