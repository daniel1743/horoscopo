# Informe: sintesis fallback de Tirada de Amor

Fecha: 2026-08-04

## Causa exacta

La filtracion venia de usar campos editoriales internos como texto visible.

Fuentes confirmadas:

- `src/lib/tarot/synthesis-generator.ts`
  - `guidance` usaba `pos3.interpretationFocus.toLowerCase()`.
  - Ese campo contiene reglas internas como "sin ordenar terminar, reconciliarse, insistir...".
- `src/routes/api/tarot/interpret-reading.ts`
  - `buildFallbackReading()` ponia `config.positions[i].interpretationFocus` en `practicalFocus`.
  - `buildReadingPrompt()` entregaba `interpretationFocus` y `synthesisInstructions` a la IA; si la IA los repetia, no habia sanitizacion antes de validar/responder.
- `src/components/tarot/experience/InteractiveThreeCardResult.tsx`
  - El titulo visible agregaba "guia programada" cuando `source === "fallback"`.

## Correccion aplicada

### Generador fallback

Archivo: `src/lib/tarot/synthesis-generator.ts`

- Se reemplazo la sintesis generica por una narrativa determinista que conecta:
  - carta 1: punto de partida emocional
  - carta 2: dinamica actual
  - carta 3: orientacion concreta
- Usa nombres de cartas, keywords, significados upright y categorias editoriales simples.
- Ya no imprime `interpretationFocus` ni `synthesisInstructions`.
- Se agrego `sanitizeTarotUserFacingText()`.

### Sanitizacion server-side

Archivo: `src/routes/api/tarot/interpret-reading.ts`

- Se sanea la respuesta de IA antes de pasar por schema.
- Se sanea el fallback completo.
- `practicalFocus` del fallback ahora usa descripcion publica de posicion, no reglas internas.
- Se elimino el `any` del parseo de IA con tipos `ParsedAIReading` y `ParsedAIPosition`.

### Interfaz

Archivo: `src/components/tarot/experience/InteractiveThreeCardResult.tsx`

- El titulo visible queda siempre como `Sintesis de la lectura`.
- `source=fallback` se mantiene como metadata, no como copy principal visible.

## Pruebas agregadas

Archivo: `src/config/three-card-readings.test.ts`

Casos cubiertos:

- No exponer `interpretationFocus`.
- No exponer `synthesisInstructions`.
- No exponer "sin ordenar terminar".
- No exponer "no afirmar sentimientos".
- No duplicar puntuacion.
- Mencionar las tres cartas.
- Mostrar progresion entre cartas.
- Pregunta reflexiva con un solo signo final.
- Determinismo con la misma combinacion.
- Cambios de patron con combinaciones distintas.

## Validacion

Comandos ejecutados:

```bash
npx vitest run src/config/three-card-readings.test.ts src/routes/api/tarot/interpret-reading.test.ts
npx eslint src/lib/tarot/synthesis-generator.ts src/config/three-card-readings.test.ts src/routes/api/tarot/interpret-reading.ts src/components/tarot/experience/InteractiveThreeCardResult.tsx
npm run build
```

Resultado:

- Tests relacionados: OK, 36 tests.
- ESLint acotado: OK.
- Build: OK.

`npm run lint` completo fue ejecutado dos veces, con limites de 120s y 240s. En ambos casos excedio el tiempo sin emitir errores. No se toma como fallo funcional de esta correccion; queda como limitacion operativa del lint completo en este entorno.

Advertencias no bloqueantes observadas:

- `vite-tsconfig-paths` deprecado frente a `resolve.tsconfigPaths`.
- `src/routes/api/tarot/interpret-reading.test.ts` no exporta `Route`.
- `createServerFn().inputValidator()` deprecado en archivos existentes.

## Veredicto

APROBADO - FALLBACK NATURAL Y SEGURO

No se modifico Supabase, RLS, proveedor IA, seleccion de cartas, contratos publicos, Git ni deploy.
