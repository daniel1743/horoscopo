#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
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
  fuego__fuego: [
    "Impulso compartido",
    "energía, entusiasmo y capacidad para iniciar movimiento",
    "competencia por marcar el ritmo",
  ],
  tierra__tierra: [
    "Estabilidad compartida",
    "constancia, paciencia y atención a lo concreto",
    "rigidez cuando ninguno quiere moverse primero",
  ],
  aire__aire: [
    "Mente compartida",
    "conversación, ideas y ligereza para explorar",
    "exceso de análisis o distancia emocional",
  ],
  agua__agua: [
    "Sensibilidad compartida",
    "empatía, intuición y lectura fina del clima emocional",
    "sobrecarga emocional o silencios protectores",
  ],
  fuego__aire: [
    "Movimiento e ideas",
    "inspiración, curiosidad y velocidad para probar caminos",
    "dispersión o decisiones tomadas demasiado rápido",
  ],
  tierra__agua: [
    "Cuidado y sostén",
    "capacidad para construir seguridad emocional y cotidiana",
    "confundir cautela con distancia o necesidad con exigencia",
  ],
  fuego__agua: [
    "Intensidad sensible",
    "pasión, protección y una forma profunda de implicarse",
    "choques entre reacción inmediata y procesamiento emocional",
  ],
  fuego__tierra: [
    "Acción y realidad",
    "convertir impulso en hechos si negocian velocidad",
    "fricción entre urgencia y prudencia",
  ],
  aire__agua: [
    "Palabra y emoción",
    "poner lenguaje a lo sensible y abrir nuevas perspectivas",
    "sentir que una parte racionaliza lo que la otra necesita sentir",
  ],
  tierra__aire: [
    "Idea y método",
    "unir visión, criterio y aplicación práctica",
    "impaciencia ante la teoría o resistencia ante el cambio",
  ],
};

const modalityAffinity = {
  cardinal__cardinal: [
    "Dos inicios",
    "iniciativa, dirección y capacidad para abrir etapas",
    "lucha silenciosa por liderar",
  ],
  fijo__fijo: [
    "Dos centros firmes",
    "lealtad, perseverancia y claridad de valores",
    "terquedad o dificultad para ceder",
  ],
  mutable__mutable: [
    "Dos ritmos adaptables",
    "flexibilidad, aprendizaje y apertura al cambio",
    "falta de cierre o continuidad",
  ],
  cardinal__fijo: [
    "Inicio y permanencia",
    "una parte abre camino y la otra sostiene",
    "presión para avanzar frente a necesidad de estabilidad",
  ],
  cardinal__mutable: [
    "Dirección y adaptación",
    "empezar procesos y ajustarlos con inteligencia",
    "cambios de plan que irritan a quien necesita dirección",
  ],
  fijo__mutable: [
    "Constancia y variación",
    "unir foco con capacidad de leer el contexto",
    "sentir rigidez de un lado y dispersión del otro",
  ],
};

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
  const args = { mode: "dry-run", limit: null, pair: null, force: false, help: false };
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--dry-run") args.mode = "dry-run";
    else if (arg === "--persist") args.mode = "persist";
    else if (arg === "--validate-only") args.mode = "validate-only";
    else if (arg === "--force") args.force = true;
    else if (arg.startsWith("--limit=")) args.limit = Number(arg.slice("--limit=".length));
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
  node scripts/generate-compatibilities.mjs --validate-only
  node scripts/generate-compatibilities.mjs --persist --limit=5

