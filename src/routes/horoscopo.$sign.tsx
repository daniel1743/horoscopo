import { createFileRoute, notFound } from "@tanstack/react-router";
import { SignHoroscopePage } from "@/pages/horoscope/SignHoroscopePage";
import { getLatestHoroscope } from "@/lib/horoscope/repository";
import { getPeriodBySlug } from "@/config/horoscope";
import { zodiacSigns } from "@/data/zodiac-signs";
import { buildMeta, schemaOrg } from "@/config/seo";
import type { HoroscopePeriod } from "@/types/horoscope";

interface Search {
  periodo?: "hoy" | "semana" | "mes";
}

const SITE_URL = "https://proyectoastral.com";

function canonicalForSign(sign: string, periodo: Search["periodo"]): string {
  if (!periodo || periodo === "hoy") return `${SITE_URL}/horoscopo/${sign}`;
  return `${SITE_URL}/horoscopo/${sign}?periodo=${periodo}`;
}

function periodLabel(periodo: Search["periodo"]): string {
  if (periodo === "semana") return "esta semana";
  if (periodo === "mes") return "este mes";
  return "hoy";
}

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export const Route = createFileRoute("/horoscopo/$sign")({
  validateSearch: (raw: Record<string, unknown>): Search => {
    const p = raw.periodo;
    if (p === "hoy" || p === "semana" || p === "mes") return { periodo: p };
    return {};
  },
  loaderDeps: ({ search }) => ({ periodo: search.periodo ?? "hoy" }),
  loader: async ({ params, deps }) => {
    const sign = zodiacSigns.find((s) => s.slug === params.sign);
    if (!sign) throw notFound();
    const def = getPeriodBySlug(deps.periodo) ?? getPeriodBySlug("hoy")!;
    const entry = await getLatestHoroscope(sign.slug, def.key);
    return { signSlug: sign.slug, period: def.key as HoroscopePeriod, entry };
  },
  head: ({ params, deps }) => {
    const sign = zodiacSigns.find((s) => s.slug === params.sign);
    const name = sign?.name ?? "Signo";
    const label = periodLabel(deps.periodo);
    const m = buildMeta({
      title: `Horóscopo de ${name} ${label} | Proyecto Astral`,
      description: `Lee el horóscopo de ${name} ${label} con una mirada editorial sobre vínculos, trabajo, bienestar y energía personal.`,
      canonical: canonicalForSign(params.sign, deps.periodo),
    });
    return {
      meta: [
        ...m.meta,
        {
          name: "keywords",
          content: `horoscopo ${name.toLowerCase()}, signo ${name.toLowerCase()}, astrologia, zodiaco`,
        },
      ],
      links: m.links,
    };
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
  const { signSlug, period, entry } = Route.useLoaderData();
  const sign = zodiacSigns.find((s) => s.slug === signSlug);
  const name = sign?.name ?? signSlug;
  const schema = entry?.publishedAt
    ? schemaOrg.article({
        headline: `Horóscopo de ${name}`,
        description: entry.summary,
        datePublished: entry.publishedAt,
      })
    : null;

  return (
    <>
      {schema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
        />
      ) : null}
      <SignHoroscopePage signSlug={signSlug} period={period} entry={entry} />
    </>
  );
}
