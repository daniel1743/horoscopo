import "dotenv/config";
import { streamChatCompletion } from "../src/lib/ai/gateway.server";

// Copia local de buildReadingPrompt para pruebas (ya que no se exporta)
function buildReadingPrompt(
  config: any,
  cards: any[],
  userContext?: string,
  userQuestion?: string,
): string {
  const [card1, card2, card3] = cards;
  const [pos1, pos2, pos3] = config.positions;

  return `Eres la Guía de Tarot de Creovision. Interpreta una lectura completa de tres cartas temática.

TEMA: ${config.title}
DESCRIPCIÓN: ${config.description}

${userContext ? `CONTEXTO DEL USUARIO: "${userContext}"` : ""}
${userQuestion ? `PREGUNTA DEL USUARIO: "${userQuestion}"` : ""}

CARTAS REVELADAS:

1. ${pos1.label} (${pos1.shortLabel}):
   Carta: ${card1.name}
   Significado: ${card1.uprightMeaning}
   Keywords: ${card1.keywords.slice(0, 4).join(", ")}
   Foco de interpretación: ${pos1.interpretationFocus}

2. ${pos2.label} (${pos2.shortLabel}):
   Carta: ${card2.name}
   Significado: ${card2.uprightMeaning}
   Keywords: ${card2.keywords.slice(0, 4).join(", ")}
   Foco de interpretación: ${pos2.interpretationFocus}

3. ${pos3.label} (${pos3.shortLabel}):
   Carta: ${card3.name}
   Significado: ${card3.uprightMeaning}
   Keywords: ${card3.keywords.slice(0, 4).join(", ")}
   Foco de interpretación: ${pos3.interpretationFocus}

INSTRUCCIONES DE SÍNTESIS:
${config.synthesisInstructions}

DEVUELVE JSON VÁLIDO con esta estructura EXACTA:
{
  "positions": [
    {
      "positionKey": "${pos1.key}",
      "interpretation": "Interpreta ${card1.name} según ${pos1.interpretationFocus} (2-3 frases)",
      "positiveValue": "Fortaleza que aporta esta carta en esta posición (1-2 frases)",
      "caution": "Aspecto a observar (1-2 frases)",
      "practicalFocus": "Acción o reflexión concreta (1-2 frases)"
    },
    {
      "positionKey": "${pos2.key}",
      "interpretation": "...",
      "positiveValue": "...",
      "caution": "...",
      "practicalFocus": "..."
    },
    {
      "positionKey": "${pos3.key}",
      "interpretation": "...",
      "positiveValue": "...",
      "caution": "...",
      "practicalFocus": "..."
    }
  ],
  "synthesis": {
    "mainPattern": "Patrón general de las tres cartas (2-3 frases)",
    "relationshipBetweenCards": "Cómo se conectan las tres cartas (2-3 frases)",
    "emotionalTensionOrResource": "Recurso o tensión destacada (2-3 frases)",
    "guidance": "Orientación práctica sin ordenar decisiones (2-3 frases)",
    "reflectionQuestion": "Pregunta que integre las tres cartas (1 frase)"
  }
}

RESTRICCIONES:
- NO afirmes sentimientos de terceros como hechos
- NO predicas reconciliaciones, separaciones ni decisiones
- NO uses lenguaje fatalista
- USA condicional: "puede", "sugiere", "invita a"
- Español natural sin palabras truncadas
- Máximo 500 caracteres por interpretation
- Máximo 300 caracteres por positiveValue, caution, practicalFocus
- Máximo 500 caracteres por cada campo de synthesis`;
}

