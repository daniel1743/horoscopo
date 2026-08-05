# Validacion tecnica de auditoria UI/UX - Creovision

Fecha: 2026-08-04
Modo: auditoria y validacion unicamente. No se modifico codigo de aplicacion, no se hizo Git ni deploy.

## Resumen

La auditoria UI/UX contiene varios hallazgos que ya no aplican al producto actual. La superficie publica vigente esta reducida a Tarot, Luna, Guias, Busqueda y legales. Horoscopo, Astrologia, Compatibilidad, Asistente y rutas futuras siguen existiendo en codigo/config para fases posteriores, pero se filtran u ocultan en runtime.

Resultado: hay P0/P1 reales que conviene corregir, pero no son los hallazgos antiguos de Horoscopo/Astrologia. Los problemas confirmados actuales se concentran en responsive mobile, marca mobile, breadcrumbs duplicados y persistencia del flujo de Tirada de Amor.

## Validacion runtime

Servidor local usado: `http://127.0.0.1:8080`.

Rutas publicas actuales:
- `/`: 200
- `/tarot`: 200
- `/tarot/carta-del-dia`: 200
- `/tarot/si-o-no`: 200
- `/tarot/tres-cartas`: 200
- `/tarot/tres-cartas/amor`: 200
- `/tarot/cartas`: 200
- `/luna`: 200
- `/luna/hoy`: 200
- `/luna/calendario`: 200
- `/luna/fases`: 200
- `/guias`: 200
- `/buscar`: 307

Rutas ocultas/no vigentes:
- `/horoscopo`: 404
- `/astrologia`: 404
- `/compatibilidad`: 404
- `/asistente`: 404
- `/account`: 404
- `/sign-up`: 404
- `/tarot/tiradas`: 404
- `/mi-espacio`: 200, pero no enlazada publicamente porque `account` esta hidden.

Sitemap runtime:
- No contiene `/horoscopo`.
- No contiene `/astrologia`.
- No contiene `/compatibilidad`.
- No contiene `/tarot/tiradas`.
- Si contiene `/tarot/tres-cartas/amor`.

## Estado actual verificado

- Home: CTA principal `Sacar una carta` apunta a `tarotDaily`; CTA secundario `Explorar tiradas` apunta a `/tarot`. Evidencia: `src/config/home.ts:60-72`.
- Menu desktop: internamente conserva Horoscopo/Astrologia, pero `desktopPrimary` exportado filtra hidden. Evidencia: `src/config/navigation.ts:32-42`, `src/config/navigation.ts:46-91`.
- Drawer movil: filtra hidden y ya tiene backdrop blur. Evidencia: `src/config/navigation.ts:152-154`, `src/components/layout/MobileNavigationDrawer.tsx:61`.
- Bottom navigation: queda reducida por filtro a Inicio, Tarot y Luna. Evidencia: `src/config/navigation.ts:94-102`.
- Footer: filtra links ocultos desde `isRoutePubliclyEnabled`. Evidencia: `src/config/footer.ts:64-69`.
- Feature flags: Horoscopo, compatibilidad, cuenta y asistente estan false/hidden. Evidencia: `src/config/features.ts`, `src/config/public-features.ts:29-50`.
- Rutas publicas: cuenta real es `/mi-espacio`, login es `/auth`; no existe `/account` ni `/sign-up`. Evidencia: `src/config/routes.ts:50-56`.
- Buscador: filtros visibles se construyen con `isPublicFeatureEnabled`; resultados dinamicos se filtran por `PUBLIC_SEARCH_SOURCE_TYPES`. Evidencia: `src/config/search.ts:56-72`, `src/services/search.service.ts:25-38`.

## Revalidacion de hallazgos

