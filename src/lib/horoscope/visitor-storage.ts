/**
 * Sistema de almacenamiento de variantes para visitantes (localStorage).
 * Los visitantes no autenticados obtienen variantes consistentes usando sessionId.
 */

import type { VisitorAssignmentStorage, VariantId } from "@/types/horoscope-automation";
import type { HoroscopePeriod } from "@/types/horoscope";
import { makeAssignmentKey } from "@/types/horoscope-automation";

const STORAGE_KEY = "horoscope_visitor_assignments";
const SESSION_ID_KEY = "horoscope_session_id";

// =====================================================================
// Helpers de localStorage
// =====================================================================

/**
 * Verifica si localStorage está disponible.
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }

  try {
    const test = "__localStorage_test__";
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lee el storage de asignaciones desde localStorage.
 */
function readStorage(): VisitorAssignmentStorage | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as VisitorAssignmentStorage;

    // Validar estructura básica
    if (!parsed.sessionId || !parsed.assignments || typeof parsed.assignments !== "object") {
      console.warn("Storage de variantes corrupto, reiniciando");
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Error al leer storage de variantes:", error);
    return null;
  }
}

/**
 * Escribe el storage de asignaciones a localStorage.
 */
function writeStorage(storage: VisitorAssignmentStorage): void {
  if (!isLocalStorageAvailable()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error("Error al escribir storage de variantes:", error);
  }
}

/**
 * Limpia el storage (útil para testing o reset).
 */
export function clearVisitorStorage(): void {
  if (!isLocalStorageAvailable()) return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(SESSION_ID_KEY);
  } catch (error) {
    console.error("Error al limpiar storage:", error);
  }
}

// =====================================================================
// Gestión de Session ID
// =====================================================================

/**
 * Genera un nuevo session ID único.
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Obtiene o crea un session ID para el visitante.
 */
function getOrCreateSessionId(): string {
  if (!isLocalStorageAvailable()) {
    // Fallback: generar ID temporal en memoria
    return generateSessionId();
  }

  try {
    let sessionId = window.localStorage.getItem(SESSION_ID_KEY);

    if (!sessionId) {
      sessionId = generateSessionId();
      window.localStorage.setItem(SESSION_ID_KEY, sessionId);
    }

    return sessionId;
  } catch (error) {
    console.error("Error al gestionar session ID:", error);
    return generateSessionId();
  }
}

// =====================================================================
// Hash Consistente para Asignación de Variante
// =====================================================================

/**
 * Genera un hash simple a partir de un string.
 * Mismo input = mismo output (determinístico).
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Calcula qué variante corresponde a un visitante para un horóscopo dado.
 * Usa hash consistente: mismo sessionId + mismo horóscopo = misma variante.
 */
function calculateVariantByHash(
  sessionId: string,
  signSlug: string,
  period: HoroscopePeriod,
  dateFor: string
): VariantId {
  const input = `${sessionId}-${signSlug}-${period}-${dateFor}`;
  const hash = simpleHash(input);

  // Modulo 4 para obtener 0-3, luego +1 para 1-4
  const variantId = (hash % 4) + 1;

  return variantId as VariantId;
}

// =====================================================================
// API Pública
// =====================================================================

/**
 * Obtiene o asigna una variante para un visitante.
 * Si ya tiene una asignada, devuelve la misma. Si no, calcula y guarda una nueva.
 */
export function getOrAssignVisitorVariant(
  signSlug: string,
  period: HoroscopePeriod,
  dateFor: string
): VariantId {
  const sessionId = getOrCreateSessionId();
  const key = makeAssignmentKey(signSlug, period, dateFor);

  // Leer storage actual
  let storage = readStorage();

  // Si no existe storage, inicializar
  if (!storage || storage.sessionId !== sessionId) {
    storage = {
      sessionId,
      createdAt: new Date().toISOString(),
      assignments: {},
    };
  }

  // Si ya tiene asignación, devolverla
  if (storage.assignments[key]) {
    const existing = storage.assignments[key];
    if (existing >= 1 && existing <= 4) {
      return existing as VariantId;
    }
  }

  // Calcular nueva variante usando hash
  const variantId = calculateVariantByHash(sessionId, signSlug, period, dateFor);

  // Guardar asignación
  storage.assignments[key] = variantId;
  writeStorage(storage);

  return variantId;
}

