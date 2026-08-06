import { describe, expect, it } from "vitest";
import { buildSynthesisText } from "./synthesis-text";

describe("buildSynthesisText", () => {
  it("une el texto principal y la pregunta de reflexion sin perder la sintesis", () => {
    const result = buildSynthesisText({
      text: "Cinco de Bastos, La Estrella y Sota de Oros muestran una progresion desde friccion emocional hacia cuidado y constancia. La lectura invita a no negar el conflicto, sino a convertirlo en aprendizaje concreto.",
      reflectionQuestion:
        "¿Cómo puedo transformar la fricción interna en un gesto concreto de cuidado?",
    });

    expect(result).toContain("Cinco de Bastos, La Estrella y Sota de Oros");
    expect(result).toContain("¿Cómo puedo transformar");
    expect(result).not.toContain("undefined");
    expect(result.split("\n\n")).toHaveLength(2);
  });
});