// Mock de configuración y cartas (Tema Amor)
const mockConfig = {
  title: "Tirada de Amor",
  description: "Explora la dinámica emocional, tus propios sentimientos y cómo proceder.",
  positions: [
    {
      key: "self",
      label: "Tu mundo emocional",
      shortLabel: "Tú",
      interpretationFocus: "Lo que sientes y aportas a la dinámica. Tus miedos y deseos reales.",
    },
    {
      key: "dynamic",
      label: "La dinámica afectiva",
      shortLabel: "Vínculo",
      interpretationFocus: "Cómo fluye la energía entre las partes. Qué se retroalimenta.",
    },
    {
      key: "guidance",
      label: "Orientación para avanzar",
      shortLabel: "Consejo",
      interpretationFocus: "Hacia dónde conviene mirar. Un paso interno o acción consciente.",
    },
  ],
  synthesisInstructions: "Conecta la posición 'Tú' con el 'Vínculo' para llegar al 'Consejo'. Busca el tema común en las tres cartas.",
};

const mockCards = [
  {
    name: "El Sol",
    uprightMeaning: "Alegría, éxito, claridad, vitalidad y confianza en uno mismo.",
    keywords: ["Alegría", "Vitalidad", "Iluminación", "Éxito"],
  },
  {
    name: "El Diablo",
    uprightMeaning: "Apegos, codependencia, miedo, instintos básicos y limitación ilusoria.",
    keywords: ["Apego", "Sombra", "Materialismo", "Tensión"],
  },
  {
    name: "Los Enamorados",
    uprightMeaning: "Amor, valores compartidos, decisiones importantes y unión armónica.",
    keywords: ["Elección", "Unión", "Amor", "Alineación"],
  },
];

async function callAI(prompt: string): Promise<string> {
  const response = await streamChatCompletion({
    alias: "fast",
    messages: [{ role: "user", content: prompt }],
  });

  const reader = response.stream.getReader();
  let accumulated = "";
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    accumulated += decoder.decode(value, { stream: true });
  }

  // Hack since streamChatCompletion returns the text via getText
  return response.getText();
}

async function runTest() {
  const questions = [
    { label: "CONTROL (Sin pregunta)", value: "" },
    { label: "PREGUNTA A (Conociendo a alguien)", value: "Estoy conociendo a una persona y quiero saber qué debo observar antes de avanzar." },
    { label: "PREGUNTA B (Recuperar confianza)", value: "Llevo años en una relación y quiero comprender cómo recuperar la confianza." },
    { label: "PREGUNTA C (Cerrar relación)", value: "Estoy pensando en cerrar una relación que ya no me hace sentir bien." }
  ];

  console.log("=== INICIANDO PRUEBA COMPARATIVA DE TAROT AI ===");
  console.log("Cartas:", mockCards.map(c => c.name).join(", "));
  console.log("--------------------------------------------------\\n");

  for (const q of questions) {
    console.log(`\\n>>> PROBANDO ESCENARIO: ${q.label}`);
    const prompt = buildReadingPrompt(mockConfig, mockCards, q.value, undefined);
    
    try {
      const response = await callAI(prompt);
      
      // Intentar parsear el JSON
      let jsonText = response;
      const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      } else if (response.includes("{")) {
        const startIdx = response.indexOf("{");
        const endIdx = response.lastIndexOf("}");
        if (startIdx !== -1 && endIdx !== -1) {
          jsonText = response.substring(startIdx, endIdx + 1);
        }
      }
      
      try {
        const parsed = JSON.parse(jsonText);
        console.log("Síntesis generada:");
        console.log("- Relación:", parsed.synthesis.relationshipBetweenCards);
        console.log("- Orientación:", parsed.synthesis.guidance);
        console.log("- Pregunta final:", parsed.synthesis.reflectionQuestion);
      } catch (err) {
        console.log("NO SE PUDO PARSEAR JSON. RAW TEXT:");
        console.log(response);
      }
      
    } catch (e) {
      console.error("Error en " + q.label, e);
    }
    
    // Pausa breve para evitar rate limits fuertes
    await new Promise(r => setTimeout(r, 2000));
  }
}

runTest().then(() => console.log("\\n=== PRUEBA FINALIZADA ===")).catch(console.error);
