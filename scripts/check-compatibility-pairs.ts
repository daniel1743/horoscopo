#!/usr/bin/env bun
/**
 * Verifica que normalizeSignPair produzca exactamente 78 pair_keys únicos
 * a partir de las 144 selecciones ordenadas de los doce signos zodiacales.
 * Ejecutar con: `bun scripts/check-compatibility-pairs.ts`.
 */
import {
  InvalidZodiacSignError,
  ZODIAC_ORDER,
  createPairKey,
  isCanonicalPair,
  normalizeSignPair,
  parsePairKey,
} from "../src/lib/compatibility/normalize-sign-pair";

let failures = 0;
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`✗ ${message}`);
    failures++;
  } else {
    console.log(`✓ ${message}`);
  }
}

// 1. Reglas básicas
assert(
  normalizeSignPair("tauro", "aries").pair_key === "aries__tauro",
  "tauro+aries → aries__tauro",
);
assert(
  normalizeSignPair("aries", "tauro").pair_key === "aries__tauro",
  "aries+tauro → aries__tauro",
);
assert(normalizeSignPair("libra", "libra").pair_key === "libra__libra", "libra+libra permitido");
assert(
  normalizeSignPair("piscis", "aries").pair_key === "aries__piscis",
  "piscis+aries → aries__piscis",
);

// 2. Signo inválido
try {
  normalizeSignPair("invalid", "aries");
  assert(false, "signo inválido lanza InvalidZodiacSignError");
} catch (err) {
  assert(err instanceof InvalidZodiacSignError, "signo inválido lanza InvalidZodiacSignError");
}

// 3. Exactamente 78 pares a partir de 144 combinaciones ordenadas
const unique = new Set<string>();
let total = 0;
for (const a of ZODIAC_ORDER) {
  for (const b of ZODIAC_ORDER) {
    total++;
    unique.add(normalizeSignPair(a, b).pair_key);
    // Invertido produce el mismo
    if (normalizeSignPair(a, b).pair_key !== normalizeSignPair(b, a).pair_key) {
      failures++;
      console.error(`✗ inversión distinta para ${a}/${b}`);
    }
  }
}
assert(total === 144, `144 combinaciones evaluadas (obtenidas: ${total})`);
assert(unique.size === 78, `78 pair keys únicos (obtenidos: ${unique.size})`);

// 4. Doce parejas del mismo signo
const same = ZODIAC_ORDER.map((s) => normalizeSignPair(s, s).pair_key);
assert(new Set(same).size === 12, "12 parejas del mismo signo únicas");

// 5. Todos los pair_key son parseables
for (const key of unique) {
  const parsed = parsePairKey(key);
  if (parsed.pair_key !== key) {
    failures++;
    console.error(`✗ parsePairKey inconsistente para ${key}`);
  }
}
assert(true, "parsePairKey redondea todos los 78 pares");

// 6. helpers
assert(createPairKey("aries", "tauro") === "aries__tauro", "createPairKey formato correcto");
assert(isCanonicalPair("aries", "tauro"), "isCanonicalPair: aries antes de tauro");
assert(!isCanonicalPair("tauro", "aries"), "isCanonicalPair: rechaza orden inverso");

if (failures > 0) {
  console.error(`\n${failures} check(s) fallaron.`);
  process.exit(1);
}
console.log(
  "\nTodas las verificaciones pasaron: 78 pair keys, 144 selecciones, mismo signo válido.",
);
