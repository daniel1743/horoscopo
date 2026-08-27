/**
 * Tipos del sistema editorial. Coinciden con las tablas de Supabase
 * `editorial_categories`, `editorial_authors`, `editorial_articles`.
 * Mantener actualizado si cambia el esquema.
 */

export type EditorialStatus = "draft" | "published" | "archived";

export type EditorialCategoryKey =
  "astrology" | "tarot" | "moon" | "compatibility" | "horoscope" | "editorial";

export interface EditorialCategory {
  id: string;
  key: EditorialCategoryKey;
  slug: string;
  label: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
}

export interface EditorialAuthor {
  id: string;
  slug: string;
  name: string;
  roleLabel: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

/* ---------------- Bloques de contenido ---------------- */

export interface BlockParagraph {
  type: "paragraph";
  text: string;
}
export interface BlockHeading {
  type: "heading";
  level: 2 | 3 | 4;
  text: string;
  id: string;
}
export interface BlockList {
  type: "list";
  style: "unordered" | "ordered";
  items: string[];
}
export interface BlockQuote {
  type: "quote";
  text: string;
  attribution?: string;
}
export interface BlockCallout {
  type: "callout";
  variant: "reflection" | "important" | "context" | "caution";
  title?: string;
  content: string;
}
export interface BlockImage {
  type: "image";
  image_url: string;
  alt: string;
  caption?: string;
  credit?: string;
}
export interface BlockDivider {
  type: "divider";
}
export interface BlockKeyPoints {
  type: "key_points";
  title?: string;
  items: string[];
}
export interface BlockDisclaimer {
  type: "disclaimer";
  disclaimer_key: string;
}

export type ArticleContentBlock =
  | BlockParagraph
  | BlockHeading
  | BlockList
  | BlockQuote
  | BlockCallout
  | BlockImage
  | BlockDivider
  | BlockKeyPoints
  | BlockDisclaimer;

export interface ArticleSeoData {
  title?: string;
  description?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
}

export interface EditorialReference {
  label: string;
  url?: string;
}

export interface EditorialArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string;
  categoryId: string;
  authorId: string;
  status: EditorialStatus;
  imageUrl: string | null;
  imageAlt: string | null;
  content: ArticleContentBlock[];
  seo: ArticleSeoData;
  tags: string[];
  readingTime: number | null;
  featured: boolean;
  homeFeatured: boolean;
  sources: EditorialReference[];
  relatedArticleIds: string[];
  disclaimerKey: string | null;
  reviewedBy: string | null;
  reviewDate: string | null;
  canonicalOverride: string | null;
  isDemo: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

export interface ArticleWithRelations extends EditorialArticle {
  category: EditorialCategory;
  author: EditorialAuthor;
}
