# Informe Ejecutivo Codex Fase 2B

## Resumen ejecutivo

Se cerro AspectEngine incorporando la politica oficial de orbes aprobada por Daniel el 2026-07-28 y manteniendo soporte para politicas personalizadas inyectadas. El motor queda server-only, determinista y desacoplado: consume posiciones de PlanetaryEngine, calcula aspectos angulares, clasifica fase de movimiento y devuelve datos puros serializables.

Correccion 2B.2: se resolvio `BLOCKER-2B-PHASE-CROSSING`, donde la clasificacion por proyeccion fija a una hora podia marcar `separating` aunque el aspecto se perfeccionara antes de esa medicion futura.

Estado: LISTO_PARA_CLINE.

## Fuentes documentales utilizadas como autoridad

- `AGENTS.md`: no reescribir historia publicada de Lovable.
- `documentacion/gobierno-y-roadmap/01_ARCHITECTURE_IMMUTABLE.md`: separacion cliente/servidor y astronomia server-only.
- `documentacion/gobierno-y-roadmap/07_DEFINITION_OF_DONE.md`: criterios de build, TypeScript, ESLint, pruebas, documentacion y server-only.
- `documentacion/automatizacion-fase-2a-planetary-engine.md`: AspectEngine debe consumir `PlanetarySnapshot.positions`; Fase 2A no calcula aspectos, orbes ni interpretaciones.
- `documentacion/automatizacion-fase-1/12_DECISIONES_PENDIENTES.md`: matriz de orbes resuelta por Daniel el 2026-07-28.
- `documentacion/gobierno-y-roadmap/10_MASTER_DECISION_LOG.md`: ADR-008 registra la politica oficial de orbes como convencion astrologica configurable.

No se usaron documentos marcados `OBSOLETO`.

## Reglas de aspectos y orbes aplicadas

Aspectos soportados:

- `conjunction`: 0 grados.
- `sextile`: 60 grados.
- `square`: 90 grados.
- `trine`: 120 grados.
- `opposition`: 180 grados.

Politica oficial por defecto:

- `conjunction`: 8 grados.
- `sextile`: 4 grados.
- `square`: 6 grados.
- `trine`: 6 grados.
- `opposition`: 8 grados.

La politica oficial vive centralizada en `DEFAULT_ASPECT_ORB_POLICY`, esta congelada con `Object.freeze`, y se documenta como convencion astrologica/editorial de Proyecto Astral, no como constante cientifica universal. `calculateAspects` y `calculateSnapshotAspects` aceptan una politica personalizada opcional que reemplaza la predeterminada.

Matematica:

- Separacion angular: `min(abs(longitudeA - longitudeB), 360 - abs(longitudeA - longitudeB))`.
- Desviacion: `abs(separation - exactAngle)`.
- Coincidencia: `deviation <= allowedOrb`.

Seleccion cuando una politica permite mas de un aspecto:

- Se devuelve un solo aspecto por par.
- Gana la menor desviacion (`orb`).
- En empate, se usa el orden estable `conjunction`, `sextile`, `square`, `trine`, `opposition`.

## Algoritmo de movimiento

Campo de salida: `phase`, con valores `applying`, `exact`, `separating` o `stationary`.

Reglas:

- Si `orb <= 0.1° + epsilon`, `phase = exact`.
- Se calcula `relativeLongitude = signedLongitudeDelta(right.absoluteLongitude, left.absoluteLongitude)`.
- Se calcula `relativeSpeed = left.speedDegreesPerDay - right.speedDegreesPerDay`.
- Para conjuncion se evalua objetivo `0°`.
- Para oposicion se evalua objetivo `180°`, tratando `+180°` y `-180°` como equivalentes por matematica circular.
- Para sextil, cuadratura y trigono se evaluan los objetivos simetricos `+angulo` y `-angulo`.
- Se selecciona el objetivo que produce el error firmado circular de menor magnitud.
- `signedError = signedLongitudeDelta(targetAngle, relativeLongitude)`.
- Si `abs(relativeSpeed)` es numericamente despreciable, `phase = stationary`.
- Si `signedError * relativeSpeed < 0`, `phase = applying`.
- Si `signedError * relativeSpeed > 0`, `phase = separating`.
- Si el producto queda dentro de epsilon y no esta exacto, `phase = stationary`.

