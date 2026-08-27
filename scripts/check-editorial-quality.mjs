#!/usr/bin/env node
import { readFile } from "node:fs/promises";

const editorialPath = new URL("../src/config/horoscope-editorial.ts", import.meta.url);
const fallbackPath = new URL("../src/lib/horoscope/fallbacks.ts", import.meta.url);
const moonConfigPath = new URL("../src/config/moon.ts", import.meta.url);
const moonCardPath = new URL("../src/components/moon/MoonTodayCard.tsx", import.meta.url);
const tarotTypesPath = new URL("../src/types/tarot.ts", import.meta.url);
const editorial = await readFile(editorialPath, "utf8");
const fallbacks = await readFile(fallbackPath, "utf8");
const moonConfig = await readFile(moonConfigPath, "utf8");
const moonCard = await readFile(moonCardPath, "utf8");
const tarotTypes = await readFile(tarotTypesPath, "utf8");

const signs = [
  "aries",
  "tauro",
  "geminis",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "escorpio",
  "sagitario",
  "capricornio",
  "acuario",
  "piscis",
];
const fields = ["centralIdea", "context", "whyItMatters", "observe", "question"];
const failures = [];

for (const sign of signs) {
  const blockMatch = editorial.match(new RegExp(`\\n  ${sign}: \\{([\\s\\S]*?)\\n  \\},`));
  if (!blockMatch) {
    failures.push(`${sign}: falta la lente editorial`);
    continue;
  }
  const block = blockMatch[1];
  for (const field of fields) {
    if (!new RegExp(`\\n    ${field}:`).test(`\n${block}`)) {
      failures.push(`${sign}: falta ${field}`);
    }
  }
}

for (const period of ["daily", "weekly", "monthly"]) {
  if (!new RegExp(`${period}: \\{`).test(editorial)) {
    failures.push(`falta configuración del periodo ${period}`);
  }
}

for (const phrase of ["hoy tu carta", "estás dispuesto a", "la carta dice", "tal, tal, tal"]) {
  if (editorial.toLocaleLowerCase("es").includes(phrase)) {
    failures.push(`frase redundante o ambigua detectada: ${phrase}`);
  }
}

if (
  !fallbacks.includes("context:") ||
  !fallbacks.includes("whyItMatters:") ||
  !fallbacks.includes("reflectionQuestion:")
) {
  failures.push("los fallbacks no exponen todos los bloques editoriales esperados");
}

for (const phase of [
  "new_moon",
  "waxing_crescent",
  "first_quarter",
  "waxing_gibbous",
  "full_moon",
  "waning_gibbous",
  "last_quarter",
  "waning_crescent",
]) {
  if (!moonConfig.includes(`  "${phase}"`) && !moonConfig.includes(`  ${phase},`)) {
    failures.push(`falta la fase lunar ${phase} en el registro`);
  }
  if (!moonCard.includes(`  ${phase}: {`)) {
    failures.push(`falta cobertura reflexiva para la fase lunar ${phase}`);
  }
}

if (!tarotTypes.includes("reflectionQuestion: string | null")) {
  failures.push("el modelo de Tarot no expone una pregunta reflexiva");
}

if (failures.length > 0) {
  console.error("Auditoría editorial fallida:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Auditoría editorial OK: ${signs.length} signos, ${fields.length} lentes y 3 periodos revisados.`,
);
