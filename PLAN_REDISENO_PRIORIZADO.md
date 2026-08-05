# Plan de rediseno priorizado

## P0 - Antes de subir

1. Corregir overflow mobile global.
   - Validar 375, 390 y 430 px.
   - Ningun H1/subtitulo/boton debe cortarse.
   - Revisar `HomeHero`, `PageHeader`, `Container` y bottom nav.

2. Unificar marca mobile.
   - Cambiar shortName o uso en `MobileTopbar`.
   - Verificar desktop/mobile.

3. Corregir breadcrumbs duplicados.
   - Definir si `AppBreadcrumbs` agrega Inicio o no.
   - Remover duplicados en paginas.

4. Mejorar loader de Tirada de Amor.
   - Reemplazar pantalla vacia por bloque contextual.
   - Mostrar skeleton de posiciones/cartas.
   - Evitar `min-h` excesivo durante carga inicial.

## P1 - Siguiente iteracion

1. Auditar flujos completos de Tarot: inicial, barajar, seleccionar, revelar, interpretar, resultado, fallback, error.
2. Capturar Luna en desktop/mobile y corregir calendario si hay overflow.
3. Capturar Guias y evitar sensacion de seccion vacia.
4. Revisar busqueda: foco, Escape, sugerencias y no aparicion de ocultos.
5. Ajustar CTA de Home a "Sacar carta del dia".
6. Reducir breadcrumbs en mobile para liberar espacio.

## P2 - Pulido premium

1. Consolidar radios, sombras y fondos por tipo de componente.
2. Definir guia de loaders.
3. Revisar `prefers-reduced-motion`.
4. Completar matriz de iconos Hugeicons.
5. Revisar contraste WCAG AA en textos `text-ink-soft`.

## Criterio de salida

Producto aprobable cuando:
- no exista scroll horizontal en mobile;
- las rutas publicas principales tengan una accion primaria clara;
- no haya breadcrumbs duplicados;
- los loaders expliquen que ocurre;
- no aparezcan funciones ocultas;
- mobile se sienta disenado, no comprimido.

