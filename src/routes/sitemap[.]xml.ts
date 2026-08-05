import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl } from "@/config/seo";
import { routes, moonCalendarMonthRoute, moonPhaseRoute, tarotCardRoute } from "@/config/routes";
import { majorArcana } from "@/data/tarot-cards";
import { MOON_PHASE_ORDER, MOON_PHASE_REGISTRY } from "@/config/moon";
import { isRoutePubliclyEnabled } from "@/config/public-features";

type ChangeFrequency = "daily" | "weekly" | "monthly" | "yearly";

interface SitemapEntry {
  path: string;
  priority: string;
  changefreq: ChangeFrequency;
}

const STATIC_PUBLIC_ROUTES: readonly SitemapEntry[] = [
  { path: routes.home, priority: "1.0", changefreq: "daily" },
  { path: routes.tarot, priority: "0.9", changefreq: "weekly" },
  { path: routes.tarotDaily, priority: "0.9", changefreq: "daily" },
  { path: routes.tarotYesNo, priority: "0.8", changefreq: "weekly" },
  { path: routes.tarotThreeCards, priority: "0.8", changefreq: "weekly" },
  { path: routes.tarotThreeCardsAmor, priority: "0.8", changefreq: "weekly" },
  { path: routes.tarotLibrary, priority: "0.8", changefreq: "weekly" },
  { path: routes.moon, priority: "0.8", changefreq: "daily" },
  { path: routes.moonToday, priority: "0.8", changefreq: "daily" },
  { path: routes.moonCalendar, priority: "0.7", changefreq: "monthly" },
  { path: routes.moonPhases, priority: "0.7", changefreq: "monthly" },
  { path: routes.guides, priority: "0.8", changefreq: "weekly" },
  { path: routes.privacy, priority: "0.3", changefreq: "yearly" },
  { path: routes.terms, priority: "0.3", changefreq: "yearly" },
  { path: routes.cookies, priority: "0.3", changefreq: "yearly" },
  { path: routes.disclaimer, priority: "0.3", changefreq: "yearly" },
];

function getCalendarMonthEntries(now = new Date()): SitemapEntry[] {
  return [-1, 0, 1].map((offset) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
    return {
      path: moonCalendarMonthRoute(date.getUTCFullYear(), date.getUTCMonth() + 1),
      priority: "0.6",
      changefreq: "monthly",
    };
  });
}

function getSitemapEntries(): SitemapEntry[] {
  const moonPhaseEntries = MOON_PHASE_ORDER.map((phaseKey) => ({
    path: moonPhaseRoute(MOON_PHASE_REGISTRY[phaseKey].slug),
    priority: "0.6",
    changefreq: "monthly" as const,
  }));

  const tarotCardEntries = majorArcana.map((card) => ({
    path: tarotCardRoute(card.slug),
    priority: "0.6",
    changefreq: "monthly" as const,
  }));

  return [
    ...STATIC_PUBLIC_ROUTES.filter((entry) => {
      const routeKey = Object.entries(routes).find(([, path]) => path === entry.path)?.[0];
      return routeKey ? isRoutePubliclyEnabled(routeKey as keyof typeof routes) : true;
    }),
    ...moonPhaseEntries,
    ...getCalendarMonthEntries(),
    ...tarotCardEntries,
  ];
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemapXml(entries: readonly SitemapEntry[]): string {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(absoluteUrl(entry.path))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
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
      GET: () =>
        new Response(buildSitemapXml(getSitemapEntries()), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
