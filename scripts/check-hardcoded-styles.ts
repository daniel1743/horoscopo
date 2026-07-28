#!/usr/bin/env bun
/**
 * Validador ligero: detecta hexadecimales, sombras o radios arbitrarios
 * en `src/` fuera de los archivos autorizados (design system + config).
 * Modo report_only: imprime, no falla el build.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = join(process.cwd(), "src");
const ALLOW = [
  "src/styles.css",
  "src/design-system/tokens.ts",
  "src/design-system/component-variants.ts",
  "src/design-system/typography.ts",
  "src/components/ui/", // shadcn primitives
];
const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const ARBITRARY_SHADOW = /shadow-\[[^\]]+\]/g;
const ARBITRARY_ROUNDED = /rounded-\[[^\]]+\]/g;

const findings: string[] = [];

function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) {
      walk(p);
      continue;
    }
    const ext = extname(p);
    if (![".ts", ".tsx", ".css"].includes(ext)) continue;
    const rel = relative(process.cwd(), p).replace(/\\/g, "/");
    if (ALLOW.some((a) => rel.startsWith(a))) continue;
    const text = readFileSync(p, "utf8");
    const hex = text.match(HEX);
    if (hex) findings.push(`${rel}: hex ${[...new Set(hex)].join(", ")}`);
    const sh = text.match(ARBITRARY_SHADOW);
    if (sh)
      findings.push(
        `${rel}: shadow arbitrario ${[...new Set(sh)].filter((s) => !s.includes("var(")).join(", ")}`,
      );
    const rd = text.match(ARBITRARY_ROUNDED);
    if (rd)
      findings.push(
        `${rel}: radius arbitrario ${[...new Set(rd)].filter((s) => !s.includes("var(")).join(", ")}`,
      );
  }
}

walk(ROOT);
if (findings.length === 0) console.log("✓ Sin estilos hard-coded fuera de tokens.");
else {
  console.log(`Reporte hardcoded-styles (${findings.length}):`);
  for (const f of findings) console.log(" -", f);
}
