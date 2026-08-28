import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { absoluteUrl, buildMeta } from "@/config/seo";
import {
  routes,
  compatibilityRoute,
  moonCalendarMonthRoute,
  moonPhaseRoute,
  tarotCardRoute,
  zodiacRoute,
} from "@/config/routes";
import { majorArcana } from "@/data/tarot-cards";
import {
  getSitemapEntries,
  getSitemapEntriesWithPublishedTarot,
  buildSitemapXml,
} from "@/routes/sitemap[.]xml";
import { moonCalendarCanonicalUrl } from "@/routes/luna.calendario.index";
import {
  getTarotCardMetaInput,
  loadTarotCardRouteData,
  parseTarotCardParams,
} from "@/routes/tarot.cartas.$card";
import { getMoonPhaseHeadMetadata } from "@/routes/luna.fases.$slug";
import { requirePublicProfile } from "@/routes/u.$username";
import { tarotThreeCardsGeneralMeta } from "@/routes/tarot.tres-cartas.index";
import { threeCardReadings } from "@/config/three-card-readings";
import { MOON_PHASE_REGISTRY } from "@/config/moon";
import {
  GEMINI_SAGITTARIUS_META_DESCRIPTION,
  buildCompatibilityPairMeta,
  getCompatibilityPairMeta,
} from "@/routes/compatibilidad.$signA.$signB";
import { buildFallbackCompatibilityProfile } from "@/lib/compatibility/fallback-compatibility";
import { normalizeSignPair } from "@/lib/compatibility/normalize-sign-pair";
import {
  indexableCompatibilityPairs,
  isIndexableCompatibilityPair,
} from "@/config/compatibility-indexability";
import {
  filterIndexableAlternativePairs,
  getIndexableCompatibilityPairForSign,
} from "@/config/compatibility-internal-links";
import type { CompatibilityProfile, ZodiacSignKey } from "@/types/compatibility";
import type { TarotCard } from "@/types/tarot";

function metaContent(
  meta: Array<Record<string, string>>,
  key: "name" | "property",
  value: string,
): string | undefined {
  return meta.find((item) => item[key] === value)?.content;
}

function compatibilityProfile(signA: ZodiacSignKey, signB: ZodiacSignKey): CompatibilityProfile {
  const normalized = normalizeSignPair(signA, signB);

  return {
    id: normalized.pair_key,
    pairKey: normalized.pair_key,
    signA: normalized.sign_a,
    signB: normalized.sign_b,
    title: `Compatibilidad ${normalized.sign_a} y ${normalized.sign_b}`,
    summary: "Resumen de prueba.",
    dynamicLabel: null,
    relationshipDynamic: "Dinámica de prueba.",
    dimensions: {},
    strengths: [],
    challenges: [],
    communicationTips: [],
    contexts: {},
    reflectionQuestions: [],
    misconceptions: [],
    disclaimerKey: "test",
    status: "published",
    isDemo: false,
    seoTitle: null,
    seoDescription: null,
    publishedAt: null,
  };
}

function tarotCard(slug: string, name: string): TarotCard {
  return {
    id: slug,
    cardKey: slug.replace(/-/g, "_"),
    slug,
    name,
    arcana: "minor",
    number: null,
    suit: "cups",
    rank: "ace",
    summary: `Resumen de ${name}.`,
    uprightMeaning: `Significado de ${name}.`,
    reversedMeaning: null,
    keywords: ["prueba"],
    reflectionQuestion: null,
    yesNoTendency: "open",
    imageKey: slug,
    displayOrder: 100,
    isDemo: false,
    seoTitle: null,
    seoDescription: null,
    publishedAt: "2026-08-18T00:00:00.000Z",
  };
}

