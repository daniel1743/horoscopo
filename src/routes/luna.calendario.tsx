import { createFileRoute, Navigate } from "@tanstack/react-router";
import { MOON_SITE_TIMEZONE } from "@/config/moon";
import { moonCalendarMonthRoute } from "@/config/routes";
import { getZonedParts } from "@/lib/moon/timezone";

/**
 * Redirección al mes actual (respetando timezone del sitio).
 * Evita duplicar la vista y mantiene URLs canónicas por mes.
 */
export const Route = createFileRoute("/luna/calendario")({
  head: () => ({
    meta: [
      { title: "Calendario lunar — Creovision" },
      {
        name: "description",
        content: "Calendario mensual con fases, iluminación y eventos lunares mayores.",
      },
      { property: "og:title", content: "Calendario lunar — Creovision" },
      {
        property: "og:description",
        content: "Calendario mensual con fases y eventos lunares mayores.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RedirectToCurrentMonth,
});

function RedirectToCurrentMonth() {
  const { year, month } = getZonedParts(new Date(), MOON_SITE_TIMEZONE);
  return <Navigate to={moonCalendarMonthRoute(year, month)} replace />;
}
