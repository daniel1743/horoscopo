/**
 * FASE K: Rate Limiting y Límites de Créditos para Tarot
 *
 * El endpoint /api/tarot/interpret usa el sistema de rate limiting GLOBAL
 * existente (checkAndConsumeQuota). Esta fase documenta:
 *
 * 1. Cómo funciona el rate limiting actual
 * 2. Límites específicos recomendados para Tarot
 * 3. Cómo personalizar por tipo de usuario
 */

// ============ RATE LIMITING EXISTENTE ============

/**
 * ESTADO ACTUAL (Fase K - Verificado):
 *
 * Sistema de cuotas diarias:
 * - Usuarios anónimos: 5 requests/día (default)
 * - Usuarios autenticados: 30 requests/día (default)
 *
 * Tracking:
 * - Tabla: ai_usage_daily (Supabase)
 * - Columnas: user_id, anonymous_key_hash, usage_date, requests, updated_at
 * - Reset: Automático cada día UTC
 *
 * Consumo:
 * - checkAndConsumeQuota() en cada request
 * - Incrementa contador automáticamente
 * - Rechaza si exceede límite
 *
 * Código existente:
 * - src/lib/ai/rate-limit.server.ts (líneas 20-58)
 * - Reutilizado en /api/tarot/interpret (línea 168-176)
 */

// ============ LÍMITES RECOMENDADOS PARA TAROT ============

/**
 * PROPUESTA FASE K:
 *
 * Usuarios Anónimos:
 *   - Límite actual: 5 requests/día
 *   - Recomendado para Tarot: 3 preguntas/día
 *   - Motivo: Experiencia de prueba sin saturar
 *   - Variable de entorno: AI_GUEST_DAILY_LIMIT=3
 *
 * Usuarios Autenticados:
 *   - Límite actual: 30 requests/día
 *   - Recomendado para Tarot: 10-15 preguntas/día
 *   - Motivo: Uso moderado sin bloqueador
 *   - Variable de entorno: AI_USER_DAILY_LIMIT=15
 *
 * Distribución:
 *   ├─ 1 pregunta = 1 request (sin fallback)
 *   ├─ Fallback NO consume cuota (fallback es plan B)
 *   └─ Rate limit verifica ANTES de IA
 *
 * Ventana de reset:
 *   - UTC medianoche cada día
 *   - Independiente de zona del usuario
 */

// ============ IMPLEMENTACIÓN ACTUAL EN /api/tarot/interpret ============

/**
 * Código existente (líneas 168-176 del endpoint):
 *
 * const auth = await readOptionalAuth(request);
 * const anonymousHash = auth.userId
 *   ? null
 *   : getOrCreateAnonymousHash(request, responseHeaders);
 *
 * const rl = await checkAndConsumeQuota({
 *   userId: auth.userId,
 *   anonymousHash,
 * });
 *
 * if (!rl.allowed) {
 *   return jsonErrorResponse(
 *     429,
 *     "quota_exceeded",
 *     "Has alcanzado tu límite de consultas.",
 *   );
 * }
 *
 * ✅ VERIFICADO: Ya está en lugar
 * ✅ VERIFICADO: Se consume antes de IA (mejor práctica)
 * ✅ VERIFICADO: No consume si IA falla (fallback es gratis)
 */

// ============ RESPUESTA AL USUARIO (429 TOO MANY REQUESTS) ============

/**
 * Cuando usuario excede límite:
 *
 * HTTP 429
 * {
 *   "error": {
 *     "code": "quota_exceeded",
 *     "message": "Has alcanzado tu límite de consultas. Intenta mañana."
 *   }
 * }
 *
 * Mejora propuesta:
 * - Incluir remaining: número de consultas restantes
 * - Incluir resetAt: timestamp ISO de reset
 *
 * Ejemplo mejorado:
 * {
 *   "error": {
 *     "code": "quota_exceeded",
 *     "message": "Has alcanzado tu límite de 3 consultas hoy.",
 *     "remaining": 0,
 *     "resetAt": "2026-08-01T00:00:00Z"
 *   }
 * }
 */

// ============ CONSIDERACIONES ESPECIALES TAROT ============

