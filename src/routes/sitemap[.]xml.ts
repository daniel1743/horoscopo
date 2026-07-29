import { createFileRoute } from "@tanstack/react-router";

const SITE_URL = "https://proyectoastral.com";

const SIGNS = [
  "aries",
  "tauro",
  "geminis",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "escorpio",
  "sagitario",
  "capricornio",
  "acuario",
  "piscis",
] as const;

const STATIC_PATHS = [
  "/",
  "/luna",
  "/luna/hoy",
  "/luna/fases",
  "/luna/calendario",
  "/tarot",
  "/tarot/carta-del-dia",
  "/tarot/si-o-no",
  "/tarot/tres-cartas",
  "/tarot/cartas",
  "/horoscopo",
  "/horoscopo/hoy",
  "/horoscopo/semana",
  "/horoscopo/mes",
] as const;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function sitemapUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

function sitemapPaths(): string[] {
  return [
    ...STATIC_PATHS,
    ...SIGNS.map((sign) => `/horoscopo/${sign}`),
    ...SIGNS.map((sign) => `/horoscopo/${sign}?periodo=semana`),
    ...SIGNS.map((sign) => `/horoscopo/${sign}?periodo=mes`),
  ];
}

function generateSitemapXml(): string {
  const urls = sitemapPaths()
    .map(
      (path) => `  <url>
    <loc>${escapeXml(sitemapUrl(path))}</loc>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(generateSitemapXml(), {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=14400, stale-while-revalidate=86400",
          },
        }),
    },
  },
});