| Hallazgo original | Estado actual | Evidencia | Severidad corregida | Correccion recomendada | Esfuerzo | Riesgo |
|---|---|---|---|---|---|---|
| El Hero todavia promociona Horoscopo | CORREGIDO_PREVIAMENTE | `home.ts:60-72`; runtime `/` 200 con copy de Tarot/Luna/Guias | Ninguna | No cambiar | 0 | Bajo |
| Astrologia todavia aparece en menu | CORREGIDO_PREVIAMENTE | Existe en config interna `navigation.ts:69-75`, pero se filtra en `navigation.ts:32-42`; runtime `/astrologia` 404 | Ninguna | Mantener filtro central | 0 | Bajo |
| Existen demasiados dropdowns | OBSOLETO | Menu exportado solo conserva Tarot y Luna con children + Guias; Horoscopo/Astrologia se filtran | P2 si se quisiera simplificar | No crear megamenus | 0 | Bajo |
| La ruta de cuenta es `/account` | OBSOLETO | `routes.account` es `/mi-espacio`; `/account` runtime 404 | Ninguna | No cambiar rutas | 0 | Bajo |
| El registro usa `/sign-up` | OBSOLETO | `routes.signIn` es `/auth`; `/sign-up` runtime 404 | Ninguna | No crear ruta nueva | 0 | Bajo |
| Ver todas las tiradas debe enlazar a `/tarot/tiradas` | OBSOLETO | `/tarot/tiradas` runtime 404; Home enlaza a `/tarot` en `home.ts:166` | Ninguna | No crear `/tarot/tiradas` | 0 | Bajo |
| Trabajo y Decisiones aparecen como Proximamente | CORREGIDO_PREVIAMENTE | Items existen pero `status: "hidden"` en `home.ts:181-199`; se filtran en `FeaturedReadingsSection` | Ninguna | Mantener ocultos hasta implementacion real | 0 | Bajo |
| Drawer necesita backdrop blur | CORREGIDO_PREVIAMENTE | `MobileNavigationDrawer.tsx:61` usa `backdrop-blur-sm` | Ninguna | No cambiar | 0 | Bajo |
| Calendario lunar movil es excesivamente alto | NO_REPRODUCIBLE como P0, requiere revision visual | Celdas tienen `aspect-square min-h-[54px]` en `MoonCalendar.tsx:62`; target tactil correcto, pero altura puede ser alta en 390px | P2 | Revisar captura mobile antes de cambiar | S | Bajo |
| La tirada se pierde al navegar atras | CONFIRMADO_ACTUAL por codigo | Todo el estado vive en `useState` local `ThreeCardLoveExperienceShell.tsx:69-76`; no hay `useBlocker` ni `sessionStorage` en tarot salvo Carta del dia | P1 | Preferir `sessionStorage` por run actual; `useBlocker` solo si hay seleccion parcial | M | Medio |
| Conviene `useBlocker` | REQUIERE_CORRECCION parcial | Sin persistencia ni blocker; estados `selecting/selected/revealing/interpreting` pueden perderse | P2/P1 | Primero persistir estado; bloquear solo durante interpretacion o seleccion completa no guardada | M | Medio |
| Existen controles tactiles menor a 44x44 | NO_REPRODUCIBLE general, algunos revisar | Topbar usa `h-11 w-11` = 44px en `MobileTopbar.tsx:28,47`; bottom nav `min-h-12`; calendario `min-h-[54px]` | P2 | Revisar botones inline tipo links de texto | S | Bajo |
| Faltan focus-visible | NO_REPRODUCIBLE general | Hay focus en muchos componentes; pero algunos links hover-only como `TarotHubPage.tsx:49-55` y drawer links `MobileNavigationDrawer.tsx:108-112` no declaran focus visible explicito | P2 | Agregar focus-visible acotado a links funcionales | S | Bajo |
| Existen errores de Supabase visibles | NO_REPRODUCIBLE en esta validacion | No se observaron errores runtime en rutas consultadas. No se probo login/API en esta fase | P2 | Revalidar en flujos auth/API | M | Medio |
| Hay bloques sin CSS o con overflow | CONFIRMADO_ACTUAL para mobile hero | Capturas previas `audit-ui-screenshots/home-390.png`, `tarot-390.png`, `tarot-love-390.png`; `HomeHero.tsx:30-31` usa tracking negativo + maxWidth fijo | P0 | Corregir responsive sin redisenar masivo | S/M | Medio |

