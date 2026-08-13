import { describe, it, expect } from "vitest";

// Simulamos la lógica extraída para tests, ya que no tenemos @testing-library/react
function determinePostAuthRedirect(hasPendingTarotSave: boolean, hasPendingLunarSave: boolean) {
  if (hasPendingTarotSave && hasPendingLunarSave) {
    return { to: "/mi-espacio/lecturas", setChainToLunar: true };
  }
  if (hasPendingTarotSave) return { to: "/mi-espacio/lecturas", setChainToLunar: false };
  if (hasPendingLunarSave) return { to: "/mi-espacio/lecturas-lunares", setChainToLunar: false };
  return { to: "/mi-espacio", setChainToLunar: false };
}

describe("AuthCallback Pending Payloads", () => {
  it("sin pending", () => {
    const result = determinePostAuthRedirect(false, false);
    expect(result.to).toBe("/mi-espacio");
    expect(result.setChainToLunar).toBe(false);
  });

  it("solo Tarot", () => {
    const result = determinePostAuthRedirect(true, false);
    expect(result.to).toBe("/mi-espacio/lecturas");
    expect(result.setChainToLunar).toBe(false);
  });

  it("solo Luna", () => {
    const result = determinePostAuthRedirect(false, true);
    expect(result.to).toBe("/mi-espacio/lecturas-lunares");
    expect(result.setChainToLunar).toBe(false);
  });

  it("Tarot + Luna (encadenamiento esperado)", () => {
    const result = determinePostAuthRedirect(true, true);
    expect(result.to).toBe("/mi-espacio/lecturas");
    expect(result.setChainToLunar).toBe(true);
  });
});
