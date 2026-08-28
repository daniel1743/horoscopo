import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { MoonPhaseGrid } from "@/components/moon/MoonPhaseGrid";
import { MoonScientificFacts } from "@/components/moon/MoonScientificFacts";
import { MoonDisclaimer } from "@/components/moon/MoonDisclaimer";
import { routes } from "@/config/routes";
import { absoluteUrl } from "@/config/seo";

const moonPhasesCanonicalUrl = absoluteUrl(routes.moonPhases);

export const Route = createFileRoute("/luna/fases/")({
  head: () => ({
    meta: [
      { title: "Las 8 fases lunares — Creovision" },
      {
        name: "description",
        content:
          "Índice completo de las ocho fases del ciclo lunar: astronomía y lectura simbólica.",
      },
      { property: "og:title", content: "Las 8 fases lunares — Creovision" },
      {
        property: "og:description",
        content: "Astronomía y lectura simbólica de las ocho fases del ciclo lunar.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: moonPhasesCanonicalUrl },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: moonPhasesCanonicalUrl }],
  }),
  component: MoonPhasesIndexPage,
});

function MoonPhasesIndexPage() {
  return (
    <PageShell
      breadcrumbs={[{ label: "Luna", href: routes.moon }, { label: "Fases" }]}
    >
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
