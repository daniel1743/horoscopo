#!/usr/bin/env bun
/**
 * Runner portable del test de precisión del motor lunar.
 *   bun run scripts/check-moon-accuracy.ts
 * Sale con código != 0 si alguna comprobación falla.
 */
import { runMoonAccuracyChecks } from "../src/server/moon/moon-engine.test";

const results = runMoonAccuracyChecks();
let failed = 0;
for (const r of results) {
  const mark = r.passed ? "✅" : "❌";
  // eslint-disable-next-line no-console
  console.log(`${mark} ${r.name} — ${r.detail}`);
  if (!r.passed) failed += 1;
}
if (failed > 0) {
  // eslint-disable-next-line no-console
  console.error(`\n${failed} comprobación(es) del motor lunar han fallado.`);
  process.exit(1);
}
// eslint-disable-next-line no-console
console.log(`\nTodas las ${results.length} comprobaciones del motor lunar pasan.`);
