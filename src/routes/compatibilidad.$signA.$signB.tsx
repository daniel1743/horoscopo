import { createFileRoute, redirect, notFound } from "@tanstack/react-router";
import { CompatibilityPairPage } from "@/pages/compatibility/CompatibilityPairPage";
import { compatibilityQueries } from "@/services/compatibility.service";
import { isZodiacSign, normalizeSignPair } from "@/lib/compatibility/normalize-sign-pair";
import { buildMeta } from "@/config/seo";
import { compatibilityRoute } from "@/config/routes";
import { getZodiacBySlug } from "@/data/zodiac-signs";
import type { ZodiacSignKey } from "@/types/compatibility";
import { isIndexableCompatibilityPair } from "@/config/compatibility-indexability";

export const GEMINI_SAGITTARIUS_META_DESCRIPTION =
  "Compatibilidad entre Géminis y Sagitario: cómo conectan en amor, comunicación y amistad, dónde chocan y qué puede ayudarles a funcionar.";

/**
 * Ruta canónica de una combinación. Si `signA/signB` no está en orden zodiacal,
 * redirige a la URL canónica para evitar contenido duplicado.
 */
export const Route = createFileRoute("/compatibilidad/$signA/$signB")({
  beforeLoad: ({ params }) => {
    const { signA, signB } = params;
    if (!isZodiacSign(signA) || !isZodiacSign(signB)) throw notFound();
    const normalized = normalizeSignPair(signA, signB);
    if (normalized.sign_a !== signA || normalized.sign_b !== signB) {
      throw redirect({
        to: "/compatibilidad/$signA/$signB",
        params: { signA: normalized.sign_a, signB: normalized.sign_b },
        replace: true,
      });
    }
  },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      compatibilityQueries.pair(params.signA as ZodiacSignKey, params.signB as ZodiacSignKey),
    ),
  head: ({ params }) => {
    const m = buildCompatibilityPairMeta(params.signA, params.signB);
    return { meta: m.meta, links: m.links, scripts: m.scripts };
  },
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-[720px] py-20 text-center">
      <h1 className="font-display text-[24px] font-semibold text-ink">
        No pudimos cargar la compatibilidad
      </h1>
      <p className="mt-3 font-body text-ink-soft">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-[720px] py-20 text-center">
      <h1 className="font-display text-[24px] font-semibold text-ink">Combinación no válida</h1>
      <p className="mt-3 font-body text-ink-soft">Revisa el enlace y vuelve al inicio.</p>
    </div>
  ),
  component: PairComponent,
});

function PairComponent() {
  const { signA, signB } = Route.useParams();
  return <CompatibilityPairPage signA={signA as ZodiacSignKey} signB={signB as ZodiacSignKey} />;
}

export function getCompatibilityPairMeta(signA: string, signB: string) {
  const a = getZodiacBySlug(signA);
  const b = getZodiacBySlug(signB);
  const nameA = a?.name ?? signA;
  const nameB = b?.name ?? signB;
  const isGeminiSagittarius = signA === "geminis" && signB === "sagitario";

  return {
    title: `${nameA} y ${nameB}: compatibilidad simbólica · Creovision`,
    description: isGeminiSagittarius
      ? GEMINI_SAGITTARIUS_META_DESCRIPTION
      : `Lectura editorial de la dinámica entre ${nameA} y ${nameB}: comunicación, ritmo emocional y áreas de crecimiento.`,
    canonical: compatibilityRoute(signA, signB),
    structuredData: "WebPage" as const,
  };
}

export function buildCompatibilityPairMeta(signA: string, signB: string) {
  const result = buildMeta(getCompatibilityPairMeta(signA, signB));
  if (isIndexableCompatibilityPair(signA, signB)) return result;

  return {
    ...result,
    meta: result.meta.map((item) =>
      item.name === "robots" ? { ...item, content: "noindex, follow" } : item,
    ),
  };
}
