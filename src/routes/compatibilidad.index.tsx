import { createFileRoute } from "@tanstack/react-router";
import { CompatibilityHubPage } from "@/pages/compatibility/CompatibilityHubPage";
import { compatibilityQueries } from "@/services/compatibility.service";
import { buildMeta } from "@/config/seo";
import { COMPATIBILITY_COPY } from "@/config/compatibility";
import {
  createCompatibilityFallback,
  getFallbackFeaturedPairs,
} from "@/lib/compatibility/fallbacks";

export const Route = createFileRoute("/compatibilidad/")({
  loader: async ({ context }) => {
    try {
      return await context.queryClient.ensureQueryData(compatibilityQueries.featured(6));
    } catch {
      return getFallbackFeaturedPairs()
        .slice(0, 6)
        .map(([signA, signB]) => createCompatibilityFallback(signA, signB));
    }
  },
  head: () => {
    const m = buildMeta({
      title: `Compatibilidad entre signos · Creovision`,
      description: COMPATIBILITY_COPY.hubDescription,
      canonical: "/compatibilidad",
    });
    return { meta: m.meta, links: m.links };
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
  component: CompatibilityHubRoute,
});

function CompatibilityHubRoute() {
  const featured = Route.useLoaderData();
  return <CompatibilityHubPage featured={featured} />;
}
