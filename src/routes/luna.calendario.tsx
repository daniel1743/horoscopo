import { createFileRoute, Navigate } from "@tanstack/react-router";
import { MOON_SITE_TIMEZONE } from "@/config/moon";
import { moonCalendarMonthRoute } from "@/config/routes";
import { getZonedParts } from "@/lib/moon/timezone";
import { buildMeta } from "@/config/seo";

/**
 * Redirección al mes actual (respetando timezone del sitio).
 * Evita duplicar la vista y mantiene URLs canónicas por mes.
 */
export const Route = createFileRoute("/luna/calendario")({
  head: () => {
    const { year, month } = getZonedParts(new Date(), MOON_SITE_TIMEZONE);
    const m = buildMeta({
      title: "Calendario lunar — Proyecto Astral",
      description: "Calendario mensual con fases, iluminación y eventos lunares mayores.",
      canonical: moonCalendarMonthRoute(year, month),
    });
    return { meta: m.meta, links: m.links };
  },
  component: RedirectToCurrentMonth,
});

function RedirectToCurrentMonth() {
  const { year, month } = getZonedParts(new Date(), MOON_SITE_TIMEZONE);
  return <Navigate to={moonCalendarMonthRoute(year, month)} replace />;
}
