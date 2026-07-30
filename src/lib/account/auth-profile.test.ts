import { describe, expect, it } from "vitest";
import {
  isSafeInternalRedirect,
  isAstralProfileComplete,
  normalizeDisplayName,
  validateAstralProfile,
  validateEmail,
  validateSignUp,
} from "./auth-profile";

describe("auth profile validation", () => {
  it("accepts safe internal redirects", () => {
    expect(isSafeInternalRedirect("/mi-espacio")).toBe(true);
    expect(isSafeInternalRedirect("/mi-espacio/perfil")).toBe(true);
    expect(isSafeInternalRedirect("/horoscopo/hoy")).toBe(true);
  });

  it("rejects external or ambiguous redirects", () => {
    expect(isSafeInternalRedirect("//dominio-externo.com")).toBe(false);
    expect(isSafeInternalRedirect("///dominio-externo.com")).toBe(false);
    expect(isSafeInternalRedirect("https://dominio-externo.com")).toBe(false);
    expect(isSafeInternalRedirect("http://dominio-externo.com")).toBe(false);
    expect(isSafeInternalRedirect("javascript:alert(1)")).toBe(false);
    expect(isSafeInternalRedirect("\\\\dominio-externo.com")).toBe(false);
    expect(isSafeInternalRedirect(null)).toBe(false);
  });

  it("normalizes visible names", () => {
    expect(normalizeDisplayName("  Luna   Solar  ")).toBe("Luna Solar");
  });

  it("validates email format", () => {
    expect(validateEmail("bad-email")).toBe("Ingresa un correo válido.");
    expect(validateEmail("persona@example.com")).toBeNull();
  });

  it("blocks signup when passwords do not match", () => {
    const result = validateSignUp({
      displayName: "Persona",
      email: "persona@example.com",
      password: "password123",
      confirmPassword: "password456",
      acceptedTerms: true,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.confirmPassword).toBe("Las contraseñas no coinciden.");
  });

  it("requires terms during signup", () => {
    const result = validateSignUp({
      displayName: "Persona",
      email: "persona@example.com",
      password: "password123",
      confirmPassword: "password123",
      acceptedTerms: false,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.acceptedTerms).toContain("términos");
  });

  it("accepts exact birth time when a time is present", () => {
    const result = validateAstralProfile({
      birthDate: "1990-05-12",
      birthTimeStatus: "exact",
      birthTime: "08:30",
      birthPlaceLabel: "Santiago, Chile",
      birthTimezone: "America/Santiago",
      birthLatitude: -33.45,
      birthLongitude: -70.66,
    });

    expect(result.valid).toBe(true);
  });

  it("accepts approximate birth time when a time is present", () => {
    const result = validateAstralProfile({
      birthDate: "1990-05-12",
      birthTimeStatus: "approximate",
      birthTime: "08:30",
      birthPlaceLabel: "Santiago, Chile",
      birthTimezone: "America/Santiago",
      birthLatitude: -33.45,
      birthLongitude: -70.66,
    });

    expect(result.valid).toBe(true);
  });

  it("accepts unknown birth time only when the time is empty", () => {
    const result = validateAstralProfile({
      birthDate: "1990-05-12",
      birthTimeStatus: "unknown",
      birthTime: null,
      birthPlaceLabel: "Santiago, Chile",
      birthTimezone: "America/Santiago",
      birthLatitude: -33.45,
      birthLongitude: -70.66,
    });

    expect(result.valid).toBe(true);
  });

  it("rejects future dates and invalid coordinates", () => {
    const result = validateAstralProfile({
      birthDate: "2999-01-01",
      birthTimeStatus: "unknown",
      birthPlaceLabel: "Santiago, Chile",
      birthTimezone: "America/Santiago",
      birthLatitude: -91,
      birthLongitude: -181,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.birthDate).toContain("futuro");
    expect(result.errors.birthLatitude).toContain("-90");
    expect(result.errors.birthLongitude).toContain("-180");
  });

  it("detects incomplete and complete astral profiles", () => {
    expect(isAstralProfileComplete(null)).toBe(false);
    expect(
      isAstralProfileComplete({
        birth_date: "1990-05-12",
        birth_place_label: "Santiago, Chile",
        birth_timezone: "America/Santiago",
        birth_latitude: -33.45,
        birth_longitude: -70.66,
        profile_completed_at: "2026-07-30T00:00:00.000Z",
      }),
    ).toBe(true);
  });
});
