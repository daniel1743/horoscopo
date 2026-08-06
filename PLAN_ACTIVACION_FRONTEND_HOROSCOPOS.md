# Plan de Activación Frontend - Sistema de Horóscopos con Variantes

**Fecha**: 2026-08-05  
**Estado**: Pendiente - Requiere generación de contenido primero

---

## 📋 Situación Actual

### ✅ Backend Completado
- Sistema de generación automática funcional
- 4 variantes por signo implementadas
- DeepSeek API integrada
- Vercel Cron configurado
- Base de datos extendida con `variant_id`

### ⚠️ Frontend Pendiente
- Feature de horóscopos **oculta** (`horoscope: false`)
- Rutas bloqueadas con `notFound()`
- No hay integración de variantes en loaders
- No aparece en Home

---

## 🎯 Objetivo

Activar el sistema de horóscopos en producción **solo cuando haya contenido real** generado por el sistema automatizado.

---

## 📦 Pasos de Activación

### Paso 1: Generar Contenido Inicial (CRÍTICO)

**Antes de activar cualquier cosa**, debe ejecutarse la primera generación:

```bash
# Opción A: Esperar a que cron ejecute automáticamente (próximo día 1:00 AM)

# Opción B: Ejecutar manualmente vía API
curl -X POST https://tu-dominio.vercel.app/api/cron/generate \
  -H "Authorization: Bearer TU_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"period": "daily"}'
```

**Verificar en Supabase que se generaron 48 horóscopos** (12 signos × 4 variantes):

```sql
SELECT 
  period, 
  variant_id, 
  COUNT(*) as total,
  COUNT(DISTINCT sign_slug) as signos
FROM horoscopes
WHERE date_for = CURRENT_DATE
  AND published_at IS NOT NULL
GROUP BY period, variant_id
ORDER BY period, variant_id;

-- Debe mostrar:
-- daily | 1 | 12 | 12
-- daily | 2 | 12 | 12
-- daily | 3 | 12 | 12
-- daily | 4 | 12 | 12
```

---

### Paso 2: Integrar Variantes en Loaders (Código)

#### 2.1 Modificar `horoscopo.hoy.tsx`

```typescript
// ANTES (loader actual - sin variantes)
loader: async () => {
  const entries = await listHoroscopesForCurrentPeriod("daily");
  return { entries };
}

// DESPUÉS (con soporte de variantes)
loader: async ({ request }) => {
  // Detectar usuario autenticado (opcional)
  const auth = await readOptionalAuth(request);
  
  // Obtener todas las variantes disponibles
  const allEntries = await listHoroscopesForCurrentPeriod("daily");
  
  // Agrupar por signo
  const entriesBySign = allEntries.reduce((acc, entry) => {
    if (!acc[entry.signSlug]) {
      acc[entry.signSlug] = [];
    }
    acc[entry.signSlug].push(entry);
    return acc;
  }, {} as Record<string, HoroscopeEntry[]>);
  
  return { 
    entriesBySign, 
    userId: auth?.userId || null,
    hasContent: allEntries.length >= 48 // 12 signos × 4 variantes
  };
}
```

#### 2.2 Actualizar Componente para Usar Variantes

```typescript
function Page() {
  const { entriesBySign, userId } = Route.useLoaderData();
  
  // Hook que asigna variante por signo
  const [selectedSign, setSelectedSign] = useState("aries");
  const { variantId } = useHoroscopeVariant(
    selectedSign, 
    "daily", 
    new Date().toISOString().split('T')[0]
  );
  
  // Obtener horóscopo con la variante correcta
  const signEntries = entriesBySign[selectedSign] || [];
  const selectedEntry = variantId 
    ? signEntries.find(e => e.variantId === variantId)
    : signEntries[0]; // Fallback
  
  return (
    <HoroscopePeriodPage 
      period="daily" 
      entry={selectedEntry}
      onSignChange={setSelectedSign}
    />
  );
}
```

**Aplicar lo mismo a**:
- `horoscopo.semana.tsx`
- `horoscopo.mes.tsx`
- `horoscopo.$sign.tsx`

---

### Paso 3: Crear Función de Verificación de Contenido

Crear `src/lib/horoscope/content-check.ts`:

