# Plan de Implementación: Sistema Automático de Horóscopos con IA

## 🎯 Objetivo

Crear un sistema completo que genere y publique automáticamente horóscopos personalizados usando DeepSeek AI, con:
- **48 variantes diarias** (12 signos × 4 versiones cada uno)
- **Publicación programada**: Diaria (1:00), Semanal (Lunes 1:00), Mensual (Día 1, 1:00)
- **Persistencia dual**: localStorage para visitantes, base de datos para usuarios logueados
- **Pipeline de calidad robusto**: Validación multi-capa, contexto astronómico real, prompts profesionales

## 📊 Análisis del Sistema Actual

### ✅ Infraestructura Existente
- **Base de datos**: Tabla `horoscopes` con estructura completa (PostgreSQL/Supabase)
- **Tipos**: `HoroscopePeriod` (daily/weekly/monthly), `HoroscopeEntry`
- **Generación IA**: Sistema maduro en `src/server/generation/` con validación editorial
- **Autenticación**: Supabase Auth + perfiles de usuario con datos astrales
- **Gateway IA**: Ya soporta DeepSeek (`src/lib/ai/gateway.server.ts`)
- **Deployment**: Vercel con Nitro preset

### ⚠️ Limitaciones Actuales
- **Sin scheduling**: No hay generación automática programada
- **Sin variantes**: Una sola versión por signo/período (constraint `UNIQUE(sign_slug, period, date_for)`)
- **Sin asignación de variantes**: No hay tabla para guardar qué variante vio cada usuario

## 🏗️ Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL CRON SCHEDULER                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Daily 1:00   │  │ Weekly Mon   │  │ Monthly 1st  │      │
│  │   (48 gen)   │  │   1:00       │  │   1:00       │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             ▼
              ┌──────────────────────────────┐
              │  API: /api/cron/generate     │
              │  - Verifica auth token       │
              │  - Determina qué generar     │
              │  - Orquesta generación       │
              └──────────┬───────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌────────┐     ┌─────────┐    ┌──────────┐
    │ Daily  │     │ Weekly  │    │ Monthly  │
    │ 12×4   │     │ 12×4    │    │ 12×4     │
    └────┬───┘     └────┬────┘    └────┬─────┘
         │              │              │
         └──────────────┼──────────────┘
                        ▼
         ┌──────────────────────────────┐
         │  GENERATION SERVICE          │
         │  ┌────────────────────────┐  │
         │  │ 1. Fetch astro data    │  │
         │  │    (astronomy-engine)  │  │
         │  ├────────────────────────┤  │
         │  │ 2. Build context       │  │
         │  │    (variante-aware)    │  │
         │  ├────────────────────────┤  │
         │  │ 3. Call DeepSeek IA    │  │
         │  │    (con retry)         │  │
         │  ├────────────────────────┤  │
         │  │ 4. Validate quality    │  │
         │  │    - Estructural       │  │
         │  │    - Editorial         │  │
         │  │    - Anti-genérico     │  │
         │  ├────────────────────────┤  │
         │  │ 5. Retry si falla      │  │
         │  │    (max 2 intentos)    │  │
         │  └────────────────────────┘  │
         └──────────────┬───────────────┘
                        ▼
         ┌──────────────────────────────┐
         │  DATABASE LAYER              │
         │  ┌────────────────────────┐  │
         │  │ horoscopes (extendida) │  │
         │  │ + variant_id: 1-4      │  │
         │  │ + generation_meta      │  │
         │  └────────────────────────┘  │
         │  ┌────────────────────────┐  │
         │  │ user_horoscope_prefs   │  │
         │  │ (nueva tabla)          │  │
         │  │ user_id → variant_id   │  │
         │  │ por sign + date        │  │
         │  └────────────────────────┘  │
         └───────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
