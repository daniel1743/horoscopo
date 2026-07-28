/**
 * Plantillas SEO compartidas. Cada route head() debería consumir estas.
 */
import { siteConfig } from "./site";

const site = {
  name: siteConfig.name,
  description: siteConfig.description,
};

export const seoDefaults = {
  titleTemplate: `%s | ${site.name}`,
  defaultTitle: `${site.name} — Astrología, tarot y horóscopo`,
  defaultDescription: site.description,
  locale: "es_ES",
  type: "website",
  twitterCard: "summary_large_image",
  robots: { index: true, follow: true },
} as const;

export const seoTemplates = {
  horoscope: (sign: string) => ({
    title: `Horóscopo de ${sign} hoy`,
    description: `Descubre el horóscopo de ${sign} para hoy con orientación sobre relaciones, trabajo, emociones y crecimiento personal.`,
  }),
  zodiac: (sign: string) => ({
    title: `${sign}: personalidad, compatibilidad y horóscopo`,
    description: `Conoce las características de ${sign}, su compatibilidad y sus principales tendencias astrológicas.`,
  }),
  tarot: (readingName: string) => ({
    title: `${readingName} — Lectura de tarot`,
    description:
      "Realiza una lectura de tarot como herramienta de reflexión sobre tu situación actual.",
  }),
  article: (articleTitle: string, articleExcerpt: string) => ({
    title: articleTitle,
    description: articleExcerpt,
  }),
} as const;

/** Genera meta tags TanStack Router a partir de título y descripción. */
export function buildMeta(input: {
  title: string;
  description?: string;
  image?: string;
  canonical?: string;
}) {
  const title = input.title;
  const description = input.description ?? seoDefaults.defaultDescription;
  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: seoDefaults.type },
    { property: "og:locale", content: seoDefaults.locale },
    { name: "twitter:card", content: seoDefaults.twitterCard },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (input.image) {
    meta.push({ property: "og:image", content: input.image });
    meta.push({ name: "twitter:image", content: input.image });
  }
  const links: Array<Record<string, string>> = [];
  if (input.canonical) links.push({ rel: "canonical", href: input.canonical });
  return { meta, links };
}

/** JSON-LD helpers para schema.org. */
export const schemaOrg = {
  organization: () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    description: site.description,
  }),
  website: () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    description: site.description,
  }),
  breadcrumb: (items: { name: string; url: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }),
  article: (input: {
    headline: string;
    description: string;
    datePublished?: string;
    author?: string;
  }) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    datePublished: input.datePublished,
    author: input.author ? { "@type": "Person", name: input.author } : undefined,
  }),
};
