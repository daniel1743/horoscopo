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
    description: "Carta del día, tirada de tres cartas, sí o no.",
    keywords: ["tarot", "cartas", "arcanos"],
    enabledIf: () =>
      featureFlags.tarotDaily || featureFlags.tarotYesNo || featureFlags.tarotThreeCards,
  },
  {
    routeKey: "moon",
    title: "Luna",
    description: "Fase actual, calendario lunar y páginas por fase.",
    keywords: ["luna", "fase lunar", "calendario"],
    enabledIf: () => featureFlags.moonToday || featureFlags.moonCalendar,
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
