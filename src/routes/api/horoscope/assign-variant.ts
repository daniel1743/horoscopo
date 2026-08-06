/**
 * API endpoint para asignar variante de horóscopo a usuario autenticado.
 */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getOrAssignUserVariant } from "@/lib/horoscope/repository";
import type { HoroscopePeriod } from "@/types/horoscope";

const AssignVariantSchema = z.object({
  signSlug: z.string().min(1),
  period: z.enum(["daily", "weekly", "monthly"]),
  dateFor: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

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
    }
  );
}

export const Route = createFileRoute("/api/horoscope/assign-variant")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // 1. Verificar autenticación (opcional pero recomendado)
        // TODO: Agregar auth check usando readOptionalAuth si se requiere
        // const auth = await readOptionalAuth(request);
        // if (!auth.userId) {
        //   return jsonError(401, "unauthorized", "Usuario no autenticado");
        // }

        // Por ahora, asumimos que se envía userId en el body para simplificar
        // En producción real, obtenerlo de la sesión/token

        // 2. Parsear body
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return jsonError(400, "invalid_json", "Body JSON inválido");
        }

        const parsed = AssignVariantSchema.safeParse(body);
        if (!parsed.success) {
          return jsonError(
            400,
            "validation_error",
            `Parámetros inválidos: ${parsed.error.issues.map((i) => i.message).join(", ")}`
          );
        }

        const { signSlug, period, dateFor } = parsed.data;

        // 3. Obtener userId de la sesión (placeholder)
        // TODO: Implementar auth real
        // const userId = auth.userId;

        // Temporalmente, esperar userId en body (INSEGURO, solo para desarrollo)
        const userId = (body as any).userId;

        if (!userId) {
          return jsonError(401, "unauthorized", "Usuario no autenticado");
        }

        // 4. Obtener o asignar variante
        try {
          const variantId = await getOrAssignUserVariant(
            userId,
            signSlug,
            period as HoroscopePeriod,
            dateFor
          );

          return new Response(
            JSON.stringify({
              success: true,
              variantId,
              signSlug,
              period,
              dateFor,
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        } catch (error) {
          console.error("[Assign Variant API] Error:", error);

          return jsonError(
            500,
            "assignment_failed",
            error instanceof Error ? error.message : "Error al asignar variante"
          );
        }
      },
    },
  },
});
