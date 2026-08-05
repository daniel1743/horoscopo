# Auditoria UI/UX Premium - Creovision

Fecha: 2026-08-04
Alcance: producto publico actual, sin modificar codigo, Supabase, rutas, Git ni deploy.

## Resumen ejecutivo

Creovision ya comunica mejor su producto publico reducido: Tarot, Luna y Guias. En desktop la primera impresion es clara y visualmente fuerte. Sin embargo, no alcanza todavia un nivel premium consistente porque la experiencia movil tiene fallos graves de responsive, marca inconsistente y breadcrumbs duplicados. El flujo principal de Tarot de Amor tambien presenta un estado de carga pobre y una pantalla casi vacia durante la consulta de baraja.

Veredicto: CORRECCION REQUERIDA - PROBLEMAS P0.

## Evidencia visual

- `audit-ui-screenshots/home-1440.png`
- `audit-ui-screenshots/home-390.png`
- `audit-ui-screenshots/tarot-1440.png`
- `audit-ui-screenshots/tarot-390.png`
- `audit-ui-screenshots/tarot-daily-1440.png`
- `audit-ui-screenshots/tarot-love-390.png`

Nota: Playwright no pudo descargar Chromium por error TLS de certificado. Se usaron capturas con Chrome local en modo headless. Algunos lotes se cortaron por timeout, por eso la evidencia visual completa debe repetirse antes de aprobacion final.

## Puntuaciones

- Primera impresion: 7/10
- Claridad: 7/10 desktop, 4/10 mobile
- Navegacion: 6/10
- Calidad visual: 7/10 desktop, 4/10 mobile
- Coherencia: 5/10
- Accesibilidad: 5/10
- Mobile: 3/10
- Confianza: 6/10
- Aceptabilidad general: 5/10

## Primeros 5, 10 y 30 segundos

5 segundos: En desktop se entiende que es una experiencia de tarot/luna con tono editorial. En mobile aparece "Astral" en vez de "Creovision", y el H1 se corta, por lo que la comprension baja de inmediato.

10 segundos: El CTA "Sacar una carta" se entiende y parece accion principal. "Explorar tiradas" funciona como alternativa. En mobile ambos botones aparecen claros, pero el corte horizontal hace que la pantalla parezca rota.

30 segundos: En desktop se descubre Tarot, Luna y Guias. En mobile el usuario detecta barra inferior, pero el contenido queda desplazado/cortado y hay riesgo alto de abandono por falta de pulido.

## Hallazgos P0

1. Texto cortado horizontalmente en mobile
- Evidencia: `home-390.png`, `tarot-390.png`, `tarot-love-390.png`.
- Impacto: La app parece rota. El usuario no puede leer el H1 ni subtitulos completos.
- Causa probable: H1 con `tracking-[-0.03em]`, `maxWidth: "18ch"` y contenedores/sections que no contienen overflow real. Revisar `src/components/home/HomeHero.tsx` y `src/components/layout/Container.tsx`.
- Recomendacion: eliminar tracking negativo en mobile, usar `text-wrap: balance` con `overflow-wrap: anywhere` donde aplique, asegurar `max-width: 100%`, y validar sin scroll horizontal a 375/390/430 px.

2. Marca inconsistente en mobile
- Evidencia: desktop muestra "Creovision"; mobile muestra "Astral".
- Archivo probable: `src/config/site.ts`, `src/components/layout/MobileTopbar.tsx`.
- Impacto: reduce confianza y hace parecer que se mezclaron productos.
- Recomendacion: usar "Creovision" tambien en mobile o definir una abreviatura reconocible como "Creo" solo si existe identidad aprobada.

3. Breadcrumb duplicado
- Evidencia: `tarot-1440.png` y `tarot-390.png`: "Inicio > Inicio > Tarot".
- Causa probable: `AppBreadcrumbs` ya agrega Inicio y varias paginas tambien pasan Inicio manualmente.
- Archivo probable: `src/components/layout/AppBreadcrumbs.tsx`, paginas en `src/pages/tarot/*`, `src/pages/editorial/*`.
- Impacto: detalle poco profesional y ruido cognitivo.
- Recomendacion: una sola fuente para Inicio. O el componente lo agrega siempre, o las paginas lo pasan, pero no ambos.

