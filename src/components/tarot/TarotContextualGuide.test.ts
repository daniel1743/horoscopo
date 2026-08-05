import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./TarotContextualGuide.tsx", import.meta.url), "utf8");

describe("TarotContextualGuide copy and structure", () => {
  it("usa tendencia simbólica y evita copy absoluto", () => {
    expect(source).toContain("Tendencia simbólica");
    expect(source).not.toContain("Energía de la carta");
    expect(source).not.toContain("depende completamente");
  });

  it("declara las cinco secciones estructuradas de respuesta", () => {
    expect(source).toContain("Mensaje principal");
    expect(source).toContain("Valor positivo");
    expect(source).toContain("Aspecto a vigilar");
    expect(source).toContain("Consejo práctico");
    expect(source).toContain("Pregunta de reflexión");
  });

  it("muestra tres preguntas rápidas iniciales y tres secundarias desplegables", () => {
    expect(source).toContain("PRIMARY_QUICK_QUESTIONS");
    expect(source).toContain("SECONDARY_QUICK_QUESTIONS");
    expect(source).toContain("Ver más preguntas");
    expect(source).toContain("Ocultar preguntas");
  });

  it("cambia el formulario después de una respuesta y evita disclaimer duplicado", () => {
    expect(source).toContain("Haz otra pregunta sobre esta carta");
    expect(source).toContain("Enviar nueva pregunta");
    expect(source).toContain("{!answer &&");
    expect(source).toContain("Orientación simbólica para reflexión personal.");
  });
});