┌─────────────────┐         ┌─────────────────┐
│  AUTHENTICATED  │         │    VISITORS     │
│  Read from DB   │         │  localStorage   │
│  + variant      │         │  + sessionId    │
│  assignment     │         │  + temp assign  │
└─────────────────┘         └─────────────────┘
```

## 🗄️ Cambios en Base de Datos

### 1. Extender tabla `horoscopes`
```sql
-- Agregar columna variant_id
ALTER TABLE public.horoscopes
  ADD COLUMN variant_id SMALLINT NOT NULL DEFAULT 1 CHECK (variant_id BETWEEN 1 AND 4),
  ADD COLUMN generation_metadata JSONB DEFAULT '{}'::jsonb;

-- Actualizar constraint único para incluir variantes
ALTER TABLE public.horoscopes
  DROP CONSTRAINT horoscopes_sign_period_date_unique,
  ADD CONSTRAINT horoscopes_sign_period_date_variant_unique 
    UNIQUE (sign_slug, period, date_for, variant_id);

-- Índice para consultas rápidas por variante
CREATE INDEX horoscopes_sign_period_date_variant_idx
  ON public.horoscopes (sign_slug, period, date_for, variant_id);
```

### 2. Nueva tabla `user_horoscope_assignments`
```sql
-- Guarda qué variante ve cada usuario
CREATE TABLE public.user_horoscope_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sign_slug TEXT NOT NULL,
  period public.horoscope_period NOT NULL,
  date_for DATE NOT NULL,
  variant_id SMALLINT NOT NULL CHECK (variant_id BETWEEN 1 AND 4),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, sign_slug, period, date_for)
);

CREATE INDEX user_horoscope_assignments_user_idx
  ON public.user_horoscope_assignments (user_id, date_for DESC);

-- RLS
ALTER TABLE public.user_horoscope_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own assignments"
  ON public.user_horoscope_assignments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users insert own assignments"
  ON public.user_horoscope_assignments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
```

### 3. Tabla de logs de generación (opcional pero recomendado)
```sql
CREATE TABLE public.horoscope_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT NOT NULL,
  period public.horoscope_period NOT NULL,
  date_for DATE NOT NULL,
  signs_generated SMALLINT NOT NULL,
  variants_per_sign SMALLINT NOT NULL,
  total_generated SMALLINT NOT NULL,
  total_failed SMALLINT DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'partial', 'failed')),
  error_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX horoscope_generation_logs_date_idx
  ON public.horoscope_generation_logs (date_for DESC, created_at DESC);
```

## 📁 Estructura de Archivos Nueva

```
src/
├── routes/
│   └── api/
│       └── cron/
│           ├── generate.ts          # Endpoint principal cron
│           └── generate.test.ts
│
├── server/
│   └── horoscope-automation/
│       ├── scheduler.ts              # Lógica de scheduling
│       ├── batch-generator.ts        # Genera lote completo (12×4)
│       ├── variant-strategy.ts       # Estrategia de variación
│       ├── quality-validator.ts      # Validación anti-genérico
│       ├── astronomical-context.ts   # Contexto planetario real
│       └── deepseek-provider.ts      # Adapter específico DeepSeek
│
├── lib/
│   └── horoscope/
│       ├── variant-assignment.ts     # Asignación de variantes
│       ├── repository.ts             # EXTENDER con variantes
│       └── visitor-storage.ts        # localStorage para visitantes
│
└── types/
    └── horoscope-automation.ts       # Tipos del sistema