Flags:
  --dry-run        Genera y valida sin escribir.
  --persist        Inserta faltantes válidas. Requiere SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
  --validate-only  Valida pares y accesibilidad de perfiles existentes.
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

  const [elementLabel, elementStrength, elementTension] = element;
  const [modalityLabel, modalityStrength, modalityTension] = modality;
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
      : `Un vínculo entre ${a.name}, de ${a.element}, y ${b.name}, de ${b.element}. ${elementStrength} pueden sostener el encuentro si ambos reconocen la tensión de ${elementTension}.`,
    dynamic_label: same
      ? `${a.keyword} amplificado`
      : sharedRuler
        ? `Regencia compartida de ${a.rulingPlanet}`
        : elementLabel,
    relationship_dynamic: same
      ? `${a.name} reconoce en el otro una sensibilidad parecida: el mismo elemento, la misma modalidad y una búsqueda común. La relación puede dar confianza porque hay códigos compartidos, pero también puede intensificar patrones que nadie cuestiona si ambos esperan que el otro actúe igual.`
      : `${a.name} se mueve desde ${a.keyword.toLowerCase()} y ${b.name} desde ${b.keyword.toLowerCase()}. El vínculo se vuelve más claro cuando traducen sus ritmos: ${modalityStrength}. La tensión aparece cuando ${modalityTension}, especialmente si cada parte defiende su modo como el único razonable.`,
    dimensions: {
      communication: {
        rating: communicationRating,
        interpretation: same
          ? "Comparten lenguaje simbólico y suelen entender rápido la intención del otro. Conviene no asumir que comprender equivale a estar de acuerdo."
          : `${a.name} aporta ${a.keyword.toLowerCase()} y ${b.name} aporta ${b.keyword.toLowerCase()} al diálogo. La conversación mejora cuando explican intención antes de reaccionar al tono.`,
      },
      emotional_rhythm: {
        rating: emotionalRating,
        interpretation: `${a.name} procesa desde su elemento ${a.element} y ${b.name} desde ${b.element}. La clave está en permitir que cada ritmo tenga espacio sin convertir la diferencia en distancia.`,
      },
      daily_life: {
        rating: dailyRating,
        interpretation: `En lo cotidiano, la relación necesita acuerdos simples: qué se decide rápido, qué se conversa y qué requiere constancia. ${modalityLabel} puede ser recurso o fricción según cómo distribuyan responsabilidades.`,
      },
      attraction: {
        rating: attractionRating,
        interpretation: same
          ? "La atracción nace de la familiaridad y del reconocimiento. Puede sentirse cómoda, aunque necesita novedad consciente."
          : `La atracción se alimenta del contraste entre ${a.keyword.toLowerCase()} y ${b.keyword.toLowerCase()}. No es destino: es curiosidad cuando ambos se sienten vistos.`,
      },
      conflict_management: {
        rating: conflictRating,
        interpretation: `El conflicto se ordena mejor cuando no discuten solo el hecho, sino el ritmo con que cada uno necesita abordarlo. ${elementTension} es el punto a vigilar.`,
      },
      growth: {
        rating: growthRating,
        interpretation: same
          ? "El crecimiento aparece cuando usan la afinidad como espejo, no como excusa para repetir lo conocido."
          : `Cada signo puede practicar algo que el otro trae de forma natural: ${a.name} aprende de ${b.keyword.toLowerCase()} y ${b.name} aprende de ${a.keyword.toLowerCase()}.`,
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
        : `Interpretar ${a.keyword.toLowerCase()} y ${b.keyword.toLowerCase()} como oposición en lugar de diferencia.`,
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
      friendship: `Como amistad, ${pairLabel} puede sostenerse con honestidad, humor y acuerdos claros sobre presencia y libertad.`,
      collaboration: `En colaboración, conviene asignar roles según fortalezas: ${a.keyword.toLowerCase()} para una parte del proceso y ${b.keyword.toLowerCase()} para otra.`,
    },
    reflection_questions: [
      same
        ? "¿Qué patrón compartido estamos reforzando sin darnos cuenta?"
        : `¿Qué puedo aprender del modo en que ${b.name} expresa ${b.keyword.toLowerCase()}?`,
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

function validateGenerated(row) {
  const errors = [];
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

async function fetchExistingPairKeys() {
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

  const allPairs = allCanonicalPairs();
  if (new Set(allPairs).size !== 78) throw new Error("La generación canónica no produjo 78 pares");
  const existing = await fetchExistingPairKeys();
  let selected = allPairs.filter((key) => !existing.keys.has(key));
  if (args.pair) selected = [args.pair].filter((key) => args.force || !existing.keys.has(key));
  if (args.limit !== null) selected = selected.slice(0, args.limit);

  const generated = selected.map(buildProfile);
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