## Hallazgos nuevos/actuales confirmados

### P0 confirmados

1. Texto cortado/overflow mobile en Home y paginas internas.
- Evidencia visual: `audit-ui-screenshots/home-390.png`, `audit-ui-screenshots/tarot-390.png`, `audit-ui-screenshots/tarot-love-390.png`.
- Evidencia codigo: `HomeHero.tsx:30-31` combina H1 grande, tracking negativo y `maxWidth: "18ch"`.
- Correccion recomendada: ajustar responsive de tipografia y contenedores; validar 375/390/430 sin scroll horizontal.

2. Breadcrumb duplicado `Inicio > Inicio > ...`.
- Evidencia codigo: `AppBreadcrumbs.tsx:30` agrega Inicio; `TarotHubPage.tsx:13-16` tambien lo pasa.
- Evidencia visual: `audit-ui-screenshots/tarot-1440.png`, `audit-ui-screenshots/tarot-390.png`.
- Correccion recomendada: normalizar contrato de breadcrumbs para que `Inicio` se agregue una sola vez.

### P1 confirmados

1. Marca mobile muestra `Astral`, no `Creovision`.
- Evidencia: `site.ts:3-4`, `MobileTopbar.tsx:19-20`.
- Riesgo: confusion de marca y menor confianza.
- Correccion recomendada: usar `siteConfig.name` en mobile o cambiar `shortName`.

2. Tirada de Amor no persiste estado al abandonar/navegar.
- Evidencia: estado local en `ThreeCardLoveExperienceShell.tsx:69-76`; reset local en `handleReset`; ausencia de persistencia en busqueda `rg`.
- Correccion recomendada: `sessionStorage` por lectura en curso para seleccion/pregunta/cartas reveladas. `useBlocker` solo si hay una accion irreversible o interpretacion en progreso.

3. Loader inicial de Tarot/Tirada de Amor puede sentirse vacio.
- Evidencia: `ThreeCardLoveExperienceShell.tsx:229` devuelve `TarotSkeleton`; skeleton generico en `TarotSkeleton.tsx:16-18`.
- Correccion recomendada: skeleton contextual de 3 posiciones/cartas; no overlay, no pantalla vacia.

### P2 confirmados

1. Hardcodes visuales mezclados con tokens.
- Evidencia: `FeaturedReadingCard` usa `rounded-[24px]`, shadows arbitrarias; `InteractiveThreeCardResult` usa `rounded-[16px]`; varios componentes usan tokens `var(--radius-card...)`.
- Correccion recomendada: consolidar radios/sombras en tokens, sin bloquear lanzamiento.

2. Focus-visible no uniforme.
- Evidencia: existen focus visibles en varios componentes, pero no todos los links funcionales los declaran.
- Correccion recomendada: pasada acotada por links de tarjetas, drawer y CTAs secundarios.

3. Calendario lunar mobile requiere captura final.
- Evidencia: `MoonCalendar.tsx:62` usa celdas 54px, tactil correcto pero posiblemente alto.
- Correccion recomendada: validar visualmente antes de cambiar.

## Hallazgos obsoletos

- Rehabilitar o corregir Horoscopo en Home/menu.
- Rehabilitar Astrologia en menu.
- Crear `/tarot/tiradas`.
- Cambiar cuenta a `/account`.
- Crear `/sign-up`.
- Agregar backdrop blur al drawer.
- Ocultar Trabajo/Decisiones como "Proximamente" en Home: ya estan hidden.

## Resultados del buscador

