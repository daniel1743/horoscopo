/**
 * YAML 12 — Adaptadores por fuente para construir SearchDocumentInput.
 * Usados por el script de sincronización server-only.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { SearchDocumentInput, SearchSourceType } from "@/types/search";
import { routes, zodiacRoute } from "@/config/routes";
import { MOON_PHASE_REGISTRY } from "@/config/moon";
import { compatibilityRoute } from "@/lib/compatibility/route-helpers";

type Client = SupabaseClient<Database>;

const ROUTE_ARTICLE = (slug: string) => `/guias/${slug}`;
const ROUTE_CATEGORY = (slug: string) => `/temas/${slug}`;
const ROUTE_AUTHOR = (slug: string) => `/autores/${slug}`;
const ROUTE_TAROT_CARD = (slug: string) => `/tarot/cartas/${slug}`;
const ROUTE_MOON_PHASE = (slug: string) => `/luna/fases/${slug}`;

function stripHtml(s: string | null | undefined): string {
  if (!s) return "";
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function joinNonEmpty(parts: (string | null | undefined)[]): string {
  return parts.map((p) => (p ? String(p) : "")).filter(Boolean).join(" · ");
}

function textFromJson(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(textFromJson).join(" ");
  if (typeof value === "object") return Object.values(value as object).map(textFromJson).join(" ");
  return String(value);
}

// ============ Articles ============
async function fetchArticles(client: Client) {
  const { data, error } = await client
    .from("editorial_articles")
    .select(
      "id, slug, title, subtitle, excerpt, content, tags, reading_time, published_at, updated_at, status, image_url, category_id, author_id, editorial_categories(key, slug, label), editorial_authors(name, slug)",
    )
    .eq("status", "published")
    .lte("published_at", new Date().toISOString());
  if (error) throw error;
  return data ?? [];
}

function mapArticle(row: Awaited<ReturnType<typeof fetchArticles>>[number]): SearchDocumentInput | null {
  if (!row.slug || !row.title) return null;
  const category = (row as any).editorial_categories;
  const author = (row as any).editorial_authors;
  const contentText = stripHtml(textFromJson(row.content)).slice(0, 4000);
  return {
    sourceType: "article",
    sourceId: row.id,
    title: row.title,
    excerpt: row.excerpt ?? row.subtitle ?? null,
    searchableText: joinNonEmpty([row.subtitle, row.excerpt, contentText, (row.tags ?? []).join(" ")]),
    keywords: [
      ...(row.tags ?? []),
      category?.label,
      author?.name,
    ].filter((v): v is string => typeof v === "string"),
    routePath: ROUTE_ARTICLE(row.slug),
    imageKey: row.image_url ?? null,
    metadata: {
      kind: "article",
      slug: row.slug,
      categoryKey: category?.key,
      authorName: author?.name,
      readingTime: row.reading_time ?? undefined,
      tags: row.tags ?? [],
    },
    language: "es",
    isPublic: true,
    sourcePublishedAt: row.published_at ?? null,
    sourceUpdatedAt: row.updated_at ?? null,
  };
}

// ============ Authors ============
async function fetchAuthors(client: Client) {
  const { data, error } = await client
    .from("editorial_authors")
    .select("id, slug, name, role_label, bio, updated_at");
  if (error) throw error;
  return data ?? [];
}

function mapAuthor(row: Awaited<ReturnType<typeof fetchAuthors>>[number]): SearchDocumentInput | null {
  if (!row.slug || !row.name) return null;
  return {
    sourceType: "author",
    sourceId: row.id,
    title: row.name,
    excerpt: row.role_label ?? null,
    searchableText: joinNonEmpty([row.role_label, row.bio]),
    keywords: [row.name, row.role_label].filter((v): v is string => typeof v === "string"),
    routePath: ROUTE_AUTHOR(row.slug),
    imageKey: null,
    metadata: { kind: "author", slug: row.slug, role: row.role_label ?? undefined },
    language: "es",
    isPublic: true,
    sourcePublishedAt: null,
    sourceUpdatedAt: row.updated_at ?? null,
  };
}

// ============ Categories ============
async function fetchCategories(client: Client) {
  const { data, error } = await client
    .from("editorial_categories")
    .select("id, key, slug, label, description, updated_at");
  if (error) throw error;
  return data ?? [];
}

function mapCategory(row: Awaited<ReturnType<typeof fetchCategories>>[number]): SearchDocumentInput | null {
  if (!row.slug || !row.label) return null;
  return {
    sourceType: "category",
    sourceId: row.id,
    title: row.label,
    excerpt: row.description ?? null,
    searchableText: row.description ?? "",
    keywords: [row.label, row.key].filter(Boolean) as string[],
    routePath: ROUTE_CATEGORY(row.slug),
    imageKey: null,
    metadata: { kind: "category", slug: row.slug },
    language: "es",
    isPublic: true,
    sourcePublishedAt: null,
    sourceUpdatedAt: row.updated_at ?? null,
  };
}

// ============ Horoscopes ============
async function fetchHoroscopes(client: Client) {
  const { data, error } = await client
    .from("horoscopes")
    .select("id, sign_slug, period, date_for, summary, focus, mood, love, work, wellbeing, published_at, updated_at")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString());
  if (error) throw error;
  return data ?? [];
}

function mapHoroscope(row: Awaited<ReturnType<typeof fetchHoroscopes>>[number]): SearchDocumentInput | null {
  if (!row.sign_slug) return null;
  const periodLabel = row.period === "daily" ? "hoy" : row.period === "weekly" ? "semana" : "mes";
  const title = `Horóscopo de ${row.sign_slug} — ${periodLabel} (${row.date_for})`;
  const path =
    row.period === "daily"
      ? routes.horoscopeToday
      : row.period === "weekly"
        ? routes.horoscopeWeek
        : row.period === "monthly"
          ? routes.horoscopeMonth
          : zodiacRoute(row.sign_slug);
  return {
    sourceType: "horoscope",
    sourceId: row.id,
    title,
    excerpt: row.summary,
    searchableText: joinNonEmpty([row.focus, row.mood, row.love, row.work, row.wellbeing]),
    keywords: [row.sign_slug, periodLabel, "horóscopo"].filter(Boolean) as string[],
    routePath: path,
    imageKey: null,
    metadata: {
      kind: "horoscope",
      signKey: row.sign_slug,
      periodType: row.period as "daily" | "weekly" | "monthly",
      periodStart: row.date_for ?? undefined,
    },
    language: "es",
    isPublic: true,
    sourcePublishedAt: row.published_at ?? null,
    sourceUpdatedAt: row.updated_at ?? null,
  };
}

// ============ Tarot cards ============
async function fetchTarotCards(client: Client) {
  const { data, error } = await client
    .from("tarot_cards")
    .select(
      "id, slug, name, arcana, suit, number, summary, upright_meaning, keywords, image_key, published_at, updated_at, status",
    )
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString());
  if (error) throw error;
  return data ?? [];
}

function mapTarotCard(row: Awaited<ReturnType<typeof fetchTarotCards>>[number]): SearchDocumentInput | null {
  if (!row.slug || !row.name) return null;
  const kws = Array.isArray(row.keywords) ? (row.keywords as unknown as string[]) : [];
  return {
    sourceType: "tarot_card",
    sourceId: row.id,
    title: row.name,
    excerpt: row.summary ?? null,
    searchableText: joinNonEmpty([row.upright_meaning, kws.join(" "), row.arcana, row.suit]),
    keywords: [row.name, ...kws, row.arcana, row.suit].filter((v): v is string => typeof v === "string"),
    routePath: ROUTE_TAROT_CARD(row.slug),
    imageKey: row.image_key ?? null,
    metadata: {
      kind: "tarot_card",
      slug: row.slug,
      arcana: row.arcana ?? "",
      number: row.number ?? undefined,
      suit: row.suit ?? undefined,
    },
    language: "es",
    isPublic: true,
    sourcePublishedAt: row.published_at ?? null,
    sourceUpdatedAt: row.updated_at ?? null,
  };
}

// ============ Moon phases ============
async function fetchMoonPhases(client: Client) {
  const { data, error } = await client
    .from("moon_phase_content")
    .select("id, phase_key, title, summary, meaning, reflection_questions, image_key, published_at, updated_at, status")
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString());
  if (error) throw error;
  return data ?? [];
}

function mapMoonPhase(row: Awaited<ReturnType<typeof fetchMoonPhases>>[number]): SearchDocumentInput | null {
  const meta = MOON_PHASE_REGISTRY[row.phase_key as keyof typeof MOON_PHASE_REGISTRY];
  if (!meta) return null;
  const questions = Array.isArray(row.reflection_questions)
    ? (row.reflection_questions as unknown as string[]).join(" ")
    : "";
  return {
    sourceType: "moon_phase",
    sourceId: row.id,
    title: row.title,
    excerpt: row.summary,
    searchableText: joinNonEmpty([row.meaning, questions, meta.label]),
    keywords: [meta.label, meta.shortLabel, "luna", row.phase_key].filter(Boolean) as string[],
    routePath: `/luna/fases/${meta.slug}`,
    imageKey: row.image_key ?? meta.imageKey,
    metadata: { kind: "moon_phase", phaseKey: row.phase_key, slug: meta.slug },
    language: "es",
    isPublic: true,
    sourcePublishedAt: row.published_at ?? null,
    sourceUpdatedAt: row.updated_at ?? null,
  };
}

// ============ Compatibility ============
async function fetchCompatibilities(client: Client) {
  const { data, error } = await client
    .from("compatibility_profiles")
    .select(
      "id, pair_key, sign_a, sign_b, title, summary, dynamic_label, relationship_dynamic, strengths, challenges, published_at, updated_at, status",
    )
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString());
  if (error) throw error;
  return data ?? [];
}

function mapCompatibility(
  row: Awaited<ReturnType<typeof fetchCompatibilities>>[number],
): SearchDocumentInput | null {
  const strengths = Array.isArray(row.strengths)
    ? (row.strengths as unknown as string[]).join(" ")
    : "";
  const challenges = Array.isArray(row.challenges)
    ? (row.challenges as unknown as string[]).join(" ")
    : "";
  return {
    sourceType: "compatibility",
    sourceId: row.id,
    title: row.title,
    excerpt: row.summary,
    searchableText: joinNonEmpty([row.relationship_dynamic, row.dynamic_label, strengths, challenges]),
    keywords: [row.sign_a, row.sign_b, "compatibilidad", row.dynamic_label ?? ""].filter(Boolean) as string[],
    routePath: compatibilityRoute(row.sign_a as any, row.sign_b as any),
    imageKey: null,
    metadata: {
      kind: "compatibility",
      pairKey: row.pair_key,
      signA: row.sign_a,
      signB: row.sign_b,
    },
    language: "es",
    isPublic: true,
    sourcePublishedAt: row.published_at ?? null,
    sourceUpdatedAt: row.updated_at ?? null,
  };
}

// ============ Registry ============
export interface AdapterEntry {
  sourceType: Exclude<SearchSourceType, "zodiac_sign" | "static_page">;
  fetchAll: (client: Client) => Promise<unknown[]>;
  toDocument: (row: any) => SearchDocumentInput | null;
}

export const SEARCH_SOURCE_REGISTRY: readonly AdapterEntry[] = [
  { sourceType: "article", fetchAll: fetchArticles, toDocument: mapArticle },
  { sourceType: "author", fetchAll: fetchAuthors, toDocument: mapAuthor },
  { sourceType: "category", fetchAll: fetchCategories, toDocument: mapCategory },
  { sourceType: "horoscope", fetchAll: fetchHoroscopes, toDocument: mapHoroscope },
  { sourceType: "tarot_card", fetchAll: fetchTarotCards, toDocument: mapTarotCard },
  { sourceType: "moon_phase", fetchAll: fetchMoonPhases, toDocument: mapMoonPhase },
  { sourceType: "compatibility", fetchAll: fetchCompatibilities, toDocument: mapCompatibility },
];
