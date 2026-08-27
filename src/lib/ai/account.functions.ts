/**
 * Server functions autenticadas para gestión de conversaciones, memorias,
 * preferencias y feedback. Todas usan RLS a través del cliente autenticado.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// -------- Conversaciones --------

export const listConversationsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("ai_conversations")
      .select("id, title, module, summary, status, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getConversationFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const [{ data: conv }, { data: messages }] = await Promise.all([
      context.supabase
        .from("ai_conversations")
        .select("id, title, module, summary, status, created_at, updated_at")
        .eq("id", data.id)
        .maybeSingle(),
      context.supabase
        .from("ai_messages")
        .select("id, role, content, sources, model_alias, created_at")
        .eq("conversation_id", data.id)
        .order("created_at", { ascending: true }),
    ]);
    if (!conv) throw new Error("Conversación no encontrada");
    return { conversation: conv, messages: messages ?? [] };
  });

export const deleteConversationFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("ai_conversations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- Memorias --------

const MemorySchema = z.object({
  category: z.enum(["preference", "interest", "goal", "personal_context", "content_preference"]),
  memoryKey: z.string().min(1).max(120),
  memoryValue: z.unknown(),
  summary: z.string().min(1).max(300),
  sourceConversationId: z.string().uuid().optional(),
});

export const listMemoriesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("ai_memories")
      .select(
        "id, category, memory_key, memory_value, summary, active, consent_status, created_at, updated_at",
      )
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createMemoryFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => MemorySchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("ai_memories")
      .insert({
        user_id: context.userId,
        category: data.category,
        memory_key: data.memoryKey,
        memory_value: data.memoryValue as never,
        summary: data.summary,
        source_conversation_id: data.sourceConversationId ?? null,
      })
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateMemoryFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        summary: z.string().min(1).max(300).optional(),
        active: z.boolean().optional(),
        consentStatus: z.enum(["confirmed", "revoked"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const patch: {
      summary?: string;
      active?: boolean;
      consent_status?: "confirmed" | "revoked";
    } = {};
    if (data.summary !== undefined) patch.summary = data.summary;
    if (data.active !== undefined) patch.active = data.active;
    if (data.consentStatus !== undefined) patch.consent_status = data.consentStatus;
    const { error } = await context.supabase.from("ai_memories").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMemoryFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("ai_memories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAllMemoriesFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("ai_memories")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- Preferencias --------

export const getPreferencesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("ai_user_preferences")
      .select("response_length, tone, memory_enabled, citations_expanded")
      .eq("user_id", context.userId)
      .maybeSingle();
    return (
      data ?? {
        response_length: "balanced",
        tone: "warm",
        memory_enabled: true,
        citations_expanded: false,
      }
    );
  });

export const updatePreferencesFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        responseLength: z.enum(["brief", "balanced", "detailed"]).optional(),
        tone: z.enum(["warm", "direct", "reflective"]).optional(),
        memoryEnabled: z.boolean().optional(),
        citationsExpanded: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const patch: {
      user_id: string;
      response_length?: "brief" | "balanced" | "detailed";
      tone?: "warm" | "direct" | "reflective";
      memory_enabled?: boolean;
      citations_expanded?: boolean;
    } = { user_id: context.userId };
    if (data.responseLength !== undefined) patch.response_length = data.responseLength;
    if (data.tone !== undefined) patch.tone = data.tone;
    if (data.memoryEnabled !== undefined) patch.memory_enabled = data.memoryEnabled;
    if (data.citationsExpanded !== undefined) patch.citations_expanded = data.citationsExpanded;
    const { error } = await context.supabase
      .from("ai_user_preferences")
      .upsert(patch, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- Feedback --------

export const submitFeedbackFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        messageId: z.string().uuid(),
        rating: z.enum(["helpful", "not_helpful"]),
        module: z.string().max(40).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("ai_feedback").insert({
      user_id: context.userId,
      message_id: data.messageId,
      rating: data.rating,
      module: data.module ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
