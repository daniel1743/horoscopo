# FASE 2A - PlanetaryEngine

## Proposito

PlanetaryEngine calcula posiciones eclipticas geocentricas tropicales para un instante absoluto. Devuelve datos matematicos reutilizables por AspectEngine sin interpretacion, contenido editorial, persistencia ni efectos secundarios.

## Ubicacion

- Contrato: `src/server/planetary/planetary-engine.ts`
- Implementacion: `src/server/planetary/astronomy-planetary-engine.ts`
- Matematica zodiacal: `src/server/planetary/zodiac-math.ts`
- Validacion portable: `scripts/check-planetary-engine.ts`

## Contrato publico

`PlanetaryEngine` expone:

- `calculatePosition(body, date)`
- `calculateSnapshot(date, bodies?)`

Cada posicion incluye `body`, `absoluteLongitude`, `sign`, `degreeInSign`, `isRetrograde`, `speedDegreesPerDay` y `calculatedAt`.

## Cuerpos soportados

Lista cerrada: `sun`, `moon`, `mercury`, `venus`, `mars`, `jupiter`, `saturn`, `uranus`, `neptune`, `pluto`.

No se incluyen asteroides, nodos, Lilith, casas, ascendente ni medio cielo.

## Precision y dependencia

La implementacion usa `astronomy-engine@2.1.19` mediante `Astronomy.GeoVector` y `Astronomy.Ecliptic` para obtener longitud ecliptica geocentrica aparente. Astronomy Engine recibe `Date` como instante absoluto; el modulo conserva `calculatedAt` en ISO UTC y no usa timezone ni locale implicitos.

## Normalizacion

Toda longitud se normaliza a `0 <= longitude < 360`. Los signos se asignan en doce segmentos tropicales de 30 grados siguiendo el orden reutilizado por `ZodiacSignKey`.

## Retrogradacion

`isRetrograde` se deriva de `speedDegreesPerDay < 0`. La velocidad se calcula con diferencia central de longitud geocentrica en una ventana de 12 horas antes y 12 horas despues del instante, usando delta angular firmado para manejar cruces 359 -> 0.

## Errores

`PlanetaryEngineError` cubre fecha invalida, cuerpo no soportado, resultado no finito, fallo de Astronomy Engine e incumplimiento de contrato.

## Server-only

El modulo vive bajo `src/server/planetary` y no debe importarse desde componentes, rutas cliente ni loaders isomorficos. La integracion futura debe pasar por server functions.

## Consumo por AspectEngine

AspectEngine podra consumir `PlanetarySnapshot.positions` para comparar longitudes absolutas, velocidades y retrogradacion. Fase 2A no calcula aspectos, orbes ni interpretaciones.
