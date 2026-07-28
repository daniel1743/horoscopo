/**
 * Repositorio editorial: única capa que habla con Supabase.
 * Las páginas y componentes NUNCA consultan supabase directamente.
 * Portable: usa `@supabase/supabase-js` estándar vía env vars.
 */
import { supabase } from "@/integrations/supabase/client";
import type {
  ArticleContentBlock,
  ArticleSeoData,
  ArticleWithRelations,
  EditorialArticle,
  EditorialAuthor,
  EditorialCategory,
  EditorialCategoryKey,
  EditorialReference,
} from "@/types/editorial";
import { calculateReadingTime } from "./reading-time";

/* ---------------- Mapeadores ---------------- */

interface CategoryRow {
  id: string;
  key: string;
  slug: string;
  label: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
}

interface AuthorRow {
  id: string;
  slug: string;
  name: string;
  role_label: string | null;
  bio: string | null;
  avatar_url: string | null;
}

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string;
  category_id: string;
  author_id: string;
  status: string;
  image_url: string | null;
  image_alt: string | null;
  content: unknown;
  seo: unknown;
  tags: string[] | null;
  reading_time: number | null;
  featured: boolean;
  home_featured: boolean;
  sources: unknown;
  related_article_ids: string[] | null;
  disclaimer_key: string | null;
  reviewed_by: string | null;
  review_date: string | null;
  canonical_override: string | null;
  is_demo: boolean;
  published_at: string | null;
  updated_at: string;
}

function mapCategory(r: CategoryRow): EditorialCategory {
  return {
    id: r.id,
    key: r.key as EditorialCategoryKey,
    slug: r.slug,
    label: r.label,
    description: r.description,
    icon: r.icon,
    sortOrder: r.sort_order,
  };
}

function mapAuthor(r: AuthorRow): EditorialAuthor {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    roleLabel: r.role_label,
    bio: r.bio,
    avatarUrl: r.avatar_url,
  };
}

function mapArticle(r: ArticleRow): EditorialArticle {
  const content = (Array.isArray(r.content) ? r.content : []) as ArticleContentBlock[];
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle,
    excerpt: r.excerpt,
    categoryId: r.category_id,
    authorId: r.author_id,
    status: r.status as EditorialArticle["status"],
    imageUrl: r.image_url,
    imageAlt: r.image_alt,
    content,
    seo: (r.seo as ArticleSeoData) ?? {},
    tags: r.tags ?? [],
    readingTime: r.reading_time ?? calculateReadingTime(content),
    featured: r.featured,
    homeFeatured: r.home_featured,
    sources: (Array.isArray(r.sources) ? r.sources : []) as EditorialReference[],
    relatedArticleIds: r.related_article_ids ?? [],
    disclaimerKey: r.disclaimer_key,
    reviewedBy: r.reviewed_by,
    reviewDate: r.review_date,
    canonicalOverride: r.canonical_override,
    isDemo: r.is_demo,
    publishedAt: r.published_at,
    updatedAt: r.updated_at,
  };
}

/* ---------------- Consultas ---------------- */

const ARTICLE_COLUMNS =
  "id,slug,title,subtitle,excerpt,category_id,author_id,status,image_url,image_alt,content,seo,tags,reading_time,featured,home_featured,sources,related_article_ids,disclaimer_key,reviewed_by,review_date,canonical_override,is_demo,published_at,updated_at";

const cli = () => supabase as unknown as import("@supabase/supabase-js").SupabaseClient;

export async function listCategories(): Promise<EditorialCategory[]> {
  const { data, error } = await cli()
    .from("editorial_categories")
    .select("id,key,slug,label,description,icon,sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as CategoryRow[]).map(mapCategory);
}

export async function getCategoryBySlug(slug: string): Promise<EditorialCategory | null> {
  const { data, error } = await cli()
    .from("editorial_categories")
    .select("id,key,slug,label,description,icon,sort_order")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCategory(data as CategoryRow) : null;
}

export async function listAuthors(): Promise<EditorialAuthor[]> {
  const { data, error } = await cli()
    .from("editorial_authors")
    .select("id,slug,name,role_label,bio,avatar_url")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data as AuthorRow[]).map(mapAuthor);
}

export async function getAuthorBySlug(slug: string): Promise<EditorialAuthor | null> {
  const { data, error } = await cli()
    .from("editorial_authors")
    .select("id,slug,name,role_label,bio,avatar_url")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapAuthor(data as AuthorRow) : null;
}

export async function listPublishedArticles(opts?: {
  categoryId?: string;
  authorId?: string;
  homeFeatured?: boolean;
  limit?: number;
}): Promise<EditorialArticle[]> {
  let q = cli()
    .from("editorial_articles")
    .select(ARTICLE_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (opts?.categoryId) q = q.eq("category_id", opts.categoryId);
  if (opts?.authorId) q = q.eq("author_id", opts.authorId);
  if (opts?.homeFeatured) q = q.eq("home_featured", true);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data as ArticleRow[]).map(mapArticle);
}

export async function getArticleBySlug(slug: string): Promise<ArticleWithRelations | null> {
  const { data, error } = await cli()
    .from("editorial_articles")
    .select(ARTICLE_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const article = mapArticle(data as ArticleRow);

  const [catRes, authRes] = await Promise.all([
    cli()
      .from("editorial_categories")
      .select("id,key,slug,label,description,icon,sort_order")
      .eq("id", article.categoryId)
      .maybeSingle(),
    cli()
      .from("editorial_authors")
      .select("id,slug,name,role_label,bio,avatar_url")
      .eq("id", article.authorId)
      .maybeSingle(),
  ]);
  if (catRes.error) throw catRes.error;
  if (authRes.error) throw authRes.error;
  if (!catRes.data || !authRes.data) return null;

  return {
    ...article,
    category: mapCategory(catRes.data as CategoryRow),
    author: mapAuthor(authRes.data as AuthorRow),
  };
}

export async function listRelatedArticles(
  article: EditorialArticle,
  limit = 3,
): Promise<EditorialArticle[]> {
  if (article.relatedArticleIds.length > 0) {
    const { data, error } = await cli()
      .from("editorial_articles")
      .select(ARTICLE_COLUMNS)
      .in("id", article.relatedArticleIds)
      .eq("status", "published")
      .limit(limit);
    if (error) throw error;
    return (data as ArticleRow[]).map(mapArticle);
  }
  // Fallback: mismos criterios de categoría
  const { data, error } = await cli()
    .from("editorial_articles")
    .select(ARTICLE_COLUMNS)
    .eq("status", "published")
    .eq("category_id", article.categoryId)
    .neq("id", article.id)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as ArticleRow[]).map(mapArticle);
}