```typescript
/**
 * Verifica si hay suficiente contenido para activar horóscopo públicamente.
 */
export async function checkHoroscopeReadiness(): Promise<{
  daily: boolean;
  weekly: boolean;
  monthly: boolean;
  all: boolean;
}> {
  const results = {
    daily: false,
    weekly: false,
    monthly: false,
    all: false,
  };

  try {
    // Verificar diario (debe tener 48 entradas: 12 signos × 4 variantes)
    const dailyEntries = await listHoroscopesForCurrentPeriod("daily");
    results.daily = dailyEntries.length >= 48;

    // Verificar semanal
    const weeklyEntries = await listHoroscopesForCurrentPeriod("weekly");
    results.weekly = weeklyEntries.length >= 48;

    // Verificar mensual
    const monthlyEntries = await listHoroscopesForCurrentPeriod("monthly");
    results.monthly = monthlyEntries.length >= 48;

    // All = todos los períodos tienen contenido
    results.all = results.daily && results.weekly && results.monthly;
  } catch (error) {
    console.error("Error checking horoscope readiness:", error);
  }

  return results;
}
```

---

### Paso 4: Activar Feature Flags

**Solo después de verificar que `checkHoroscopeReadiness().all === true`**:

#### 4.1 Actualizar `src/config/features.ts`

```typescript
export const featureFlags = {
  // ... otros flags
  horoscope: true, // ← Cambiar de false a true
} as const;
```

#### 4.2 Actualizar `src/config/public-features.ts`

```typescript
export const publicFeatureVisibility = {
  // ... otros
  horoscope: "enabled", // ← Cambiar de "hidden" a "enabled"
} as const;
```

---

### Paso 5: Activar en Home

#### 5.1 Modificar `src/routes/index.tsx`

Agregar sección de horóscopos después del hero:

```typescript
// Importar
import { HoroscopeHomeSection } from "@/components/horoscope/HoroscopeHomeSection";
import { checkHoroscopeReadiness } from "@/lib/horoscope/content-check";

// En loader
loader: async () => {
  const horoscopeReady = await checkHoroscopeReadiness();
  
  return {
    // ... otros datos
    showHoroscope: horoscopeReady.daily, // Mostrar solo si hay contenido diario
  };
}

// En componente
function HomePage() {
  const { showHoroscope } = Route.useLoaderData();
  
  return (
    <>
      <Hero />
      
      {showHoroscope && (
        <section className="py-16">
          <HoroscopeHomeSection />
        </section>
      )}
      
      {/* Resto del home */}
    </>
  );
}
```

#### 5.2 Crear Componente `HoroscopeHomeSection`

```typescript
// src/components/horoscope/HoroscopeHomeSection.tsx
import { zodiacSigns } from "@/data/zodiac-signs";
import { Link } from "@tanstack/react-router";
import { routes } from "@/config/routes";

export function HoroscopeHomeSection() {
  return (
    <div className="container mx-auto px-4">
      <h2 className="font-display text-3xl font-semibold text-ink mb-8">
        Horóscopo de hoy
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {zodiacSigns.map((sign) => (
          <Link
            key={sign.slug}
            to={routes.zodiacSign}
            params={{ sign: sign.slug }}
            className="p-4 bg-canvas-soft rounded-lg hover:bg-canvas-muted transition"
          >
            <div className="text-3xl mb-2">{sign.symbol}</div>
            <div className="font-semibold text-ink">{sign.name}</div>
            <div className="text-sm text-ink-soft">{sign.dateRange}</div>
          </Link>
        ))}
      </div>
      
      <div className="flex gap-4 justify-center">
        <Link
          to={routes.horoscopeToday}
          className="btn-primary"
        >
          Ver todos los signos
        </Link>
        <Link
          to={routes.horoscopeWeek}
          className="btn-secondary"
        >
          Horóscopo semanal
        </Link>
      </div>
    </div>
  );
}
```

---

### Paso 6: Actualizar Navegación

#### 6.1 Desktop Menu

Ya existe en el código, solo se activa cuando `featureFlags.horoscope === true`.

#### 6.2 Mobile Drawer

Ya existe, se activa automáticamente con el flag.

---

## ⚠️ Checklist Pre-Activación

