/**
 * Server functions para el CRUD editorial de artículos.
 *
 * Reglas Fase B:
 * - Autorización: assertRole en cada handler (EDITOR_ROLES/APPROVER_ROLES/PUBLISHER_ROLES).
 * - Concurrencia optimista: UPDATE ... WHERE version = $expected; si 0 filas → conflicto.
 * - Revisiones: se crea un snapshot ANTES de cada UPDATE.
 * - Publicación: sólo cuando workflow_state = 'approved' (admin/super_admin pueden overridear con motivo → auditado).
 * - Restauración: crea un snapshot nuevo del estado actual, sobrescribe con la revisión objetivo,
 *   fuerza status='draft' y workflow_state='draft'. NUNCA publica.
 * - Auditoría: cada acción sensible llama logAdminAction.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertRole } from "./admin.functions";
import {
  EDITOR_ROLES,
  APPROVER_ROLES,
  PUBLISHER_ROLES,
  AUDIT_READER_ROLES,
} from "./roles";
import { canTransition, type WorkflowState } from "./workflow";

// -----------------------------------------------------------------------------
// Helper: registrar auditoría desde dentro de otros handlers (mismo request).
// -----------------------------------------------------------------------------
async function audit(
  supabase: any,
  actorId: string,
  entry: {
    action: string;
    resourceType?: string;
    resourceId?: string;
    status?: "success" | "denied" | "error";
    metadata?: Record<string, unknown>;
  },
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const rolesResp = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", actorId)
    .limit(1);
  const roleForAudit = rolesResp.data?.[0]?.role ?? null;
  await supabaseAdmin.from("admin_audit_log").insert({
    actor_id: actorId,
    actor_role: roleForAudit,
    action: entry.action.slice(0, 100),
    resource_type: entry.resourceType?.slice(0, 60) ?? null,
    resource_id: entry.resourceId?.slice(0, 200) ?? null,
    status: entry.status ?? "success",
    metadata: (entry.metadata ?? {}) as never,
  });
}

// -----------------------------------------------------------------------------
// LIST
// -----------------------------------------------------------------------------
export const adminListArticles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    page?: number;
    pageSize?: number;
    status?: "draft" | "published" | "archived" | "all";
    categoryId?: string | null;
    search?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    await assertRole(context, EDITOR_ROLES);

    const page = Math.max(1, data.page ?? 1);
    const pageSize = Math.min(50, Math.max(5, data.pageSize ?? 20));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = context.supabase
      .from("editorial_articles")
      .select(
        "id,slug,title,subtitle,excerpt,category_id,author_id,status,image_url,featured,home_featured,is_demo,published_at,updated_at,version",
        { count: "exact" },
      )
      .order("updated_at", { ascending: false })
      .range(from, to);

    if (data.status && data.status !== "all") {
      query = query.eq("status", data.status);
    }
    if (data.categoryId) {
      query = query.eq("category_id", data.categoryId);
    }
    if (data.search && data.search.trim()) {
      const q = data.search.trim().slice(0, 80);
      query = query.or(`title.ilike.%${q}%,slug.ilike.%${q}%`);
    }

    const { data: rows, error, count } = await query;
    if (error) throw new Error(error.message);

    // Join workflow states
    const ids = (rows ?? []).map((r: any) => r.id);
    let workflowMap: Record<string, string> = {};
    if (ids.length) {
      const { data: wf } = await context.supabase
        .from("content_workflow")
        .select("resource_id, workflow_state")
        .eq("resource_type", "article")
        .in("resource_id", ids);
      workflowMap = Object.fromEntries(
        (wf ?? []).map((w: any) => [w.resource_id, w.workflow_state]),
      );
    }

    return {
      page,
      pageSize,
      total: count ?? 0,
      items: (rows ?? []).map((r: any) => ({
        ...r,
        workflow_state: workflowMap[r.id] ?? "draft",
      })),
    };
  });

// -----------------------------------------------------------------------------
// GET (edit)
// -----------------------------------------------------------------------------
export const adminGetArticle = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await assertRole(context, EDITOR_ROLES);
    const { data: row, error } = await context.supabase
      .from("editorial_articles")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("NOT_FOUND");

    const { data: wf } = await context.supabase
      .from("content_workflow")
      .select("*")
      .eq("resource_type", "article")
      .eq("resource_id", data.id)
      .maybeSingle();

    return { article: row, workflow: wf ?? null };
  });

// -----------------------------------------------------------------------------
// CREATE (draft)
// -----------------------------------------------------------------------------
export const adminCreateArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    slug: string;
    title: string;
    excerpt: string;
    categoryId: string;
    authorId: string;
  }) => input)
  .handler(async ({ data, context }) => {
    await assertRole(context, EDITOR_ROLES);

    // Validación básica (BLOCKER si falla).
    if (!/^[a-z0-9-]{3,120}$/.test(data.slug)) {
      throw new Error("BLOCKER: slug inválido (a-z, 0-9, guiones, 3-120 chars).");
    }
    if (data.title.trim().length < 3) throw new Error("BLOCKER: título muy corto.");
    if (data.excerpt.trim().length < 20) throw new Error("BLOCKER: excerpt muy corto.");

    const { data: created, error } = await context.supabase
      .from("editorial_articles")
      .insert({
        slug: data.slug,
        title: data.title.trim(),
        excerpt: data.excerpt.trim(),
        category_id: data.categoryId,
        author_id: data.authorId,
        status: "draft",
        content: [],
        seo: {},
        tags: [],
        sources: [],
        related_article_ids: [],
        featured: false,
        home_featured: false,
        is_demo: false,
        version: 1,
      })
      .select("id, slug, version")
      .single();

    if (error) throw new Error(error.message);

    await context.supabase.from("content_workflow").insert({
      resource_type: "article",
      resource_id: created.id,
      workflow_state: "draft",
      updated_by: context.userId,
    });

    await audit(context.supabase, context.userId, {
      action: "article.create",
      resourceType: "article",
      resourceId: created.id,
      metadata: { slug: created.slug },
    });

    return created;
  });

// -----------------------------------------------------------------------------
// UPDATE (optimistic concurrency)
// -----------------------------------------------------------------------------
export const adminUpdateArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id: string;
    expectedVersion: number;
    expectedUpdatedAt: string;
    patch: {
      title?: string;
      subtitle?: string | null;
      excerpt?: string;
      slug?: string;
      categoryId?: string;
      authorId?: string;
      imageUrl?: string | null;
      imageAlt?: string | null;
      tags?: string[];
      featured?: boolean;
      homeFeatured?: boolean;
      readingTime?: number | null;
      content?: unknown;
      seo?: Record<string, unknown>;
      sources?: unknown[];
      relatedArticleIds?: string[];
      disclaimerKey?: string | null;
    };
    revisionNote?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    await assertRole(context, EDITOR_ROLES);

    // 1) Leer estado actual para snapshot + validación de concurrencia.
    const { data: current, error: readErr } = await context.supabase
      .from("editorial_articles")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (!current) throw new Error("NOT_FOUND");

    if (current.version !== data.expectedVersion) {
      throw new Error(
        `CONFLICT: otra persona modificó el artículo (versión actual ${current.version}, esperada ${data.expectedVersion}).`,
      );
    }

    // 2) Snapshot append-only ANTES del cambio.
    const { error: snapErr } = await context.supabase
      .from("content_revisions")
      .insert({
        resource_type: "article",
        resource_id: data.id,
        version: current.version,
        snapshot: current,
        note: data.revisionNote?.slice(0, 200) ?? null,
        created_by: context.userId,
      });
    if (snapErr) throw new Error(snapErr.message);

    // 3) UPDATE con WHERE version = expected (protección doble contra race).
    const p = data.patch;
    const nextVersion = current.version + 1;
    const updates: Record<string, unknown> = { version: nextVersion };
    if (p.title !== undefined) updates.title = p.title.trim();
    if (p.subtitle !== undefined) updates.subtitle = p.subtitle;
    if (p.excerpt !== undefined) updates.excerpt = p.excerpt.trim();
    if (p.slug !== undefined) {
      if (!/^[a-z0-9-]{3,120}$/.test(p.slug))
        throw new Error("BLOCKER: slug inválido.");
      updates.slug = p.slug;
    }
    if (p.categoryId !== undefined) updates.category_id = p.categoryId;
    if (p.authorId !== undefined) updates.author_id = p.authorId;
    if (p.imageUrl !== undefined) updates.image_url = p.imageUrl;
    if (p.imageAlt !== undefined) updates.image_alt = p.imageAlt;
    if (p.tags !== undefined) updates.tags = p.tags;
    if (p.featured !== undefined) updates.featured = p.featured;
    if (p.homeFeatured !== undefined) updates.home_featured = p.homeFeatured;
    if (p.readingTime !== undefined) updates.reading_time = p.readingTime;
    if (p.content !== undefined) updates.content = p.content;
    if (p.seo !== undefined) updates.seo = p.seo;
    if (p.sources !== undefined) updates.sources = p.sources;
    if (p.relatedArticleIds !== undefined)
      updates.related_article_ids = p.relatedArticleIds;
    if (p.disclaimerKey !== undefined) updates.disclaimer_key = p.disclaimerKey;

    const { data: updated, error: updErr } = await context.supabase
      .from("editorial_articles")
      .update(updates as never)
      .eq("id", data.id)
      .eq("version", data.expectedVersion)
      .select("id, version, updated_at")
      .maybeSingle();
    if (updErr) throw new Error(updErr.message);
    if (!updated) {
      throw new Error("CONFLICT: la versión cambió entre snapshot y update.");
    }

    await audit(context.supabase, context.userId, {
      action: "article.update",
      resourceType: "article",
      resourceId: data.id,
      metadata: { from_version: current.version, to_version: updated.version },
    });

    return updated;
  });

// -----------------------------------------------------------------------------
// WORKFLOW: transiciones (submit_for_review, request_changes, approve)
// -----------------------------------------------------------------------------
export const adminTransitionWorkflow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id: string;
    to: WorkflowState;
    note?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    // Autorización según destino
    const allowed =
      data.to === "approved"
        ? APPROVER_ROLES
        : data.to === "in_review" || data.to === "draft" || data.to === "changes_requested"
          ? EDITOR_ROLES // reviewers/editors/admins may bounce back
          : data.to === "published" || data.to === "archived"
            ? PUBLISHER_ROLES
            : EDITOR_ROLES;
    await assertRole(context, allowed);

    const { data: wf, error: readErr } = await context.supabase
      .from("content_workflow")
      .select("*")
      .eq("resource_type", "article")
      .eq("resource_id", data.id)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (!wf) throw new Error("NOT_FOUND: workflow no inicializado.");

    if (!canTransition(wf.workflow_state as WorkflowState, data.to)) {
      throw new Error(
        `BLOCKER: transición no permitida (${wf.workflow_state} → ${data.to}).`,
      );
    }

    const { error: updErr } = await context.supabase
      .from("content_workflow")
      .update({
        workflow_state: data.to,
        notes: data.note?.slice(0, 500) ?? wf.notes,
        updated_by: context.userId,
      })
      .eq("id", wf.id);
    if (updErr) throw new Error(updErr.message);

    await audit(context.supabase, context.userId, {
      action: `article.workflow.${data.to}`,
      resourceType: "article",
      resourceId: data.id,
      metadata: { from: wf.workflow_state, to: data.to, has_note: Boolean(data.note) },
    });

    return { ok: true, workflow_state: data.to };
  });

// -----------------------------------------------------------------------------
// PUBLISH — requiere workflow=approved. Actualiza status y published_at.
// -----------------------------------------------------------------------------
export const adminPublishArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id: string;
    expectedVersion: number;
    overrideReason?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    await assertRole(context, PUBLISHER_ROLES);

    const { data: wf } = await context.supabase
      .from("content_workflow")
      .select("workflow_state")
      .eq("resource_type", "article")
      .eq("resource_id", data.id)
      .maybeSingle();

    const isApproved = wf?.workflow_state === "approved";
    if (!isApproved && !data.overrideReason) {
      throw new Error(
        "BLOCKER: el artículo no está aprobado. Se requiere motivo (overrideReason) para publicar como admin.",
      );
    }

    const { data: current, error: rErr } = await context.supabase
      .from("editorial_articles")
      .select("id, version, slug, status")
      .eq("id", data.id)
      .maybeSingle();
    if (rErr) throw new Error(rErr.message);
    if (!current) throw new Error("NOT_FOUND");
    if (current.version !== data.expectedVersion) {
      throw new Error("CONFLICT: la versión cambió antes de publicar.");
    }

    const { data: updated, error: uErr } = await context.supabase
      .from("editorial_articles")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        version: current.version + 1,
      })
      .eq("id", data.id)
      .eq("version", data.expectedVersion)
      .select("id, version, status, published_at")
      .maybeSingle();
    if (uErr) throw new Error(uErr.message);
    if (!updated) throw new Error("CONFLICT: la versión cambió.");

    await context.supabase
      .from("content_workflow")
      .update({ workflow_state: "published", updated_by: context.userId })
      .eq("resource_type", "article")
      .eq("resource_id", data.id);

    await audit(context.supabase, context.userId, {
      action: "article.publish",
      resourceType: "article",
      resourceId: data.id,
      metadata: {
        from_status: current.status,
        override: !isApproved,
        reason: data.overrideReason?.slice(0, 200) ?? null,
      },
    });

    return updated;
  });

// -----------------------------------------------------------------------------
// REVISIONS: list + restore
// -----------------------------------------------------------------------------
export const adminListRevisions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await assertRole(context, EDITOR_ROLES);
    const { data: rows, error } = await context.supabase
      .from("content_revisions")
      .select("id, version, note, created_by, created_at")
      .eq("resource_type", "article")
      .eq("resource_id", data.id)
      .order("version", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminGetRevision = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { revisionId: string }) => input)
  .handler(async ({ data, context }) => {
    await assertRole(context, EDITOR_ROLES);
    const { data: row, error } = await context.supabase
      .from("content_revisions")
      .select("*")
      .eq("id", data.revisionId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("NOT_FOUND");
    return row;
  });

export const adminRestoreRevision = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    articleId: string;
    revisionId: string;
    expectedVersion: number;
  }) => input)
  .handler(async ({ data, context }) => {
    await assertRole(context, EDITOR_ROLES);

    // 1) Cargar revisión objetivo
    const { data: rev, error: revErr } = await context.supabase
      .from("content_revisions")
      .select("*")
      .eq("id", data.revisionId)
      .maybeSingle();
    if (revErr) throw new Error(revErr.message);
    if (!rev || rev.resource_id !== data.articleId)
      throw new Error("NOT_FOUND: revisión no válida.");

    // 2) Cargar artículo actual
    const { data: current, error: cErr } = await context.supabase
      .from("editorial_articles")
      .select("*")
      .eq("id", data.articleId)
      .maybeSingle();
    if (cErr) throw new Error(cErr.message);
    if (!current) throw new Error("NOT_FOUND");
    if (current.version !== data.expectedVersion)
      throw new Error("CONFLICT: la versión cambió antes de restaurar.");

    // 3) Snapshot del estado ACTUAL (no perdemos nada)
    await context.supabase.from("content_revisions").insert({
      resource_type: "article",
      resource_id: data.articleId,
      version: current.version,
      snapshot: current,
      note: `Snapshot antes de restaurar a v${rev.version}`,
      created_by: context.userId,
    });

    // 4) Aplicar snapshot como borrador (NUNCA publica).
    const snap: Record<string, any> = (rev.snapshot ?? {}) as Record<string, any>;
    const nextVersion = current.version + 1;
    const restored: Record<string, unknown> = {
      title: snap.title,
      subtitle: snap.subtitle,
      excerpt: snap.excerpt,
      slug: snap.slug,
      category_id: snap.category_id,
      author_id: snap.author_id,
      image_url: snap.image_url,
      image_alt: snap.image_alt,
      tags: snap.tags ?? [],
      featured: false,
      home_featured: false,
      reading_time: snap.reading_time,
      content: snap.content ?? [],
      seo: snap.seo ?? {},
      sources: snap.sources ?? [],
      related_article_ids: snap.related_article_ids ?? [],
      disclaimer_key: snap.disclaimer_key,
      status: "draft", // ← invariante
      version: nextVersion,
    };

    const { data: updated, error: uErr } = await context.supabase
      .from("editorial_articles")
      .update(restored as never)
      .eq("id", data.articleId)
      .eq("version", data.expectedVersion)
      .select("id, version")
      .maybeSingle();
    if (uErr) throw new Error(uErr.message);
    if (!updated) throw new Error("CONFLICT.");

    // 5) Workflow vuelve a borrador (nunca publica).
    await context.supabase
      .from("content_workflow")
      .update({ workflow_state: "draft", updated_by: context.userId })
      .eq("resource_type", "article")
      .eq("resource_id", data.articleId);

    await audit(context.supabase, context.userId, {
      action: "article.restore_revision",
      resourceType: "article",
      resourceId: data.articleId,
      metadata: { restored_from_version: rev.version, new_version: updated.version },
    });

    return updated;
  });

// -----------------------------------------------------------------------------
// CATÁLOGOS auxiliares para el formulario (categorías, autores)
// -----------------------------------------------------------------------------
export const adminListCategoriesAndAuthors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertRole(context, EDITOR_ROLES);
    const [cats, auths] = await Promise.all([
      context.supabase
        .from("editorial_categories")
        .select("id,label,slug")
        .order("sort_order"),
      context.supabase
        .from("editorial_authors")
        .select("id,name,slug")
        .order("name"),
    ]);
    if (cats.error) throw new Error(cats.error.message);
    if (auths.error) throw new Error(auths.error.message);
    return { categories: cats.data ?? [], authors: auths.data ?? [] };
  });

// -----------------------------------------------------------------------------
// AUDIT LOG (lectura, sólo admin/super_admin)
// -----------------------------------------------------------------------------
export const adminListAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { resourceId?: string; limit?: number }) => input)
  .handler(async ({ data, context }) => {
    await assertRole(context, AUDIT_READER_ROLES);
    let q = context.supabase
      .from("admin_audit_log")
      .select("id, action, resource_type, resource_id, status, actor_id, actor_role, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(Math.min(200, data.limit ?? 50));
    if (data.resourceId) q = q.eq("resource_id", data.resourceId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
