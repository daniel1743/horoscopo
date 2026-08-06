/**
 * API endpoint para generación automática de horóscopos vía Vercel Cron.
 * Solo accesible con token de autorización correcto.
 */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { generateBatch } from "@/server/horoscope-automation/batch-generator";
import { zodiacSigns } from "@/data/zodiac-signs";
import type { HoroscopePeriod } from "@/types/horoscope";
import type { VariantId, GenerationStatus } from "@/types/horoscope-automation";
import { referenceDateFor } from "@/config/horoscope";

// Schema de validación
const GenerateSchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]),
  dateFor: z.string().optional(), // Si no se provee, usa fecha de referencia del período
  signs: z.array(z.string()).optional(), // Si no se provee, genera todos los signos
  variants: z.array(z.number().min(1).max(4)).optional(), // Si no se provee, genera todas (1-4)
  forceRegenerate: z.boolean().optional(),
});

/**
 * Verifica el token de autorización de Vercel Cron.
 */
function verifyAuthorization(request: Request): boolean {
  const authHeader = request.headers.get("authorization");

  // Vercel Cron envía: Authorization: Bearer <CRON_SECRET>
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken) {
    console.error("[Cron API] CRON_SECRET no configurado en variables de entorno");
    return false;
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("[Cron API] Authorization header inválido o faltante");
    return false;
  }

  const token = authHeader.substring(7); // Remover "Bearer "

  return token === expectedToken;
}

/**
 * Respuesta JSON de error.
 */
function jsonError(status: number, code: string, message: string): Response {
  return new Response(
    JSON.stringify({
      error: {
        code,
        message,
      },
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}

/**
 * Guarda log de generación en base de datos.
 */
async function saveBatchLog(
  batchId: string,
  period: HoroscopePeriod,
  dateFor: string,
  signsRequested: number,
  variantsPerSign: number,
  totalRequested: number,
  totalGenerated: number,
  totalFailed: number,
  status: GenerationStatus,
  startedAt: string,
  completedAt: string,
  stats: Record<string, unknown>,
  errors: string[],
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // Supabase generated types do not include horoscope_generation_logs yet.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabaseAdmin as any;
  const { error } = await db.from("horoscope_generation_logs").insert({
    batch_id: batchId,
    period,
    date_for: dateFor,
    signs_requested: signsRequested,
    variants_per_sign: variantsPerSign,
    total_requested: totalRequested,
    total_generated: totalGenerated,
    total_failed: totalFailed,
    started_at: startedAt,
    completed_at: completedAt,
    status,
    error_details: errors.length > 0 ? { errors } : null,
    generation_stats: stats,
  });

  if (error) {
    console.error(`[Cron API] No se pudo guardar log batch ${batchId}:`, error);
  }
}

async function runGeneration(input: z.infer<typeof GenerateSchema>) {
  const period = input.period;
  const dateFor = input.dateFor || referenceDateFor(period);
  const signs = input.signs || zodiacSigns.map((s) => s.slug);
  const variants = (input.variants || [1, 2, 3, 4]) as VariantId[];

  console.log(
    `[Cron API] Generación solicitada: ${period} para ${dateFor} (${signs.length} signos × ${variants.length} variantes)`,
  );

  const result = await generateBatch({
    period,
    dateFor,
    signs,
    variants,
    forceRegenerate: input.forceRegenerate || false,
    maxRetries: 2,
  });

  const status: GenerationStatus =
    result.totalFailed === 0 ? "completed" : result.totalGenerated > 0 ? "partial" : "failed";

  await saveBatchLog(
    result.batchId,
    result.period,
    result.dateFor,
    signs.length,
    variants.length,
    result.totalRequested,
    result.totalGenerated,
    result.totalFailed,
    status,
    result.startedAt,
    result.completedAt,
    {
      durationSeconds: Math.round(result.stats.durationMs / 1000),
      successRate: result.stats.successRate,
      tokensUsed: result.stats.totalTokensUsed,
      averageQualityScore: result.stats.averageQualityScore,
    },
    result.errors || [],
  );

  return {
    success: true,
    batchId: result.batchId,
    period: result.period,
    dateFor: result.dateFor,
    stats: {
      totalRequested: result.totalRequested,
      totalGenerated: result.totalGenerated,
      totalFailed: result.totalFailed,
      successRate: result.stats.successRate,
      durationMs: result.stats.durationMs,
      averageQualityScore: result.stats.averageQualityScore,
      tokensUsed: result.stats.totalTokensUsed,
    },
    status,
    errors: result.errors,
  };
}

function jsonOk(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const Route = createFileRoute("/api/cron/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const startTime = Date.now();

        // 1. Verificar autorización
        if (!verifyAuthorization(request)) {
          return jsonError(401, "unauthorized", "Token de autorización inválido o faltante");
        }

        // 2. Parsear body
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return jsonError(400, "invalid_json", "Body JSON inválido");
        }

        const parsed = GenerateSchema.safeParse(body);
        if (!parsed.success) {
          return jsonError(
            400,
            "validation_error",
            `Parámetros inválidos: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
          );
        }

        const input = parsed.data;

        let payload;
        try {
          payload = await runGeneration(input);
        } catch (error) {
          console.error("[Cron API] Error en generación batch:", error);

          return jsonError(
            500,
            "generation_failed",
            error instanceof Error ? error.message : "Error desconocido en generación",
          );
        }

        const duration = Date.now() - startTime;

        console.log(
          `[Cron API] Generación completada en ${duration}ms: ${payload.stats.totalGenerated}/${payload.stats.totalRequested} exitosos`,
        );

        return jsonOk(payload);
      },

      GET: async ({ request }) => {
        if (!verifyAuthorization(request)) {
          return jsonError(401, "unauthorized", "Token de autorización inválido o faltante");
        }

        const url = new URL(request.url);
        const health = url.searchParams.get("health");
        if (health === "1" || health === "true") {
          const checks = {
            cronSecretConfigured: !!process.env.CRON_SECRET,
            deepseekApiKeyConfigured: !!process.env.DEEPSEEK_API_KEY,
            supabaseConfigured:
              !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          };
          const allHealthy = Object.values(checks).every((v) => v);
          return jsonOk({
            healthy: allHealthy,
            timestamp: new Date().toISOString(),
            checks,
            message: allHealthy
              ? "Sistema de generación automática operativo"
              : "Configuración incompleta - verificar variables de entorno",
          });
        }

        const queryInput = {
          period: url.searchParams.get("period") || "daily",
          dateFor: url.searchParams.get("dateFor") || undefined,
          forceRegenerate: url.searchParams.get("forceRegenerate") === "true",
        };
        const parsed = GenerateSchema.safeParse(queryInput);
        if (!parsed.success) {
          return jsonError(
            400,
            "validation_error",
            `Parámetros inválidos: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
          );
        }

        try {
          return jsonOk(await runGeneration(parsed.data));
        } catch (error) {
          console.error("[Cron API] Error en generación batch:", error);
          return jsonError(
            500,
            "generation_failed",
            error instanceof Error ? error.message : "Error desconocido en generación",
          );
        }
      },
    },
  },
});
