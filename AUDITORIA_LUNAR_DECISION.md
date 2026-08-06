# Auditoría Mínima: Tu Luna de Hoy

## Decisión

**Estado**: VIABLE CON PIEZAS FALTANTES

**Preparación técnica verificable**: 62.5%

## Evidencia

| Capacidad | Estado | Ruta | Prueba | Sirve |
|-----------|--------|------|--------|-------|
| Luna actual | IMPLEMENTADO | `src/server/moon/astronomy-moon-engine.ts` | Contrato MoonEngine verificado | ✅ SÍ |
| Luna natal | IMPLEMENTADO | `src/server/planetary/astronomy-planetary-engine.ts` | Moon en PLANETARY_BODIES | ✅ SÍ |
| Comparación Luna actual/natal | IMPLEMENTADO | `src/server/aspects/aspect-engine.ts` | Firma calculateAspects verificada | ✅ SÍ |
| DeepSeek estructurado | IMPLEMENTADO | `src/lib/ai/gateway.server.ts` | Provider deepseek detectado | ✅ SÍ |
| Formulario natal | NO EXISTE | - | No encontrado | ❌ NO |
| Persistencia natal | IMPLEMENTADO | `src/integrations/supabase/types.ts` | Campos birth_* en profiles | ✅ SÍ |
| Política hora desconocida | NO EXISTE | - | No implementado | ❌ NO |
| Zona horaria | PARCIAL | `src/lib/moon/timezone.ts` | Utils básicos existen | ⚠️ PARCIAL |

**Cálculo**: 5 completos (5pts) + 1 parcial (0.25pts) / 8 = 62.5%

## Respuestas Decisivas

### 1. MoonEngine
- **¿Devuelve longitud lunar?**: ❌ NO DIRECTAMENTE
- **Evidencia**: `MoonSnapshot` tiene `phase_angle_degrees`, `phase_key`, `illumination_fraction`, NO tiene `longitude` o `zodiac_sign`
- **Resultado**: ⚠️ **LIMITACIÓN CRÍTICA** - MoonEngine NO expone longitud eclíptica

### 2. PlanetaryEngine
- **¿Calcula Luna natal?**: ✅ SÍ
- **Evidencia**: 
  - `PLANETARY_BODIES = ["sun", "moon", "mercury"...]`
  - `calculatePosition(body: PlanetaryBody, date: Date): PlanetaryPosition`
  - `PlanetaryPosition` incluye `absoluteLongitude: number`
- **Resultado**: ✅ **FUNCIONA** - Puede calcular Luna en cualquier fecha

### 3. AspectEngine
- **¿Compara Luna actual y natal?**: ✅ SÍ
- **Evidencia**:
  - `calculateAspects(positions: readonly AspectInputPosition[])`
  - Acepta array de posiciones de fechas arbitrarias
  - Devuelve aspectos con orbes configurables
- **Resultado**: ✅ **FUNCIONA** - Puede comparar dos Lunas de fechas distintas

### 4. DeepSeek
- **¿Admite salida estructurada?**: ✅ PROBABLE
- **Evidencia**:
  - `resolveAiProvider()` detecta "deepseek" o "lovable"
  - Gateway existente en `src/lib/ai/gateway.server.ts`
  - Usado en generación de horóscopos
- **Resultado**: ✅ **REUTILIZABLE** - Infraestructura IA funcional

### 5. Datos Natales
- **¿Existe formulario?**: ❌ NO
- **¿Existe persistencia?**: ✅ SÍ
- **¿Existe zona horaria?**: ✅ SÍ
- **Evidencia**:
  - Tabla `profiles` con: `birth_date`, `birth_time`, `birth_time_status`, `birth_timezone`, `birth_city`, etc.
  - NO encontrados formularios de entrada en `/routes`
  - Utils timezone en `src/lib/moon/timezone.ts`

## Lo Que Falta Exactamente

1. **MoonEngine NO expone longitud eclíptica** ⚠️ CRÍTICO
   - `MoonSnapshot` solo tiene `phase_angle_degrees`
   - **Solución**: Usar `PlanetaryEngine.calculatePosition("moon", date)` para Luna actual

2. **Función wrapper `calculateNatalMoon()`** ❌
   - Debe llamar `PlanetaryEngine.calculatePosition("moon", birthDate)`
   - Manejar hora conocida/desconocida

3. **Estrategia hora desconocida** ❌
   - Calcular rango 00:00-23:59 día local
   - Comparar signos lunares

4. **Formulario de entrada datos natales** ❌
   - UI para fecha, hora, lugar
   - Validación

5. **Ruta `/luna/tu-luna-de-hoy`** ❌
   - Página de lectura personalizada

6. **Prompt específico lectura lunar** ❌
   - Template DeepSeek con datos calculados

7. **Caché por usuario** ❌
   - Sistema existente es global, necesita key por usuario

## Siguiente Paso Único Recomendado

**Crear función `calculateNatalMoon()` en 50 líneas** que:
1. Llame `PlanetaryEngine.calculatePosition("moon", birthDate)`
2. Maneje hora desconocida calculando inicio/fin día
3. Compare signos lunares si hora ausente
4. Devuelva `{ position, confidence }`

**Workaround para Luna actual**: Usar `PlanetaryEngine.calculatePosition("moon", new Date())` en lugar de `MoonEngine.getSnapshot()` para obtener longitud eclíptica.

## Comandos Ejecutados

| Comando | Exit code | Resultado |
|---------|-------:|-----------|
| grep MoonEngine exports | 0 | `astronomyMoonEngine` encontrado |
| grep PlanetaryEngine exports | 0 | `astronomyPlanetaryEngine` encontrado |
| grep moon in PLANETARY_BODIES | 0 | "moon" confirmado |
| grep AspectEngine calculateAspects | 0 | Firma verificada |
| grep DeepSeek provider | 0 | deepseek detectado |
| grep birth_date in types | 0 | Campos birth_* en profiles |
| grep longitude in MoonSnapshot | 1 | ❌ NO encontrado |
| search birth forms in routes | 1 | ❌ NO encontrado |
| npm test moon-engine | 1 | Script test no existe |
