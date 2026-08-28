import { createFileRoute, notFound } from "@tanstack/react-router";
import { CompatibilityHubPage } from "@/pages/compatibility/CompatibilityHubPage";
import { compatibilityQueries } from "@/services/compatibility.service";
import { buildMeta } from "@/config/seo";
import { COMPATIBILITY_COPY } from "@/config/compatibility";
import { isPublicFeatureEnabled } from "@/config/public-features";
import { routes } from "@/config/routes";

export const Route = createFileRoute("/compatibilidad/")({
  beforeLoad: () => {
    if (!isPublicFeatureEnabled("compatibility")) throw notFound();
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(compatibilityQueries.featured(6)),
  head: () => {
    const m = buildMeta({
      title: `Compatibilidad entre signos · Creovision`,
      description: COMPATIBILITY_COPY.hubDescription,
      canonical: routes.compatibility,
      structuredData: "CollectionPage",
    });
    return { meta: m.meta, links: m.links, scripts: m.scripts };
  },
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-[720px] py-20 text-center">
      <h1 className="font-display text-[24px] font-semibold text-ink">
        No pudimos cargar Compatibilidad
      </h1>
      <p className="mt-3 font-body text-ink-soft">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-[720px] py-20 text-center">
      <h1 className="font-display text-[24px] font-semibold text-ink">No encontrado</h1>
    </div>
  ),
  component: CompatibilityHubPage,
});
