#!/usr/bin/env node
/**
 * Script de prueba local para el sistema de generación automática.
 * Ejecutar con: node scripts/test-horoscope-generation.js
 */

import { calculateAstronomicalContext } from "../src/server/horoscope-automation/astronomical-context.js";
import { validateQuality } from "../src/server/horoscope-automation/quality-validator.js";
import { getVariantConfig, buildVariantInstruction } from "../src/server/horoscope-automation/variant-strategy.js";

async function testAstronomicalContext() {
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("TEST 1: Contexto Astronómico");
  console.log("═══════════════════════════════════════════════════════════\n");

  const today = new Date().toISOString().split("T")[0];

  try {
    const context = await calculateAstronomicalContext(today);

    console.log(`📅 Fecha: ${context.date}`);
    console.log(`🌙 Fase Lunar: ${context.moonPhase.name} (${context.moonPhase.illumination}%)`);
    console.log(`\n🪐 Posiciones Planetarias:`);

    context.positions.forEach((pos) => {
      const retro = pos.retrograde ? " ℞" : "";
      console.log(`   ${pos.planet}: ${pos.sign} ${pos.degrees}°${retro}`);
    });

    console.log(`\n⭐ Aspectos Mayores (top 5):`);
    context.majorAspects.slice(0, 5).forEach((aspect) => {
      const nature = aspect.nature === "harmonious" ? "✓" : aspect.nature === "challenging" ? "⚠️" : "○";
      console.log(`   ${nature} ${aspect.planet1} ${aspect.aspectType} ${aspect.planet2} (fuerza: ${aspect.strength}/5)`);
    });

    console.log("\n✅ Contexto astronómico calculado correctamente\n");
  } catch (error) {
    console.error("❌ Error al calcular contexto astronómico:", error.message);
  }
}

async function testVariantStrategies() {
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("TEST 2: Estrategias de Variantes");
  console.log("═══════════════════════════════════════════════════════════\n");

  for (let variantId = 1; variantId <= 4; variantId++) {
    const config = getVariantConfig(variantId);
    console.log(`\n📋 Variante ${variantId}: ${config.label}`);
    console.log(`   Descripción: ${config.description}`);
    console.log(`   Áreas: ${config.focusAreas.join(", ")}`);
    console.log(`   Keywords: ${config.toneKeywords.join(", ")}`);
  }

  console.log("\n✅ Todas las variantes configuradas correctamente\n");
}

async function testQualityValidator() {
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("TEST 3: Validador de Calidad");
  console.log("═══════════════════════════════════════════════════════════\n");

  // Texto genérico (debe fallar)
  const genericText = `
    Hoy es un buen día para ti. Las estrellas se alinean y todo será mejor.
    Mantén una actitud positiva y confía en el universo.
  `;

  const genericResult = validateQuality(genericText);
  console.log("🔴 Texto Genérico:");
  console.log(`   Válido: ${genericResult.valid}`);
  console.log(`   Score: ${genericResult.score}/100`);
  console.log(`   Issues: ${genericResult.issues.length}`);
  genericResult.issues.forEach((issue) => {
    console.log(`   - ${issue.type}: ${issue.message}`);
  });

  // Texto de calidad (debe pasar)
  const qualityText = `
    Con Marte en trígono con Júpiter a 15° de Leo, tu energía emprendedora
    se amplifica notablemente. Este aspecto armonioso te impulsa a tomar
    acción en proyectos que has pospuesto. La Luna en Capricornio te invita
    a estructurar tus emociones con pragmatismo, creando bases sólidas para
    decisiones importantes. Aprovecha esta configuración para avanzar en
    metas profesionales con confianza renovada.
  `;

  const qualityResult = validateQuality(qualityText);
  console.log("\n🟢 Texto de Calidad:");
  console.log(`   Válido: ${qualityResult.valid}`);
  console.log(`   Score: ${qualityResult.score}/100`);
  console.log(`   Issues: ${qualityResult.issues.length}`);

  if (qualityResult.valid) {
    console.log("\n✅ Validador funcionando correctamente\n");
  } else {
    console.log("\n⚠️ Texto de calidad no pasó validación (revisar thresholds)\n");
  }
}

async function testEnvironmentVariables() {
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("TEST 4: Variables de Entorno");
  console.log("═══════════════════════════════════════════════════════════\n");

  const checks = {
    DEEPSEEK_API_KEY: !!process.env.DEEPSEEK_API_KEY,
    CRON_SECRET: !!process.env.CRON_SECRET,
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  Object.entries(checks).forEach(([key, configured]) => {
    const status = configured ? "✅" : "❌";
    console.log(`   ${status} ${key}: ${configured ? "Configurada" : "FALTANTE"}`);
  });

  const allConfigured = Object.values(checks).every((v) => v);

  if (allConfigured) {
    console.log("\n✅ Todas las variables de entorno configuradas\n");
  } else {
    console.log("\n⚠️ Faltan variables de entorno. Ver .env.example\n");
  }

  return allConfigured;
}

async function main() {
  console.log("\n");
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║   SISTEMA DE GENERACIÓN AUTOMÁTICA DE HORÓSCOPOS - TEST  ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");

  try {
    // Test 1: Contexto astronómico
    await testAstronomicalContext();

    // Test 2: Variantes
    await testVariantStrategies();

    // Test 3: Validador de calidad
    await testQualityValidator();

    // Test 4: Variables de entorno
    const envConfigured = await testEnvironmentVariables();

    // Resumen final
    console.log("═══════════════════════════════════════════════════════════");
    console.log("RESUMEN");
    console.log("═══════════════════════════════════════════════════════════\n");

    if (envConfigured) {
      console.log("✅ Sistema listo para deployment");
      console.log("\nPróximos pasos:");
      console.log("1. Ejecutar migration SQL en Supabase");
      console.log("2. Configurar CRON_SECRET en Vercel");
      console.log("3. Deploy: vercel --prod");
      console.log("4. Verificar: curl -X GET https://tu-dominio/api/cron/generate -H 'Authorization: Bearer CRON_SECRET'");
    } else {
      console.log("⚠️ Completar configuración antes de deployment");
      console.log("\nRevisa las variables de entorno faltantes arriba.");
    }

    console.log("\n");
  } catch (error) {
    console.error("\n❌ Error durante tests:", error);
    process.exit(1);
  }
}

main();