```

## 🔧 Implementación Detallada

### Fase 1: Base de Datos y Tipos (30 min)
1. **Migration SQL**
   - Crear `20260805_horoscope_variants.sql`
   - Extender tabla horoscopes
   - Crear tabla user_horoscope_assignments
   - Crear tabla horoscope_generation_logs

2. **Tipos TypeScript**
   - Extender `HoroscopeEntry` con `variantId`
   - Crear `HoroscopeVariantAssignment`
   - Crear `GenerationBatchConfig`
   - Crear `QualityValidationResult`

### Fase 2: Sistema de Variantes (1 hora)
1. **variant-strategy.ts**
   - 4 estrategias de variación:
     - Variante 1: Enfoque práctico/acción
     - Variante 2: Enfoque emocional/relaciones
     - Variante 3: Enfoque reflexivo/crecimiento
     - Variante 4: Enfoque intuitivo/espiritual
   - Seeds diferentes por variante para diversidad

2. **variant-assignment.ts**
   - Función para asignar variante a usuario logueado (guardado en DB)
   - Función para asignar variante a visitante (localStorage con sessionId)
   - Algoritmo: hash consistente basado en user_id/sessionId + date

3. **Extender repository.ts**
   - `getHoroscopeVariant(sign, period, date, variantId)`
   - `assignUserVariant(userId, sign, period, date)`
   - `getUserAssignedVariant(userId, sign, period, date)`

### Fase 3: Contexto Astronómico (45 min)
1. **astronomical-context.ts**
   - Usar `astronomy-engine` (ya instalado)
   - Calcular posiciones planetarias reales para la fecha
   - Detectar aspectos mayores (conjunción, oposición, trígono, cuadratura)
   - Formatear para prompt IA

### Fase 4: Pipeline de Calidad (1 hora)
1. **quality-validator.ts**
   - Validación anti-genérico:
     - Detectar frases cliché (lista negra)
     - Verificar especificidad (debe mencionar contexto astrológico)
     - Validar diversidad entre variantes del mismo signo
     - Score de calidad 0-100
   - Validación editorial (reusar existente)
   - Validación estructural (reusar existente)

2. **deepseek-provider.ts**
   - Adapter para DeepSeek API
   - Implementa interfaz `TextGenerationProvider`
   - Retry con backoff exponencial
   - Logging de tokens consumidos

### Fase 5: Generación Batch (1.5 horas)
1. **batch-generator.ts**
   ```typescript
   async function generateBatch(config: GenerationBatchConfig) {
     // 1. Preparar lote (12 signos × 4 variantes)
     // 2. Para cada signo:
     //    - Obtener contexto astronómico
     //    - Para cada variante:
     //      - Construir prompt con estrategia de variante
     //      - Llamar DeepSeek
     //      - Validar calidad
     //      - Retry si falla (max 2 intentos)
     //      - Guardar en DB
     // 3. Log de resultados
     // 4. Manejo de errores parciales (no fallar todo si 1-2 fallan)
   }
   ```

2. **Prompts por Variante**
   - Prompt base + modificadores por variante
   - Incluir contexto astronómico real
   - Temperatura: 0.7 para diversidad pero consistencia
   - Max tokens: 800 por horóscopo

### Fase 6: API y Scheduling (1 hora)
1. **routes/api/cron/generate.ts**
   ```typescript
   export const Route = createFileRoute("/api/cron/generate")({
     server: {
       handlers: {
         POST: async ({ request }) => {
           // 1. Verificar auth token (Vercel Cron secret)
           const authHeader = request.headers.get("authorization");
           if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
             return new Response("Unauthorized", { status: 401 });
           }
           
           // 2. Determinar qué generar (query param: daily/weekly/monthly)
           const url = new URL(request.url);
           const period = url.searchParams.get("period");
           
           // 3. Generar batch
           const result = await generateBatch({ period, variants: 4 });
           
           // 4. Responder
           return new Response(JSON.stringify(result), {
             headers: { "Content-Type": "application/json" }
           });
         }
       }
     }
   });
   ```

2. **vercel.json** (Configuración Cron)
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/generate?period=daily",
         "schedule": "0 1 * * *"
       },
       {
         "path": "/api/cron/generate?period=weekly",
         "schedule": "0 1 * * 1"
       },
       {
         "path": "/api/cron/generate?period=monthly",
         "schedule": "0 1 1 * *"
       }
     ]
   }
   ```

