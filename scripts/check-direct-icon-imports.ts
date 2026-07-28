#!/usr/bin/env bun
/** Detecta imports directos de lucide-react fuera del registro central. */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = join(process.cwd(), "src");
const ALLOW = ["src/config/icons.ts", "src/components/ui/icon.tsx"];
const RE = /from\s+["']lucide-react["']/;
const findings: string[] = [];

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
    if (ALLOW.includes(rel)) continue;
    // Ignora primitivas shadcn (usan lucide legítimamente)
    if (rel.startsWith("src/components/ui/")) continue;
    if (RE.test(readFileSync(p, "utf8"))) findings.push(rel);
  }
}
walk(ROOT);
if (!findings.length) console.log("✓ Sin imports directos de lucide-react.");
else {
  console.log(`Reporte direct-icon-imports (${findings.length}):`);
  for (const f of findings) console.log(" -", f);
}
