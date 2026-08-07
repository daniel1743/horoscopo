import { z } from "zod";
import { validateUsername, validateAstralProfile, type BirthTimeStatus } from "./auth-profile";
import { isUsernameAvailable } from "./repository";

export const profileFormSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-z0-9._]+$/, "Solo letras en minúscula, números, puntos y guiones bajos."),
  display_name: z.string().max(80).optional().nullable(),
  bio: z.string().max(400).optional().nullable(),
  avatar_url: z.string().optional().nullable(),
  cover_url: z.string().optional().nullable(),
  
  preferred_sign: z.string().optional().nullable(),
  favorite_signs: z.array(z.string()).max(3, "Máximo 3 signos favoritos").optional().default([]),
  
  show_sun_sign: z.boolean().default(true),
  show_moon_sign: z.boolean().default(false),
  show_favorite_signs: z.boolean().default(true),

  birth_date: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  birth_time_status: z.enum(["exact", "approximate", "unknown"] as const),
  birth_time: z.string().optional().nullable(),
  
  birth_place_label: z.string().min(1, "El lugar de nacimiento es obligatorio"),
  birth_city: z.string().optional().nullable(),
  birth_region: z.string().optional().nullable(),
  birth_country: z.string().optional().nullable(),
  birth_country_code: z.string().optional().nullable(),
  birth_timezone: z.string().min(1, "La zona horaria es obligatoria"),
  birth_latitude: z.number({ required_error: "Latitud obligatoria", invalid_type_error: "Latitud inválida" }).min(-90).max(90),
  birth_longitude: z.number({ required_error: "Longitud obligatoria", invalid_type_error: "Longitud inválida" }).min(-180).max(180),
  
  city: z.string().max(80).optional().nullable(),
}).superRefine(async (data, ctx) => {
  // 1. Validation for username reserved words (from auth-profile.ts logic but we can do it here)
  const reserved = ["admin", "creovision", "support", "api", "auth", "mi-espacio"];
  if (reserved.includes(data.username)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Este nombre de usuario no está disponible.",
      path: ["username"]
    });
  }

  // 2. Validate time logic
  if (data.birth_time_status !== "unknown" && !data.birth_time) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Ingresa la hora o marca que no la conoces.",
      path: ["birth_time"]
    });
  }
  
  // 3. Optional: other custom checks from validateAstralProfile
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
