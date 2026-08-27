/**
 * Verificación opcional de sesión Supabase para rutas API que aceptan
 * autenticados y anónimos. SERVER-ONLY.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export interface OptionalAuth {
  userId: string | null;
  authenticatedSupabase: ReturnType<typeof createClient<Database>> | null;
}

export async function readOptionalAuth(request: Request): Promise<OptionalAuth> {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) return { userId: null, authenticatedSupabase: null };

  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer "))
    return { userId: null, authenticatedSupabase: null };
  const token = header.slice("Bearer ".length).trim();
  if (!token || token.split(".").length !== 3) return { userId: null, authenticatedSupabase: null };

  const client = createClient<Database>(url, anon, {
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (h.get("Authorization") === `Bearer ${anon}`) h.delete("Authorization");
        h.set("apikey", anon);
        h.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers: h });
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data, error } = await client.auth.getClaims(token);
    if (error || !data?.claims?.sub) return { userId: null, authenticatedSupabase: null };
    return { userId: data.claims.sub as string, authenticatedSupabase: client };
  } catch {
    return { userId: null, authenticatedSupabase: null };
  }
}