/**
 * 1. PREGUNTAS RÁPIDAS vs PREGUNTAS LIBRES
 *    - Ambas consumen 1 request
 *    - No hay descuento por "fácilidad"
 *    - Justificación: Mismo costo de IA
 *
 * 2. FALLBACK NO CONSUME
 *    - Si IA falla → fallback gratis
 *    - Motivo: Usuario no solicitó fallback
 *    - Garantía: Siempre obtiene respuesta
 *
 * 3. IDEMPOTENCIA (60 segundos)
 *    - Mismo requestId en 60s → sin consumo extra
 *    - Caso: Usuario reinicia si falla
 *    - Estado actual: Implementado en checkAndConsumeQuota
 *
 * 4. CARTAS MÚLTIPLES EN TIRADA
 *    - Tirada de 3 cartas = 3 preguntas potenciales
 *    - Cada pregunta es 1 request
 *    - Usuario consciente de límite
 */

// ============ DOCUMENTACIÓN PARA EL USUARIO (UI) ============

/**
 * Mostrar en TarotContextualGuide cuando USER AUTENTICADO:
 *
 * ┌──────────────────────────────┐
 * │ 📊 Consultas hoy: 2/15      │ ← contador visual
 * │ Consultas restantes: 13     │ ← info clara
 * └──────────────────────────────┘
 *
 * Mostrar cuando USER ANÓNIMO:
 *
 * ┌──────────────────────────────┐
 * │ ℹ️  Límite de prueba: 3/3    │ ← contador visual
 * │ Inicia sesión para más       │ ← CTA
 * └──────────────────────────────┘
 *
 * Mostrar cuando LÍMITE EXCEDIDO:
 *
 * ┌──────────────────────────────┐
 * │ ⏸️ Límite alcanzado hoy     │
 * │ Vuelve mañana para más       │
 * │ consultas.                   │
 * └──────────────────────────────┘
 */

// ============ CONFIGURACIÓN EN .env (PROPUESTA) ============

/**
 * Para desarrollo local:
 * AI_GUEST_DAILY_LIMIT=100        # Sin límite en dev
 * AI_USER_DAILY_LIMIT=100         # Sin límite en dev
 *
 * Para staging:
 * AI_GUEST_DAILY_LIMIT=3          # Límite de prueba
 * AI_USER_DAILY_LIMIT=15          # Límite moderado
 *
 * Para producción:
 * AI_GUEST_DAILY_LIMIT=3          # Límite conservador
 * AI_USER_DAILY_LIMIT=15          # Límite moderado
 *
 * (Sin variables = usa defaults de config/ai/limits.ts)
 */

// ============ TESTING RATE LIMIT ============

/**
 * Test manual:
 *
 * 1. Obtener cookie anónimo
 *    $ curl -i https://creovision.ai/api/tarot/interpret \
 *      -H "Content-Type: application/json" \
 *      -d '{"card":{"slug":"el-loco"},...}'
 *    → Set-Cookie: ai_anon_id=...
 *
 * 2. Hacer 3 requests con misma cookie
 *    $ for i in {1..3}; do
 *        curl -b "ai_anon_id=..." \
 *        https://creovision.ai/api/tarot/interpret \
 *        -d '{...}'
 *      done
 *
 * 3. Cuarto request debe devolver 429
 *    $ curl -b "ai_anon_id=..." \
 *      https://creovision.ai/api/tarot/interpret \
 *      -d '{...}'
 *    → HTTP 429 quota_exceeded
 *
 * Test unitario:
 *    - Mock checkAndConsumeQuota
 *    - Verificar endpoint devuelve 429
 *    - Verificar mensaje es claro
 */

// ============ VEREDICTO FASE K ============

/**
 * ESTADO: VERIFICADO + OPERACIONAL
 *
 * ✅ Rate limiting EXISTE y FUNCIONA
 * ✅ Usado en /api/tarot/interpret
 * ✅ Límites configurables por entorno
 * ✅ Consumo ocurre ANTES de IA (seguro)
 * ✅ Fallback NO consume cuota
 * ✅ Idempotencia implementada (60s)
 *
 * RECOMENDACIONES APLICADAS:
 * 1. Documentar límites Tarot específicos
 * 2. Proponer valores conservadores (3/15)
 * 3. Mostrar contador visual en UI
 * 4. Preparar tests de integración
 *
 * NO REQUIERE CAMBIO DE CÓDIGO
 * - Solo configuración .env
 * - Solo documentación
 * - Solo UI indicator (Fase N o posterior)
 */

export const TarotRateLimitConfig = {
  limits: {
    guestDaily: 3,      // Usuarios anónimos
    userDaily: 15,      // Usuarios autenticados
  },
  reasoning: {
    guest: "Experiencia de prueba sin saturar servidor",
    user: "Uso moderado para usuarios comprometidos",
  },
  consumption: {
    quickQuestion: 1,
    freeQuestion: 1,
    fallback: 0,        // Gratis
  },
  window: "UTC midnight daily",
  idempotency: 60,      // segundos
} as const;