4. Tirada de Amor en mobile queda en estado casi vacio
- Evidencia: `tarot-love-390.png`.
- Impacto: el usuario ve "Consultando la baraja..." al fondo de una pantalla vacia, sin skeleton rico ni progreso claro.
- Archivo probable: `src/components/tarot/experience/ThreeCardLoveExperienceShell.tsx`, `src/components/tarot/TarotSkeleton.tsx`.
- Recomendacion: loader compacto dentro de una superficie visible, con 2-3 lineas contextuales y skeleton parecido al estado final. Evitar min-height excesivo antes de que haya contenido.

## Hallazgos P1

1. Home desktop fuerte, pero hero depende demasiado de una ilustracion SVG generica. Se siente premium, pero no revela producto real.
2. El CTA "Sacar una carta" podria explicitar "Carta del dia" para alinear expectativa.
3. Tarot hub explica las opciones, pero todas las tarjetas tienen peso visual similar. No hay recomendacion clara para usuario nuevo.
4. Breadcrumbs en mobile ocupan espacio valioso y agregan ruido; se deberian simplificar o ocultar en primer nivel.
5. La bottom nav muestra parte de un item cortado al borde derecho en mobile, senal de overflow o distribucion incorrecta.
6. Busqueda esta oculta tras icono sin texto en desktop; aceptable, pero el producto depende de descubrimiento y podria mejorar con tooltip/foco.
7. La experiencia de carga en Tarot usa texto generico y verticalidad excesiva.

## Hallazgos P2

1. El tono visual alterna entre misticismo editorial oscuro y parchment claro; funciona, pero falta una regla de uso mas estricta por tipo de pantalla.
2. Hay radios y sombras de tarjetas con variaciones heredadas.
3. Algunos textos son correctos pero largos para mobile.
4. Los iconos se ven consistentes en general, pero conviene auditar que todos pasen por el componente central `Icon`.
5. La Home puede sufrir fatiga si mantiene demasiadas secciones despues del hero; priorizar Tarot, Luna y Guias.

## Navegacion

Desktop:
- Clara y reducida: Tarot, Luna, Guias.
- Buena decision esconder cuenta si no esta lista.
- Problema: dropdowns pueden parecer pequenos/desbalanceados frente al hero, pero no bloquea.

Mobile:
- P0 por marca "Astral".
- Bottom nav ayuda, pero requiere verificar que no corte items.
- Drawer no fue capturado por limite de herramienta; debe revisarse manualmente.

## Tarot

Hub:
- Se entiende el objetivo.
- CTA por tarjeta claro.
- Falta recomendacion "Empieza por Carta del dia" o "Para una duda concreta usa Si o no".

Carta del dia:
- Captura desktop disponible; debe repetirse en mobile y estado revelado.

Tirada de Amor:
- Estado inicial/carga no es aceptable en mobile.
- Antes de seleccionar, la pantalla no explica suficiente progreso si la baraja tarda.
- Se debe validar seleccion 1/3, 2/3, 3/3, revelar, interpretar y resultado.

## Luna

No se completo captura por timeout, pero el modulo queda dentro de la superficie habilitada y debe auditarse antes de aprobacion final. Prioridades de revision: legibilidad de porcentajes, calendario movil, controles de mes y estados sin contenido editorial.

## Guias

No se completo captura por timeout. Riesgo conocido: si solo existe una guia publicada, el listado puede sentirse vacio. Recomendacion: presentar mejor "coleccion editorial inicial" y sugerir rutas relacionadas a Tarot/Luna.

## Busqueda

La busqueda ya no debe exponer modulos ocultos. Debe probarse:
- foco inicial;
- Escape;
- filtros visibles;
- sugerencias;
- estado sin resultados;
- no aparicion de horoscopo/compatibilidad.

## Accesibilidad

Riesgos:
- texto cortado en mobile;
- focus visible no auditado con teclado;
- iconos sin tooltip visible no auditados;
- animaciones SVG y tarot deben respetar `prefers-reduced-motion`;
- bottom nav fija puede cubrir contenido.

## Recomendaciones prioritarias

1. Corregir responsive global: sin scroll horizontal y sin textos cortados en 375/390/430.
2. Unificar marca mobile a Creovision.
3. Corregir breadcrumbs duplicados.
4. Redisenar loaders de Tarot, especialmente Tirada de Amor.
5. Auditar visualmente Luna, Guias y Busqueda con capturas completas.
6. Definir regla de jerarquia para mobile: H1 mas pequeno, subtitulos max-width 100%, CTAs visibles sin overflow.
7. Repetir smoke visual en 1440, 1366, 1920, 768, 820, 375, 390 y 430.
