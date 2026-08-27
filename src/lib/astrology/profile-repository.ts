import { supabase } from "@/integrations/supabase/client";
import type { BirthData } from "@/types/astrology";

/** Datos de nacimiento que una persona puede autorizar guardar en su cuenta. */
export interface PersistedAstrologyBirthData {
  birthDate: string | null;
  birthTime: string | null;
  timezone: string | null;
  locationLabel: string | null;
  latitude: number | null;
  longitude: number | null;
}

export type AstrologyPersistenceStatus = "saved" | "empty" | "backend-unavailable" | "error";

export class AstrologyPersistenceError extends Error {
  readonly status: Exclude<AstrologyPersistenceStatus, "saved" | "empty">;

  constructor(
    message: string,
    status: Exclude<AstrologyPersistenceStatus, "saved" | "empty"> = "error",
  ) {
    super(message);
    this.name = "AstrologyPersistenceError";
    this.status = status;
  }
}

const PROFILE_ASTROLOGY_COLUMNS =
  "birth_date,birth_time,birth_timezone,birth_place_label,birth_latitude,birth_longitude";

type ProfileAstrologyRow = {
  birth_date?: string | null;
  birth_time?: string | null;
  birth_timezone?: string | null;
  birth_place_label?: string | null;
  birth_latitude?: number | string | null;
  birth_longitude?: number | string | null;
};

function ensureUserId(userId: string): void {
  if (!userId.trim()) {
    throw new AstrologyPersistenceError("Necesitamos una sesión para guardar estos datos.");
  }
}

function isBackendUnavailable(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return /missing supabase|failed to fetch|fetch failed|network|timeout|timed out|abort|connection|not found|does not exist|schema cache|column .* not found/.test(
    message,
  );
}

function mapRow(row: ProfileAstrologyRow | null | undefined): PersistedAstrologyBirthData | null {
  if (!row) return null;
  const mapped: PersistedAstrologyBirthData = {
    birthDate: row.birth_date ?? null,
    birthTime: row.birth_time ? row.birth_time.slice(0, 5) : null,
    timezone: row.birth_timezone ?? null,
    locationLabel: row.birth_place_label ?? null,
    latitude: row.birth_latitude == null ? null : Number(row.birth_latitude),
    longitude: row.birth_longitude == null ? null : Number(row.birth_longitude),
  };

  const hasAnyValue = Object.values(mapped).some((value) => value !== null && value !== "");
  return hasAnyValue ? mapped : null;
}

function mapInput(data: BirthData): PersistedAstrologyBirthData {
  return {
    birthDate: data.birthDate || null,
    birthTime: data.birthTime || null,
    timezone: data.timezone.trim() || null,
    locationLabel: data.locationLabel?.trim() || null,
    latitude: Number.isFinite(data.latitude) ? data.latitude : null,
    longitude: Number.isFinite(data.longitude) ? data.longitude : null,
  };
}

function toRow(data: BirthData | null): Record<string, string | number | null> {
  if (!data) {
    return {
      birth_date: null,
      birth_time: null,
      birth_timezone: null,
      birth_place_label: null,
      birth_latitude: null,
      birth_longitude: null,
    };
  }
  return {
    birth_date: data.birthDate || null,
    birth_time: data.birthTime || null,
    birth_timezone: data.timezone.trim() || null,
    birth_place_label: data.locationLabel?.trim() || null,
    birth_latitude: Number.isFinite(data.latitude) ? data.latitude : null,
    birth_longitude: Number.isFinite(data.longitude) ? data.longitude : null,
  };
}

async function execute<T>(
  operation: () => Promise<{ data: T; error: { message: string } | null }>,
): Promise<T> {
  try {
    const { data, error } = await operation();
    if (error) {
      const status = isBackendUnavailable(error) ? "backend-unavailable" : "error";
      throw new AstrologyPersistenceError(
        status === "backend-unavailable"
          ? "El guardado natal no está disponible temporalmente. Tus datos siguen solo en este navegador."
          : "No pudimos acceder a tus datos natales guardados.",
        status,
      );
    }
    return data;
  } catch (error) {
    if (error instanceof AstrologyPersistenceError) throw error;
    throw new AstrologyPersistenceError(
      isBackendUnavailable(error)
        ? "El guardado natal no está disponible temporalmente. Tus datos siguen solo en este navegador."
        : "No pudimos completar esta operación de privacidad.",
      isBackendUnavailable(error) ? "backend-unavailable" : "error",
    );
  }
}

/** Lee solo los campos natales del propio usuario; nunca usa el RPC de perfil público. */
export async function fetchPersistedAstrologyBirthData(
  userId: string,
): Promise<PersistedAstrologyBirthData | null> {
  ensureUserId(userId);
  const data = await execute(
    () =>
      supabase
        .from("profiles")
        .select(PROFILE_ASTROLOGY_COLUMNS)
        .eq("id", userId)
        .maybeSingle() as unknown as Promise<{
        data: ProfileAstrologyRow | null;
        error: { message: string } | null;
      }>,
  );
  return mapRow(data);
}

/** Guarda o actualiza únicamente los datos natales autorizados por el usuario. */
export async function savePersistedAstrologyBirthData(
  userId: string,
  birthData: BirthData,
): Promise<PersistedAstrologyBirthData> {
  ensureUserId(userId);
  const data = await execute(
    () =>
      supabase
        .from("profiles")
        .upsert({ id: userId, ...toRow(birthData) } as never, { onConflict: "id" })
        .select(PROFILE_ASTROLOGY_COLUMNS)
        .single() as unknown as Promise<{
        data: ProfileAstrologyRow;
        error: { message: string } | null;
      }>,
  );
  return mapRow(data) ?? mapInput(birthData);
}

/** Elimina los datos natales sin eliminar la cuenta ni el resto del perfil. */
export async function clearPersistedAstrologyBirthData(userId: string): Promise<void> {
  ensureUserId(userId);
  await execute(
    () =>
      supabase
        .from("profiles")
        .update(toRow(null) as never)
        .eq("id", userId) as unknown as Promise<{
        data: null;
        error: { message: string } | null;
      }>,
  );
}

/** Convierte datos persistidos a la entrada que ya consume el motor local. */
export function toBirthData(data: PersistedAstrologyBirthData): BirthData | null {
  if (!data.birthDate || !data.timezone || data.latitude == null || data.longitude == null) {
    return null;
  }
  return {
    birthDate: data.birthDate,
    birthTime: data.birthTime || undefined,
    timezone: data.timezone,
    latitude: data.latitude,
    longitude: data.longitude,
    locationLabel: data.locationLabel || undefined,
  };
}
