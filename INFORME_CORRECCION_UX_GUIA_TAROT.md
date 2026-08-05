# Informe Correccion UX Guia Tarot

## Veredicto

APROBADO - ASISTENTE CONTEXTUAL REFINADO

## Diagnostico P1-P7

- P1 eleccionesivas: no aparece en codigo, seeds, fallback ni tests. Origen mas probable: salida puntual de IA. Se agrego guardrail al prompt para pedir espanol natural sin palabras truncadas, concatenadas o inventadas, y se explicito "elecciones afectivas" para Los Enamorados en amor.
- P2 copy absoluto: se encontro en `TarotContextualGuide.tsx` y en `tarot-fallback-generator.ts`. Se elimino "depende completamente".
- P3 etiqueta ambigua: "Energia de la carta" estaba en el panel. Se reemplazo por "Tendencia simbolica".
- P4 disclaimer duplicado: el panel repetia el aviso en el footer y la respuesta podia traer otro. Ahora el footer breve solo aparece antes de una respuesta; si hay respuesta, el aviso vive dentro del bloque estructurado.
- P5 jerarquia visual debil: la respuesta se formateaba como texto plano concatenado. Ahora se renderizan campos estructurados con cinco secciones.
- P6 preguntas rapidas excesivas: habia seis visibles. Ahora hay tres iniciales y tres secundarias bajo "Ver mas preguntas".
- P7 flujo post-respuesta: el formulario mantenia "Tu pregunta personalizada". Ahora cambia a "Haz otra pregunta sobre esta carta" y el boton a "Enviar nueva pregunta".

## Archivos Modificados

- `src/components/tarot/TarotContextualGuide.tsx`
- `src/routes/api/tarot/interpret.ts`
- `src/server/generation/tarot-fallback-generator.ts`
- `src/server/tarot/interpret.test.ts`
- `src/components/tarot/TarotContextualGuide.test.ts`
- `INFORME_CORRECCION_UX_GUIA_TAROT.md`

## Copy Anterior y Final

- Antes: "Energia de la carta"
- Ahora: "Tendencia simbolica"

- Antes: "El resultado depende completamente de tu intencion y tus acciones."
- Ahora: "Orientacion abierta: la carta no senala una unica direccion y debe leerse segun el contexto."

- Antes: respuesta como bloque de texto con etiquetas incrustadas.
- Ahora: "Mensaje principal", "Valor positivo", "Aspecto a vigilar", "Consejo practico" y "Pregunta de reflexion".

- Antes: "Interpretacion simbolica para reflexion personal." repetido en el panel.
- Ahora: "Orientacion simbolica para reflexion personal." como aviso breve sin duplicarse despues de respuesta.

## Estructura Visual Implementada

- Encabezado compacto con miniatura, carta, contexto y aviso de consultas limitadas.
- Tendencia simbolica en una linea compacta.
- Preguntas rapidas adaptativas: tres visibles, tres desplegables.
- Al escribir o seleccionar una sugerencia, se ocultan las preguntas rapidas.
- Formulario fijo al fondo del panel.
- Respuesta estructurada como protagonista, sin convertir el panel en chat general.

## Resultado de Pruebas

- `npx vitest run src/server/tarot/interpret.test.ts src/components/tarot/TarotContextualGuide.test.ts`: OK, 23 tests.
- `npx eslint src/components/tarot/TarotContextualGuide.tsx src/routes/api/tarot/interpret.ts src/server/generation/tarot-fallback-generator.ts src/server/tarot/interpret.test.ts src/components/tarot/TarotContextualGuide.test.ts`: OK.
- `npm run build`: OK.

## Resultado de TypeScript

`npx tsc --noEmit` sigue fallando por configuracion global/preexistente de tests con `vitest` fuera de tipos y otros errores del repositorio. En la verificacion filtrada no quedaron errores de los archivos de produccion tocados.

## Verificacion Movil y Escritorio

No se ejecuto Playwright ni captura visual automatizada. La verificacion aplicada fue por build, lint, tests de contrato/copy y revision del markup responsive del panel.

## Regresiones Encontradas

- No se detectaron regresiones en build.
- No se cambio Supabase, RLS, autenticacion, proveedor IA, rate limit ni endpoints nuevos.
- El endpoint conserva el contrato y solo agrega `responseMode` opcional ya validado por schema.

## Pendientes

- El indicador muestra "Consultas limitadas por dia"; para mostrar un numero real hacen falta metadatos de cuota en la respuesta del endpoint.
- Si se desea garantizar visualmente movil 375x812 y escritorio 1920x1080, falta una pasada con Playwright/capturas.
- El repositorio mantiene deuda de `tsc --noEmit` no relacionada con esta correccion.