### Fase 7: Cliente (Visitantes y Usuarios) (1 hora)
1. **visitor-storage.ts**
   ```typescript
   // localStorage con estructura:
   // {
   //   sessionId: "uuid",
   //   assignments: {
   //     "aries-daily-2026-08-05": 2,
   //     "tauro-daily-2026-08-05": 4,
   //     ...
   //   }
   // }
   ```

2. **Extender componentes existentes**
   - Modificar `src/routes/horoscopo.*.tsx` para:
     - Detectar si usuario está logueado
     - Si logueado: buscar/asignar variante en DB
     - Si visitante: buscar/asignar variante en localStorage
     - Fetch horóscopo con variant_id correcto

### Fase 8: Testing y Monitoring (1 hora)
1. **Tests unitarios**
   - variant-strategy.test.ts
   - quality-validator.test.ts
   - batch-generator.test.ts

2. **Dashboard de monitoring** (opcional)
   - Página admin para ver logs de generación
   - Métricas: tasa de éxito, tokens consumidos, tiempo promedio

## 📊 Estimación de Costos

### DeepSeek API
- **Modelo recomendado**: `deepseek-chat` o `deepseek-v4-flash`
- **Pricing**: ~$0.14/M tokens input, ~$0.28/M tokens output

**Generación Diaria (48 horóscopos)**
- Prompt promedio: 1,000 tokens (contexto astronómico + instrucciones)
- Output promedio: 600 tokens por horóscopo
- Total input: 48,000 tokens/día = ~$0.007
- Total output: 28,800 tokens/día = ~$0.008
- **Diario**: ~$0.015

**Generación Semanal** (Lunes): +$0.015
**Generación Mensual** (día 1): +$0.015

**Total mensual estimado**: ~$0.50 - $2.00 USD
(Incluye retries y overhead. En producción real con tráfico puede variar.)

## 🎨 Pipeline de Calidad: Detalles

### 1. Prompt Engineering
```
Rol: Eres un astrólogo profesional con 20 años de experiencia...

Contexto Astronómico Actual:
- Sol en Leo a 13°
- Luna en Capricornio a 8°
- Mercurio retrógrado en Virgo
- Aspectos: Sol trígono Júpiter (fuerza +3), Luna cuadratura Marte (tensión +2)

Signo: Aries
Período: Diario (2026-08-05)
Variante: #2 (Enfoque emocional/relaciones)

IMPORTANTE:
- Menciona AL MENOS un tránsito planetario específico
- Usa lenguaje profesional pero accesible
- NO uses frases genéricas ("hoy es un buen día", "las estrellas se alinean")
- Sé específico y concreto
- 150-200 palabras

Formato JSON exacto:
{
  "sign": "aries",
  "summary": "...",
  "focus": "...",
  ...
}
```

### 2. Validación Multi-Capa
```typescript
// Capa 1: Estructural (ya existe)
validateGeneratedDraft()

// Capa 2: Editorial (ya existe)
validateEditorialDraft()

// Capa 3: Anti-genérico (NUEVO)
validateQuality() {
  // Blacklist de frases
  const clichePhrases = [
    "las estrellas se alinean",
    "hoy es un buen día",
    "mantén una actitud positiva",
    ...
  ];
  
  // Verificar menciona tránsitos
  const mentionsPlanets = /\b(sol|luna|mercurio|venus|marte|júpiter|saturno)\b/i.test(text);
  
  // Score de especificidad
  const specificityScore = calculateSpecificity(text);
  
  return {
    valid: !hasClichés && mentionsPlanets && specificityScore > 60,
    score: specificityScore
  };
}

// Capa 4: Diversidad entre variantes
validateVariantDiversity(variant1, variant2, variant3, variant4) {
  // Calcular similitud textual (Levenshtein o cosine similarity)
  // Las 4 variantes deben tener <40% de similitud entre sí
}
```

## 🔒 Seguridad

1. **CRON_SECRET**: Variable de entorno en Vercel
   - Generado con `openssl rand -base64 32`
   - Solo Vercel Cron puede llamar al endpoint

