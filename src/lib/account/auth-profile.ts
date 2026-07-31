import type { Profile } from "@/lib/account/repository";

export const AUTH_CALLBACK_URL = "https://www.creovision.io/auth/callback";
export const PASSWORD_RECOVERY_URL = "https://www.creovision.io/auth/update-password";

export type BirthTimeStatus = "exact" | "approximate" | "unknown";

export interface AuthValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface PasswordUpdateResult {
  ok: boolean;
  errors: Record<string, string>;
  message?: string;
}

export const RECOVERY_LINK_ERROR =
  "Este enlace de recuperación expiró o ya fue utilizado. Solicita uno nuevo.";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_BIRTH_DATE = "1900-01-01";

export function normalizeDisplayName(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, 80);
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Ingresa tu correo electrónico.";
  if (!EMAIL_PATTERN.test(email.trim())) return "Ingresa un correo válido.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Ingresa tu contraseña.";
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  return null;
}

export function validateNewPassword(input: {
  password: string;
  confirmPassword: string;
}): AuthValidationResult {
  const errors: Record<string, string> = {};

  if (!input.password) errors.password = "Ingresa tu nueva contraseña.";
  else if (input.password.length < 8) {
    errors.password = "La contraseña debe tener al menos 8 caracteres.";
  }

  if (!input.confirmPassword) errors.confirmPassword = "Confirma tu nueva contraseña.";
  else if (input.password !== input.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export async function exchangeRecoveryCode(input: {
  code: string | null;
  exchangedCode: string | null;
  exchangeCodeForSession: (code: string) => Promise<{ error: { message?: string } | null }>;
}): Promise<{ status: "ready" | "invalid" | "duplicate" }> {
  if (!input.code) return { status: "invalid" };
  if (input.exchangedCode === input.code) return { status: "duplicate" };

  const { error } = await input.exchangeCodeForSession(input.code);
  if (error) return { status: "invalid" };

  return { status: "ready" };
}

export async function updateRecoveryPassword(input: {
  password: string;
  confirmPassword: string;
  updateUser: (attributes: { password: string }) => Promise<{ error: { message?: string } | null }>;
}): Promise<PasswordUpdateResult> {
  const validation = validateNewPassword({
    password: input.password,
    confirmPassword: input.confirmPassword,
  });

  if (!validation.valid) {
    return { ok: false, errors: validation.errors };
  }

  const { error } = await input.updateUser({ password: input.password });
  if (error) {
    return {
      ok: false,
      errors: {},
      message: "No pudimos actualizar tu contraseña. Inténtalo nuevamente.",
    };
  }

  return { ok: true, errors: {}, message: "Tu contraseña fue actualizada correctamente" };
}

export function isSafeInternalRedirect(value: string | null): boolean {
  return Boolean(
    value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\"),
  );
}

export function validateSignUp(input: {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}): AuthValidationResult {
  const errors: Record<string, string> = {};
  const displayName = normalizeDisplayName(input.displayName);
  const emailError = validateEmail(input.email);
  const passwordError = validatePassword(input.password);

  if (!displayName) errors.displayName = "Ingresa tu nombre visible.";
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  if (input.password !== input.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }
  if (!input.acceptedTerms) {
    errors.acceptedTerms = "Debes aceptar los términos y la política de privacidad.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateAstralProfile(input: {
  displayName?: string | null;
  birthDate?: string | null;
  birthTime?: string | null;
  birthTimeStatus?: BirthTimeStatus | null;
  birthPlaceLabel?: string | null;
  birthTimezone?: string | null;
  birthLatitude?: string | number | null;
  birthLongitude?: string | number | null;
}): AuthValidationResult {
  const errors: Record<string, string> = {};
  const today = new Date().toISOString().slice(0, 10);
  const birthDate = input.birthDate ?? "";
  const timeStatus = input.birthTimeStatus ?? "unknown";
  const lat = Number(input.birthLatitude);
  const lng = Number(input.birthLongitude);

  if (
    input.displayName !== undefined &&
    normalizeDisplayName(input.displayName ?? "").length > 80
  ) {
    errors.displayName = "El nombre no puede superar 80 caracteres.";
  }
  if (!birthDate) errors.birthDate = "Ingresa tu fecha de nacimiento.";
  else if (birthDate < MIN_BIRTH_DATE) errors.birthDate = "Ingresa una fecha posterior a 1900.";
  else if (birthDate > today)
    errors.birthDate = "La fecha de nacimiento no puede estar en el futuro.";

  if (!["exact", "approximate", "unknown"].includes(timeStatus)) {
    errors.birthTimeStatus = "Selecciona si conoces la hora de nacimiento.";
  }
  if (timeStatus !== "unknown" && !input.birthTime) {
    errors.birthTime = "Ingresa la hora o marca que no la conoces.";
  }
  if (timeStatus === "unknown" && input.birthTime) {
    errors.birthTime = "Deja la hora vacía si indicas que no la conoces.";
  }
  if (!input.birthPlaceLabel?.trim()) errors.birthPlaceLabel = "Ingresa tu lugar de nacimiento.";
  if (!input.birthTimezone?.trim()) errors.birthTimezone = "Ingresa la zona horaria de nacimiento.";
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    errors.birthLatitude = "La latitud debe estar entre -90 y 90.";
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    errors.birthLongitude = "La longitud debe estar entre -180 y 180.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function isAstralProfileComplete(profile: Partial<Profile> | null | undefined): boolean {
  if (!profile) return false;
  return Boolean(
    profile.birth_date &&
    profile.birth_place_label &&
    profile.birth_timezone &&
    profile.birth_latitude !== null &&
    profile.birth_latitude !== undefined &&
    profile.birth_longitude !== null &&
    profile.birth_longitude !== undefined &&
    profile.profile_completed_at,
  );
}

export function authErrorMessage(message?: string): string {
  const lower = (message ?? "").toLowerCase();
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "Correo o contraseña incorrectos.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirma tu correo antes de iniciar sesión.";
  }
  if (lower.includes("password")) {
    return "Revisa que la contraseña cumpla los requisitos.";
  }
  if (lower.includes("rate limit")) {
    return "Espera unos minutos antes de intentarlo nuevamente.";
  }
  return "No pudimos completar la acción. Revisa los datos e inténtalo nuevamente.";
}