Estado por codigo:
- Filtros visibles: Todo, Guias, Tarot, Luna; Horoscopo/Compatibilidad/Signos solo aparecen si sus features se habilitan.
- Resultados dinamicos: `search.service.ts` filtra tipos no publicos mediante `PUBLIC_SEARCH_SOURCE_TYPES`.
- Riesgo residual: `INDEXABLE_SOURCE_TYPES` todavia lista horoscope/compatibility para sincronizacion de indice; no afecta interfaz si el servicio filtra, pero conviene documentar esa diferencia para futuras tareas de indexado.

## Tarot: navegacion atras y persistencia

Estados actuales:
- `preparing`: pregunta escrita se pierde si navega atras o cambia de ruta.
- `shuffling`: timers locales se limpian al desmontar.
- `selecting`: cartas candidatas y seleccion parcial se pierden.
- `selected`: seleccion completa se pierde.
- `revealing`: reveladas parciales se pierden.
- `interpreting`: interpretacion en curso se pierde al desmontar; no hay bloqueo.
- `completed`: resultado no se persiste desde este componente.

Recomendacion tecnica:
- Mejor primera solucion: `sessionStorage` por reading id/run id para pregunta, estado, slugs seleccionados y slugs revelados.
- `useBlocker`: usar solo durante `selecting`, `selected`, `revealing` o `interpreting` si no se implementa persistencia inmediata. Si se implementa sessionStorage correctamente, `useBlocker` puede limitarse a confirmar salida durante request de interpretacion.

## Auditoria visual tecnica

- `rounded-*` hardcodeado: confirmado en componentes nuevos de tarot/home; no es P0, pero reduce consistencia.
- `shadow-*` hardcodeado: confirmado en home/tarot; P2.
- Tokens CSS: existen y se usan en muchas superficies (`var(--radius-card...)`, `shadow-floating`, `shadow-card`).
- Variantes reales de botones: existen via `Button`, aunque tambien hay links con clases manuales.
- Estados hover/focus/disabled: parcialmente consistentes; target tactil principal cumple 44px.
- Contraste: no se midio automaticamente; visualmente los cortes mobile son mas criticos que contraste.
- Scroll horizontal: confirmado visualmente en capturas mobile.
- Overlays: drawer correcto con blur; no se confirmo overlay bloqueante en completed.
- Z-index: drawer z-50, bottom nav z-40; no se observo conflicto runtime.

## Validacion tecnica

- `npm run lint`: no concluyo dentro de 240s. Estado: INCONCLUSO POR TIMEOUT. No se toma como fallo de codigo validado.
- `npm run build`: OK. Warnings no bloqueantes:
  - `vite-tsconfig-paths` deprecado frente a `resolve.tsconfigPaths`.
  - `src/routes/api/tarot/interpret-reading.test.ts` no exporta `Route`.
  - `createServerFn().inputValidator()` deprecado en varias funciones.

## Plan de implementacion en lotes pequenos

Lote 1 - P0 responsive y breadcrumbs:
- Corregir overflow mobile en Home/PageHeader/contenedores.
- Corregir duplicado de Inicio en breadcrumbs.
- Validar 375, 390, 430, 1366, 1440.

Lote 2 - Marca y loaders:
- Cambiar marca mobile a Creovision.
- Sustituir loader generico de Tirada de Amor por skeleton contextual.
- Mantener rutas y navegacion actual.

Lote 3 - Persistencia de Tirada de Amor:
- Guardar estado de lectura en `sessionStorage`.
- Decidir `useBlocker` solo para estados donde hay perdida real sin persistencia.

Lote 4 - Pulido visual/accesibilidad:
- Unificar radios/sombras.
- Completar focus-visible en links funcionales.
- Revalidar calendario lunar mobile y buscador con capturas.

## Veredicto

REQUIERE_CORRECCION acotada. No implementar recomendaciones obsoletas del reporte original. La prioridad real actual es responsive mobile + breadcrumbs + marca mobile + persistencia/loader de Tirada de Amor.
