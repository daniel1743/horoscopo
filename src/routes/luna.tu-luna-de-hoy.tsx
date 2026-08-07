import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";
import { LunarReadingForm } from "@/components/moon/LunarReadingForm";

export const Route = createFileRoute("/luna/tu-luna-de-hoy")({
  head: () => ({
    meta: [
      { title: "Tu Luna de Hoy — Creovision" },
      {
        name: "description",
        content: "Descubre cómo la fase lunar actual interactúa con tu luna natal.",
      },
      { property: "og:title", content: "Tu Luna de Hoy — Creovision" },
      {
        property: "og:description",
        content: "Lectura personalizada del tránsito lunar según tu carta natal.",
      },
    ],
  }),
  component: TuLunaDeHoyPage,
});

function TuLunaDeHoyPage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Luna", href: routes.moon },
        { label: "Tu Luna de Hoy" },
      ]}
    >
      <PageHeader
        eyebrow="Lectura Personalizada"
        title="Tu Luna de Hoy"
        description="Ingresa tus datos de nacimiento para descubrir cómo influye el tránsito lunar actual en tu mundo emocional."
      />
      
      <div className="py-8">
        <LunarReadingForm />
      </div>
    </PageShell>
  );
}
