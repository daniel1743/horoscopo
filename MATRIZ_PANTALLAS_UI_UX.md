# Matriz de pantallas UI/UX

| Pantalla | Ruta | Objetivo | Accion principal | Se entiende | Problema | Severidad | Recomendacion | Archivo probable | Captura |
|---|---|---|---|---|---|---|---|---|---|
| Home | `/` | Presentar producto | Sacar una carta | Si en desktop, parcial en mobile | H1 cortado y marca Astral | P0 | Corregir responsive y marca | `HomeHero.tsx`, `MobileTopbar.tsx`, `site.ts` | `home-1440.png`, `home-390.png` |
| Tarot hub | `/tarot` | Elegir lectura | Comenzar una tirada | Si | Breadcrumb duplicado, mobile cortado | P0 | Unificar breadcrumbs, corregir overflow | `AppBreadcrumbs.tsx`, `TarotHubPage.tsx` | `tarot-1440.png`, `tarot-390.png` |
| Carta del dia | `/tarot/carta-del-dia` | Revelar carta diaria | Revelar carta | Pendiente estados | Captura solo desktop inicial | P2 | Repetir mobile y revelado | `TarotDailyPage.tsx` | `tarot-daily-1440.png` |
| Si o no | `/tarot/si-o-no` | Resolver duda simple | Consultar carta | No auditada visualmente | Captura pendiente | P2 | Capturar inicial/resultado | `TarotYesNoPage.tsx` | Pendiente |
| Tres cartas | `/tarot/tres-cartas` | Lectura general | Realizar tirada | No auditada visualmente | Captura pendiente | P2 | Capturar estados completos | `TarotThreeCardsPage.tsx` | Pendiente |
| Tirada de Amor | `/tarot/tres-cartas/amor` | Lectura afectiva | Barajar cartas | Parcial | Loader pobre, pantalla vacia, texto cortado | P0 | Loader rico y responsive | `ThreeCardLoveExperienceShell.tsx`, `TarotSkeleton.tsx` | `tarot-love-390.png` |
| Biblioteca | `/tarot/cartas` | Explorar cartas | Abrir carta | Pendiente | Captura pendiente | P2 | Capturar desktop/mobile | `TarotLibraryPage.tsx` | Pendiente |
| Detalle de carta | `/tarot/cartas/:card` | Aprender significado | Leer/volver | Pendiente | Captura pendiente | P2 | Revisar lectura mobile | `TarotCardDetailPage.tsx` | Pendiente |
| Luna hoy | `/luna/hoy` | Consultar fase actual | Leer fase | Pendiente | Captura pendiente | P1 | Validar indicadores y contexto | `luna.hoy.tsx` | Pendiente |
| Calendario lunar | `/luna/calendario` | Ver fases por mes | Cambiar mes/dia | Pendiente | Captura pendiente | P1 | Validar calendario movil | `luna.calendario.*.tsx` | Pendiente |
| Fases lunares | `/luna/fases` | Explorar fases | Abrir fase | Pendiente | Captura pendiente | P2 | Revisar tarjetas y detalle | `luna.fases*.tsx` | Pendiente |
| Guias | `/guias` | Leer contenido editorial | Abrir guia | Pendiente | Riesgo de parecer vacio | P1 | Presentar coleccion inicial | `GuidesPage.tsx` | Pendiente |
| Busqueda | `/buscar` | Encontrar contenido | Buscar | Pendiente | Debe confirmar no exponer ocultos | P1 | Probar filtros y sugerencias | `buscar.tsx`, `search.service.ts` | Pendiente |

