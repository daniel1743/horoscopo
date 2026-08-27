import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { MoonPhaseGrid } from "@/components/moon/MoonPhaseGrid";
import { MoonScientificFacts } from "@/components/moon/MoonScientificFacts";
import { MoonDisclaimer } from "@/components/moon/MoonDisclaimer";
import { routes } from "@/config/routes";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/luna/fases")({
  head: () => {
    const m = buildMeta({
      title: "Las 8 fases lunares — Creovision",
      description:
        "Índice completo de las ocho fases del ciclo lunar: astronomía y lectura simbólica.",
      canonical: "/luna/fases",
    });
    return { meta: m.meta, links: m.links };
  },
  component: MoonPhasesIndexPage,
});

function MoonPhasesIndexPage() {
  return (
    <PageShell breadcrumbs={[{ label: "Luna", href: routes.moon }, { label: "Fases" }]}>
      <PageHeader
        eyebrow="Ciclo sinódico"
        title="Las 8 fases lunares"
        description="Cada fase se cuenta desde dos planos: qué es astronómicamente y qué lecturas simbólicas suelen asociarse."
      />
      <MoonPhaseGrid />
      <MoonScientificFacts />
      <MoonDisclaimer />
    </PageShell>
  );
}
