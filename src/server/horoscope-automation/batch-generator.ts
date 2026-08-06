/**
 * Generador batch de horóscopos con soporte de variantes múltiples.
 * Orquesta la generación automática de 12 signos × 4 variantes.
 */

import { zodiacSigns } from "@/data/zodiac-signs";
import type {
  GenerationBatchConfig,
  BatchGenerationResult,
  SingleGenerationResult,
  VariantId,
  GenerationMetadata,
  HoroscopeEntryWithVariant,
} from "@/types/horoscope-automation";
import { getVariantConfig } from "@/types/horoscope-automation";
import type { HoroscopePeriod } from "@/types/horoscope";
import {
  calculateAstronomicalContext,
  formatAstronomicalContextForPrompt,
} from "./astronomical-context";
import { buildVariantInstruction } from "./variant-strategy";
import { validateQuality, validateVariantSet } from "./quality-validator";
import { referenceDateFor } from "@/config/horoscope";
import { generateWithDeepSeek } from "./deepseek-provider";

/**
 * Genera un ID único para el batch.
 */
function generateBatchId(period: HoroscopePeriod, dateFor: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `batch-${period}-${dateFor}-${timestamp}`;
}

/**
 * Construye el prompt completo para un horóscopo.
 */
async function buildHoroscopePrompt(
  signSlug: string,
  period: HoroscopePeriod,
  dateFor: string,
  variantId: VariantId,
): Promise<string> {
  const sign = zodiacSigns.find((s) => s.slug === signSlug);
  if (!sign) throw new Error(`Signo inválido: ${signSlug}`);

  // Obtener contexto astronómico real
  const astroContext = await calculateAstronomicalContext(dateFor);
  const astroSection = formatAstronomicalContextForPrompt(astroContext);

  // Obtener instrucción de variante
  const variantInstruction = buildVariantInstruction(variantId);
  const variantConfig = getVariantConfig(variantId);

  // Mapeo de períodos
  const periodLabel = period === "daily" ? "DIARIO" : period === "weekly" ? "SEMANAL" : "MENSUAL";

  const prompt = `
Eres un astrólogo profesional con 20 años de experiencia en astrología moderna.
Tu especialidad es crear lecturas precisas, fundamentadas y profundas que ayuden a las personas
a navegar sus vidas con mayor consciencia.

═══════════════════════════════════════════════════════════════
TAREA: HORÓSCOPO ${periodLabel}
═══════════════════════════════════════════════════════════════

SIGNO: ${sign.name} (${sign.symbol})
• Elemento: ${sign.element}
• Modalidad: ${sign.modality}
• Planeta regente: ${sign.rulingPlanet}
• Palabra clave: ${sign.keyword}

FECHA: ${dateFor}
PERÍODO: ${periodLabel}

${astroSection}

${variantInstruction}

═══════════════════════════════════════════════════════════════
INSTRUCCIONES DE CONTENIDO
═══════════════════════════════════════════════════════════════

1. FUNDAMENTACIÓN ASTRONÓMICA (OBLIGATORIO):
   - DEBES mencionar AL MENOS UN tránsito planetario específico del contexto actual
   - Fundamenta tus interpretaciones en los aspectos y posiciones reales listadas arriba
   - Sé específico: "Marte en trígono con Júpiter" NO "las energías se alinean"

2. PERSONALIZACIÓN POR SIGNO:
   - Considera el elemento de ${sign.name} (${sign.element})
   - Considera su modalidad (${sign.modality})
   - Usa el arquetipo del signo como base

3. TONO Y ESTILO:
   - Profesional pero accesible
   - Empoderador y práctico
   - Sin promesas absolutas ni predicciones deterministas
   - Lenguaje claro, sin jerga excesiva

4. LONGITUD:
   - Summary: 150-200 palabras (2-3 oraciones sustanciales)
   - Focus: 1 palabra o frase corta (máx 4 palabras)
   - Mood: 1-2 palabras descriptivas del estado emocional
   - Secciones opcionales (love, work, wellbeing): 80-120 palabras cada una

5. PROHIBIDO:
   ✗ Frases cliché: "las estrellas se alinean", "el destino te sonríe"
   ✗ Promesas absolutas: "ganarás dinero", "encontrarás el amor"
   ✗ Contenido genérico que aplica a cualquier signo
   ✗ Predicciones de eventos específicos sin fundamento
   ✗ Mencionar que esto es una "variante #${variantId}"

6. CALIDAD:
   ✓ Específico y fundamentado
   ✓ Útil y accionable
   ✓ Coherente con el enfoque ${variantConfig.label}
   ✓ Menciona contexto astronómico real

═══════════════════════════════════════════════════════════════
FORMATO DE RESPUESTA (JSON ESTRICTO)
═══════════════════════════════════════════════════════════════

Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin \`\`\`json):

{
  "summary": "Texto principal del horóscopo (150-200 palabras)",
  "focus": "Área de enfoque principal (1-4 palabras)",
  "mood": "Estado emocional sugerido (1-2 palabras)",
  "energy": 3,
  "love": "Lectura opcional sobre amor/relaciones (80-120 palabras) o null",
  "work": "Lectura opcional sobre trabajo/carrera (80-120 palabras) o null",
  "wellbeing": "Lectura opcional sobre bienestar (80-120 palabras) o null",
  "luckyNumber": 7,
  "luckyColor": "Verde esmeralda"
}

NOTAS:
- energy: número 1-5 (1=baja, 5=muy alta)
- luckyNumber: número entero 1-99
- luckyColor: nombre de color descriptivo
- Las secciones love/work/wellbeing son opcionales según el enfoque de la variante

GENERA EL HORÓSCOPO AHORA:
`;

  return prompt.trim();
}

