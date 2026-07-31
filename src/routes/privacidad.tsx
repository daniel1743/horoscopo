import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "@/components/layout/Placeholder";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Privacidad — Creovision" },
      { name: "description", content: "Cómo tratamos tus datos." },
      { property: "og:title", content: "Privacidad — Creovision" },
      { property: "og:description", content: "Cómo tratamos tus datos." },
    ],
  }),
  component: () => <Placeholder title="Privacidad" description="Cómo tratamos tus datos." />,
});
