/**
 * YAML 12 — Registro estático indexable localmente.
 * NO duplicar zodiac.config / moon.config: consumirlas y proyectarlas.
 * Solo secciones públicas visibles. Nada de rutas privadas ni auth.
 */
import { routes, zodiacRoute } from "@/config/routes";
import { featureFlags } from "@/config/features";
import { zodiacSigns } from "@/data/zodiac-signs";
import type { SearchStaticDocument } from "@/types/search";

function buildZodiacDocs(): SearchStaticDocument[] {
  return zodiacSigns.map((s) => ({
    id: `zodiac:${s.id}`,
    sourceType: "zodiac_sign",
    title: s.name,
    description: `${s.dateRange} · ${s.element} · ${s.keyword}`,
    keywords: [s.name, s.slug, s.element, s.rulingPlanet, s.symbol, s.keyword],
    routePath: zodiacRoute(s.slug),
    metadata: { kind: "zodiac_sign", signKey: s.slug, symbol: s.symbol },
  }));
}

interface StaticPageEntry {
  routeKey: keyof typeof routes;
  title: string;
  description: string;
  keywords: string[];
  enabledIf?: () => boolean;
}

const STATIC_PAGES: readonly StaticPageEntry[] = [
  {
    routeKey: "home",
    title: "Inicio",
    description: "Astrología, tarot, horóscopo y luna en un solo lugar.",
    keywords: ["inicio", "home", "astrología"],
  },
  {
    routeKey: "horoscope",
    title: "Horóscopo",
    description: "Horóscopos diarios, semanales y mensuales por signo.",
    keywords: ["horóscopo", "signos", "hoy"],
    enabledIf: () => featureFlags.horoscope,
  },
  {
    routeKey: "tarot",
    title: "Tarot",
    description: "Carta del día, sí o no, tres cartas, decisión y pasado, presente y futuro.",
    keywords: ["tarot", "cartas", "arcanos", "carta del día", "decisión", "pasado presente futuro"],
    enabledIf: () =>
      featureFlags.tarotDaily ||
      featureFlags.tarotYesNo ||
      featureFlags.tarotThreeCards ||
      featureFlags.tarotDecision ||
      featureFlags.tarotPastPresentFuture,
  },
  {
    routeKey: "tarotDecision",
    title: "Tarot para una decisión",
    description: "Dos cartas para ordenar una decisión desde la reflexión, sin certezas absolutas.",
    keywords: ["tarot decisión", "elegir", "orientación", "reflexión"],
    enabledIf: () => featureFlags.tarotDecision,
  },
  {
    routeKey: "tarotPastPresentFuture",
    title: "Tarot pasado, presente y futuro",
    description: "Tres cartas para observar antecedentes, presente y una posibilidad abierta.",
    keywords: ["pasado presente futuro", "tarot", "secuencia", "contexto"],
    enabledIf: () => featureFlags.tarotPastPresentFuture,
  },
  {
    routeKey: "moon",
    title: "Luna",
    description: "Fase actual, calendario lunar y páginas por fase.",
    keywords: ["luna", "fase lunar", "calendario"],
    enabledIf: () => featureFlags.moonToday || featureFlags.moonCalendar,
  },
  {
    routeKey: "astrology",
    title: "Astrología personal",
    description: "Carta natal, ascendente, signo lunar, tránsitos y sinastría local.",
    keywords: ["astrología", "carta natal", "ascendente", "tránsitos", "sinastría"],
    enabledIf: () => featureFlags.astrology,
  },
  {
    routeKey: "transits",
    title: "Tránsitos astrológicos",
    description: "Observa posiciones y aspectos de una fecha frente a una carta de referencia.",
    keywords: ["tránsitos", "retrogradación", "aspectos", "astrología"],
    enabledIf: () => featureFlags.transits,
  },
  {
    routeKey: "synastry",
    title: "Sinastría",
    description: "Compara dos cartas de referencia en memoria, sin guardar datos natales.",
    keywords: ["sinastría", "compatibilidad astral", "dos cartas", "pareja"],
    enabledIf: () => featureFlags.synastry,
  },
  {
    routeKey: "topics",
    title: "Temas",
    description: "Explora categorías editoriales de astrología, Tarot y Luna.",
    keywords: ["temas", "categorías", "astrología", "tarot", "luna"],
    enabledIf: () => featureFlags.articles,
  },
  {
    routeKey: "compatibility",
    title: "Compatibilidad",
    description: "Explora compatibilidades entre signos zodiacales.",
    keywords: ["compatibilidad", "signos", "pareja"],
    enabledIf: () => featureFlags.compatibilityBasic,
  },
  {
    routeKey: "numerologyLifePath",
    title: "Camino de vida",
    description: "Calcula un número simbólico a partir de tu fecha sin guardar datos personales.",
    keywords: ["numerología", "camino de vida", "número de vida"],
    enabledIf: () => featureFlags.numerologyLifePath,
  },
  {
    routeKey: "dreams",
    title: "Diccionario de sueños",
    description:
      "Explora símbolos de sueños con lentes emocionales y simbólicos, sin interpretaciones universales.",
    keywords: ["sueños", "diccionario de sueños", "símbolos", "emociones"],
    enabledIf: () => featureFlags.dreams,
  },
  {
    routeKey: "guides",
    title: "Guías",
    description: "Artículos editoriales verificados.",
    keywords: ["guías", "artículos", "temas"],
    enabledIf: () => featureFlags.articles,
  },
  {
    routeKey: "method",
    title: "Método editorial",
    description: "Cómo verificamos y publicamos nuestro contenido.",
    keywords: ["método", "editorial", "verificación"],
  },
  {
    routeKey: "assistant",
    title: "Asistente",
    description: "Asistente conversacional para orientación y reflexión.",
    keywords: ["asistente", "chat", "ia"],
    enabledIf: () => featureFlags.aiAssistant,
  },
];

function buildStaticPageDocs(): SearchStaticDocument[] {
  return STATIC_PAGES.filter((p) => (p.enabledIf ? p.enabledIf() : true)).map((p) => ({
    id: `page:${p.routeKey}`,
    sourceType: "static_page",
    title: p.title,
    description: p.description,
    keywords: p.keywords,
    routePath: routes[p.routeKey],
    metadata: { kind: "static_page", routeKey: p.routeKey },
  }));
}

/** Registro estático combinado. Se recalcula por build (feature flags). */
export const STATIC_SEARCH_DOCUMENTS: readonly SearchStaticDocument[] = [
  ...buildZodiacDocs(),
  ...buildStaticPageDocs(),
];
