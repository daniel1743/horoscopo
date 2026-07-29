# Informe Ejecutivo Codex Correccion 2A

## Resumen ejecutivo

Se corrigio el calculo de `speedDegreesPerDay` de PlanetaryEngine reemplazando la ventana global de +/-12h por ventanas especificas por cuerpo. La correccion afecta solo la derivada usada para velocidad e `isRetrograde`; no modifica `absoluteLongitude`, contratos ni snapshots.

Estado final: LISTO_PARA_CLINE.

## Causa del defecto

La ventana fija de +/-12h suavizaba demasiado la derivada cerca de estaciones planetarias. En Mercurio, el caso `2024-12-15T21:00:00.000Z` quedaba clasificado como retrogrado por una velocidad negativa residual, aunque la ventana local de +/-1h muestra movimiento directo.

## Archivos modificados

- `src/server/planetary/astronomy-planetary-engine.ts`
- `src/server/planetary/planetary-engine.test.ts`
- `documentacion/md-pendientes/PENDIENTES_ANTES_DE_DESPLEGAR.md`
- `documentacion/fase-2a/INFORME_EJECUTIVO_CODEX_CORRECCION_2A.md`

## Algoritmo implementado

Se agrego `SPEED_SAMPLE_HOURS_BY_BODY: Record<PlanetaryBody, number>`:

- Sol: +/-6h
- Luna: +/-1h
- Mercurio: +/-1h
- Venus: +/-2h
- Marte: +/-3h
- Jupiter: +/-6h
- Saturno: +/-6h
- Urano: +/-12h
- Neptuno: +/-12h
- Pluton: +/-12h

`calculateSpeedDegreesPerDay` conserva diferencia central, `signedLongitudeDelta` y normalizacion de cruces 359->0. `calculateLongitude` y `absoluteLongitude` no cambiaron.

## Pruebas agregadas

- Caso critico Mercurio `2024-12-15T21:00:00.000Z` directo.
- Mercurio retrogrado estable y directo estable.
- Pruebas directas de `signedLongitudeDelta`, incluidos 359->1 y 1->359.
- Correccion del test tautologico de signo previo zodiacal.
- Sol y Luna directos en 30 fechas distribuidas.
- Casos internos no JPL de retrogradacion para Marte, Jupiter y Saturno.
- Urano, Neptuno y Pluton con velocidades finitas y deterministas.
- Determinismo de cuerpo+fecha.
- Coincidencia entre posicion puntual y snapshot.
- Regresion de `absoluteLongitude` para snapshot de referencia.
- Fechas invalidas y cuerpos invalidos.

## Resultados y exit codes

- `bun scripts/check-planetary-engine.ts`: exit 1, `bun` no esta instalado en esta maquina.
- `npx --yes tsx scripts/check-planetary-engine.ts`: exit 0.
- `npx eslint src/server/planetary/astronomy-planetary-engine.ts src/server/planetary/planetary-engine.test.ts scripts/check-planetary-engine.ts`: exit 0.
- `npx tsc --noEmit`: exit 1 por errores preexistentes no relacionados.
- `npm run build`: exit 0.
- `rg "from ['\"](.*planetary.*|astronomy-engine)['\"]|import .*['\"](.*planetary.*|astronomy-engine)['\"]" src --glob '!src/server/planetary/**'`: exit 1, sin imports cliente de PlanetaryEngine ni `astronomy-engine`.
- `rg "astronomy-engine|GeoVector|planetary-engine" .output/public`: exit 0 solo por texto editorial visible en `luna.hoy`; sin codigo/import de PlanetaryEngine.
- `git diff --check`: exit 0.

## Comparacion antes/despues Mercurio

- Antes, con ventana global +/-12h: aproximadamente `speedDegreesPerDay = -0.000287`, `isRetrograde = true`.
- Despues, con ventana Mercurio +/-1h: `speedDegreesPerDay = 0.00020267471882107202`, `isRetrograde = false`.
- `absoluteLongitude` del caso critico despues: `246.39624697210218`.

## Confirmacion de absoluteLongitude

El snapshot `2024-06-21T12:00:00.000Z` conserva las longitudes absolutas de referencia capturadas antes de la correccion:

- Sol `90.60209009934113`
- Luna `263.7444333426423`
- Mercurio `98.8232275608488`
- Venus `95.20364813031392`
- Marte `39.07137378311819`
- Jupiter `66.12156312886327`
- Saturno `349.3686761674396`
- Urano `55.267092115685955`
- Neptuno `359.90266361387705`
- Pluton `301.5756110904715`

## Errores preexistentes encontrados

TypeScript global falla fuera del alcance de PlanetaryEngine en componentes y rutas existentes:

- Tipos de `Link`/`to` para rutas dinamicas de Luna y Tarot.
- Rutas configuradas como `/astrologia/carta-natal` no presentes en el union type generado.
- Navegaciones a `/auth` sin parametro `mode` requerido.

No hay errores TypeScript reportados en los archivos modificados de PlanetaryEngine.

## Pendientes no bloqueantes

`PEND-ASTRAL-001` queda ABIERTO y NO_BLOQUEANTE en `documentacion/md-pendientes/PENDIENTES_ANTES_DE_DESPLEGAR.md`: certificacion externa de posiciones planetarias contra JPL Horizons, obligatoria antes del despliegue, con 20 fixtures reales, respuestas crudas, SHA-256, compatibilidad de coordenadas y eliminacion definitiva de fixtures contaminados.

Este pendiente no bloquea AspectEngine y no se declara resuelto.

## Diff stat

`git diff --stat` sobre archivos trackeados modificados de PlanetaryEngine:

```text
src/server/planetary/astronomy-planetary-engine.ts |  19 ++-
src/server/planetary/planetary-engine.test.ts      | 173 ++++++++++++++++++++-
2 files changed, 187 insertions(+), 5 deletions(-)
```

Archivos documentales no trackeados en esta rama de trabajo:

- `documentacion/md-pendientes/PENDIENTES_ANTES_DE_DESPLEGAR.md`
- `documentacion/fase-2a/INFORME_EJECUTIVO_CODEX_CORRECCION_2A.md`

Cambios principales:

- `src/server/planetary/astronomy-planetary-engine.ts`: constante tipada de ventanas por cuerpo y uso en velocidad.
- `src/server/planetary/planetary-engine.test.ts`: ampliacion de checks reproducibles.
- `documentacion/md-pendientes/PENDIENTES_ANTES_DE_DESPLEGAR.md`: ajuste de PEND-ASTRAL-001.
- `documentacion/fase-2a/INFORME_EJECUTIVO_CODEX_CORRECCION_2A.md`: informe ejecutivo.

## Confirmaciones

- No se modifico `PlanetaryPosition`.
- No se modifico `PlanetaryEngine`.
- No se modifico `absoluteLongitude`.
- No se agrego `isStationary`.
- No se modifico MoonEngine.
- No se inicio AspectEngine.
- No se hizo commit, push ni PR.