Constantes:

- `EXACT_ASPECT_PHASE_TOLERANCE_DEGREES = 0.1`.
- `ASPECT_PHASE_EPSILON_DEGREES = 1e-9`.

El algoritmo usa solo `absoluteLongitude`, `speedDegreesPerDay` y `signedLongitudeDelta`. No proyecta una ventana fija, no llama `astronomy-engine`, no usa fecha actual y no recalcula posiciones.

Caso bloqueante corregido:

- Luna `359.85°`, `14.4°/dia`; Sol `0°`, `0°/dia`; conjuncion: antes podia salir `separating`; ahora sale `applying`.

## Arquitectura implementada

- `src/server/aspects/aspect-engine.ts`
  - Contrato `AspectEngine`.
  - Tipos `AspectType`, `AspectPhase`, `AspectOrbPolicy`, `AspectInputPosition`, `PlanetaryAspect`.
  - Constantes `ASPECT_TYPES`, `ASPECT_EXACT_ANGLES`, `DEFAULT_ASPECT_ORB_POLICY`.
  - Funcion pura `angularSeparation`.
  - Implementacion `deterministicAspectEngine`.
  - Errores tipados `AspectEngineError`.

El motor:

- No importa `astronomy-engine`.
- No recalcula posiciones planetarias.
- Reutiliza `normalizeLongitude` desde `src/server/planetary/zodiac-math.ts`.
- No modifica `PlanetaryEngine`, `PlanetaryPosition`, `PlanetarySnapshot`, MoonEngine, UI, rutas, Supabase ni contenido editorial.
- No introduce estado mutable, aleatoriedad, fecha actual ni llamadas externas.

## Archivos creados y modificados

Creados:

- `src/server/aspects/aspect-engine.ts`
- `src/server/aspects/aspect-engine.test.ts`
- `scripts/check-aspect-engine.ts`
- `documentacion/fase-2b/INFORME_EJECUTIVO_CODEX_FASE_2B.md`

Modificados:

- `documentacion/automatizacion-fase-1/12_DECISIONES_PENDIENTES.md`
- `documentacion/gobierno-y-roadmap/10_MASTER_DECISION_LOG.md`

## Pruebas agregadas

`src/server/aspects/aspect-engine.test.ts` cubre:

- Politica predeterminada exacta: 8, 4, 6, 6, 8.
- Uso automatico de `DEFAULT_ASPECT_ORB_POLICY`.
- Politica personalizada opcional.
- Politica incompleta, negativa, NaN e infinita.
- Politica oficial congelada y no mutable accidentalmente.
- Separacion 359 y 1 = 2.
- Separacion 1 y 359 = 2.
- Separacion maxima 0 y 180 = 180.
- Simetria matematica.
- Conjuncion, sextil, cuadratura, trigono y oposicion exactos.
- Dentro del orbe, exactamente en el limite y fuera por diferencia pequena.
- `phase`: applying, separating, exact y stationary.
- Caso adversarial `BLOCKER-2B-PHASE-CROSSING`: Luna `359.85°` aplicando a conjuncion con Sol `0°`.
- Caso espejo: Luna `0.15°` separandose de conjuncion con Sol `0°`.
- Cruces 359->0 y 0->359.
- Aplicacion hacia oposicion y separacion desde oposicion.
- Caso con planeta retrogrado y caso con ambos planetas directos.
- Determinismo de fase e invariancia matematica al intercambiar A/B.
- Entradas invalidas, longitudes no finitas y cuerpo repetido.
- Cuerpo invalido runtime `earth` rechazado con `AspectEngineError`.
- Snapshot vacio y snapshot de un cuerpo.
- Cantidad de pares `n*(n-1)/2`.
- Sin pares duplicados A-B/B-A.
- Determinismo y orden estable.
- Consumo de un `PlanetarySnapshot` real sin modificar `absoluteLongitude`.

