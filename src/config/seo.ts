/**
 * Configuración SEO avanzada y competitiva para 2026.
 * Optimizado para Core Web Vitals, búsqueda semántica y AI search engines.
 */
import { siteConfig } from "./site";

const site = {
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url.replace(/\/$/, ""),
};

// Keywords estratégicas 2026 - Búsqueda conversacional y semántica
export const strategicKeywords = {
  primary: [
    "horóscopo diario personalizado",
    "tarot online gratis",
    "fases lunares hoy",
    "carta astral completa",
    "compatibilidad zodiacal",
  ],
  secondary: [
    "horóscopo del día",
    "lectura de tarot gratis",
    "calendario lunar",
    "signos zodiacales",
    "ascendente astrológico",
    "carta natal",
    "tarot amor",
    "horóscopo semanal",
  ],
  longTail: [
    "qué dice mi horóscopo hoy",
    "cómo hacer una tirada de tarot",
    "en qué fase está la luna hoy",
    "calcular ascendente gratis",
    "compatibilidad entre signos",
  ],
} as const;

export const seoDefaults = {
  titleTemplate: `%s | ${site.name}`,
  defaultTitle: `${site.name} — Horóscopo Diario, Tarot Online y Fases Lunares 2026`,
  defaultDescription: `${site.description} Descubre tu horóscopo personalizado, lecturas de tarot gratis y el calendario lunar actualizado. Herramientas de autoconocimiento y reflexión.`,
  locale: "es_ES",
  type: "website",
  twitterCard: "summary_large_image",
  robots: { index: true, follow: true },

  // Nuevos campos SEO 2026
  author: "Equipo Creovision",
  publisher: site.name,
  language: "es",
  region: "ES",
  themeColor: "#6B46C1", // Color cosmic del brand
} as const;

// Templates SEO optimizados para búsqueda conversacional 2026
export const seoTemplates = {
  // Horóscopo - Optimizado para "qué dice mi horóscopo hoy"
  horoscope: (sign: string) => ({
    title: `Horóscopo de ${sign} Hoy ${new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long" })} - Predicciones Diarias`,
    description: `Tu horóscopo de ${sign} para hoy. Descubre qué te deparan los astros en amor, trabajo y bienestar. Lectura personalizada actualizada diariamente.`,
    keywords: `horóscopo ${sign.toLowerCase()}, horóscopo ${sign.toLowerCase()} hoy, predicciones ${sign.toLowerCase()}, ${sign.toLowerCase()} horóscopo diario`,
  }),

  horoscopeWeekly: (sign: string) => ({
    title: `Horóscopo Semanal de ${sign} - Predicciones para Esta Semana`,
    description: `Horóscopo semanal de ${sign}. Planifica tu semana con las predicciones astrológicas más precisas. Amor, trabajo y oportunidades.`,
    keywords: `horóscopo semanal ${sign.toLowerCase()}, ${sign.toLowerCase()} semana, predicciones semanales ${sign.toLowerCase()}`,
  }),

  horoscopeMonthly: (sign: string) => ({
    title: `Horóscopo Mensual de ${sign} ${new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`,
    description: `Horóscopo mensual completo de ${sign}. Tendencias, oportunidades y desafíos para este mes. Planifica con astrología profesional.`,
    keywords: `horóscopo mensual ${sign.toLowerCase()}, ${sign.toLowerCase()} mes, predicciones mensuales ${sign.toLowerCase()}`,
  }),

  // Zodiac - Optimizado para "características de [signo]"
  zodiac: (sign: string) => ({
    title: `${sign}: Personalidad, Compatibilidad y Características del Signo Zodiacal`,
    description: `Todo sobre ${sign}: rasgos de personalidad, compatibilidad amorosa, fortalezas, debilidades y qué esperar en relaciones. Guía completa del signo zodiacal.`,
    keywords: `${sign.toLowerCase()} personalidad, características ${sign.toLowerCase()}, compatibilidad ${sign.toLowerCase()}, signo ${sign.toLowerCase()}`,
  }),

  // Tarot - Optimizado para "tirada de tarot gratis"
  tarot: (readingName: string) => ({
    title: `${readingName} — Lectura de Tarot Online Gratis`,
    description: `${readingName} de tarot gratis. Realiza tu consulta y recibe orientación sobre tu situación. Lectura interactiva y reflexiva.`,
    keywords: `${readingName.toLowerCase()}, tarot gratis, lectura tarot online, consulta tarot`,
  }),

  tarotCard: (cardName: string) => ({
    title: `${cardName} en el Tarot - Significado, Interpretación y Simbología`,
    description: `Descubre el significado completo de ${cardName}: interpretación en lectura, simbología, aspectos positivos y negativos. Guía completa de esta carta del tarot.`,
    keywords: `${cardName.toLowerCase()} tarot, significado ${cardName.toLowerCase()}, carta ${cardName.toLowerCase()}`,
  }),

  // Luna - Optimizado para "en qué fase está la luna"
  moon: () => ({
    title: `Calendario Lunar ${new Date().getFullYear()} - Fases de la Luna Hoy y Este Mes`,
    description: `Calendario lunar actualizado. Consulta en qué fase está la luna hoy, próximas lunas llenas y nuevas. Influencias lunares y mejores días del mes.`,
    keywords: `calendario lunar ${new Date().getFullYear()}, fases lunares hoy, en qué fase está la luna, luna llena, luna nueva`,
  }),

  moonPhase: (phaseName: string) => ({
    title: `${phaseName} - Significado, Influencias y Rituales de Esta Fase Lunar`,
    description: `Todo sobre la ${phaseName}: qué representa, influencias astrológicas, mejores actividades y rituales. Aprovecha la energía lunar.`,
    keywords: `${phaseName.toLowerCase()}, fase lunar ${phaseName.toLowerCase()}, energía ${phaseName.toLowerCase()}`,
  }),

  // Astrología - Optimizado para "calcular ascendente"
  birthChart: () => ({
    title: `Carta Astral Gratis - Calcula tu Carta Natal Completa Online`,
    description: `Calcula tu carta astral gratis con fecha, hora y lugar de nacimiento. Descubre tu ascendente, posiciones planetarias y casas astrológicas. Carta natal completa.`,
    keywords: `carta astral gratis, calcular carta natal, carta natal online, horóscopo personalizado`,
  }),

  ascendant: () => ({
    title: `Calcular Ascendente Astrológico Gratis - Tu Signo Ascendente`,
    description: `Calcula tu ascendente astrológico gratis. Descubre cómo te perciben los demás y qué influencia tiene en tu personalidad. Cálculo preciso con hora de nacimiento.`,
    keywords: `calcular ascendente gratis, signo ascendente, ascendente astrológico, qué es el ascendente`,
  }),

  // Compatibilidad - Optimizado para "compatibilidad entre signos"
  compatibility: (sign1?: string, sign2?: string) => {
    if (sign1 && sign2) {
      return {
        title: `Compatibilidad ${sign1} y ${sign2} - ¿Son Compatibles Estos Signos?`,
        description: `Descubre la compatibilidad entre ${sign1} y ${sign2} en amor y relaciones. Análisis completo de fortalezas, desafíos y consejos para la pareja.`,
        keywords: `compatibilidad ${sign1.toLowerCase()} ${sign2.toLowerCase()}, ${sign1.toLowerCase()} con ${sign2.toLowerCase()}, pareja ${sign1.toLowerCase()} ${sign2.toLowerCase()}`,
      };
    }
    return {
      title: `Compatibilidad entre Signos del Zodiaco - Calcula tu Compatibilidad Amorosa`,
      description: `Descubre la compatibilidad astrológica entre todos los signos del zodiaco. Analiza tu relación de pareja según los astros. Compatibilidad completa.`,
      keywords: `compatibilidad signos, compatibilidad amorosa, compatibilidad zodiacal, signos compatibles`,
    };
  },

  // Artículos/Guías - SEO para contenido editorial
  article: (articleTitle: string, articleExcerpt: string) => ({
    title: articleTitle,
    description: articleExcerpt,
  }),
} as const;

