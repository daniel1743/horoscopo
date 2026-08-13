#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dotenvPath = path.join(root, ".env");
if (fs.existsSync(dotenvPath)) {
  for (const line of fs.readFileSync(dotenvPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}
const signSource = fs.readFileSync(path.join(root, "src/data/zodiac-signs.ts"), "utf8");
const arrayLiteral = signSource.match(
  /export const zodiacSigns[^=]*=\s*(\[[\s\S]*?\])\s+as const;/,
)?.[1];
if (!arrayLiteral) throw new Error("No se pudo leer zodiacSigns desde src/data/zodiac-signs.ts");

const zodiacSigns = Function(`"use strict"; return (${arrayLiteral});`)();
const zodiacOrder = zodiacSigns.map((s) => s.slug);
const signSet = new Set(zodiacOrder);
const position = new Map(zodiacOrder.map((slug, index) => [slug, index + 1]));
const existingDemoPairs = new Set(["aries__libra", "cancer__capricornio", "geminis__sagitario"]);
const dimensions = [
  "communication",
  "emotional_rhythm",
  "daily_life",
  "attraction",
  "conflict_management",
  "growth",
];

const elementOrder = ["fuego", "tierra", "aire", "agua"];
const modalityOrder = ["cardinal", "fijo", "mutable"];

const elementAffinity = {
  fuego__fuego: {
    label: "Impulso compartido",
    strength: "ambos reconocen la fuerza de actuar, entusiasmarse y abrir camino",
    tension: "la energía puede volverse competencia si nadie acepta bajar la intensidad",
  },
  tierra__tierra: {
    label: "Estabilidad compartida",
    strength: "hay paciencia para construir confianza y cuidar los acuerdos concretos",
    tension: "la búsqueda de seguridad puede convertirse en resistencia al cambio",
  },
  aire__aire: {
    label: "Mente compartida",
    strength: "la conversación, las ideas y el movimiento mental mantienen vivo el vínculo",
    tension: "puede faltar aterrizaje emocional si todo queda en explicación",
  },
  agua__agua: {
    label: "Sensibilidad compartida",
    strength: "la intuición y la lectura del clima emocional aparecen con naturalidad",
    tension: "la sensibilidad puede saturarse si ambos callan para protegerse",
  },
  fuego__aire: {
    label: "Movimiento e ideas",
    strength: "el entusiasmo encuentra palabras, planes y curiosidad para probar caminos",
    tension: "la velocidad puede dispersar decisiones que necesitaban más escucha",
  },
  tierra__agua: {
    label: "Cuidado y sostén",
    strength: "lo emocional encuentra una forma concreta de cuidado y permanencia",
    tension: "la cautela puede confundirse con distancia, y la necesidad con exigencia",
  },
  fuego__agua: {
    label: "Intensidad sensible",
    strength: "la pasión y la sensibilidad pueden crear una implicación profunda",
    tension: "una reacción inmediata puede sentirse brusca para quien necesita procesar",
  },
  fuego__tierra: {
    label: "Acción y realidad",
    strength: "el impulso puede encontrar forma, cuerpo y continuidad",
    tension: "la urgencia y la prudencia necesitan negociar tiempos concretos",
  },
  aire__agua: {
    label: "Palabra y emoción",
    strength: "lo sensible puede encontrar lenguaje y nuevas perspectivas",
    tension: "una parte puede sentir que la otra racionaliza lo que pedía presencia",
  },
  tierra__aire: {
    label: "Idea y método",
    strength: "las ideas ganan método y lo práctico gana perspectiva",
    tension:
      "la teoría puede impacientar a quien necesita hechos, y la rutina a quien necesita aire",
  },
};

const modalityAffinity = {
  cardinal__cardinal: {
    label: "Dos inicios",
    strength: "hay iniciativa para abrir etapas y tomar decisiones",
    tension: "puede aparecer una disputa por quién marca la dirección",
  },
  fijo__fijo: {
    label: "Dos centros firmes",
    strength: "la lealtad y la perseverancia dan consistencia al vínculo",
    tension: "la firmeza puede volverse terquedad si nadie quiere ceder",
  },
  mutable__mutable: {
    label: "Dos ritmos adaptables",
    strength: "la flexibilidad permite aprender, cambiar y volver a mirar",
    tension: "la apertura puede dejar temas importantes sin cierre",
  },
  cardinal__fijo: {
    label: "Inicio y permanencia",
    strength: "una parte abre movimiento y la otra ayuda a sostenerlo",
    tension: "avanzar y conservar pueden sentirse como necesidades opuestas",
  },
  cardinal__mutable: {
    label: "Dirección y adaptación",
    strength: "un impulso inicial puede ajustarse con inteligencia en el camino",
    tension: "los cambios de plan pueden incomodar a quien necesita dirección",
  },
  fijo__mutable: {
    label: "Constancia y variación",
    strength: "el foco y la adaptabilidad pueden equilibrarse con buenos acuerdos",
    tension: "una parte puede leer rigidez donde la otra intenta cuidar continuidad",
  },
};

const keywordNouns = {
  Impulso: "decisión",
  Arraigo: "calma",
  Curiosidad: "pregunta",
  Cuidado: "ternura",
  Expresión: "presencia",
  Precisión: "detalle",
  Equilibrio: "acuerdo",
  Profundidad: "intensidad",
  Horizonte: "sentido",
  Estructura: "responsabilidad",
  Visión: "posibilidad",
  Intuición: "sensibilidad",
};

const forbiddenEditorialFragments = [
  "pueden sostener el encuentro",
  "expresa expresión",
  "puede ser recurso o fricción",
  "Como amistad, Aries y Tauro puede",
  "Como amistad, Géminis y Leo puede",
  "Como amistad, Escorpio y Piscis puede",
];

function orderedKey(a, b, order) {
  return order.indexOf(a) <= order.indexOf(b) ? `${a}__${b}` : `${b}__${a}`;
}

function normalizeSignPair(a, b) {
  if (!signSet.has(a) || !signSet.has(b)) throw new Error(`Signo inválido: ${a} / ${b}`);
  const [sign_a, sign_b] = position.get(a) <= position.get(b) ? [a, b] : [b, a];
  return {
    sign_a,
    sign_b,
    pair_key: `${sign_a}__${sign_b}`,
    canonical_path: `/compatibilidad/${sign_a}/${sign_b}`,
  };
}

function parsePairKey(pairKey) {
  const [a, b, rest] = pairKey.split("__");
  if (rest) throw new Error(`pair_key inválido: ${pairKey}`);
  return normalizeSignPair(a, b);
}

function signBySlug(slug) {
  const sign = zodiacSigns.find((s) => s.slug === slug);
  if (!sign) throw new Error(`Signo no encontrado: ${slug}`);
  return sign;
}

function allCanonicalPairs() {
  const pairs = [];
  for (let i = 0; i < zodiacOrder.length; i += 1) {
    for (let j = i; j < zodiacOrder.length; j += 1) {
      pairs.push(normalizeSignPair(zodiacOrder[i], zodiacOrder[j]).pair_key);
    }
  }
  return pairs;
}

function parseArgs(argv) {
  const args = {
    mode: "dry-run",
    provider: "rules",
    limit: null,
    pair: null,
    force: false,
    offline: false,
    help: false,
  };
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--dry-run") args.mode = "dry-run";
    else if (arg === "--persist") args.mode = "persist";
    else if (arg === "--validate-only") args.mode = "validate-only";
    else if (arg === "--force") args.force = true;
    else if (arg === "--offline") args.offline = true;
    else if (arg.startsWith("--provider=")) {
      args.provider = arg.slice("--provider=".length);
      if (!["rules", "deepseek"].includes(args.provider)) {
        throw new Error("--provider debe ser rules o deepseek");
      }
    } else if (arg.startsWith("--limit=")) args.limit = Number(arg.slice("--limit=".length));
    else if (arg.startsWith("--pair="))
      args.pair = parsePairKey(arg.slice("--pair=".length)).pair_key;
    else throw new Error(`Flag no soportado: ${arg}`);
  }
  if (args.limit !== null && (!Number.isInteger(args.limit) || args.limit < 1)) {
    throw new Error("--limit debe ser un entero positivo");
  }
  return args;
}

function printHelp() {
  console.log(`Uso:
  node scripts/generate-compatibilities.mjs --dry-run --limit=3
  node scripts/generate-compatibilities.mjs --dry-run --pair=aries__tauro
  node scripts/generate-compatibilities.mjs --dry-run --provider=deepseek --limit=3
  node scripts/generate-compatibilities.mjs --validate-only
  node scripts/generate-compatibilities.mjs --persist --limit=5

Flags:
  --dry-run        Genera y valida sin escribir.
  --persist        Inserta faltantes válidas. Requiere SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
  --validate-only  Valida pares y accesibilidad de perfiles existentes.
  --provider=rules Genera con reglas locales estructuradas. Es el modo por defecto.
  --provider=deepseek Redacta con IA usando DEEPSEEK_API_KEY y valida antes de escribir.
  --offline       No consulta Supabase; asume las 3 demos existentes.
  --limit=N        Limita cantidad de faltantes procesadas.
  --pair=A__B      Procesa una pareja concreta.
  --force          En --persist permite upsert.
`);
}

function rating(value) {
  return Math.max(1, Math.min(5, value));
}

function buildProfile(pairKey) {
  const normalized = parsePairKey(pairKey);
  const a = signBySlug(normalized.sign_a);
  const b = signBySlug(normalized.sign_b);
  const same = a.slug === b.slug;
  const element = elementAffinity[orderedKey(a.element, b.element, elementOrder)];
  const modality = modalityAffinity[orderedKey(a.modality, b.modality, modalityOrder)];
  if (!element || !modality) throw new Error(`Sin reglas para ${pairKey}`);

  const { label: elementLabel, strength: elementStrength, tension: elementTension } = element;
  const { label: modalityLabel, strength: modalityStrength, tension: modalityTension } = modality;
  const pairLabel = `${a.name} y ${b.name}`;
  const sharedRuler = a.rulingPlanet === b.rulingPlanet;
  const communicationRating = rating(
    a.element === "aire" || b.element === "aire" || sharedRuler ? 4 : 3,
  );
  const emotionalRating = rating(a.element === "agua" || b.element === "agua" ? 4 : same ? 4 : 3);
  const dailyRating = rating(a.element === "tierra" || b.element === "tierra" ? 4 : same ? 4 : 3);
  const attractionRating = rating(same ? 3 : a.element === b.element ? 4 : 3);
  const conflictRating = rating(a.modality === b.modality ? 2 : 3);
  const growthRating = rating(same ? 3 : 4);

  return {
    pair_key: normalized.pair_key,
    sign_a: normalized.sign_a,
    sign_b: normalized.sign_b,
    title: same
      ? `${a.name} y ${b.name}: espejo de ${a.keyword.toLowerCase()}`
      : `${pairLabel}: ${a.keyword.toLowerCase()} y ${b.keyword.toLowerCase()}`,
    summary: same
      ? `Un encuentro entre dos formas de ${a.keyword.toLowerCase()} que puede sentirse familiar, intenso y revelador. La afinidad es clara, pero también exige mirar hábitos repetidos.`
      : `Un vínculo entre ${a.name}, de ${a.element}, y ${b.name}, de ${b.element}. En esta combinación, ${elementStrength}; el aprendizaje está en reconocer cuándo ${elementTension}.`,
    dynamic_label: same
      ? `${a.keyword} amplificado`
      : sharedRuler
        ? `Regencia compartida de ${a.rulingPlanet}`
        : elementLabel,
    relationship_dynamic: same
      ? `${a.name} reconoce en el otro una sensibilidad parecida: el mismo elemento, la misma modalidad y una búsqueda común. La relación puede dar confianza porque hay códigos compartidos, pero también puede intensificar patrones que nadie cuestiona si ambos esperan que el otro actúe igual.`
      : `${a.name} se mueve desde ${keywordNouns[a.keyword]} y ${b.name} desde ${keywordNouns[b.keyword]}. El vínculo se vuelve más claro cuando traducen sus ritmos: ${modalityStrength}. La tensión aparece cuando ${modalityTension}, especialmente si cada parte defiende su modo como el único razonable.`,
    dimensions: {
      communication: {
        rating: communicationRating,
        interpretation: same
          ? "Comparten lenguaje simbólico y suelen entender rápido la intención del otro. Conviene no asumir que comprender equivale a estar de acuerdo."
          : `${a.name} aporta ${keywordNouns[a.keyword]} y ${b.name} aporta ${keywordNouns[b.keyword]} al diálogo. La conversación mejora cuando explican intención antes de reaccionar al tono.`,
      },
      emotional_rhythm: {
        rating: emotionalRating,
        interpretation: `${a.name} procesa desde su elemento ${a.element} y ${b.name} desde ${b.element}. La clave está en permitir que cada ritmo tenga espacio sin convertir la diferencia en distancia.`,
      },
      daily_life: {
        rating: dailyRating,
        interpretation: `En lo cotidiano, la relación necesita acuerdos simples: qué se decide rápido, qué se conversa y qué requiere constancia. ${modalityLabel} pide distribuir responsabilidades sin convertir cada diferencia de ritmo en una prueba de lealtad.`,
      },
      attraction: {
        rating: attractionRating,
        interpretation: same
          ? "La atracción nace de la familiaridad y del reconocimiento. Puede sentirse cómoda, aunque necesita novedad consciente."
          : `La atracción se alimenta del contraste entre ${keywordNouns[a.keyword]} y ${keywordNouns[b.keyword]}. No es destino: es curiosidad cuando ambos se sienten vistos.`,
      },
      conflict_management: {
        rating: conflictRating,
        interpretation: `El conflicto se ordena mejor cuando no discuten solo el hecho, sino el ritmo con que cada uno necesita abordarlo. ${elementTension} es el punto a vigilar.`,
      },
      growth: {
        rating: growthRating,
        interpretation: same
          ? "El crecimiento aparece cuando usan la afinidad como espejo, no como excusa para repetir lo conocido."
          : `Cada signo puede practicar algo que el otro trae de forma natural: ${a.name} aprende de ${keywordNouns[b.keyword]} y ${b.name} aprende de ${keywordNouns[a.keyword]}.`,
      },
    },
    strengths: [
      same ? `Códigos compartidos alrededor de ${a.keyword.toLowerCase()}.` : elementStrength,
      modalityStrength,
      sharedRuler
        ? `Una sensibilidad común vinculada a ${a.rulingPlanet}.`
        : `Contraste fértil entre ${a.rulingPlanet} y ${b.rulingPlanet}.`,
    ],
    challenges: [
      elementTension,
      modalityTension,
      same
        ? "Repetir el mismo patrón sin que nadie lo cuestione."
        : `Interpretar ${keywordNouns[a.keyword]} y ${keywordNouns[b.keyword]} como oposición en lugar de diferencia.`,
    ],
    communication_tips: [
      "Nombrar la intención antes de defender la postura.",
      "Separar la necesidad emocional de la decisión práctica.",
      same
        ? "Preguntar qué necesita cambiar aunque ambos crean entenderse."
        : `Traducir el ritmo de ${a.name} al lenguaje de ${b.name}, y al revés.`,
    ],
    contexts: {
      romantic: same
        ? "Puede sentirse muy reconocible. La relación gana profundidad cuando no confunde afinidad con ausencia de trabajo emocional."
        : "Puede haber atracción por contraste. Funciona mejor cuando el deseo no exige que una parte abandone su naturaleza.",
      friendship: `La amistad entre ${a.name} y ${b.name} encuentra mejor tono cuando hay honestidad, humor y acuerdos claros sobre presencia y libertad.`,
      collaboration: `En colaboración, conviene asignar roles según fortalezas: ${a.keyword.toLowerCase()} para una parte del proceso y ${b.keyword.toLowerCase()} para otra.`,
    },
    reflection_questions: [
      same
        ? "¿Qué patrón compartido estamos reforzando sin darnos cuenta?"
        : `¿Qué puedo aprender del modo en que ${b.name} sostiene su ${keywordNouns[b.keyword]}?`,
      "¿Qué acuerdo simple haría más clara nuestra forma de comunicarnos?",
    ],
    misconceptions: [
      "La compatibilidad simbólica no determina el futuro de una relación.",
      "Compartir elemento o modalidad no elimina la necesidad de acuerdos concretos.",
    ],
    disclaimer_key: "compatibility_generic",
    status: "published",
    is_demo: false,
    seo_title: `${pairLabel}: compatibilidad simbólica`,
    seo_description: `Explora la dinámica entre ${a.name} y ${b.name}: comunicación, ritmo emocional, fortalezas y desafíos desde una mirada editorial.`,
    published_at: new Date().toISOString(),
  };
}

function cleanJson(raw) {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.replace(/^```json\s*/, "");
  else if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```\s*/, "");
  return cleaned.replace(/\s*```$/, "").trim();
}

function buildAiPrompt(baseProfile) {
  const a = signBySlug(baseProfile.sign_a);
  const b = signBySlug(baseProfile.sign_b);
  return `Redacta una ficha editorial de compatibilidad zodiacal para Creovision.

Usa este contexto estructurado como base simbólica. No inventes predicciones absolutas, destino, promesas de amor ni afirmaciones deterministas:
${JSON.stringify(
  {
    sign_a: { name: a.name, element: a.element, modality: a.modality, ruler: a.rulingPlanet },
    sign_b: { name: b.name, element: b.element, modality: b.modality, ruler: b.rulingPlanet },
    pair_key: baseProfile.pair_key,
    symbolic_axis: baseProfile.dynamic_label,
    base_ratings: Object.fromEntries(
      dimensions.map((key) => [key, baseProfile.dimensions[key].rating]),
    ),
    useful_angles: {
      strength: baseProfile.strengths,
      challenge: baseProfile.challenges,
      questions: baseProfile.reflection_questions,
    },
  },
  null,
  2,
)}

No copies frases literales de ese contexto. Úsalo solo para sostener la interpretación.
Evita estas frases exactas:
${[
  baseProfile.summary,
  baseProfile.relationship_dynamic,
  ...dimensions.map((key) => baseProfile.dimensions[key].interpretation),
  ...baseProfile.strengths,
  ...baseProfile.challenges,
  ...baseProfile.communication_tips,
].join("\n- ")}

Devuelve SOLO JSON válido con esta forma exacta:
{
  "title": "string",
  "summary": "string de 130 a 230 caracteres",
  "dynamic_label": "string breve",
  "relationship_dynamic": "string de 240 a 420 caracteres",
  "dimensions": {
    "communication": {"rating": 1, "interpretation": "string de 90 a 170 caracteres"},
    "emotional_rhythm": {"rating": 1, "interpretation": "string de 90 a 170 caracteres"},
    "daily_life": {"rating": 1, "interpretation": "string de 90 a 170 caracteres"},
    "attraction": {"rating": 1, "interpretation": "string de 90 a 170 caracteres"},
    "conflict_management": {"rating": 1, "interpretation": "string de 90 a 170 caracteres"},
    "growth": {"rating": 1, "interpretation": "string de 90 a 170 caracteres"}
  },
  "strengths": ["3 frases concretas"],
  "challenges": ["3 frases concretas"],
  "communication_tips": ["3 consejos accionables"],
  "contexts": {
    "romantic": "string de 100 a 180 caracteres",
    "friendship": "string de 100 a 180 caracteres",
    "collaboration": "string de 100 a 180 caracteres"
  },
  "reflection_questions": ["2 preguntas útiles y no genéricas"],
  "misconceptions": ["2 aclaraciones no deterministas"],
  "seo_title": "string con ambos signos",
  "seo_description": "string de 120 a 155 caracteres"
}

Estilo: español natural, premium, útil, cero relleno. Cada pareja debe sentirse única.`;
}

function normalizeAiProfile(baseProfile, ai) {
  const merged = {
    ...baseProfile,
    title: String(ai.title || baseProfile.title).trim(),
    summary: String(ai.summary || baseProfile.summary).trim(),
    dynamic_label: String(ai.dynamic_label || baseProfile.dynamic_label).trim(),
    relationship_dynamic: String(
      ai.relationship_dynamic || baseProfile.relationship_dynamic,
    ).trim(),
    dimensions: baseProfile.dimensions,
    strengths: Array.isArray(ai.strengths) ? ai.strengths.map(String) : baseProfile.strengths,
    challenges: Array.isArray(ai.challenges) ? ai.challenges.map(String) : baseProfile.challenges,
    communication_tips: Array.isArray(ai.communication_tips)
      ? ai.communication_tips.map(String)
      : baseProfile.communication_tips,
    contexts: typeof ai.contexts === "object" && ai.contexts ? ai.contexts : baseProfile.contexts,
    reflection_questions: Array.isArray(ai.reflection_questions)
      ? ai.reflection_questions.map(String)
      : baseProfile.reflection_questions,
    misconceptions: Array.isArray(ai.misconceptions)
      ? ai.misconceptions.map(String)
      : baseProfile.misconceptions,
    seo_title: String(ai.seo_title || baseProfile.seo_title).trim(),
    seo_description: String(ai.seo_description || baseProfile.seo_description).trim(),
  };

  if (typeof ai.dimensions === "object" && ai.dimensions) {
    merged.dimensions = Object.fromEntries(
      dimensions.map((key) => {
        const aiDim = ai.dimensions[key] ?? {};
        const baseDim = baseProfile.dimensions[key];
        return [
          key,
          {
            rating: rating(Number(aiDim.rating || baseDim.rating)),
            interpretation: String(aiDim.interpretation || baseDim.interpretation).trim(),
          },
        ];
      }),
    );
  }

  merged.contexts = {
    romantic: String(merged.contexts.romantic || baseProfile.contexts.romantic).trim(),
    friendship: String(merged.contexts.friendship || baseProfile.contexts.friendship).trim(),
    collaboration: String(
      merged.contexts.collaboration || baseProfile.contexts.collaboration,
    ).trim(),
  };

  return merged;
}

async function callDeepSeek(baseProfile, attempt) {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY no configurada para --provider=deepseek");
  const baseUrl = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/+$/, "");
  const model =
    process.env.DEEPSEEK_MODEL_COMPATIBILITY || process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            attempt === 1
              ? "Eres editor astrológico senior. Respondes únicamente JSON válido, sin markdown."
              : "Responde SOLO un objeto JSON válido y completo. No uses markdown, comentarios, comillas curvas ni texto fuera del JSON.",
        },
        { role: "user", content: buildAiPrompt(baseProfile) },
      ],
      temperature: attempt === 1 ? 0.72 : 0.45,
      top_p: 0.92,
      frequency_penalty: 0.35,
      presence_penalty: 0.2,
      max_tokens: 3200,
      response_format: { type: "json_object" },
      stream: false,
    }),
  });

  if (!response.ok) {
    let message = `DeepSeek API error: ${response.status} ${response.statusText}`;
    try {
      const error = await response.json();
      message = error?.error?.message || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const data = await response.json();
  const choice = data?.choices?.[0];
  if (choice?.finish_reason === "length") {
    throw new Error(`DeepSeek truncó la respuesta para ${baseProfile.pair_key}`);
  }
  const content = choice?.message?.content;
  if (typeof content !== "string") throw new Error("DeepSeek no devolvió contenido usable");
  return content;
}

async function generateWithDeepSeek(baseProfile) {
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const content = await callDeepSeek(baseProfile, attempt);
      return normalizeAiProfile(baseProfile, JSON.parse(cleanJson(content)));
    } catch (error) {
      lastError = error;
      console.error(
        `[compat] Reintento ${attempt}/3 fallido para ${baseProfile.pair_key}: ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  }
  throw lastError;
}

async function buildProfiles(pairKeys, provider) {
  const baseProfiles = pairKeys.map(buildProfile);
  if (provider === "rules") return baseProfiles;
  const rows = [];
  for (const baseProfile of baseProfiles) {
    console.error(`[compat] Redactando ${baseProfile.pair_key} con DeepSeek`);
    const generated = await generateWithDeepSeek(baseProfile);
    if (similarity(baseProfile.summary, generated.summary) >= 0.72) {
      throw new Error(
        `DeepSeek devolvió un summary demasiado parecido al contexto base para ${baseProfile.pair_key}`,
      );
    }
    rows.push(generated);
  }
  return rows;
}

function validateGenerated(row) {
  const errors = [];
  const serialized = JSON.stringify(row);
  const normalized = parsePairKey(row.pair_key);
  if (row.sign_a !== normalized.sign_a || row.sign_b !== normalized.sign_b)
    errors.push("pair_mismatch");
  if (!row.title.includes(signBySlug(row.sign_a).name)) errors.push("title_missing_sign_a");
  if (!row.title.includes(signBySlug(row.sign_b).name)) errors.push("title_missing_sign_b");
  if (row.summary.length < 120) errors.push("summary_too_short");
  if (row.relationship_dynamic.length < 220) errors.push("dynamic_too_short");
  for (const key of dimensions) {
    const dim = row.dimensions[key];
    if (!dim) errors.push(`missing_dimension:${key}`);
    else if (dim.interpretation.length < 80) errors.push(`dimension_too_short:${key}`);
  }
  if (row.strengths.length < 3) errors.push("strengths_below_minimum");
  if (row.challenges.length < 3) errors.push("challenges_below_minimum");
  if (row.communication_tips.length < 3) errors.push("tips_below_minimum");
  if (row.reflection_questions.length < 2) errors.push("reflection_below_minimum");
  for (const fragment of forbiddenEditorialFragments) {
    if (serialized.includes(fragment)) errors.push(`forbidden_fragment:${fragment}`);
  }
  return errors;
}

function similarity(a, b) {
  const tokenize = (value) =>
    new Set(
      value
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
        .split(/\s+/)
        .filter((token) => token.length > 4),
    );
  const left = tokenize(a);
  const right = tokenize(b);
  const intersection = [...left].filter((token) => right.has(token)).length;
  const union = new Set([...left, ...right]).size || 1;
  return intersection / union;
}

async function fetchExistingPairKeys(offline) {
  if (offline) return { source: "local-demo-assumption", keys: existingDemoPairs };
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { source: "local-demo-assumption", keys: existingDemoPairs };
  const client = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await client.from("compatibility_profiles").select("pair_key");
  if (error) throw error;
  return { source: "supabase", keys: new Set((data ?? []).map((row) => row.pair_key)) };
}

async function persistRows(rows, force) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error("Persistencia requiere SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY");
  const client = createClient(url, key, { auth: { persistSession: false } });
  const query = force
    ? client.from("compatibility_profiles").upsert(rows, { onConflict: "pair_key" })
    : client.from("compatibility_profiles").insert(rows);
  const { error } = await query;
  if (error) throw error;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return printHelp();
  if (args.mode === "persist" && args.offline) {
    throw new Error("--persist no puede usarse con --offline");
  }

  const allPairs = allCanonicalPairs();
  if (new Set(allPairs).size !== 78) throw new Error("La generación canónica no produjo 78 pares");
  const existing = await fetchExistingPairKeys(args.offline);
  let selected = allPairs.filter((key) => !existing.keys.has(key));
  if (args.pair) selected = [args.pair].filter((key) => args.force || !existing.keys.has(key));
  if (args.limit !== null) selected = selected.slice(0, args.limit);

  const generated = await buildProfiles(selected, args.provider);
  const validation = generated.map((row) => ({
    pair_key: row.pair_key,
    errors: validateGenerated(row),
  }));
  const failed = validation.filter((row) => row.errors.length > 0);
  const similarities = generated.flatMap((row, index) =>
    generated.slice(index + 1).map((other) => ({
      pair_key: `${row.pair_key} <> ${other.pair_key}`,
      similarity: Number(similarity(row.summary, other.summary).toFixed(3)),
    })),
  );
  const suspicious = similarities.filter((row) => row.similarity >= 0.72);

  console.log(
    JSON.stringify(
      {
        mode: args.mode,
        provider: args.provider,
        existingSource: existing.source,
        totalPairs: allPairs.length,
        existingPairs: existing.keys.size,
        selectedMissing: selected.length,
        generated: generated.length,
        validationFailures: failed.length,
        suspiciousSimilarity: suspicious.length,
      },
      null,
      2,
    ),
  );
  console.table(
    generated.map((row) => ({
      pair_key: row.pair_key,
      title: row.title,
      validation: validation.find((v) => v.pair_key === row.pair_key)?.errors.length
        ? "FAIL"
        : "PASS",
      origin: existing.keys.has(row.pair_key) ? "existing" : "generated",
      is_demo: row.is_demo,
    })),
  );

  if (failed.length > 0) {
    console.table(failed);
    process.exitCode = 1;
    return;
  }
  if (suspicious.length > 0) {
    console.table(suspicious);
    process.exitCode = 1;
    return;
  }
  if (args.mode === "persist") {
    await persistRows(generated, args.force);
    console.log(`Persisted ${generated.length} compatibility profile(s).`);
  } else if (args.mode === "dry-run") {
    console.log(JSON.stringify(generated, null, 2));
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