## Comandos ejecutados y exit codes

- `git status --short`: exit 0 antes de cierre, solo archivos no trackeados de Fase 2B.
- `npx --yes tsx scripts/check-aspect-engine.ts`: exit 0.
- `npx --yes tsx scripts/check-planetary-engine.ts`: exit 0.
- `npx eslint src/server/aspects/aspect-engine.ts src/server/aspects/aspect-engine.test.ts scripts/check-aspect-engine.ts`: exit 0.
- `npx tsc --noEmit`: exit 1, emitiendo errores preexistentes fuera de AspectEngine.
- `npm run build`: exit 0.
- `rg "from ['\"](.*aspects.*|astronomy-engine)['\"]|import .*['\"](.*aspects.*|astronomy-engine)['\"]" src --glob '!src/server/aspects/**' --glob '!src/server/planetary/**' --glob '!src/server/moon/**'`: sin imports cliente.
- `rg "aspect-engine|deterministicAspectEngine|angularSeparation|astronomy-engine|GeoVector" .output/public`: solo texto editorial `astronomy-engine` en `luna.hoy`; sin AspectEngine ni imports de astronomy-engine.
- `rg "astronomy-engine" src/server/aspects scripts/check-aspect-engine.ts`: sin imports directos.
- `git diff --check`: exit 0.

## Resultado del build

`npm run build` pasa con exit 0. El bundle cliente no contiene AspectEngine. `astronomy-engine` aparece en bundle SSR, no en cliente; en `.output/public` solo aparece como texto descriptivo de la pagina lunar.

## Confirmacion de regresion de PlanetaryEngine

`npx --yes tsx scripts/check-planetary-engine.ts` pasa con exit 0. No se modificaron archivos de PlanetaryEngine.

## Confirmacion server-only

AspectEngine vive en `src/server/aspects/`. No hay imports desde codigo cliente. No usa UI, Supabase, IA ni `astronomy-engine`.

## Errores preexistentes

`npx tsc --noEmit` agota timeout tras emitir errores existentes de TanStack Router fuera del alcance:

- Rutas configuradas como `/astrologia/carta-natal` no presentes en el union type generado.
- Navegaciones a `/auth` sin parametro `mode` requerido.
- Links dinamicos de Luna y Tarot no asignables al tipo de rutas generado.

No hay errores TypeScript reportados en `src/server/aspects/`.

## Pendientes bloqueantes y no bloqueantes

Bloqueantes de Fase 2B: ninguno.

Resuelto:

- Matriz oficial de orbes astrologicos: aprobada por Daniel el 2026-07-28 y registrada en `12_DECISIONES_PENDIENTES.md` y `10_MASTER_DECISION_LOG.md`.

No bloqueantes:

- `PEND-ASTRAL-001` sigue abierto: certificacion externa JPL de posiciones planetarias antes del despliegue. No bloquea AspectEngine.

## git diff --stat

Los archivos nuevos de Fase 2B estan no trackeados hasta que se decida commit; `git diff --stat` solo muestra archivos ya trackeados modificados.

Archivos nuevos:

```text
scripts/check-aspect-engine.ts
src/server/aspects/aspect-engine.ts
src/server/aspects/aspect-engine.test.ts
documentacion/fase-2b/INFORME_EJECUTIVO_CODEX_FASE_2B.md
```

Archivos trackeados modificados:

```text
documentacion/automatizacion-fase-1/12_DECISIONES_PENDIENTES.md
documentacion/gobierno-y-roadmap/10_MASTER_DECISION_LOG.md
```

## Confirmaciones

- No hubo commit.
- No hubo push.
- No hubo PR.
- No se recuperaron stashes ni ramas forenses.
- No se modifico PlanetaryEngine ni MoonEngine.
- No se implemento interpretacion astrologica textual.
- No se implemento TransitEngine.
- No se implemento IA, scheduler, cron, UI, Supabase ni fixtures JPL.
