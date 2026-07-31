const { runAspectEngineChecks } = require("./src/server/aspects/aspect-engine.test");
const { runPlanetaryEngineChecks } = require("./src/server/planetary/planetary-engine.test");

console.log("=== ASPECT ENGINE TESTS ===\n");
const aspectReports = runAspectEngineChecks();
let aspectPassed = 0;
let aspectFailed = 0;
for (const report of aspectReports) {
  const mark = report.passed ? "OK" : "FAIL";
  console.log(`${mark} ${report.name}: ${report.detail}`);
  if (report.passed) aspectPassed++;
  else aspectFailed++;
}
console.log(`\nAspectEngine: ${aspectPassed} passed, ${aspectFailed} failed\n`);

console.log("=== PLANETARY ENGINE TESTS ===\n");
const planetaryReports = runPlanetaryEngineChecks();
let planetaryPassed = 0;
let planetaryFailed = 0;
for (const report of planetaryReports) {
  const mark = report.passed ? "OK" : "FAIL";
  console.log(`${mark} ${report.name}: ${report.detail}`);
  if (report.passed) planetaryPassed++;
  else planetaryFailed++;
}
console.log(`\nPlanetaryEngine: ${planetaryPassed} passed, ${planetaryFailed} failed\n`);

const totalPassed = aspectPassed + planetaryPassed;
const totalFailed = aspectFailed + planetaryFailed;
console.log(`TOTAL: ${totalPassed}/${totalPassed + totalFailed} passed`);
process.exit(totalFailed > 0 ? 1 : 0);
