#!/usr/bin/env bun
/** Detecta rutas internas hard-coded fuera de src/config/routes.ts y de las rutas de fichero. */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = join(process.cwd(), "src");
const ALLOW = ["src/config/routes.ts", "src/config/navigation.ts", "src/config/footer.ts"];
const KNOWN = [
  "/horoscopo",
  "/tarot",
  "/astrologia",
  "/compatibilidad",
  "/luna",
  "/guias",
  "/buscar",
  "/nosotros",
  "/metodo",
  "/ayuda",
  "/contacto",
  "/privacidad",
  "/terminos",
  "/cookies",
  "/aviso-de-responsabilidad",
  "/mi-espacio",
];
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
    if (rel.startsWith("src/routes/")) continue; // definiciones de ruta legítimas
    if (rel.endsWith("routeTree.gen.ts")) continue;
    const text = readFileSync(p, "utf8");
    for (const route of KNOWN) {
      const re = new RegExp(`["']${route}(/[^"']*)?["']`, "g");
      if (re.test(text)) findings.push(`${rel} → ${route}`);
    }
  }
}
walk(ROOT);
if (!findings.length) console.log("✓ Sin rutas internas hard-coded.");
else {
  console.log(`Reporte direct-routes (${findings.length}):`);
  for (const f of findings) console.log(" -", f);
}
