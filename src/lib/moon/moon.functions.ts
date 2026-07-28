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