/**
 * Obtiene la variante asignada a un visitante (sin crear nueva).
 * Retorna null si no tiene asignación previa.
 */
export function getVisitorAssignedVariant(
  signSlug: string,
  period: HoroscopePeriod,
  dateFor: string
): VariantId | null {
  const storage = readStorage();
  if (!storage) return null;

  const key = makeAssignmentKey(signSlug, period, dateFor);
  const variantId = storage.assignments[key];

  if (variantId >= 1 && variantId <= 4) {
    return variantId as VariantId;
  }

  return null;
}

/**
 * Obtiene el session ID actual del visitante.
 */
export function getVisitorSessionId(): string | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    return window.localStorage.getItem(SESSION_ID_KEY);
  } catch {
    return null;
  }
}

/**
 * Lista todas las asignaciones del visitante actual.
 */
export function listVisitorAssignments(): Array<{
  key: string;
  variantId: VariantId;
}> {
  const storage = readStorage();
  if (!storage) return [];

  return Object.entries(storage.assignments)
    .filter(([_, variantId]) => variantId >= 1 && variantId <= 4)
    .map(([key, variantId]) => ({
      key,
      variantId: variantId as VariantId,
    }));
}

/**
 * Limpia asignaciones antiguas (más de 30 días).
 * Útil para evitar que el storage crezca indefinidamente.
 */
export function cleanupOldAssignments(): void {
  const storage = readStorage();
  if (!storage) return;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Filtrar assignments por fecha en el key (formato: "sign-period-YYYY-MM-DD")
  const cleanedAssignments: Record<string, VariantId> = {};

  for (const [key, variantId] of Object.entries(storage.assignments)) {
    try {
      // Extraer fecha del key (último segmento)
      const parts = key.split("-");
      const dateStr = parts[parts.length - 1]; // YYYY-MM-DD

      if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Key inválido, mantener por si acaso
        cleanedAssignments[key] = variantId;
        continue;
      }

      const assignmentDate = new Date(dateStr);

      if (assignmentDate >= thirtyDaysAgo) {
        cleanedAssignments[key] = variantId;
      }
      // Si es más antiguo, no lo incluimos (se elimina)
    } catch {
      // Error al parsear, mantener por seguridad
      cleanedAssignments[key] = variantId;
    }
  }

  // Actualizar storage
  storage.assignments = cleanedAssignments;
  writeStorage(storage);
}

/**
 * Hook de inicialización: limpia assignments antiguos al cargar.
 * Llamar una vez al iniciar la app.
 */
export function initVisitorStorage(): void {
  if (!isLocalStorageAvailable()) return;

  // Verificar si hace más de 7 días que no limpiamos
  const LAST_CLEANUP_KEY = "horoscope_last_cleanup";

  try {
    const lastCleanup = window.localStorage.getItem(LAST_CLEANUP_KEY);
    const now = Date.now();

    if (!lastCleanup || now - parseInt(lastCleanup, 10) > 7 * 24 * 60 * 60 * 1000) {
      cleanupOldAssignments();
      window.localStorage.setItem(LAST_CLEANUP_KEY, now.toString());
    }
  } catch (error) {
    console.error("Error en init de visitor storage:", error);
  }
}

// =====================================================================
// Utilidades de Debugging
// =====================================================================

/**
 * Obtiene el estado completo del storage (para debugging).
 */
export function getStorageDebugInfo(): {
  available: boolean;
  sessionId: string | null;
  assignmentCount: number;
  createdAt: string | null;
} {
  if (!isLocalStorageAvailable()) {
    return {
      available: false,
      sessionId: null,
      assignmentCount: 0,
      createdAt: null,
    };
  }

  const storage = readStorage();

  return {
    available: true,
    sessionId: storage?.sessionId || null,
    assignmentCount: storage ? Object.keys(storage.assignments).length : 0,
    createdAt: storage?.createdAt || null,
  };
}