async function saveGeneratedHoroscope(input: {
  signSlug: string;
  variantId: VariantId;
  period: HoroscopePeriod;
  dateFor: string;
  response: Awaited<ReturnType<typeof generateWithDeepSeek>>;
  metadata: GenerationMetadata;
  forceRegenerate: boolean;
}): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // Supabase generated types do not include the latest horoscope variant migration yet.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabaseAdmin as any;

  if (!input.forceRegenerate) {
    const { data: existing, error: existingError } = await db
      .from("horoscopes")
      .select("id")
      .eq("sign_slug", input.signSlug)
      .eq("period", input.period)
      .eq("date_for", input.dateFor)
      .eq("variant_id", input.variantId)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing?.id) return existing.id;
  }

  const row = {
    sign_slug: input.signSlug,
    period: input.period,
    date_for: input.dateFor,
    variant_id: input.variantId,
    summary: input.response.summary,
    focus: input.response.focus,
    mood: input.response.mood,
    energy: input.response.energy,
    love: input.response.love,
    work: input.response.work,
    wellbeing: input.response.wellbeing,
    lucky_number: input.response.luckyNumber,
    lucky_color: input.response.luckyColor,
    is_demo: false,
    published_at: new Date().toISOString(),
    generation_metadata: input.metadata as unknown as Record<string, unknown>,
  };

  const { data, error } = await db
    .from("horoscopes")
    .upsert(row, {
      onConflict: "sign_slug,period,date_for,variant_id",
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Genera un horóscopo individual con reintentos.
 */
async function generateSingleHoroscope(
  signSlug: string,
  variantId: VariantId,
  period: HoroscopePeriod,
  dateFor: string,
  forceRegenerate: boolean,
  maxRetries: number,
): Promise<SingleGenerationResult> {
  const startTime = Date.now();
  let lastError: string | undefined;
  let retries = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Construir prompt
      const prompt = await buildHoroscopePrompt(signSlug, period, dateFor, variantId);

      // Llamar a DeepSeek (temperatura ajustada por variante para diversidad)
      const baseTemp = 0.7;
      const tempVariation = (variantId - 1) * 0.05; // 0.7, 0.75, 0.8, 0.85
      const temperature = baseTemp + tempVariation;

      const response = await generateWithDeepSeek({
        prompt,
        temperature,
        maxTokens: 800,
        variantId,
        signSlug,
      });

      // Validar calidad
      const fullText = `${response.summary} ${response.focus} ${response.mood}`;
      const qualityResult = validateQuality(fullText);

      if (!qualityResult.valid) {
        lastError = `Falló validación de calidad: ${qualityResult.issues.map((i) => i.message).join(", ")}`;
        retries = attempt;
        continue; // Reintentar
      }

      // Éxito
      const durationMs = Date.now() - startTime;
      const metadata: GenerationMetadata = {
        providerId: "deepseek",
        modelId: "deepseek-chat",
        variantStrategy: getVariantConfig(variantId).strategy,
        promptVersion: "horoscope-automation-v1",
        temperature,
        tokensUsed: response.tokensUsed,
        qualityScore: qualityResult.score,
        retries: attempt,
        generatedAt: new Date().toISOString(),
      };
      const horoscopeId = await saveGeneratedHoroscope({
        signSlug,
        variantId,
        period,
        dateFor,
        response,
        metadata,
        forceRegenerate,
      });

      return {
        signSlug,
        variantId,
        success: true,
        horoscopeId,
        retries: attempt,
        durationMs,
        tokensUsed: response.tokensUsed,
        qualityScore: qualityResult.score,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      retries = attempt;

      // Si no es el último intento, continuar
      if (attempt < maxRetries) {
        // Backoff exponencial: 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        continue;
      }
    }
  }

  // Falló todos los intentos
  const durationMs = Date.now() - startTime;

  return {
    signSlug,
    variantId,
    success: false,
    error: lastError || "Error desconocido",
    retries,
    durationMs,
  };
}

/**
 * Genera un batch completo de horóscopos.
 */
export async function generateBatch(config: GenerationBatchConfig): Promise<BatchGenerationResult> {
  const startTime = Date.now();

  // Defaults
  const batchId = config.batchId || generateBatchId(config.period, config.dateFor);
  const signs = config.signs.length > 0 ? config.signs : zodiacSigns.map((s) => s.slug);
  const variants = config.variants.length > 0 ? config.variants : ([1, 2, 3, 4] as VariantId[]);
  const maxRetries = config.maxRetries ?? 2;

  const totalRequested = signs.length * variants.length;
  const results: SingleGenerationResult[] = [];

  console.log(
    `[Batch ${batchId}] Iniciando generación: ${signs.length} signos × ${variants.length} variantes = ${totalRequested} horóscopos`,
  );

  // Generar todos los horóscopos
  for (const signSlug of signs) {
    console.log(`[Batch ${batchId}] Generando ${signSlug}...`);

    // Generar las 4 variantes de este signo
    const signResults: SingleGenerationResult[] = [];

    for (const variantId of variants) {
      const result = await generateSingleHoroscope(
        signSlug,
        variantId,
        config.period,
        config.dateFor,
        config.forceRegenerate || false,
        maxRetries,
      );

      signResults.push(result);
      results.push(result);

      const status = result.success ? "✓" : "✗";
      console.log(
        `  ${status} Variante ${variantId}: ${result.success ? `${result.qualityScore}/100` : result.error}`,
      );
    }

    // Validar diversidad entre variantes de este signo
    // TODO: Implementar validación de diversidad entre las 4 variantes
    // const diversityCheck = validateVariantSet(...)
  }

  // Calcular estadísticas
  const completedAt = new Date().toISOString();
  const durationMs = Date.now() - startTime;

  const totalGenerated = results.filter((r) => r.success).length;
  const totalFailed = results.filter((r) => !r.success).length;

  const totalTokensInput = results
    .filter((r) => r.tokensUsed)
    .reduce((sum, r) => sum + (r.tokensUsed?.input || 0), 0);

  const totalTokensOutput = results
    .filter((r) => r.tokensUsed)
    .reduce((sum, r) => sum + (r.tokensUsed?.output || 0), 0);

  const averageQualityScore =
    results.filter((r) => r.qualityScore).reduce((sum, r) => sum + (r.qualityScore || 0), 0) /
    results.filter((r) => r.qualityScore).length;

  const successRate = totalRequested > 0 ? (totalGenerated / totalRequested) * 100 : 0;

  console.log(`[Batch ${batchId}] Completado en ${(durationMs / 1000).toFixed(1)}s`);
  console.log(`  ✓ Generados: ${totalGenerated}/${totalRequested} (${successRate.toFixed(1)}%)`);
  console.log(`  ✗ Fallidos: ${totalFailed}`);
  console.log(`  📊 Calidad promedio: ${averageQualityScore.toFixed(1)}/100`);
  console.log(
    `  🪙 Tokens: ${totalTokensInput.toLocaleString()} input, ${totalTokensOutput.toLocaleString()} output`,
  );

  return {
    batchId,
    period: config.period,
    dateFor: config.dateFor,
    startedAt: new Date(startTime).toISOString(),
    completedAt,
    totalRequested,
    totalGenerated,
    totalFailed,
    results,
    stats: {
      durationMs,
      averageQualityScore: Math.round(averageQualityScore * 10) / 10,
      totalTokensUsed: {
        input: totalTokensInput,
        output: totalTokensOutput,
      },
      successRate: Math.round(successRate * 10) / 10,
    },
    errors: results.filter((r) => !r.success).map((r) => r.error!),
  };
}

/**
 * Genera horóscopos para el período actual (helper).
 */
export async function generateForCurrentPeriod(
  period: HoroscopePeriod,
): Promise<BatchGenerationResult> {
  const dateFor = referenceDateFor(period);

  return generateBatch({
    period,
    dateFor,
    signs: zodiacSigns.map((s) => s.slug),
    variants: [1, 2, 3, 4],
    maxRetries: 2,
  });
}

/**
 * Genera solo horóscopos diarios para hoy (shortcut).
 */
export async function generateDailyToday(): Promise<BatchGenerationResult> {
  return generateForCurrentPeriod("daily");
}

/**
 * Genera horóscopos semanales para esta semana.
 */
export async function generateWeeklyThisWeek(): Promise<BatchGenerationResult> {
  return generateForCurrentPeriod("weekly");
}

/**
 * Genera horóscopos mensuales para este mes.
 */
export async function generateMonthlyThisMonth(): Promise<BatchGenerationResult> {
  return generateForCurrentPeriod("monthly");
}
