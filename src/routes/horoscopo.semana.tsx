import { createFileRoute } from "@tanstack/react-router";
import { HoroscopePeriodPage } from "@/pages/horoscope/HoroscopePeriodPage";
import { listHoroscopesForCurrentPeriod } from "@/lib/horoscope/repository";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/horoscopo/semana")({
  loader: async () => {
    const entries = await listHoroscopesForCurrentPeriod("weekly");
    return { entries };
  },
  head: () => {
    const m = buildMeta({
      title: "Horóscopo de la semana — Proyecto Astral",
      description: "Panorama semanal con las claves para cada signo.",
    });
    return { meta: m.meta, links: m.links };
  },
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-[720px] py-20 text-center">
      <h1 className="font-display text-[24px] font-semibold text-ink">
        No pudimos cargar el horóscopo
      </h1>
      <p className="mt-3 font-body text-ink-soft">{error.message}</p>
    </div>
  ),
  component: Page,
});

function Page() {
  const { entries } = Route.useLoaderData();
  return <HoroscopePeriodPage period="weekly" entries={entries} />;
}
