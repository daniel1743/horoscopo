/**
 * Hook para manejar asignación de variantes de horóscopos.
 * Detecta si usuario está autenticado y asigna variante correspondiente.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/account/auth-profile";
import type { HoroscopePeriod } from "@/types/horoscope";
import type { VariantId } from "@/types/horoscope-automation";
import {
  getOrAssignVisitorVariant,
  initVisitorStorage,
} from "@/lib/horoscope/visitor-storage";

/**
 * Hook que devuelve la variante asignada para un horóscopo específico.
 */
export function useHoroscopeVariant(
  signSlug: string,
  period: HoroscopePeriod,
  dateFor: string
): {
  variantId: VariantId | null;
  isLoading: boolean;
  error: string | null;
} {
  const { userId } = useAuth();
  const [variantId, setVariantId] = useState<VariantId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function assignVariant() {
      try {
        setIsLoading(true);
        setError(null);

        if (userId) {
          // Usuario autenticado: obtener o asignar variante via API
          const response = await fetch("/api/horoscope/assign-variant", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              signSlug,
              period,
              dateFor,
            }),
          });

          if (!response.ok) {
            throw new Error("Error al asignar variante");
          }

          const data = await response.json();
          setVariantId(data.variantId);
        } else {
          // Visitante: usar localStorage
          initVisitorStorage(); // Limpia assignments antiguos si es necesario
          const assigned = getOrAssignVisitorVariant(signSlug, period, dateFor);
          setVariantId(assigned);
        }
      } catch (err) {
        console.error("Error en useHoroscopeVariant:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        // Fallback a variante 1
        setVariantId(1);
      } finally {
        setIsLoading(false);
      }
    }

    assignVariant();
  }, [userId, signSlug, period, dateFor]);

  return { variantId, isLoading, error };
}

/**
 * Hook simplificado que solo inicializa el visitor storage al montar.
 * Útil para inicializar en _app o layout principal.
 */
export function useInitVisitorStorage() {
  useEffect(() => {
    initVisitorStorage();
  }, []);
}
