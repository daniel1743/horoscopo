/**
 * YAML 12 — Servicio de indexación server-only.
 * Usa el registro de adaptadores para hacer upsert en search_documents.
 * Nunca se importa desde el navegador.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { SearchDocumentInput } from "@/types/search";
import type { Json } from "@/integrations/supabase/types";
import { SEARCH_SOURCE_REGISTRY, type AdapterEntry } from "./search-source-registry";

type Client = SupabaseClient<Database>;

interface UpsertRow {
  source_type: string;
  source_id: string;
  title: string;
  excerpt: string | null;
  searchable_text: string;
  keywords: string[];
  route_path: string;
  image_key: string | null;
  metadata: Json;
  language: string;
  is_public: boolean;
  source_published_at: string | null;
  source_updated_at: string | null;
  indexed_at: string;
}

function toRow(doc: SearchDocumentInput): UpsertRow {
  return {
    source_type: doc.sourceType,
    source_id: doc.sourceId,
    title: doc.title,
    excerpt: doc.excerpt,
    searchable_text: doc.searchableText,
    keywords: doc.keywords,
    route_path: doc.routePath,
    image_key: doc.imageKey,
    metadata: doc.metadata as unknown as Json,
    language: doc.language,
    is_public: doc.isPublic,
    source_published_at: doc.sourcePublishedAt,
    source_updated_at: doc.sourceUpdatedAt,
    indexed_at: new Date().toISOString(),
  };
}

export interface SyncOptions {
  dryRun?: boolean;
  removeOrphans?: boolean;
  onlySourceTypes?: string[];
  limit?: number;
  onProgress?: (msg: string) => void;
}

export interface SyncSummary {
  bySource: Record<string, { fetched: number; upserted: number; skipped: number; errors: number; orphansRemoved: number }>;
  total: { fetched: number; upserted: number; skipped: number; errors: number; orphansRemoved: number };
  dryRun: boolean;
}

function emptyPerSource() {
  return { fetched: 0, upserted: 0, skipped: 0, errors: 0, orphansRemoved: 0 };
}

export async function syncAll(client: Client, options: SyncOptions = {}): Promise<SyncSummary> {
  const summary: SyncSummary = {
    bySource: {},
    total: emptyPerSource(),
    dryRun: !!options.dryRun,
  };
  const filter = options.onlySourceTypes && options.onlySourceTypes.length > 0
    ? new Set(options.onlySourceTypes)
    : null;

  for (const adapter of SEARCH_SOURCE_REGISTRY) {
    if (filter && !filter.has(adapter.sourceType)) continue;
    const perSource = emptyPerSource();
    summary.bySource[adapter.sourceType] = perSource;
    try {
      let rows: unknown[] = [];
      try {
        rows = await adapter.fetchAll(client);
      } catch (err) {
        options.onProgress?.(`[skip:${adapter.sourceType}] fuente inaccesible`);
        continue;
      }
      if (options.limit) rows = rows.slice(0, options.limit);
      perSource.fetched = rows.length;

      const docs: UpsertRow[] = [];
      const validIds = new Set<string>();
      for (const row of rows) {
        try {
          const doc = adapter.toDocument(row);
          if (!doc) {
            perSource.skipped += 1;
            continue;
          }
          if (!doc.routePath.startsWith("/") || doc.routePath.length < 2) {
            perSource.skipped += 1;
            continue;
          }
          if (!doc.isPublic) {
            perSource.skipped += 1;
            continue;
          }
          validIds.add(doc.sourceId);
          docs.push(toRow(doc));
        } catch {
          perSource.errors += 1;
        }
      }

      if (!options.dryRun && docs.length > 0) {
        const { error } = await client
          .from("search_documents")
          .upsert(docs, { onConflict: "source_type,source_id" });
        if (error) {
          perSource.errors += docs.length;
          options.onProgress?.(`[error:${adapter.sourceType}] upsert falló: ${error.message}`);
        } else {
          perSource.upserted += docs.length;
        }
      }

      if (options.removeOrphans && !options.dryRun) {
        const { data: existing } = await client
          .from("search_documents")
          .select("source_id")
          .eq("source_type", adapter.sourceType);
        const orphanIds = (existing ?? [])
          .map((r) => r.source_id)
          .filter((id) => !validIds.has(id));
        if (orphanIds.length > 0) {
          const { error } = await client
            .from("search_documents")
            .delete()
            .eq("source_type", adapter.sourceType)
            .in("source_id", orphanIds);
          if (!error) perSource.orphansRemoved = orphanIds.length;
        }
      }
    } catch (err) {
      perSource.errors += 1;
    }

    summary.total.fetched += perSource.fetched;
    summary.total.upserted += perSource.upserted;
    summary.total.skipped += perSource.skipped;
    summary.total.errors += perSource.errors;
    summary.total.orphansRemoved += perSource.orphansRemoved;
    options.onProgress?.(
      `[${adapter.sourceType}] fetched=${perSource.fetched} upserted=${perSource.upserted} skipped=${perSource.skipped} errors=${perSource.errors} orphans=${perSource.orphansRemoved}`,
    );
  }

  return summary;
}

/** Sincroniza un único recurso. Se llama después de publicar. */
export async function syncSearchDocument(
  client: Client,
  input: { sourceType: AdapterEntry["sourceType"]; sourceId: string },
): Promise<{ ok: boolean; reason?: string }> {
  const adapter = SEARCH_SOURCE_REGISTRY.find((a) => a.sourceType === input.sourceType);
  if (!adapter) return { ok: false, reason: "unknown_source_type" };
  const rows = await adapter.fetchAll(client);
  const match = (rows as Array<{ id?: string }>).find((r) => r.id === input.sourceId);
  if (!match) return { ok: false, reason: "not_found_or_not_public" };
  const doc = adapter.toDocument(match);
  if (!doc || !doc.isPublic) return { ok: false, reason: "not_indexable" };
  const { error } = await client
    .from("search_documents")
    .upsert(toRow(doc), { onConflict: "source_type,source_id" });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

/** Retira un recurso del índice (archivado, eliminado, retirado). */
export async function removeSearchDocument(
  client: Client,
  input: { sourceType: string; sourceId: string },
): Promise<{ ok: boolean }> {
  const { error } = await client
    .from("search_documents")
    .delete()
    .eq("source_type", input.sourceType)
    .eq("source_id", input.sourceId);
  return { ok: !error };
}
