import {
  getArticleBySlug,
  getCategoryBySlug,
  listAuthors,
  listCategories,
  listPublishedArticles,
  listRelatedArticles,
} from "@/lib/editorial/repository";
import {
  localGuideArticles,
  localGuideAuthor,
  localGuideCategories,
} from "@/data/editorial-guides";
import type {
  ArticleWithRelations,
  EditorialArticle,
  EditorialAuthor,
  EditorialCategory,
} from "@/types/editorial";

const REMOTE_TIMEOUT_MS = 900;

function withTimeout<T>(promise: Promise<T>, milliseconds = REMOTE_TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Editorial remote repository timeout")),
      milliseconds,
    );
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

function mergeByKey<T>(remote: T[], local: T[], getKey: (item: T) => string): T[] {
  const merged = new Map(local.map((item) => [getKey(item), item]));
  remote.forEach((item) => merged.set(getKey(item), item));
  return [...merged.values()];
}

function localArticlesFor(options?: {
  categoryId?: string;
  authorId?: string;
  homeFeatured?: boolean;
  limit?: number;
}): EditorialArticle[] {
  let articles = [...localGuideArticles];
  if (options?.categoryId)
    articles = articles.filter((article) => article.categoryId === options.categoryId);
  if (options?.authorId)
    articles = articles.filter((article) => article.authorId === options.authorId);
  if (options?.homeFeatured) articles = articles.filter((article) => article.homeFeatured);
  if (options?.limit) articles = articles.slice(0, options.limit);
  return articles;
}

export async function listCategoriesResilient(): Promise<EditorialCategory[]> {
  try {
    return mergeByKey(
      await withTimeout(listCategories()),
      localGuideCategories,
      (category) => category.key,
    );
  } catch {
    return localGuideCategories;
  }
}

export async function listAuthorsResilient(): Promise<EditorialAuthor[]> {
  try {
    return mergeByKey(
      await withTimeout(listAuthors()),
      [localGuideAuthor],
      (author) => author.slug,
    );
  } catch {
    return [localGuideAuthor];
  }
}

export async function listPublishedArticlesResilient(options?: {
  categoryId?: string;
  authorId?: string;
  homeFeatured?: boolean;
  limit?: number;
}): Promise<EditorialArticle[]> {
  const local = localArticlesFor(options);
  try {
    const remote = await withTimeout(listPublishedArticles(options));
    const merged = mergeByKey(remote, local, (article) => article.slug).sort((a, b) =>
      (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
    );
    return options?.limit ? merged.slice(0, options.limit) : merged;
  } catch {
    return local;
  }
}

function localArticleBySlug(slug: string): ArticleWithRelations | null {
  const article = localGuideArticles.find((candidate) => candidate.slug === slug);
  if (!article) return null;
  const category = localGuideCategories.find((candidate) => candidate.id === article.categoryId);
  if (!category) return null;
  return { ...article, category, author: localGuideAuthor };
}

export async function getArticleBySlugResilient(
  slug: string,
): Promise<ArticleWithRelations | null> {
  try {
    return (await withTimeout(getArticleBySlug(slug))) ?? localArticleBySlug(slug);
  } catch {
    return localArticleBySlug(slug);
  }
}

export async function getCategoryBySlugResilient(slug: string): Promise<EditorialCategory | null> {
  try {
    return (
      (await withTimeout(getCategoryBySlug(slug))) ??
      localGuideCategories.find((category) => category.slug === slug) ??
      null
    );
  } catch {
    return localGuideCategories.find((category) => category.slug === slug) ?? null;
  }
}

export async function listRelatedArticlesResilient(
  article: EditorialArticle,
  limit = 3,
): Promise<EditorialArticle[]> {
  if (article.id.startsWith("local-guide-")) {
    return localGuideArticles
      .filter(
        (candidate) => candidate.id !== article.id && candidate.categoryId === article.categoryId,
      )
      .slice(0, limit);
  }
  try {
    return await withTimeout(listRelatedArticles(article, limit));
  } catch {
    return [];
  }
}