export type JsonLdPageType = "WebPage" | "CollectionPage";

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${site.url}${path}`;
}

/**
 * Genera meta tags TanStack Router optimizados para 2026.
 * Incluye Open Graph, Twitter Cards, y structured data hints.
 */
export function buildMeta(input: {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  canonical?: string;
  noindex?: boolean;
  type?: "website" | "article";
  structuredData?: JsonLdPageType;
}) {
  const title = input.title;
  const description = input.description ?? seoDefaults.defaultDescription;
  const canonical = input.canonical ? absoluteUrl(input.canonical) : undefined;
  const image = input.image ? absoluteUrl(input.image) : `${site.url}/og-image.jpg`;
  const type = input.type ?? seoDefaults.type;

  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },

    // Open Graph (Facebook, LinkedIn, WhatsApp)
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:locale", content: seoDefaults.locale },
    { property: "og:site_name", content: site.name },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },

    // Twitter Cards
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },

    // SEO Avanzado 2026
    { name: "author", content: seoDefaults.author },
    { name: "publisher", content: seoDefaults.publisher },
    { name: "theme-color", content: seoDefaults.themeColor },

    // Accesibilidad y móvil
    { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5" },
    { name: "format-detection", content: "telephone=no" },
  ];

  if (canonical) {
    meta.push({ property: "og:url", content: canonical });
  }

  // Keywords si se proveen (uso moderado, no spam)
  if (input.keywords) {
    meta.push({ name: "keywords", content: input.keywords });
  }

  // Robots
  if (input.noindex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  } else {
    meta.push({
      name: "robots",
      content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    });
  }

  const links: Array<Record<string, string>> = [];

  if (canonical) {
    links.push({ rel: "canonical", href: canonical });
  }

  // Preconnect para performance
  links.push(
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  );

  const scripts =
    input.structuredData && canonical
      ? [
          buildJsonLdScript({
            canonical,
            name: title,
            description,
            pageType: input.structuredData,
          }),
        ]
      : undefined;

  return { meta, links, scripts };
}

export interface JsonLdGraph {
  "@context": "https://schema.org";
  "@graph": Array<Record<string, unknown>>;
}

export function buildJsonLd(input: {
  canonical: string;
  name: string;
  description: string;
  pageType: JsonLdPageType;
}): JsonLdGraph {
  const canonical = absoluteUrl(input.canonical);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: `${site.url}/`,
        name: site.name,
        description: site.description,
      },
      {
        "@type": input.pageType,
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: input.name,
        description: input.description,
        isPartOf: {
          "@id": `${site.url}/#website`,
        },
      },
    ],
  };
}

export function serializeJsonLdForScript(input: JsonLdGraph): string {
  return JSON.stringify(input).replace(/[<>&]/g, (char) => {
    if (char === "<") return "\\u003c";
    if (char === ">") return "\\u003e";
    return "\\u0026";
  });
}

export function buildJsonLdScript(input: Parameters<typeof buildJsonLd>[0]) {
  return {
    type: "application/ld+json",
    children: serializeJsonLdForScript(buildJsonLd(input)),
  };
}
