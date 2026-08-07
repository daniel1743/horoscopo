import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CalculateIdentityInput = z.object({
  birthDate: z.string(),
  birthTime: z.string().optional().nullable(),
  timezoneOffset: z.number().default(0),
});

export const calculateAstralIdentityFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => CalculateIdentityInput.parse(raw))
  .handler(async ({ data }) => {
    const { calculateNatalMoon } = await import("@/server/natal/natal-moon-calculator");
    const { astronomyPlanetaryEngine } = await import("@/server/planetary/astronomy-planetary-engine");

    const moonResult = calculateNatalMoon(data.birthDate, data.birthTime || undefined, data.timezoneOffset);
    
    // Calculate Sun
    let utcDate = new Date();
    if (data.birthTime) {
      const [hours, minutes] = data.birthTime.split(":").map(Number);
      const exactUtcHour = hours - data.timezoneOffset;
      utcDate.setUTCFullYear(parseInt(data.birthDate.substring(0, 4)), parseInt(data.birthDate.substring(5, 7)) - 1, parseInt(data.birthDate.substring(8, 10)));
      utcDate.setUTCHours(Math.floor(exactUtcHour));
      utcDate.setUTCMinutes(minutes + (exactUtcHour % 1) * 60);
      utcDate.setUTCSeconds(0);
      utcDate.setUTCMilliseconds(0);
    } else {
      utcDate.setUTCFullYear(parseInt(data.birthDate.substring(0, 4)), parseInt(data.birthDate.substring(5, 7)) - 1, parseInt(data.birthDate.substring(8, 10)));
      utcDate.setUTCHours(12 - data.timezoneOffset);
      utcDate.setUTCMinutes(0);
    }

    const sunPos = astronomyPlanetaryEngine.calculatePosition("sun", utcDate);

    return {
      sun_sign: sunPos.sign,
      moon_sign: moonResult.moon.sign,
    };
  });
