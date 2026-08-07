/**
 * Server functions del sistema lunar (YAML 10 §11).
 *
 * Puentes SSR-safe entre el motor astronómico server-only y la UI.
 * Los componentes llaman a estas funciones; el motor jamás se importa
 * desde el bundle de cliente (import dinámico dentro del handler).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { MOON_SITE_TIMEZONE } from "@/config/moon";
import type {
  MoonCalendarDay,
  MoonPhaseEvent,
  MoonSnapshot,
} from "@/types/moon";
import type { LunarReadingResult } from "@/server/moon/moon-reading-orchestrator";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LunarReadingInput = z.object({
  birthDate: z.string(), // YYYY-MM-DD
  birthTime: z.string().optional(), // HH:mm
  timezoneOffset: z.number().default(0),
});

const MonthInput = z.object({
  year: z.number().int().min(1900).max(2100),
  month: z.number().int().min(1).max(12),
});

export const getMoonToday = createServerFn({ method: "GET" }).handler(
  async (): Promise<MoonSnapshot> => {
    const { astronomyMoonEngine } = await import(
      "@/server/moon/astronomy-moon-engine"
    );
    return astronomyMoonEngine.getSnapshot(new Date(), MOON_SITE_TIMEZONE);
  },
);

export const getMoonCalendar = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => MonthInput.parse(raw))
  .handler(async ({ data }): Promise<MoonCalendarDay[]> => {
    const { astronomyMoonEngine } = await import(
      "@/server/moon/astronomy-moon-engine"
    );
    return astronomyMoonEngine.getCalendarMonth(
      data.year,
      data.month,
      MOON_SITE_TIMEZONE,
    );
  });

export const getUpcomingMoonEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<MoonPhaseEvent[]> => {
    const { astronomyMoonEngine } = await import(
      "@/server/moon/astronomy-moon-engine"
    );
    const now = new Date();
    const end = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    return astronomyMoonEngine
      .getPhaseEvents(now, end, MOON_SITE_TIMEZONE)
      .slice(0, 8);
  },
);

export const getPersonalLunarReading = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => LunarReadingInput.parse(raw))
  .handler(async ({ data }): Promise<LunarReadingResult> => {
    const { orchestrateLunarReading } = await import("@/server/moon/moon-reading-orchestrator");
    return orchestrateLunarReading(data);
  });

// -------- Lecturas Guardadas --------

const SaveLunarReadingSchema = z.object({
  title: z.string(),
  sourceDate: z.string(), // YYYY-MM-DD
  natalMoonSign: z.string(),
  currentMoonSign: z.string(),
  aspectName: z.string(),
  aspectType: z.string(),
  birthTimeKnown: z.boolean(),
  uncertaintyMessage: z.string().optional(),
  interpretation: z.string(),
  focusText: z.string().optional(),
  metadata: z.record(z.unknown()).default({}),
});

export const saveLunarReadingFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SaveLunarReadingSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("saved_readings").upsert({
      user_id: context.userId,
      reading_type: "lunar",
      title: data.title,
      source_date: data.sourceDate,
      natal_moon_sign: data.natalMoonSign,
      current_moon_sign: data.currentMoonSign,
      aspect_name: data.aspectName,
      aspect_type: data.aspectType,
      birth_time_known: data.birthTimeKnown,
      uncertainty_message: data.uncertaintyMessage ?? null,
      interpretation: data.interpretation,
      focus_text: data.focusText ?? null,
      metadata: data.metadata,
    }, { onConflict: "user_id, reading_type, source_date" });

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getSavedLunarReadingsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_readings")
      .select("id, title, source_date, natal_moon_sign, current_moon_sign, aspect_type, created_at")
      .eq("user_id", context.userId)
      .eq("reading_type", "lunar")
      .order("source_date", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getSavedLunarReadingByIdFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("saved_readings")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!row) throw new Error("Lectura no encontrada");
    return row;
  });

export const deleteSavedLunarReadingFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("saved_readings")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
      
    if (error) throw new Error(error.message);
    return { ok: true };
  });