2. **Rate Limiting**: Prevenir abuso manual
   - Max 1 generación por período cada 20 horas
   - Check en DB de último batch

3. **API Keys**: DeepSeek key en Vercel Environment Variables
   - Nunca exponer con prefix `VITE_`
   - Solo accesible server-side

## ✅ Checklist de Implementación

### Base de Datos
- [ ] Crear migration SQL completa
- [ ] Ejecutar migration en Supabase
- [ ] Verificar constraints y índices
- [ ] Seed de prueba con 2-3 variantes

### Backend
- [ ] Implementar variant-strategy.ts
- [ ] Implementar astronomical-context.ts
- [ ] Implementar quality-validator.ts
- [ ] Implementar deepseek-provider.ts
- [ ] Implementar batch-generator.ts
- [ ] Extender horoscope/repository.ts
- [ ] Implementar api/cron/generate.ts

### Frontend/Cliente
- [ ] Implementar variant-assignment.ts
- [ ] Implementar visitor-storage.ts
- [ ] Extender componentes horoscopo.*.tsx
- [ ] UI para mostrar "Tu horóscopo personalizado"

### Configuración
- [ ] Configurar DEEPSEEK_API_KEY en Vercel
- [ ] Generar y configurar CRON_SECRET
- [ ] Crear vercel.json con crons
- [ ] Deploy y verificar crons activos

### Testing
- [ ] Test manual de generación de 1 variante
- [ ] Test manual de generación de batch completo (48)
- [ ] Test de asignación de variantes (usuarios)
- [ ] Test de asignación de variantes (visitantes)
- [ ] Test de validación de calidad
- [ ] Test end-to-end completo

### Monitoring
- [ ] Dashboard de logs en Vercel
- [ ] Alertas si generación falla
- [ ] Métricas de costos (opcional)
- [ ] Página admin para ver generaciones (opcional)

## 🚀 Plan de Rollout

### Semana 1: MVP
- Implementar solo generación diaria
- Solo 2 variantes (simplificado)
- Sin validación de diversidad
- Testing manual intensivo

### Semana 2: Full Implementation
- Agregar generación semanal y mensual
- Implementar 4 variantes completas
- Agregar validación de diversidad
- Dashboard de monitoring

### Semana 3: Optimización
- Analizar calidad de outputs
- Ajustar prompts según feedback
- Optimizar costos (batch requests si es posible)
- A/B testing de variantes

## 🎯 Métricas de Éxito

1. **Técnicas**
   - 95%+ tasa de éxito en generación
   - <2 segundos tiempo de respuesta por horóscopo
   - 0 errores de cron jobs

2. **Calidad**
   - Score de calidad promedio >75
   - 0% contenido genérico detectado
   - 100% menciona contexto astronómico

3. **Engagement**
   - Tasa de retorno de usuarios que ven variantes
   - Tiempo en página de horóscopo
   - Compartidos en redes (si se implementa)

## 📚 Documentación Requerida

1. **README_HOROSCOPE_AUTOMATION.md**
   - Cómo funciona el sistema
   - Cómo ejecutar generación manual
   - Troubleshooting común

2. **API_CRON.md**
   - Endpoints disponibles
   - Autenticación
   - Responses esperados

3. **PROMPTS.md**
   - Todos los prompts usados
   - Estrategias de variante
   - Historial de cambios en prompts

---

## ⏱️ Estimación Total de Tiempo

- **Implementación**: 8-10 horas
- **Testing**: 3-4 horas
- **Debugging**: 2-3 horas
- **Documentación**: 1-2 horas

**Total**: 14-19 horas de desarrollo

## 💰 Inversión Total

- **Desarrollo**: 15-20 horas @ tu tarifa
- **Costos mensuales**: $2-5 DeepSeek API
- **Infraestructura**: $0 (ya en Vercel)

**ROI**: Sistema completamente automatizado que genera contenido fresco diario sin intervención manual.
