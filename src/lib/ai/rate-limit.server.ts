/**
 * Rate limiting y cuotas diarias. SERVER-ONLY.
 * Usa ai_usage_daily con service role (sin exponer al cliente).
 */
import { createHash } from "node:crypto";
import { aiLimits, readIntEnv } from "@/config/ai/limits";

export interface RateLimitCheck {
  allowed: boolean;
  remaining: number;
  limit: number;
  reason?: "quota_exceeded";
}

export class RateLimitStoreError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "RateLimitStoreError";
  }
}

export function hashAnonymousKey(rawKey: string): string {
  const salt = process.env.AI_RATE_LIMIT_SALT ?? "astral-fallback-salt";
  return createHash("sha256").update(`${salt}::${rawKey}`).digest("hex");
}

function isDevelopmentRuntime(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "development";
}

export async function checkAndConsumeQuota(params: {
  userId: string | null;
  anonymousHash: string | null;
}): Promise<RateLimitCheck> {
  const limit = params.userId
    ? readIntEnv("AI_USER_DAILY_LIMIT", aiLimits.userDailyDefault)
    : readIntEnv("AI_GUEST_DAILY_LIMIT", aiLimits.guestDailyDefault);

  if (isDevelopmentRuntime()) {
    return { allowed: true, remaining: Number.MAX_SAFE_INTEGER, limit: Number.MAX_SAFE_INTEGER };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const today = new Date().toISOString().slice(0, 10);

  const query = supabaseAdmin.from("ai_usage_daily").select("id, requests").eq("usage_date", today);
  if (params.userId) query.eq("user_id", params.userId);
  else if (params.anonymousHash) query.eq("anonymous_key_hash", params.anonymousHash);
  else return { allowed: false, remaining: 0, limit, reason: "quota_exceeded" };

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new RateLimitStoreError(`No se pudo leer ai_usage_daily: ${error.code}`, "read_failed");
  }

  const currentRequests = data?.requests ?? 0;
  if (currentRequests >= limit) {
    return { allowed: false, remaining: 0, limit, reason: "quota_exceeded" };
  }

  if (data?.id) {
    const { error: updateError } = await supabaseAdmin
      .from("ai_usage_daily")
      .update({ requests: currentRequests + 1, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (updateError) {
      throw new RateLimitStoreError(
        `No se pudo actualizar ai_usage_daily: ${updateError.code}`,
        "update_failed",
      );
    }
  } else {
    const { error: insertError } = await supabaseAdmin.from("ai_usage_daily").insert({
      user_id: params.userId,
      anonymous_key_hash: params.anonymousHash,
      usage_date: today,
      requests: 1,
    });
    if (insertError) {
      throw new RateLimitStoreError(
        `No se pudo insertar ai_usage_daily: ${insertError.code}`,
        "insert_failed",
      );
    }
  }

  return { allowed: true, remaining: Math.max(0, limit - currentRequests - 1), limit };
}