describe("SEO indexability and canonical consistency", () => {
  it("includes public tarot core routes and Tu Luna in the sitemap", () => {
    const paths = getSitemapEntries().map((entry) => entry.path);

    expect(paths).toContain(routes.tarot);
    expect(paths).toContain(routes.tarotDaily);
    expect(paths).toContain(routes.tarotYesNo);
    expect(paths).toContain(routes.tarotThreeCards);
    expect(paths).toContain(routes.tarotThreeCardsAmor);
    expect(paths).toContain(routes.tarotThreeCardsTrabajo);
    expect(paths).toContain(routes.tarotThreeCardsDecision);
    expect(paths).toContain(routes.tarotLibrary);
    expect(paths).toContain(routes.moonPersonalToday);
  });

  it("keeps the lunar hub and its primary pathways in the sitemap", () => {
    const paths = getSitemapEntries().map((entry) => entry.path);

    expect(paths).toContain(routes.moon);
    expect(paths).toContain(routes.moonPersonalToday);
    expect(paths).toContain(routes.moonToday);
    expect(paths).toContain(routes.moonCalendar);
    expect(paths).toContain(routes.moonPhases);
  });

  it("does not generate duplicate sitemap URLs", () => {
    const paths = getSitemapEntries().map((entry) => entry.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("does not include deliberately noindex search in the sitemap", () => {
    const paths = getSitemapEntries().map((entry) => entry.path);
    expect(paths).not.toContain(routes.search);
  });

  it("keeps the static sitemap fallback limited to locally known tarot cards", () => {
    const paths = getSitemapEntries().map((entry) => entry.path);
    const tarotCardPaths = paths.filter((path) => path.startsWith(`${routes.tarotLibrary}/`));

    expect(tarotCardPaths).toHaveLength(majorArcana.length);
    expect(tarotCardPaths).toContain(tarotCardRoute("el-loco"));
  });

  it("builds the production sitemap from the published tarot catalog source", async () => {
    const publishedCards = [
      tarotCard("el-loco", "El Loco"),
      tarotCard("as-de-copas", "As de Copas"),
      tarotCard("dos-de-espadas", "Dos de Espadas"),
    ];
    const entries = await getSitemapEntriesWithPublishedTarot({
      getLibrary: async () => publishedCards,
    });
    const paths = entries.map((entry) => entry.path);
    const tarotCardPaths = paths.filter((path) => path.startsWith(`${routes.tarotLibrary}/`));

    expect(tarotCardPaths).toHaveLength(publishedCards.length);
    expect(paths).toContain(tarotCardRoute("el-loco"));
    expect(paths).toContain(tarotCardRoute("as-de-copas"));
    expect(paths).toContain(tarotCardRoute("dos-de-espadas"));
    expect(paths).not.toContain(tarotCardRoute("carta-inexistente"));
    expect(paths).not.toContain("/compatibilidad/aries/aries");
  });

  it("builds sitemap XML with the canonical host", () => {
    const xml = buildSitemapXml([
      { path: routes.tarotYesNo, priority: "0.8", changefreq: "weekly" },
    ]);
    expect(xml).toContain(`<loc>${absoluteUrl(routes.tarotYesNo)}</loc>`);
  });

  it("uses the canonical www origin for protected and lunar phase routes", () => {
    expect(absoluteUrl(routes.home)).toBe("https://www.creovision.io/");
    expect(absoluteUrl(routes.horoscope)).toBe("https://www.creovision.io/horoscopo");
    expect(absoluteUrl(routes.horoscopeToday)).toBe("https://www.creovision.io/horoscopo/hoy");
    expect(absoluteUrl(zodiacRoute("aries"))).toBe("https://www.creovision.io/horoscopo/aries");
    expect(absoluteUrl(routes.moonPhases)).toBe("https://www.creovision.io/luna/fases");
    expect(absoluteUrl(moonCalendarMonthRoute(2026, 8))).toBe(
      "https://www.creovision.io/luna/calendario/2026-08",
    );
    expect(absoluteUrl(routes.guides)).toBe("https://www.creovision.io/guias");
    expect(absoluteUrl(moonPhaseRoute("luna-creciente"))).toBe(
      "https://www.creovision.io/luna/fases/luna-creciente",
    );
  });

  it("keeps corrected canonicals query-free and trailing-slash normalized", () => {
    const canonicals = [
      routes.horoscope,
      routes.horoscopeToday,
      zodiacRoute("aries"),
      routes.moonPhases,
      moonCalendarMonthRoute(2026, 8),
      routes.guides,
      moonPhaseRoute("luna-creciente"),
    ].map(absoluteUrl);

    for (const canonical of canonicals) {
      expect(canonical).toContain("https://www.creovision.io/");
      expect(canonical).not.toContain("?");
      expect(canonical).not.toContain("#");
      expect(canonical.endsWith("/")).toBe(false);
    }
  });

  it("uses self canonical and matching og:url when canonical is provided", () => {
    const result = buildMeta({
      title: "Tarot sí o no · Creovision",
      canonical: routes.tarotYesNo,
    });

    expect(result.links).toContainEqual({ rel: "canonical", href: absoluteUrl(routes.tarotYesNo) });
    expect(metaContent(result.meta, "property", "og:url")).toBe(absoluteUrl(routes.tarotYesNo));
  });

  it("uses self canonical and matching og:url for home, horoscope and lunar phase", () => {
    const home = buildMeta({ title: "Home", canonical: routes.home });
    const horoscope = buildMeta({ title: "Horóscopo", canonical: routes.horoscope });
    const moonPhase = buildMeta({
      title: "Luna creciente",
      canonical: moonPhaseRoute("luna-creciente"),
      type: "article",
    });

    expect(home.links).toContainEqual({ rel: "canonical", href: absoluteUrl(routes.home) });
    expect(metaContent(home.meta, "property", "og:url")).toBe(absoluteUrl(routes.home));

    expect(horoscope.links).toContainEqual({
      rel: "canonical",
      href: absoluteUrl(routes.horoscope),
    });
    expect(metaContent(horoscope.meta, "property", "og:url")).toBe(absoluteUrl(routes.horoscope));

    expect(moonPhase.links).toContainEqual({
      rel: "canonical",
      href: absoluteUrl(moonPhaseRoute("luna-creciente")),
    });
    expect(metaContent(moonPhase.meta, "property", "og:url")).toBe(
      absoluteUrl(moonPhaseRoute("luna-creciente")),
    );
  });

  it("preserves the lunar hub self canonical and og:url", () => {
    const moon = buildMeta({
      title: "Luna hoy, calendario y fases — Creovision",
      description:
        "Fase lunar de hoy, calendario mensual y las ocho fases del ciclo, calculadas con un motor astronómico validado.",
      canonical: routes.moon,
    });

    expect(moon.links).toContainEqual({ rel: "canonical", href: absoluteUrl(routes.moon) });
    expect(metaContent(moon.meta, "property", "og:url")).toBe(absoluteUrl(routes.moon));
    expect(metaContent(moon.meta, "name", "robots")).toContain("index, follow");
  });

  it("uses the canonical www URL for the lunar calendar index", () => {
    expect(moonCalendarCanonicalUrl).toBe("https://www.creovision.io/luna/calendario");
    expect(moonCalendarCanonicalUrl).not.toContain("?");
    expect(moonCalendarCanonicalUrl).not.toContain("#");
    expect(moonCalendarCanonicalUrl.endsWith("/")).toBe(false);
  });

  it("does not silently point og:url to home when canonical is missing", () => {
    const result = buildMeta({ title: "Página interna sin canonical" });
    expect(metaContent(result.meta, "property", "og:url")).toBeUndefined();
  });

  it("keeps themed tarot canonicals distinct", () => {
    const amor = buildMeta({ title: "Amor", canonical: routes.tarotThreeCardsAmor });
    const trabajo = buildMeta({ title: "Trabajo", canonical: routes.tarotThreeCardsTrabajo });
    const decision = buildMeta({ title: "Decisión", canonical: routes.tarotThreeCardsDecision });

    expect(metaContent(amor.meta, "property", "og:url")).toBe(
      absoluteUrl(routes.tarotThreeCardsAmor),
    );
    expect(metaContent(trabajo.meta, "property", "og:url")).toBe(
      absoluteUrl(routes.tarotThreeCardsTrabajo),
    );
    expect(metaContent(decision.meta, "property", "og:url")).toBe(
      absoluteUrl(routes.tarotThreeCardsDecision),
    );
  });

  it("aligns the general three-card tarot description with the real spread", () => {
    const result = buildMeta(tarotThreeCardsGeneralMeta);
    const description = metaContent(result.meta, "name", "description");

    expect(tarotThreeCardsGeneralMeta.title).toBe(
      "Tirada de Tarot de 3 cartas gratis · Creovision",
    );
    expect(tarotThreeCardsGeneralMeta.canonical).toBe(routes.tarotThreeCards);
    expect(result.links).toContainEqual({
      rel: "canonical",
      href: absoluteUrl(routes.tarotThreeCards),
    });
    expect(description).toContain("situación abierta");
    expect(description).toContain("influencia");
    expect(description).toContain("qué mirar");
    expect(description).toContain("próximo paso");
    expect(description).not.toMatch(/pasado|presente|futuro/i);
  });

  it("preserves the protected work three-card tarot metadata contract", () => {
    const trabajo = threeCardReadings.trabajo;
    const result = buildMeta({
      title: trabajo.seo.title,
      description: trabajo.seo.description,
      canonical: trabajo.seo.canonical,
    });

    expect(trabajo.seo.title).toBe("Tirada de Tarot de Trabajo de 3 cartas | Creovision");
    expect(trabajo.seo.description).toBe(
      "Una lectura enfocada en tu ámbito laboral o profesional: situación actual, desafío u oportunidad, y una acción recomendada.",
    );
    expect(trabajo.seo.canonical).toBe(routes.tarotThreeCardsTrabajo);
    expect(metaContent(result.meta, "property", "og:url")).toBe(
      absoluteUrl(routes.tarotThreeCardsTrabajo),
    );
  });

  it("keeps compatibility canonical URLs normalized by the route helper", () => {
    const canonical = compatibilityRoute("geminis", "sagitario");
    const result = buildMeta({ title: "Compatibilidad", canonical });

    expect(result.links).toContainEqual({ rel: "canonical", href: absoluteUrl(canonical) });
    expect(canonical).toBe("/compatibilidad/geminis/sagitario");
  });

  it("uses the approved Gemini and Sagittarius compatibility description only for that pair", () => {
    const target = getCompatibilityPairMeta("geminis", "sagitario");
    const cancerCapricorn = getCompatibilityPairMeta("cancer", "capricornio");
    const ariesLibra = getCompatibilityPairMeta("aries", "libra");
    const result = buildMeta(target);

    expect(target.title).toBe("Géminis y Sagitario: compatibilidad simbólica · Creovision");
    expect(target.description).toBe(GEMINI_SAGITTARIUS_META_DESCRIPTION);
    expect(target.canonical).toBe("/compatibilidad/geminis/sagitario");
    expect(result.links).toContainEqual({
      rel: "canonical",
      href: "https://www.creovision.io/compatibilidad/geminis/sagitario",
    });
    expect(metaContent(result.meta, "property", "og:url")).toBe(
      "https://www.creovision.io/compatibilidad/geminis/sagitario",
    );
    expect(cancerCapricorn.description).toBe(
      "Lectura editorial de la dinámica entre Cáncer y Capricornio: comunicación, ritmo emocional y áreas de crecimiento.",
    );
    expect(ariesLibra.description).toBe(
      "Lectura editorial de la dinámica entre Aries y Libra: comunicación, ritmo emocional y áreas de crecimiento.",
    );
  });

  it("keeps Gemini and Sagittarius as a single canonical compatibility URL", () => {
    const forward = normalizeSignPair("geminis", "sagitario");
    const reverse = normalizeSignPair("sagitario", "geminis");
    const forwardCanonical = compatibilityRoute("geminis", "sagitario");
    const reverseCanonical = compatibilityRoute("sagitario", "geminis");

    expect(forward.pair_key).toBe("geminis__sagitario");
    expect(reverse).toEqual(forward);
    expect(forwardCanonical).toBe("/compatibilidad/geminis/sagitario");
    expect(reverseCanonical).toBe(forwardCanonical);
    expect(absoluteUrl(reverseCanonical)).toBe(
      "https://www.creovision.io/compatibilidad/geminis/sagitario",
    );
  });

  it("keeps SEO-06B internal link targets on existing route helpers", () => {
    expect(zodiacRoute("geminis")).toBe("/horoscopo/geminis");
    expect(zodiacRoute("sagitario")).toBe("/horoscopo/sagitario");
    expect(routes.compatibility).toBe("/compatibilidad");
    expect(absoluteUrl(zodiacRoute("geminis"))).toBe("https://www.creovision.io/horoscopo/geminis");
    expect(absoluteUrl(zodiacRoute("sagitario"))).toBe(
      "https://www.creovision.io/horoscopo/sagitario",
    );
    expect(absoluteUrl(routes.compatibility)).toBe("https://www.creovision.io/compatibilidad");
  });

  it("characterizes compatibility fallback without changing its indexability policy", () => {
    const realProfileFallbackShape = buildFallbackCompatibilityProfile("geminis", "sagitario");
    const validUnpublishedFallback = buildFallbackCompatibilityProfile("aries", "aries");

    expect(realProfileFallbackShape.pairKey).toBe("geminis__sagitario");
    expect(realProfileFallbackShape.isDemo).toBe(true);
    expect(realProfileFallbackShape.status).toBe("published");
    expect(realProfileFallbackShape.seoDescription).toContain("Géminis y Sagitario");

    expect(validUnpublishedFallback.pairKey).toBe("aries__aries");
    expect(validUnpublishedFallback.signA).toBe("aries");
    expect(validUnpublishedFallback.signB).toBe("aries");
    expect(validUnpublishedFallback.isDemo).toBe(true);
    expect(validUnpublishedFallback.status).toBe("published");
    expect(() => buildFallbackCompatibilityProfile("invalid", "aries")).toThrow();
  });

  it("keeps approved compatibility profiles indexable and fallback-only pairs noindex follow", () => {
    const geminiSagittarius = buildCompatibilityPairMeta("geminis", "sagitario");
    const cancerCapricorn = buildCompatibilityPairMeta("cancer", "capricornio");
    const ariesLibra = buildCompatibilityPairMeta("aries", "libra");
    const fallbackOnly = buildCompatibilityPairMeta("aries", "aries");

    expect(metaContent(geminiSagittarius.meta, "name", "robots")).toContain("index, follow");
    expect(metaContent(cancerCapricorn.meta, "name", "robots")).toContain("index, follow");
    expect(metaContent(ariesLibra.meta, "name", "robots")).toContain("index, follow");
    expect(metaContent(fallbackOnly.meta, "name", "robots")).toBe("noindex, follow");
    expect(fallbackOnly.links).toContainEqual({
      rel: "canonical",
      href: "https://www.creovision.io/compatibilidad/aries/aries",
    });
  });

  it("keeps the compatibility sitemap limited to indexable compatibility pairs", () => {
    const paths = getSitemapEntries().map((entry) => entry.path);
    const expected = indexableCompatibilityPairs().map((pair) =>
      compatibilityRoute(pair.signA, pair.signB),
    );
    const compatibilityPaths = paths.filter((path) => path.startsWith(`${routes.compatibility}/`));

    expect(isIndexableCompatibilityPair("sagitario", "geminis")).toBe(true);
    expect(isIndexableCompatibilityPair("aries", "aries")).toBe(false);
    expect(compatibilityPaths.sort()).toEqual(expected.sort());
    expect(paths).toContain("/compatibilidad/geminis/sagitario");
    expect(paths).toContain("/compatibilidad/cancer/capricornio");
    expect(paths).toContain("/compatibilidad/aries/libra");
    expect(paths).not.toContain("/compatibilidad/aries/aries");
  });

  it("keeps SEO-07B compatibility link destinations on valid route helpers", () => {
    for (const pair of indexableCompatibilityPairs()) {
      expect(compatibilityRoute(pair.signA, pair.signB)).toMatch(/^\/compatibilidad\//);
      expect(zodiacRoute(pair.signA)).toMatch(/^\/horoscopo\//);
      expect(zodiacRoute(pair.signB)).toMatch(/^\/horoscopo\//);
    }

    expect(compatibilityRoute("geminis", "sagitario")).toBe("/compatibilidad/geminis/sagitario");
    expect(zodiacRoute("geminis")).toBe("/horoscopo/geminis");
    expect(zodiacRoute("sagitario")).toBe("/horoscopo/sagitario");
  });

  it("filters compatibility alternatives to indexable pairs only", () => {
    const alternatives = [
      compatibilityProfile("geminis", "sagitario"),
      compatibilityProfile("aries", "aries"),
      compatibilityProfile("cancer", "capricornio"),
    ];

    const filtered = filterIndexableAlternativePairs(alternatives);

    expect(filtered.map((profile) => profile.pairKey)).toEqual([
      "geminis__sagitario",
      "cancer__capricornio",
    ]);
    expect(filtered.map((profile) => profile.pairKey)).not.toContain("aries__aries");
  });

  it("derives sign to compatibility links from the indexable compatibility registry", () => {
    expect(getIndexableCompatibilityPairForSign("geminis")).toMatchObject({
      signA: "geminis",
      signB: "sagitario",
      signAName: "Géminis",
      signBName: "Sagitario",
    });
    expect(getIndexableCompatibilityPairForSign("sagitario")).toMatchObject({
      signA: "geminis",
      signB: "sagitario",
    });
    expect(getIndexableCompatibilityPairForSign("tauro")).toBeNull();
  });

  it("includes corrected canonical paths in the sitemap entries", () => {
    const paths = getSitemapEntries().map((entry) => entry.path);

    expect(paths).toContain(routes.home);
    expect(paths).toContain(routes.horoscope);
    expect(paths).toContain(routes.horoscopeToday);
    expect(paths).toContain(zodiacRoute("aries"));
    expect(paths).toContain(routes.moonPhases);
    expect(paths).toContain(routes.guides);
    expect(paths).toContain(moonPhaseRoute("luna-creciente"));
  });

  it("keeps known tarot card slugs routable and rejects unknown card slugs", () => {
    expect(parseTarotCardParams({ card: "el-loco" })).toEqual({ card: "el-loco" });
    expect(parseTarotCardParams({ card: "as-de-copas" })).toEqual({ card: "as-de-copas" });
    expect(parseTarotCardParams({ card: "dos-de-espadas" })).toEqual({
      card: "dos-de-espadas",
    });
    expect(() => parseTarotCardParams({ card: "" })).toThrow();
  });

  it("loads real tarot cards through the runtime source and preserves notFound for missing cards", async () => {
    const cards = new Map([
      ["as-de-copas", tarotCard("as-de-copas", "As de Copas")],
      ["dos-de-espadas", tarotCard("dos-de-espadas", "Dos de Espadas")],
    ]);
    const service = {
      getCardBySlug: async (slug: string) => cards.get(slug) ?? null,
    };

    await expect(loadTarotCardRouteData("as-de-copas", service)).resolves.toMatchObject({
      card: { slug: "as-de-copas", name: "As de Copas" },
    });
    await expect(loadTarotCardRouteData("dos-de-espadas", service)).resolves.toMatchObject({
      card: { slug: "dos-de-espadas", name: "Dos de Espadas" },
    });
    await expect(loadTarotCardRouteData("carta-inexistente", service)).rejects.toThrow();
  });

  it("preserves tarot card metadata pattern and canonical for dynamically loaded cards", () => {
    const meta = getTarotCardMetaInput("as-de-copas", tarotCard("as-de-copas", "As de Copas"));
    const result = buildMeta(meta);

    expect(meta.title).toBe("As de Copas · Tarot · Creovision");
    expect(meta.description).toBe(
      "Significado simbólico y palabras clave de la carta As de Copas.",
    );
    expect(result.links).toContainEqual({
      rel: "canonical",
      href: "https://www.creovision.io/tarot/cartas/as-de-copas",
    });
  });

  it("uses curated lunar phase metadata and keeps the existing fallback safe", () => {
    const meta = MOON_PHASE_REGISTRY.waxing_crescent;
    const curated = getMoonPhaseHeadMetadata(meta, {
      seo_title: "Luna creciente | Significado y ciclo",
      seo_description: "Astronomía y lectura simbólica de la Luna creciente en el ciclo sinódico.",
    });
    const fallback = getMoonPhaseHeadMetadata(meta, {
      seo_title: null,
      seo_description: "",
    });

    expect(curated.title).toBe("Luna creciente | Significado y ciclo");
    expect(curated.description).toBe(
      "Astronomía y lectura simbólica de la Luna creciente en el ciclo sinódico.",
    );
    expect(fallback.title).toBe("Luna creciente — Creovision");
    expect(fallback.description).toBe(
      "Luna creciente: astronomía y lectura simbólica en Creovision.",
    );
    expect(absoluteUrl(moonPhaseRoute(meta.slug))).toBe(
      "https://www.creovision.io/luna/fases/luna-creciente",
    );
  });

  it("keeps the Proyecto Astral brand fix migration scoped to the demo article SEO field", () => {
    const migration = readFileSync(
      "supabase/migrations/20260818233000_fix_demo_article_project_astral_brand.sql",
      "utf8",
    );

    expect(migration).toContain("UPDATE public.editorial_articles");
    expect(migration).toContain("WHERE slug = 'articulo-de-demostracion'");
    expect(migration).toContain("seo ->> 'title' = 'Artículo de demostración — Proyecto Astral'");
    expect(migration).toContain("Artículo de demostración — Creovision");
    expect(migration).toContain(
      "Contenido de ejemplo utilizado para validar la infraestructura editorial de Creovision.",
    );
    expect(migration).not.toMatch(/UPDATE public\.editorial_articles\s*;/i);
  });

  it("keeps loaded public profiles routable and rejects missing public profiles", () => {
    const profile = {
      id: "profile-id",
      username: "usuario",
      display_name: "Usuario",
      avatar_url: null,
      cover_url: null,
      bio: null,
      created_at: "2026-08-17T00:00:00.000Z",
      sun_sign: null,
      moon_sign: null,
      favorite_signs: null,
    };

    expect(requirePublicProfile(profile)).toBe(profile);
    expect(() => requirePublicProfile(null)).toThrow();
  });
});
