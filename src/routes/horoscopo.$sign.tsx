import { createFileRoute, notFound } from "@tanstack/react-router";
import { SignHoroscopePage } from "@/pages/horoscope/SignHoroscopePage";
import { getLatestHoroscope } from "@/lib/horoscope/repository";
import { createHoroscopeFallback } from "@/lib/horoscope/fallbacks";
import { moonQueries } from "@/services/moon.service";
import { getPeriodBySlug } from "@/config/horoscope";
import { zodiacSigns } from "@/data/zodiac-signs";
import { buildMeta } from "@/config/seo";
import type { HoroscopePeriod } from "@/types/horoscope";

interface Search {
  periodo?: "hoy" | "semana" | "mes";
}

export const Route = createFileRoute("/horoscopo/$sign")({
  validateSearch: (raw: Record<string, unknown>): Search => {
    const p = raw.periodo;
    if (p === "hoy" || p === "semana" || p === "mes") return { periodo: p };
    return {};
  },
  loaderDeps: ({ search }) => ({ periodo: search.periodo ?? "hoy" }),
  loader: async ({ context, params, deps }) => {
    const sign = zodiacSigns.find((s) => s.slug === params.sign);
    if (!sign) throw notFound();
    const def = getPeriodBySlug(deps.periodo) ?? getPeriodBySlug("hoy")!;
    const [publishedEntry, moon] = await Promise.all([
      getLatestHoroscope(sign.slug, def.key).catch(() => null),
      context.queryClient.ensureQueryData(moonQueries.today()).catch(() => null),
    ]);
    const entry = publishedEntry ?? createHoroscopeFallback(sign.slug, def.key);
    return { signSlug: sign.slug, period: def.key as HoroscopePeriod, entry, moon };
  },
  head: ({ params, search }) => {
    const sign = zodiacSigns.find((s) => s.slug === params.sign);
    const name = sign?.name ?? "Signo";
    const periodLabel =
      search?.periodo === "semana" ? "esta semana" : search?.periodo === "mes" ? "este mes" : "hoy";
    const m = buildMeta({
      title: `${name} — Horóscopo de ${periodLabel} · Proyecto Astral`,
      description: `Horóscopo de ${name} para ${periodLabel}, con foco, ánimo y energía para orientar tu día.`,
      canonical: `/horoscopo/${sign?.slug ?? params.sign}`,
      robots: search?.periodo ? "noindex,follow" : undefined,
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
  notFoundComponent: () => (
    <div className="mx-auto max-w-[720px] py-20 text-center">
      <h1 className="font-display text-[24px] font-semibold text-ink">Signo no encontrado</h1>
      <p className="mt-3 font-body text-ink-soft">
        Revisa el enlace o vuelve al listado de signos.
      </p>
    </div>
  ),
  component: Page,
});

function Page() {
  const { signSlug, period, entry, moon } = Route.useLoaderData();
  return <SignHoroscopePage signSlug={signSlug} period={period} entry={entry} moon={moon} />;
}
