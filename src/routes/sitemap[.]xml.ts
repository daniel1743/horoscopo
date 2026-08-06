import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl } from "@/config/seo";
import { routes, moonCalendarMonthRoute, moonPhaseRoute, tarotCardRoute, zodiacRoute } from "@/config/routes";
import { majorArcana } from "@/data/tarot-cards";
import { zodiacSigns } from "@/data/zodiac-signs";
import { MOON_PHASE_ORDER, MOON_PHASE_REGISTRY } from "@/config/moon";
import { isRoutePubliclyEnabled } from "@/config/public-features";

type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

interface SitemapEntry {
  path: string;
  priority: string;
  changefreq: ChangeFrequency;
  lastmod?: string;
}

/**
 * Sitemap dinámico y optimizado para SEO 2026.
 * Incluye prioridades estratégicas y frecuencias de actualización reales.
 */
function getSitemapEntries(): SitemapEntry[] {
  const today = new Date().toISOString().slice(0, 10);
  const entries: SitemapEntry[] = [];

  // 1. PÁGINAS PRINCIPALES (Alta prioridad)
  entries.push(
    { path: routes.home, priority: "1.0", changefreq: "daily", lastmod: today },
    { path: routes.search, priority: "0.7", changefreq: "weekly" },
    { path: routes.about, priority: "0.5", changefreq: "monthly" },
  );

  // 2. HORÓSCOPO (Si está activado)
  if (isRoutePubliclyEnabled("horoscope")) {
    // Landing principal de horóscopo
    entries.push({ path: routes.horoscope, priority: "0.9", changefreq: "daily", lastmod: today });

    // Horóscopos por período (actualizados diariamente)
    entries.push(
      { path: routes.horoscopeToday, priority: "0.95", changefreq: "daily", lastmod: today },
      { path: routes.horoscopeWeek, priority: "0.85", changefreq: "weekly", lastmod: today },
      { path: routes.horoscopeMonth, priority: "0.80", changefreq: "monthly", lastmod: today },
    );

    // Páginas individuales de cada signo (12 signos)
    zodiacSigns.forEach((sign) => {
      entries.push({
        path: zodiacRoute(sign.slug),
        priority: "0.85",
        changefreq: "daily",
        lastmod: today,
      });
    });
  }

  // 3. TAROT (Alta prioridad - contenido evergreen)
  entries.push(
    { path: routes.tarot, priority: "0.9", changefreq: "weekly" },
    { path: routes.tarotDaily, priority: "0.9", changefreq: "daily", lastmod: today },
    { path: routes.tarotYesNo, priority: "0.8", changefreq: "weekly" },
    { path: routes.tarotThreeCards, priority: "0.8", changefreq: "weekly" },
    { path: routes.tarotThreeCardsAmor, priority: "0.85", changefreq: "weekly" },
    { path: routes.tarotLibrary, priority: "0.7", changefreq: "monthly" },
  );

  // Páginas individuales de cartas del tarot
  majorArcana.forEach((card) => {
    entries.push({
      path: tarotCardRoute(card.slug),
      priority: "0.75",
      changefreq: "monthly",
    });
  });

  // 4. LUNA (Contenido dinámico con alta frecuencia)
  entries.push(
    { path: routes.moon, priority: "0.9", changefreq: "daily", lastmod: today },
    { path: routes.moonToday, priority: "0.95", changefreq: "hourly", lastmod: today },
    { path: routes.moonCalendar, priority: "0.85", changefreq: "daily", lastmod: today },
    { path: routes.moonPhases, priority: "0.8", changefreq: "weekly" },
  );

  // Páginas de fases lunares individuales (8 fases)
  MOON_PHASE_ORDER.forEach((key) => {
    const meta = MOON_PHASE_REGISTRY[key];
    entries.push({
      path: moonPhaseRoute(meta.slug),
      priority: "0.75",
      changefreq: "monthly",
    });
  });

  // Calendario lunar (últimos 3 meses + próximos 6 meses)
  const currentDate = new Date();
  for (let i = -3; i <= 6; i++) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + i);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    entries.push({
      path: moonCalendarMonthRoute(year, month),
      priority: i === 0 ? "0.9" : "0.7", // Mes actual tiene mayor prioridad
      changefreq: i <= 0 ? "monthly" : "weekly",
      lastmod: i === 0 ? today : undefined,
    });
  }

  // 5. ASTROLOGÍA (Herramientas interactivas)
  entries.push(
    { path: routes.astrology, priority: "0.8", changefreq: "weekly" },
    { path: routes.birthChart, priority: "0.85", changefreq: "weekly" },
    { path: routes.ascendant, priority: "0.85", changefreq: "weekly" },
    { path: routes.moonSign, priority: "0.80", changefreq: "weekly" },
  );

  // 6. COMPATIBILIDAD
  entries.push({
    path: routes.compatibility,
    priority: "0.85",
    changefreq: "weekly",
  });

  // 7. CONTENIDO EDITORIAL (Si hay guías/temas)
  entries.push(
    { path: routes.guides, priority: "0.75", changefreq: "weekly" },
    { path: routes.topics, priority: "0.70", changefreq: "weekly" },
  );

  return entries;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : "";

      return `  <url>
    <loc>${escapeXml(absoluteUrl(entry.path))}</loc>${lastmod}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls}
</urlset>
`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(buildSitemapXml(getSitemapEntries()), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400",
            "X-Robots-Tag": "noindex", // El sitemap en sí no debe indexarse
          },
        }),
    },
  },
});
