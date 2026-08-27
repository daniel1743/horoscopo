/**
 * Server functions del área privada.
 * Todas requieren sesión validada (requireSupabaseAuth). Jamás aceptan
 * user_id desde el body: siempre se deriva del token verificado.
 * SUPABASE_SERVICE_ROLE_KEY solo se importa dentro del handler.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const OWNED_USER_ID_TABLES = [
  "user_favorites",
  "saved_tarot_readings",
  "user_activity_history",
  "user_privacy_settings",
  "ai_conversations",
  "ai_messages",
  "ai_memories",
  "ai_user_preferences",
  "ai_feedback",
] as const;

/** Exporta todos los datos del usuario autenticado (JSON descargable). */
export const exportAccountFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const client = supabase as unknown as {
      from: (t: string) => {
        select: (c: string) => Promise<{ data: unknown; error: { message: string } | null }>;
      };
    };

    const payload: Record<string, unknown> = {
      exported_at: new Date().toISOString(),
      user_id: userId,
    };

    const tables = ["profiles", ...OWNED_USER_ID_TABLES];
    for (const table of tables) {
      const { data, error } = await client.from(table).select("*");
      payload[table] = error ? { error: error.message } : (data ?? []);
    }

    return { payload: JSON.stringify(payload) };
  });

/**
 * Elimina la cuenta y todos los datos asociados. Usa service role
 * SOLO tras confirmar la identidad del llamador vía middleware.
 */
export const deleteAccountFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;
    const client = supabase as unknown as {
      from: (t: string) => {
        delete: () => { eq: (c: string, v: string) => Promise<{ error: unknown }> };
      };
    };

    for (const table of OWNED_USER_ID_TABLES) {
      await client.from(table).delete().eq("user_id", userId);
    }
    await client.from("profiles").delete().eq("id", userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);

    return { ok: true as const };
  });
