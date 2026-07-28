#!/usr/bin/env bun
/** Detecta más de un componente Footer global o navegaciones paralelas. */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = join(process.cwd(), "src");
const RE_FOOTER = /export\s+(?:default\s+)?function\s+Footer\b|export\s+\{\s*Footer\b/;
const footers: string[] = [];

function walk(dir: string) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    const s = statSync(p);
    if (s.isDirectory()) {
      walk(p);
      continue;
    }
    if (![".ts", ".tsx"].includes(extname(p))) continue;
    const rel = relative(process.cwd(), p).replace(/\\/g, "/");
    const text = readFileSync(p, "utf8");
    if (RE_FOOTER.test(text)) footers.push(rel);
  }
}
walk(ROOT);
if (footers.length <= 1) console.log(`✓ Footer único (${footers[0] ?? "n/a"}).`);
else {
  console.log(`Reporte duplicate-layout: ${footers.length} footers detectados`);
  for (const f of footers) console.log(" -", f);
}