Antes de cambiar los feature flags, verificar:

- [ ] ✅ Cron job ejecutó exitosamente al menos una vez
- [ ] ✅ Supabase tiene 48 horóscopos diarios (12 signos × 4 variantes)
- [ ] ✅ Todos tienen `published_at IS NOT NULL`
- [ ] ✅ Ninguno tiene `summary` vacío
- [ ] ✅ `checkHoroscopeReadiness().daily === true`
- [ ] ✅ Hook `useHoroscopeVariant` funciona correctamente
- [ ] ✅ API `/api/horoscope/assign-variant` responde OK
- [ ] ✅ localStorage guarda asignaciones para visitantes

**SQL de verificación**:

```sql
-- Verificar contenido completo
SELECT 
  COUNT(*) as total,
  COUNT(DISTINCT sign_slug) as signos_unicos,
  COUNT(DISTINCT variant_id) as variantes_unicas,
  MIN(LENGTH(summary)) as min_summary_length,
  COUNT(CASE WHEN published_at IS NULL THEN 1 END) as sin_publicar
FROM horoscopes
WHERE date_for = CURRENT_DATE;

-- Esperado:
-- total: 48
-- signos_unicos: 12
-- variantes_unicas: 4
-- min_summary_length: > 100
-- sin_publicar: 0
```

---

## 🚀 Secuencia de Activación Recomendada

### Día 1: Generación Inicial
1. Deploy del sistema de generación
2. Esperar primera ejecución de cron (1:00 AM)
3. Verificar en DB que se generaron 48 horóscopos

### Día 2: Testing Interno
4. Modificar loaders para soportar variantes
5. Actualizar componentes
6. Testing local: `npm run dev`
7. Verificar que variantes se asignan correctamente
8. Verificar que usuarios ven contenido personalizado

### Día 3: Soft Launch
9. Cambiar feature flags a `true`/`enabled`
10. Deploy a producción
11. Verificar rutas funcionan:
    - `/horoscopo`
    - `/horoscopo/hoy`
    - `/horoscopo/semana`
    - `/horoscopo/mes`
    - `/horoscopo/aries` (y otros 11 signos)

### Día 4: Activación en Home
12. Agregar `HoroscopeHomeSection` a Home
13. Deploy
14. Monitorear engagement

---

## 📊 Métricas Post-Activación

Monitorear:

- **Distribución de variantes**: ¿Las 4 variantes se asignan uniformemente?
- **Engagement por variante**: ¿Alguna variante retiene más?
- **Tasa de retorno**: ¿Los usuarios vuelven al día siguiente?
- **Errores 404**: ¿Hay signos sin contenido?

**Query útil**:

```sql
-- Distribución de asignaciones
SELECT 
  variant_id,
  COUNT(*) as assignments,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM user_horoscope_assignments) * 100, 2) as percentage
FROM user_horoscope_assignments
WHERE date_for >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY variant_id
ORDER BY variant_id;
```

---

## 🔄 Rollback Plan

Si algo falla después de activar:

1. **Desactivar feature flags inmediatamente**:
   ```typescript
   featureFlags.horoscope = false;
   publicFeatureVisibility.horoscope = "hidden";
   ```

2. **Deploy rápido**: `vercel --prod`

3. **Investigar**:
   - Logs de Vercel
   - Errores en Supabase
   - Reportes de usuarios

4. **Fix y re-activar** cuando esté resuelto

---

## 📝 Notas Importantes

- **NO activar** hasta tener contenido generado
- **Testing local** obligatorio antes de producción
- **Soft launch**: Considerar activar solo para usuarios beta primero
- **SEO**: Actualizar sitemap.xml cuando se active
- **Analytics**: Agregar tracking de eventos (ver variante, cambiar signo)

---

## ✅ Resumen Ejecutivo

**Estado actual**: Sistema backend listo, frontend requiere integración  
**Bloqueador**: Necesita primera generación de contenido (48 horóscopos)  
**Tiempo estimado de integración**: 4-6 horas  
**Riesgo**: Bajo (sistema puede revertirse con feature flags)

---

**Próximo paso**: Esperar a que cron genere el primer batch de horóscopos, luego proceder con integración frontend.
