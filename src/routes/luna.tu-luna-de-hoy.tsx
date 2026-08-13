import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { routes } from "@/config/routes";
import { LunarReadingForm } from "@/components/moon/LunarReadingForm";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/luna/tu-luna-de-hoy")({
  head: () => {
    const m = buildMeta({
      title: "Tu Luna de Hoy — Creovision",
      description: "Descubre cómo la fase lunar actual interactúa con tu luna natal.",
      canonical: routes.moonPersonalToday,
    });
    return { meta: m.meta, links: m.links };
  },
  component: TuLunaDeHoyPage,
});

function TuLunaDeHoyPage() {
  return (
    <PageShell breadcrumbs={[{ label: "Luna", href: routes.moon }, { label: "Tu Luna de Hoy" }]}>
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
