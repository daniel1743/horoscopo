# AUDITORÍA PREMIUM HOME CREOVISION — UX/UI 2026, CONVERSIÓN Y REVISITA

**Fecha**: 8 de agosto de 2026
**Tipo**: Auditoría — NO modificar código
**Alcance**: Home completa (móvil + desktop), navegación, CTAs, servicios, retención
**Versión**: v1.0.0

---

## SECCIÓN 1 — VEREDICTO EJECUTIVO

```
VEREDICTO HOME CREOVISION
========================

¿Entiendo qué es en 5 segundos?:
PARCIAL

¿Sé qué hacer inmediatamente?:
PARCIAL

¿Existe CTA principal claro?:
SÍ — pero con ambigüedad: hay 2 CTAs en el hero compitiendo

¿La primera pantalla móvil está optimizada?:
NO

¿Los servicios importantes son descubribles?:
PARCIAL

¿La página invita a interactuar?:
PARCIAL

¿Tengo razones visibles para volver mañana?:
NO

¿Se siente como producto premium de 2026?:
PARCIAL

¿Se siente diferente de una web genérica de astrología?:
SÍ

NOTA TOTAL:
52/100
```

### Puntuaciones por dimensión

| Dimensión | Puntuación | Explicación |
|-----------|-----------|-------------|
| Primera impresión | 48/100 | La luna decorativa domina el viewport; el mensaje tarda en llegar |
| Claridad | 55/100 | El copy es bueno pero la jerarquía visual lo entierra |
| Diseño visual | 72/100 | Identidad fuerte, paleta coherente, tipografía cuidada |
| UX móvil | 38/100 | Primer viewport mal aprovechado, demasiado scroll hasta la acción |
| CTAs | 48/100 | Dos CTAs compiten en hero; jerarquía plana en el resto |
| Descubrimiento | 50/100 | Los servicios existen pero no todos se comunican en Home |
| Conversión | 42/100 | Funnel de tarot es el único claro; los demás requieren exploración |
| Retención | 35/100 | Sin razones visibles para volver; sin personalización en Home |
| Revisita | 30/100 | Home idéntica para usuario nuevo y recurrente |
| Sensación producto 2026 | 58/100 | Buena base visual pero exceso de espacio vacío, poca interactividad |

**MAYOR FORTALEZA**:
Identidad visual distintiva. Creovision no parece un blog genérico de astrología. La paleta nocturna con violeta, dorado y la luna como motivo central crean una identidad reconocible y con personalidad.

**MAYOR DEBILIDAD**:
El primer viewport móvil sacrifica comprensión y conversión en favor de una ilustración decorativa. Un usuario nuevo en móvil ve principalmente una luna grande, lee parcialmente un titular y no encuentra acción obvia sin hacer scroll.

**CAMBIO #1 RECOMENDADO**:
Reestructurar el hero móvil: reducir la altura de la ilustración lunar (~50%), asegurar que al menos 1 CTA quede visible en el primer viewport, y mover "Tu luna hoy" inmediatamente después como gancho de revisita diaria.

**CAMBIO #1 QUE NO DEBEMOS HACER**:
Eliminar la ilustración lunar o la identidad oscura del hero. La luna es el activo visual más distintivo de Creovision. El problema no es que exista sino que ocupa demasiado espacio sin suficiente retorno en comprensión o acción.

---

## SECCIÓN 2 — LOS 10 PROBLEMAS QUE MÁS DINERO/USUARIOS PUEDEN COSTAR

| # | Problema | Evidencia | Impacto | Severidad | Componente responsable |
|---|----------|-----------|---------|-----------|----------------------|
| 1 | **Primer viewport móvil sin CTA visible** | `HomeHero.tsx` L87: `order-first` en mobile coloca la ilustración ANTES del texto. La ilustración mide `h-56` (224px) + `py-16` (64px) del container + header ~56px = ~344px antes del texto. En viewport de 800px, el CTA queda fuera. | Usuario no sabe qué hacer, rebota | **P0** | `HomeHero.tsx` L85-91 |
| 2 | **Home idéntica para usuario nuevo y recurrente** | `HomePage.tsx` L30-41: Cero diferenciación por estado de autenticación. `homeConfig.enabled` es estático. | Sin continuidad, sin personalización, sin razón para volver | **P0** | `HomePage.tsx`, `homeConfig` |
| 3 | **Horóscopo diario invisible en Home** | `homeConfig.ts` L48: `daily_insight: false`. El sistema de horóscopos automatizado genera 48 textos diarios (backend completo), pero la sección está deshabilitada. | El motor de revisita más potente está apagado | **P0** | `homeConfig.ts` L48 |
| 4 | **"Trabajo" y "Decisiones" ocultos como features públicas** | `public-features.ts` L37-38: `tarotThreeCardsTrabajo: "hidden"`, `tarotThreeCardsDecision: "hidden"`. Pero `homeConfig.ts` L183-201 los incluye como items de `featuredTarot`. | Inconsistencia: la Home promociona tiradas que luego no son accesibles | **P0** | `public-features.ts` L37-38 vs `homeConfig.ts` L183-201 |
| 5 | **Sección de Guías es placeholder** | `FeaturedGuidesSection.tsx`: Muestra solo tarjetas "Próximamente" sin contenido real. | Sección entera no aporta valor, consume viewport valioso | **P1** | `FeaturedGuidesSection.tsx` |
| 6 | **Jerarquía de CTAs plana — 10 secciones compiten** | `homeConfig.ts` L32-43: 10 secciones, cada una con su CTA. Hero tiene 2 CTAs, MoonToday 1, Compatibility 1, ZodiacSelector 12 (signos), FeaturedReadings 3, etc. Total: ~20+ acciones clickables. | Parálisis de decisión, ninguna acción se percibe como principal | **P1** | `homeConfig.ts` |
| 7 | **Newsletter es demo no funcional** | `HomeNewsletterSection.tsx`: Formulario con validación Zod pero sin endpoint real. Label dice "Demo". | Sección ocupa espacio sin generar valor real. Puede generar desconfianza | **P1** | `HomeNewsletterSection.tsx` |
| 8 | **Espacio vertical excesivo entre secciones y dentro de secciones** | `HomeHero.tsx` L21: `py-16 md:py-24 lg:py-28`. `MoonTodaySection.tsx` L27: `py-14 md:py-20`. `h-56` (224px) lunar illustration + `gap-12` grid + `mt-5`, `mt-3`, `mt-8` acumulados. | ~45-55% del viewport móvil es padding/espacio vacío o decoración | **P1** | Múltiples componentes |
| 9 | **Bottom navigation no comunica estado "Yo" para perfil** | `MobileNavigationDrawer.tsx`: El ítem "Yo" agrupa perfil, historial, favoritos, lecturas, config. Pero el label "Yo" es ambiguo — ¿yo quién?, ¿mi perfil?, ¿mi configuración? | Descubrimiento reducido de features de cuenta; los usuarios no saben qué hay detrás de "Yo" | **P2** | `MobileNavigationDrawer.tsx` |
| 10 | **Sin razones visibles para volver mañana** | Toda la Home es estática editorial. `MoonTodaySection` muestra datos reales de luna pero no comunica "mañana será diferente". No hay sección de "tu actividad reciente", "continúa donde lo dejaste", ni "tu lectura de hoy". | Retención depende de que el usuario recuerde volver por sí mismo | **P1** | Arquitectura completa de Home |

---

## SECCIÓN 3 — PRIMER VIEWPORT MÓVIL

### Representación (basada en análisis de código)

```
┌──────────────────────────┐  ← top: 0 (viewport 390×844)
│ HEADER (~56px)           │  SiteHeader con logo + hamburguesa
├──────────────────────────┤  ← ~56px
│                          │
│   HERO BACKDROP          │  Gradientes radiales violeta + dorado
│   (bg-night)             │
│                          │
│   ┌──────────────────┐   │
│   │                  │   │
│   │   LUNA SVG       │   │  h-56 = 224px (order-first en mobile!)
│   │   400×400        │   │  Planeta + anillos + estrellas animadas
│   │   Centrada       │   │  Ocupa ~28% del viewport ella sola
│   │                  │   │
│   └──────────────────┘   │  ← ~280px
│                          │
│   "TAROT Y CICLOS       │  ← eyebrow (12px, gold, uppercase)
│    LUNARES"             │
│                          │
│   "Tarot, luna y guías  │  ← H1 (31px, display, semibold)
│    para comprender..."  │     ~3 líneas visibles
│                          │
│   "Cartas de tarot,     │  ← description (16px)
│    ciclos lunares..."   │     ~2 líneas, posiblemente cortada
│                          │  ← ~540px (límite aprox primer viewport)
│   ─── CORTE VIEWPORT ───│
│                          │
│   [Sacar una carta]     │  ← CTA primario (FUERA de viewport)
│   [Explorar tiradas]    │  ← CTA secundario (FUERA de viewport)
│                          │
└──────────────────────────┘  ← bottom: 844px
│ BOTTOM NAV (~56px)      │  Inicio | Horóscopo | Tarot | Luna | Yo
└──────────────────────────┘
```

### Qué funciona

- **Eyebrow visible**: "TAROT Y CICLOS LUNARES" se lee inmediatamente, da contexto temático
- **Ilustración con personalidad**: La luna con anillos y estrellas animadas es distintiva y memorable
- **Fondo oscuro**: Diferencia inmediata de webs de astrología genéricas (que suelen ser blancas/claras)
- **Respeto por reduced-motion**: Las animaciones de estrellas tienen `@media (prefers-reduced-motion: no-preference)`

### Qué sobra

- **Altura excesiva de la ilustración**: `h-56` (224px) + `py-16` (64px de padding-top del container) = **288px** antes de que aparezca el eyebrow. En un viewport de ~740px útil (844 - header 56 - bottom nav 56), eso es **39% del espacio** dedicado a decoración
- **`order-first` en mobile**: La ilustración lunar aparece ANTES del texto. Esto invierte la jerarquía natural: el usuario ve decoración antes que contenido
- **`max-w-md` en ilustración**: La ilustración está limitada a 448px de ancho máximo, pero en mobile 390px ya ocupa casi todo el ancho — no hay balance visual con el texto

### Qué falta

- **CTA visible sin scroll**: Ambos botones ("Sacar una carta", "Explorar tiradas") están después de `mt-8` desde la description, que a su vez está después de `mt-5` desde el H1. Estimación: eyebrow (20px) + mt-5 (20px) + H1 3 líneas (~102px) + mt-5 (20px) + description 2 líneas (~54px) + mt-8 (32px) = **248px de contenido textual** + 288px de ilustración + 56px header = **~592px desde el top**. En viewport de 740px útil, el CTA queda en el pixel ~592 — **visible solo en screens >740px útiles** (iPhone SE, iPhone 12/13 mini: NO visible)
- **Indicador de scroll**: No hay flecha, gradiente inferior ni señal visual de que hay más contenido abajo
- **Propuesta de valor en 3 segundos**: Después de 3 segundos, un usuario nuevo ve: luna decorativa + "TAROT Y CICLOS LUNARES" + parte del H1. No sabe exactamente qué puede hacer

### Qué debería verse (propuesta)

```
┌──────────────────────────┐
│ HEADER                   │
├──────────────────────────┤
│                          │
│  "TAROT Y CICLOS        │  ← eyebrow inmediato
│   LUNARES"              │
│                          │
│  "Tarot, luna y guías   │  ← H1 completo visible
│   para comprender       │
│   tu momento"           │
│                          │
│  ┌────────────────────┐  │
│  │   LUNA (reducida)  │  │  ← ilustración más pequeña (~120-140px)
│  │   a la derecha     │  │     o como background sutil
│  └────────────────────┘  │
│                          │
│  "Cartas de tarot,      │  ← description visible
│   ciclos lunares..."   │
│                          │
│  [Sacar una carta]      │  ← CTA primario VISIBLE
│  [Explorar tiradas]     │  ← CTA secundario VISIBLE
│                          │
│  ⋮                       │  ← indicador sutil de scroll
└──────────────────────────┘
```

### Cálculo de distribución del primer viewport

| Elemento | Altura aprox (px) | % Viewport |
|----------|-------------------|------------|
| Header | 56 | 6.6% |
| Ilustración lunar (padding-top + SVG) | 288 | 34.1% |
| Eyebrow | 20 | 2.4% |
| H1 (3 líneas) | 102 | 12.1% |
| Description (2 líneas visibles) | 54 | 6.4% |
| **Subtotal visible** | **520** | **61.6%** |
| CTAs (fuera de viewport) | 72 | 8.5% |
| Espacio restante (padding, gaps) | ~152 | 18.0% |
| Bottom nav | 56 | 6.6% |
| **Total viewport** | **844** | **100%** |

**Dedicado a decoración**: 34.1% (ilustración lunar)
**Dedicado a propuesta de valor**: ~21% (eyebrow + H1 + description parcial)
**Dedicado a acciones**: 0% visible, 8.5% fuera de viewport

---

## SECCIÓN 4 — MAPA COMPLETO DE CTAs

### Inventario exhaustivo

| # | Sección | Texto CTA | Tipo | Destino | ¿Funciona? | Qué espera el usuario | Qué encuentra | Prioridad visual | Claridad | Fricción | Conversión probable | Problema | Recomendación |
|---|---------|-----------|------|---------|------------|----------------------|---------------|------------------|----------|----------|--------------------|----------|---------------|
| 1 | Hero | "Sacar una carta" | Button primary | `/tarot/carta-del-dia` | ✅ | Una carta de tarot para hoy | Carta del día (experiencia real) | Alta | Alta | Baja | Alta | — | Mantener como CTA#1 |
| 2 | Hero | "Explorar tiradas" | Button dark | `/tarot` | ✅ | Listado de tiradas disponibles | Índice de tarot con 3 cartas, sí/no, carta del día | Media | Media | Baja | Media | Compite con CTA#1; menos específico | Podría ser secundario real (ghost) o moverse a sección Tarot |
| 3 | Hero | (Zodiac quick select) | Select + Link | `/horoscopo/{sign}` | ❌ `showZodiacQuickSelect: false` | — | No se renderiza | N/A | N/A | N/A | N/A | Feature oculto | Si se activa, es un tercer CTA compitiendo |
| 4 | Moon Today | "Consultar mi luna" | Button dark | `/luna/tu-luna-de-hoy` | ✅ | Lectura lunar personalizada | Página de consulta lunar (requiere fecha nacimiento) | Alta | Alta | Media (pide dato personal) | Media-Alta | Requiere fecha de nacimiento; fricción para usuario anónimo | Buen CTA; necesita comunicar mejor el valor antes del click |
| 5 | Moon Today | (Card completa) | Card | — | ✅ | Información visual de la luna | Datos reales de fase lunar, iluminación, signo | Media | Alta | N/A | N/A | Solo informativa, no clickable | Podría linkear a `/luna/hoy` |
| 6 | Compatibility | (Select signo 1) | Select | — | ✅ | Elegir primer signo | Dropdown con 12 signos | Media | Alta | Baja | N/A | — | — |
| 7 | Compatibility | (Select signo 2) | Select | — | ✅ | Elegir segundo signo | Dropdown con 12 signos | Media | Alta | Baja | N/A | — | — |
| 8 | Compatibility | "Ver compatibilidad" | Button primary | `/compatibilidad/{signA}/{signB}` | ✅ | Análisis de compatibilidad | Página de resultado con dinámicas | Alta | Alta | Media (2 selecciones) | Media | Requiere 2 selecciones antes del CTA; sin preselección | Buen diseño; considerar preseleccionar signo del usuario |
| 9 | ZodiacSelector | (12 signos) | Link cards | `/horoscopo/{sign}` | ✅ | Horóscopo de ese signo | Página de horóscopo del signo | Media-Alta | Alta | Baja | Alta | Carrusel horizontal: ¿el usuario sabe que hay 12? | Añadir indicador de scroll horizontal |
| 10 | FeaturedReadings | "Amor — Comenzar tirada" | Card + CTA | `/tarot/tres-cartas/amor` | ✅ | Tirada de 3 cartas sobre amor | Experiencia de tirada interactiva | Media | Alta | Baja | Alta | — | Buen CTA |
| 11 | FeaturedReadings | "Trabajo — Comenzar tirada" | Card + CTA | `/tarot/tres-cartas/trabajo` | ⚠️ | Tirada sobre trabajo | **Ruta oculta** (`tarotThreeCardsTrabajo: "hidden"`) | Media | Alta | **Crítica** | Nula | **Ruta no accesible como feature pública** | Activar `tarotThreeCardsTrabajo` en public-features.ts |
| 12 | FeaturedReadings | "Decisiones — Comenzar tirada" | Card + CTA | `/tarot/tres-cartas/decision` | ⚠️ | Tirada para decidir | **Ruta oculta** (`tarotThreeCardsDecision: "hidden"`) | Media | Alta | **Crítica** | Nula | **Ruta no accesible como feature pública** | Activar `tarotThreeCardsDecision` en public-features.ts |
| 13 | FeaturedReadings | "Ver tarot" | Button secondary | `/tarot` | ✅ | Índice de tarot | Índice de tarot | Baja | Alta | Baja | Baja | Redundante con CTA#2 del hero | Eliminar o diferenciar |
| 14 | DailyInsight | — | — | — | ❌ `daily_insight: false` | — | No se renderiza | N/A | N/A | N/A | N/A | **Oportunidad de retención diaria perdida** | Activar inmediatamente |
| 15 | FeaturedGuides | "Ver todas" | Button secondary | `/guias` | ⚠️ | Listado de guías | Página de guías (contenido real por verificar) | Baja | Alta | Media | Baja | Sección es placeholder con "Próximamente" | Llenar con 4 guías reales o deshabilitar sección |
| 16 | FeaturedGuides | (Cards "Próximamente") | Cards | — | ❌ | Contenido de guía | "Próximamente" (placeholder) | Baja | — | — | Nula | Placeholder no genera engagement | Publicar guías reales |
| 17 | ExploreTopics | (6 categorías) | Link cards | `/temas/{category}` | ✅ | Contenido sobre ese tema | Página de categoría | Media | Media | Baja | Media | Sin imágenes; URLs hardcoded | Añadir iconos/ilustraciones pequeñas |
| 18 | PersonalSpace | "Abrir mi espacio" | Button premium | `/mi-espacio` | ✅ | Área personal | Página de login o mi-espacio si autenticado | Media | Media | Media (si no autenticado) | Media | Usuario no autenticado va a login sin contexto | Comunicar beneficio de crear cuenta antes del click |
| 19 | Newsletter | "Suscribirme" | Button | — | ❌ Demo | Recibir newsletter | Formulario demo no funcional | Baja | Baja | Baja | Nula | No funcional; etiquetado "Demo" | Implementar endpoint o deshabilitar sección |
| 20 | BottomNav | "Inicio" | Nav icon+label | `/` | ✅ | Volver al inicio | Home | Alta | Alta | Baja | N/A | — | — |
| 21 | BottomNav | "Horóscopo" | Nav icon+label | `/horoscopo` | ✅ | Horóscopo | Índice de horóscopo | Alta | Alta | Baja | Alta | — | — |
| 22 | BottomNav | "Tarot" | Nav icon+label | `/tarot` | ✅ | Tarot | Índice de tarot | Alta | Alta | Baja | Alta | — | — |
| 23 | BottomNav | "Luna" | Nav icon+label | `/luna` | ✅ | Contenido lunar | Índice lunar | Alta | Alta | Baja | Alta | — | — |
| 24 | BottomNav | "Yo" | Nav icon+label | `/mi-espacio` | ✅ | Perfil / área personal | Login o mi-espacio | Alta | **Baja** (ambiguo) | Media | Media | Label "Yo" no comunica qué hay dentro | Cambiar a "Perfil" o usar icono de persona |
| 25 | Header | Logo | Link | `/` | ✅ | Inicio | Home | Alta | Alta | Baja | N/A | — | — |
| 26 | Header | Hamburguesa | Button | Abre drawer | ✅ | Menú completo | Drawer con navegación secundaria | Alta | Alta | Baja | N/A | — | — |
| 27 | Drawer | "Mi espacio" | Link | `/mi-espacio` | ✅ | Perfil | Login o mi-espacio | Media | Alta | Media | Media | Duplicado con BottomNav "Yo" | Diferenciar para autenticados vs no |

### Clasificación por tipo

| Tipo | CTAs | Ejemplos |
|------|------|----------|
| **Acquisition** (descubrir) | 9 | Hero CTAs, ZodiacSelector (12 signos), ExploreTopics (6), FeaturedGuides cards |
| **Engagement** (comenzar experiencia) | 7 | MoonToday CTA, Compatibility CTA, FeaturedReadings (3), DailyInsight |
| **Continuation** (de una experiencia a otra) | 2 | "Ver tarot", "Ver todas" |
| **Account** (registro/login) | 4 | PersonalSpace, BottomNav "Yo", Drawer "Mi espacio" |
| **Retention** (volver) | 0 | **NINGUNO visible** |
| **No funcional** | 2 | Newsletter (demo), FeaturedGuides cards (placeholder) |

### Jerarquía real de CTAs (lo que el diseño comunica)

1. **CTA #1**: "Sacar una carta" (Hero, primary) — visible con scroll
2. **CTA #2**: "Explorar tiradas" (Hero, dark) — mismo nivel visual que #1
3. **CTA #3**: "Consultar mi luna" (MoonToday, dark) — sección siguiente
4. **CTA #4**: 12 signos del zodiaco
5. **CTA #5**: 3 tiradas de tarot destacadas
6. **CTA #6**: Bottom navigation (5 items)

**Problema**: Los CTAs #1 y #2 comparten el mismo peso visual (dos botones side-by-side en desktop, stacked en mobile). No hay una acción principal indiscutible. Todos los servicios parecen tener la misma importancia.

### Jerarquía recomendada

1. **CTA #1 (PRIMARIO)**: "Sacar una carta" — acción más rápida, sin fricción, valor inmediato
2. **CTA #2 (SECUNDARIO)**: "Tu horóscopo de hoy" — si daily_insight se activa con signo recordado
3. **CTA #3 (ENGAGEMENT)**: "Consultar mi luna" — revisita diaria, personalizado
4. **CTA #4 (DESCUBRIMIENTO)**: Tiradas destacadas / signos

---

## SECCIÓN 5 — MAPA DE SERVICIOS

> ¿Puede un usuario descubrir fácilmente todo lo valioso que Creovision ya sabe hacer?

| Servicio | ¿Visible en Home? | ¿Dónde? | ¿Qué tan temprano? | ¿Nombre explica? | ¿Tiene CTA? | ¿Visual invita? | ¿Beneficio explicado? | ¿Requiere cuenta? | ¿Destino funciona? | Fricción | Potencial | Prioridad recomendada |
|----------|-------------------|---------|-------------------|-----------------|-------------|-----------------|----------------------|-------------------|-------------------|----------|-----------|----------------------|
| **Carta del día** | ✅ | Hero CTA#1 | Viewport 1.5 | ✅ "Sacar una carta" | ✅ | Parcial | No en Home | No | ✅ | Baja | ⭐⭐⭐⭐⭐ | Mantener en Hero |
| **Tirada 3 cartas — Amor** | ✅ | FeaturedReadings | Viewport 4-5 | ✅ "Amor" | ✅ "Comenzar tirada" | ✅ (imagen) | ✅ | No | ✅ | Baja | ⭐⭐⭐⭐⭐ | Mantener |
| **Tirada 3 cartas — Trabajo** | ✅ | FeaturedReadings | Viewport 4-5 | ✅ "Trabajo" | ✅ "Comenzar tirada" | ✅ (imagen) | ✅ | No | ❌ **Ruta oculta** | **Crítica** | ⭐⭐⭐⭐ | **Activar feature** |
| **Tirada 3 cartas — Decisiones** | ✅ | FeaturedReadings | Viewport 4-5 | ✅ "Decisiones" | ✅ "Comenzar tirada" | ✅ (imagen) | ✅ | No | ❌ **Ruta oculta** | **Crítica** | ⭐⭐⭐⭐ | **Activar feature** |
| **Tarot Sí/No** | ❌ | No aparece | — | — | ❌ | ❌ | ❌ | No | ✅ | Alta | ⭐⭐⭐ | Añadir como card adicional |
| **Horóscopo diario** | ❌ | `daily_insight: false` | — | — | ❌ | ❌ | ❌ | No | ✅ | — | ⭐⭐⭐⭐⭐ | **Activar inmediatamente** |
| **Horóscopo semanal** | ❌ | No aparece | — | — | ❌ | ❌ | ❌ | No | ✅ | — | ⭐⭐⭐⭐ | Considerar inclusión |
| **Horóscopo mensual** | ❌ | No aparece | — | — | ❌ | ❌ | ❌ | No | ✅ | — | ⭐⭐⭐ | Baja prioridad |
| **Selector zodiacal** | ✅ | ZodiacSelector | Viewport 3-4 | ✅ "Elige tu signo" | ✅ (12 links) | ✅ (símbolos) | ✅ | No | ✅ | Baja | ⭐⭐⭐⭐ | Mantener; mejorar scroll |
| **Tu luna hoy** | ✅ | MoonTodaySection | Viewport 2 | ✅ "Tu luna hoy" | ✅ "Consultar mi luna" | ✅ (datos reales) | ✅ | No (lectura), Sí (guardar) | ✅ | Media | ⭐⭐⭐⭐⭐ | Excelente; motor de revisita |
| **Fases lunares** | ❌ | No aparece | — | — | ❌ | ❌ | ❌ | No | ✅ | — | ⭐⭐⭐ | Enlace desde MoonToday |
| **Calendario lunar** | ❌ | No aparece | — | — | ❌ | ❌ | ❌ | No | ✅ | — | ⭐⭐⭐ | Enlace desde MoonToday |
| **Compatibilidad** | ✅ | CompatibilitySection | Viewport 3 | ✅ "Compara cualquier pareja zodiacal" | ✅ "Ver compatibilidad" | Parcial (selects) | ✅ | No | ✅ | Media (2 selects) | ⭐⭐⭐⭐ | Mantener; preseleccionar signo |
| **Guías** | ⚠️ | FeaturedGuidesSection | Viewport 6-7 | ✅ "Guías para comprenderte mejor" | ⚠️ "Ver todas" | ❌ Placeholder | ❌ | No | ⚠️ | Alta | ⭐⭐⭐ | Llenar con contenido o mover |
| **Explorar temas** | ✅ | ExploreTopicsSection | Viewport 7-8 | ✅ "¿Qué deseas comprender?" | ✅ (6 links) | ❌ Sin imágenes | ✅ | No | ✅ | Baja | ⭐⭐⭐ | Añadir iconos |
| **Buscador** | ❌ | No aparece en Home | — | — | ❌ | ❌ | ❌ | Sí (público) | ✅ | — | ⭐⭐⭐ | Añadir en header |
| **Mi espacio / Perfil** | ✅ | PersonalSpaceSection | Viewport 8-9 | ✅ "Tu universo personal" | ✅ "Abrir mi espacio" | ✅ (ilustración) | ✅ | Sí | ✅ | Media (login) | ⭐⭐⭐⭐ | Mantener; mejorar comunicación |
| **Asistente IA** | ❌ | `assistant: "hidden"` | — | — | ❌ | ❌ | ❌ | — | — | — | ⭐⭐ | Postergar |
| **Astrología (carta natal)** | ❌ | `astrology: "hidden"` | — | — | ❌ | ❌ | ❌ | — | — | — | ⭐⭐⭐ | Evaluar activación |

### Matriz de visibilidad

```
Servicios VISIBLES en Home (8):
  ✅ Carta del día
  ✅ Tirada Amor
  ⚠️ Tirada Trabajo (link roto)
  ⚠️ Tirada Decisiones (link roto)
  ✅ Selector zodiacal (12 signos)
  ✅ Tu luna hoy
  ✅ Compatibilidad
  ⚠️ Guías (placeholder)

Servicios INVISIBLES en Home (11):
  ❌ Horóscopo diario (backend listo, frontend oculto)
  ❌ Horóscopo semanal
  ❌ Horóscopo mensual
  ❌ Tarot Sí/No
  ❌ Fases lunares
  ❌ Calendario lunar
  ❌ Buscador
  ❌ Astrología / Carta natal
  ❌ Asistente IA
  ❌ Perfil / Historial (solo como sección final)
  ❌ Lecturas guardadas (ídem)
```

---

## SECCIÓN 6 — MAPA DE REVISITA

### ¿Por qué volver mañana? Inventario de activos de retención

| Activo | ¿Existe? | ¿Visible en Home? | ¿Cambia diariamente? | ¿El usuario lo percibe? |
|--------|----------|-------------------|----------------------|------------------------|
| Horóscopo diario | ✅ (backend) | ❌ (daily_insight: false) | ✅ | ❌ |
| Luna de hoy | ✅ (datos reales) | ✅ | ✅ (fase, iluminación, signo) | Parcial — no se comunica "mañana será diferente" |
| Carta del día | ✅ | ✅ (CTA hero) | ✅ | Parcial — no se indica frecuencia |
| Lecturas guardadas | ✅ | ❌ (solo en /mi-espacio) | Depende del usuario | ❌ |
| Historial | ✅ | ❌ | Depende del usuario | ❌ |
| Contenido semanal | ❌ | ❌ | — | ❌ |
| Newsletter | ❌ (demo) | ⚠️ | — | ❌ |

### Clasificación

| Tipo | Pregunta | Respuesta actual |
|------|----------|-----------------|
| **Diaria** | ¿Qué cambia cada día? | La luna (datos astronómicos), pero no se comunica. El horóscopo diario existe pero está oculto. La carta del día podría cambiar. |
| **Semanal** | ¿Qué razón hay para volver cada semana? | **Ninguna visible.** |
| **Personal** | ¿Qué mejora mientras más usa Creovision? | Lecturas guardadas e historial (solo visible en /mi-espacio). Sin historial de signos preferidos en Home. |
| **Social** | ¿Hay razones relacionadas con otras personas? | Compatibilidad (pero no se sugiere "comparte esto con alguien") |
| **Continuidad** | ¿Creovision recuerda lo que hice? | No en Home. La Home es idéntica para usuarios nuevos y recurrentes. |

### Motivos de revisita recomendados

1. **Diario**: "Tu horóscopo de hoy" (ya existe backend, solo activar sección) + "La luna hoy está en {signo}" (ya existe, comunicar cambio diario)
2. **Semanal**: Horóscopo semanal + "La luna cambiará de fase el {día}"
3. **Personal**: "Continúa donde lo dejaste" (última lectura), "Tu signo: {signo}" recordado
4. **Social**: "Comparte tu compatibilidad con alguien"
5. **Continuidad**: "Tus últimas 3 lecturas" en Home para usuarios autenticados

---

## SECCIÓN 7 — ARQUITECTURA RECOMENDADA DE HOME

### Orden actual

```
1. Hero (ilustración lunar + copy + 2 CTAs)
2. Moon Today (datos lunares reales + CTA)
3. Compatibility (2 selects + CTA)
4. Zodiac Selector (12 signos scroll horizontal)
5. Featured Tarot (3 tiradas destacadas + CTA)
6. Daily Insight (❌ deshabilitado)
7. Featured Guides (⚠️ placeholder)
8. Explore Topics (6 categorías)
9. Personal Space (mi espacio + CTA)
10. Newsletter (❌ demo no funcional)
```

### Orden recomendado

```
1. Hero REDISEÑADO
   - Eyebrow + H1 + description (visibles completos)
   - 1 CTA primario visible ("Sacar una carta")
   - Ilustración lunar REDUCIDA (max 140px en mobile)
   - Sin zodiac quick select (ya existe ZodiacSelector abajo)
   
2. Tu horóscopo de hoy ← NUEVO / REACTIVADO (daily_insight)
   - Si el usuario tiene signo guardado: mostrar horóscopo directamente
   - Si no: selector rápido de signo
   - CTA: "Leer horóscopo completo"
   - RAZÓN PARA VOLVER MAÑANA
   
3. Tu luna hoy (Moon Today) ← MANTENER, SUBIR
   - Datos astronómicos reales
   - Comunicar cambio diario: "Mañana la luna estará en {signo}"
   - CTA: "Consultar mi luna"
   - RAZÓN PARA VOLVER MAÑANA
   
4. Tiradas destacadas (Featured Tarot) ← SUBIR
   - 3 cards con imágenes + CTAs directos
   - Activar Trabajo y Decisiones como features públicas
   - EXPERIENCIA INMEDIATA
   
5. Elige tu signo (Zodiac Selector) ← MANTENER
   - Carrusel horizontal con indicador de scroll
   - 12 signos con símbolos
   - DESCUBRIMIENTO
   
6. Compatibilidad ← BAJAR
   - Preseleccionar signo del usuario si conocido
   - EXPERIENCIA COMPLEMENTARIA
   
7. Explora por temas ← MANTENER
   - Añadir iconos/ilustraciones
   - DESCUBRIMIENTO EDITORIAL
   
8. Para usuarios autenticados: CONTINUIDAD ← NUEVO
   - "Tu última lectura"
   - "Continúa donde lo dejaste"
   - Acceso rápido a lecturas guardadas
   - SOLO VISIBLE SI AUTENTICADO
   
9. Tu universo personal (Personal Space) ← MOVER AL FINAL
   - Para no autenticados: beneficio de crear cuenta
   - Para autenticados: acceso a perfil
   
10. Guías ← DESHABILITAR hasta tener contenido real
11. Newsletter ← DESHABILITAR hasta tener endpoint
```

### Razones para cada cambio

| Cambio | Razón |
|--------|-------|
| Hero: reducir ilustración, asegurar CTA visible | P0: Conversión inmediata. El usuario debe poder actuar sin scroll |
| Hero: 1 CTA en vez de 2 | Reducir parálisis de decisión. "Sacar una carta" es la acción más rápida |
| Activar Daily Insight sección #2 | P0: Retención. Es la razón #1 para volver mañana |
| Moon Today sección #3 | P1: Segundo motor de revisita. Comunicar cambio diario |
| Subir Featured Tarot a #4 | P1: Experiencia de mayor valor (3 cartas interactivas) por encima de selector zodiacal (informativo) |
| Bajar Compatibility | P2: No es entrada principal; requiere 2 selecciones |
| Añadir sección de continuidad para autenticados | P1: Diferenciar experiencia; dar razón para crear cuenta |
| Deshabilitar Guías y Newsletter hasta que funcionen | P1: No mostrar placeholders; dañan credibilidad |

---

## SECCIÓN 8 — QUICK WINS (alto impacto, bajo riesgo)

| # | Acción | Impacto | Riesgo | Esfuerzo estimado |
|---|--------|---------|--------|-------------------|
| 1 | **Activar `daily_insight: true`** en homeConfig.ts y `horoscope: "enabled"` en public-features.ts | **P0**: Motor de revisita diaria. El backend ya genera 48 horóscopos/día | Bajo: solo cambiar 2 flags | 5 min |
| 2 | **Activar `tarotThreeCardsTrabajo` y `tarotThreeCardsDecision`** en public-features.ts | **P0**: Dos CTAs en Home que actualmente llevan a rutas ocultas | Bajo: solo cambiar 2 flags. Verificar que las páginas funcionan | 5 min |
| 3 | **Reducir altura de ilustración lunar en mobile** (`h-56` → `h-36` o `h-40`) | **P0**: Recuperar ~80px de viewport para contenido/CTAs | Bajo: un cambio de clase Tailwind | 2 min |
| 4 | **Invertir orden en mobile**: texto antes que ilustración (cambiar `order-first` → `order-none` en el div de ilustración) | **P0**: El usuario lee el mensaje antes de ver decoración | Bajo: un cambio de clase Tailwind | 2 min |
| 5 | **Añadir indicador visual de scroll** en la parte inferior del hero (flecha, gradiente o "⋮") | **P1**: El usuario sabe que hay más contenido | Bajo: añadir un div con ícono | 15 min |
| 6 | **Deshabilitar FeaturedGuidesSection y HomeNewsletterSection** hasta que tengan contenido/endpoint real | **P1**: Eliminar placeholders que dañan credibilidad | Bajo: `enabled: false` en homeConfig | 2 min |
| 7 | **Cambiar label "Yo" en bottom nav** a "Perfil" o usar solo icono de persona | **P2**: Mejorar descubrimiento de features de cuenta | Bajo: cambio de string | 2 min |
| 8 | **Añadir badge "Nuevo cada día"** en MoonTodaySection | **P1**: Comunicar revisita diaria | Bajo: añadir chip/badge | 15 min |
| 9 | **Comunicar "12 signos"** con indicador de scroll horizontal en ZodiacSelector | **P2**: Mejorar affordance del carrusel | Bajo: añadir dots o gradiente lateral | 30 min |
| 10 | **Reducir padding vertical de secciones** (`py-14/16/20` → `py-10/12/16`) | **P1**: Recuperar espacio vertical; reducir scroll | Bajo-Medio: cambios de clases Tailwind en 5+ componentes | 30 min |

---

## SECCIÓN 9 — CAMBIOS ESTRUCTURALES

### 1. Home condicional por estado de autenticación (P0)

**Problema**: HomePage.render() es idéntico para usuario anónimo y autenticado.

**Beneficio esperado**: 
- Usuario recurrente ve continuidad (última lectura, su signo, su luna)
- Usuario nuevo ve descubrimiento (qué es Creovision, qué puede hacer)
- La diferenciación crea incentivo para crear cuenta

**Propuesta** (sin implementar):
- `HomePage` recibe `authState` (ya disponible en `__root.tsx` vía `AuthProvider`)
- `homeConfig` acepta `sectionOrder` condicional: `anonymousOrder` vs `authenticatedOrder`
- Sección "Tu continuidad" solo visible si autenticado
- Si `daily_insight` está activo y el usuario tiene signo guardado, mostrar horóscopo sin pedir signo

### 2. Sistema de signo persistente (P1)

**Problema**: El selector de signos no recuerda la elección del usuario. Cada visita a Home requiere volver a elegir.

**Beneficio esperado**:
- Horóscopo inmediato sin fricción
- Compatibilidad con signo preseleccionado
- Datos de luna personalizados si hay fecha de nacimiento

### 3. Motor de revisita diaria visible (P0)

**Problema**: Los activos de retención existen (horóscopo diario, luna diaria, carta del día) pero ninguno se comunica como "vuelve mañana".

**Beneficio esperado**:
- Usuario entiende que Creovision es un producto VIVO, no estático
- La Home comunica cambio diario: fecha, fase lunar, horóscopo del día
- Badges/types: "Hoy", "Nuevo cada día", "Actualizado {fecha}"

---

## SECCIÓN 10 — QUÉ NO TOCAR

### Elementos que funcionan bien y deben protegerse

| Elemento | Razón |
|----------|-------|
| **Paleta de colores** (night, violet, gold, ivory) | Identidad visual fuerte y distintiva. No caer en el cliché de astrología blanca/beige |
| **Tipografía Fraunces + Manrope** | Combinación premium. Fraunces para display aporta personalidad; Manrope para body es legible |
| **Ilustración lunar SVG** | Es el activo visual más memorable. Reducir tamaño en mobile, pero NO eliminar |
| **Animaciones de estrellas con reduced-motion** | Buen ejemplo de polish técnico. Mantener el respeto por prefers-reduced-motion |
| **MoonTodaySection con datos reales** | Única sección con datos dinámicos reales. Es el proof-of-concept de que Creovision es un producto, no un blog |
| **CTA "Sacar una carta"** | La acción más rápida y de menor fricción. Debe seguir siendo el CTA #1 |
| **Estructura config-driven** (homeConfig) | Excelente arquitectura para iterar orden sin tocar componentes. Facilita A/B testing |
| **AppShell con gestural drawer** | Implementación técnica sólida (Framer Motion, snap points). No refactorizar |
| **Sistema de feature flags** (public-features.ts) | Permite activar/desactivar features sin deploy. Usarlo más (ej: activar horóscopo, trabajo, decisiones) |
| **Tono editorial del copy** | "Para observar tu momento con claridad", "Sin ruido, sin promesas absolutas" — tono maduro, no esotérico. Mantener esta voz |

---

## ANEXO A — ANÁLISIS POR SECCIÓN DETALLADO

### A.1 — Hero (HomeHero.tsx)

**Copy actual**:
- Eyebrow: "Tarot y ciclos lunares"
- Headline: "Tarot, luna y guías para comprender tu momento"
- Description: "Cartas de tarot, ciclos lunares y guías editoriales para observar tu momento con claridad."

**Evaluación**:
- Claridad: 6/10 — Dice qué ofrece pero no por qué debería importarme
- Especificidad: 5/10 — "Tarot, luna y guías" es genérico; ¿qué tipo de tarot?, ¿qué luna?
- Diferenciación: 6/10 — "Observar tu momento con claridad" es buen ángulo, no es el típico "descubre tu futuro"
- Beneficio: 4/10 — No comunica beneficio concreto. ¿Qué gano yo?
- Emocionalidad: 5/10 — Correcto pero no genera deseo
- Credibilidad: 7/10 — Tono sobrio, sin promesas exageradas
- Memorabilidad: 4/10 — "Comprender tu momento" es difuso; no se graba

**CTAs**: 
- "Sacar una carta" → `/tarot/carta-del-dia` (bueno: específico, rápida acción)
- "Explorar tiradas" → `/tarot` (regular: genérico, compite con el primero)

**Estructura visual**:
- Mobile: ilustración primero (`order-first`), texto después. Esto es incorrecto.
- Desktop: grid 2 columnas, texto + ilustración balanceados
- Altura total estimada en mobile 390×844: ~650-700px (casi todo el viewport)

**Problemas específicos**:
1. `showZodiacQuickSelect: false` es correcto — ya existe ZodiacSelector como sección independiente
2. `max-w-[12ch]` en H1 mobile — demasiado restrictivo, el texto se rompe en muchas líneas
3. Ilustración `order-first` + `h-56` en mobile — ~39% del viewport útil es decoración
4. CTAs stacked en mobile (`flex-col`) — dos botones full-width ocupan mucho espacio

**Propuesta de estructura ideal** (NO implementar):
```
Mobile:
  Eyebrow → H1 → Description → ILUSTRACIÓN (reducida, 120-140px) → CTA principal (1 solo)
  Altura total: ~450-500px (vs ~650-700px actual)
  
Desktop:
  Texto (izquierda, 55%) + Ilustración (derecha, 45%) → CTAs debajo del texto
  Altura: mantener ~500-600px
```

### A.2 — Moon Today (MoonTodaySection.tsx)

**Fortalezas**:
- Única sección con datos astronómicos reales (fase lunar, iluminación, signo)
- Integración con servicio real (`moonQueries.today()`)
- Buen manejo de estados: loading (skeleton), error (unavailable), success (card)
- Copy efectivo: "Tu luna hoy" es personal, directo

**Debilidades**:
- No comunica que los datos cambian diariamente
- CTA "Consultar mi luna" requiere fecha de nacimiento — fricción no comunicada
- `MoonTodayCard` no es clickeable (solo informativa) — oportunidad perdida

**Métricas**:
- Distancia desde inicio de sección hasta CTA: ~150px (eyebrow + título + descripción + gap)
- Vista previa de datos lunares es buen anzuelo para el CTA
- Sección bien ubicada como #2 (después del hero)

### A.3 — Zodiac Selector (ZodiacSelector.tsx)

**Fortalezas**:
- Visual limpio: 12 signos con símbolo + nombre + fechas
- Snap-scroll en mobile (Embla Carousel)
- Grid responsive: 2→3→4→6 columnas
- Buenas prácticas: `useSelectedSign` con localStorage

**Debilidades**:
- Sin indicador visual de "hay más signos" en mobile (flechas, dots, gradiente)
- Sin preselección del signo del usuario (si ya fue seleccionado antes)
- `showDates: false` en configuración actual — las fechas son información útil para No astrólogos

**Problema de espacio investigado**:
- El "gran espacio vacío" reportado después del selector es probablemente causado por:
  - `min-height` del contenedor del carrusel en mobile
  - Gap entre grid items que no colapsa correctamente
  - O una sección subsiguiente con `py-` grande
- Sin acceso al render real, la causa más probable es `py-16` o similar en el Container de la sección

### A.4 — Featured Tarot (FeaturedReadingsSection.tsx)

**Fortalezas**:
- 3 tiradas con imágenes, títulos y CTAs claros
- "Comenzar tirada" es un CTA fuerte y accionable
- Imágenes WebP con fallback
- Carrusel adaptativo

**Debilidades**:
- Headline excesivamente largo: "Elige un tema, conecta con tu situación y descubre una orientación simbólica a través de tres cartas." (134 caracteres) — en mobile ocupa ~4-5 líneas
- Trabajo y Decisiones tienen rutas ocultas (`public-features.ts`)
- "Ver tarot" como CTA secundario es redundante
- Sin indicación de que Amor es solo un ejemplo (¿el usuario sabe que hay más temas?)

### A.5 — Compatibility (CompatibilitySection.tsx)

**Fortalezas**:
- Buena explicación: "78 combinaciones canónicas están disponibles"
- Dos selects + CTA claro
- Buen ritmo visual alternando fondo claro

**Debilidades**:
- Sin preselección de signo si el usuario ya lo indicó
- 2 selects + botón = 3 interacciones antes del valor
- label genérico: "Tu signo" / "El otro signo" — podría ser más cálido

### A.6 — Featured Guides (FeaturedGuidesSection.tsx)

**Estado actual**: PLACEHOLDER
- Cards con "Próximamente" no aportan valor
- "Ver todas" lleva a `/guias` que también puede estar vacío
- **Recomendación**: Deshabilitar sección (`enabled: false`) hasta tener al menos 4 guías publicadas

### A.7 — Explore Topics (ExploreTopicsSection.tsx)

**Fortalezas**:
- "¿Qué deseas comprender?" es buena pregunta disparadora
- Grid de categorías limpio
- Links directos a contenido editorial

**Debilidades**:
- Sin iconos/ilustraciones — poco atractivo visual
- "Encuentra contenido organizado según las preguntas que pueden estar acompañándote ahora" — copy largo y poco concreto

### A.8 — Personal Space (PersonalSpaceSection.tsx)

**Fortalezas**:
- Buena sección para comunicar valor de cuenta
- Diseño premium con acentos dorados
- 4 beneficios listados (lecturas, favoritos, historial, perfil)
- Ilustración SVG decorativa

**Debilidades**:
- Muy abajo en la página (sección #9 de 10)
- Usuario no autenticado hace click en "Abrir mi espacio" y va a login sin contexto
- Copy "Tu universo personal, reunido en un solo lugar" es aspiracional pero no concreto

### A.9 — Newsletter (HomeNewsletterSection.tsx)

**Estado actual**: DEMO NO FUNCIONAL
- Formulario con validación Zod pero sin endpoint
- Label "Demo" visible
- **Recomendación**: Deshabilitar hasta tener endpoint y estrategia de email

---

## ANEXO B — EVALUACIÓN DE PERSONAS

### Persona 1: Usuario curioso (no sabe nada de astrología)

| Pregunta | Respuesta |
|----------|-----------|
| ¿Qué cree que es Creovision? | Un sitio sobre tarot y astrología, quizás un blog |
| ¿Qué entiende que puede hacer? | Sacar cartas de tarot, ver la luna |
| ¿Qué elemento observa primero? | La luna grande decorativa |
| ¿Qué elemento intenta tocar primero? | La luna (no es interactiva) → frustración sutil |
| ¿Sabe cuál es la acción principal? | No claramente; hay varios botones |
| ¿Existe alguna duda sobre por dónde comenzar? | Sí — ¿saco una carta?, ¿exploro tiradas?, ¿veo la luna? |
| ¿Percibe contenido, producto o web editorial? | Web editorial con algunas herramientas interactivas |
| ¿La experiencia transmite confianza? | Parcial — diseño cuidado pero placeholders (Guías, Newsletter) generan desconfianza |
| ¿Transmite personalidad propia? | Sí — la estética oscura con luna y violeta es distintiva |
| ¿Recuerda algo distintivo después de cerrar? | La luna con anillos; el fondo oscuro |

### Persona 2: Usuario de astrología (busca horóscopo)

| Pregunta | Respuesta |
|----------|-----------|
| ¿Qué cree que es Creovision? | Una plataforma de astrología con tarot |
| ¿Qué entiende que puede hacer? | Ver signos del zodiaco, quizás horóscopo |
| ¿Encuentra horóscopo rápidamente? | Parcial — Está en bottom nav "Horóscopo" pero no en la Home como sección |
| ¿El selector de signos es claro? | Sí, pero no sabe si hay horóscopo diario o solo información del signo |
| ¿Volvería mañana? | No hay razón visible para hacerlo |

### Persona 3: Usuario de tarot (quiere hacer una tirada ahora)

| Pregunta | Respuesta |
|----------|-----------|
| ¿Qué cree que es Creovision? | Un sitio de tarot interactivo |
| ¿Qué entiende que puede hacer? | Tiradas de cartas |
| ¿Encuentra una tirada rápido? | Sí — "Sacar una carta" en el hero, tiradas destacadas más abajo |
| ¿La experiencia de tirada es accesible? | Sí, pero Trabajo y Decisiones tienen links rotos |
| ¿Haría otra tirada después? | Posiblemente — pero no hay "probar otra tirada" al terminar |

### Persona 4: Usuario recurrente (ya visitó ayer)

| Pregunta | Respuesta |
|----------|-----------|
| ¿Qué cambió desde ayer? | La fase lunar (datos reales) pero no se destaca |
| ¿La Home lo reconoce? | No — idéntica a la primera visita |
| ¿Ve su actividad reciente? | No |
| ¿Tiene acceso rápido a su signo? | Tiene que volver a seleccionarlo |
| ¿Encuentra razón para seguir usando? | Solo si recuerda por sí mismo volver |
| ¿La experiencia mejora con el uso? | No perceptiblemente desde la Home |

### Test de timing

**Después de 3 segundos**:
- ¿Qué es? → "Algo de tarot y astrología... hay una luna grande"
- ¿Qué puedo hacer? → "No sé exactamente... ¿ver la luna?, ¿cartas?"
- ¿Por qué debería interesarme? → "No está claro aún"

**Después de 8 segundos (con scroll)**:
- ¿Tengo una acción obvia? → "Hay botones: sacar carta, consultar luna, ver compatibilidad..."
- ¿Hay algo personalizado para mí? → "No todavía"
- ¿Quiero continuar? → "Quizás... probar la carta"

---

## ANEXO C — EVALUACIÓN DE NAVEGACIÓN

### Mobile Bottom Navigation

| Item | Icono | ¿Es correcto? | ¿Falta? | Problema |
|------|-------|---------------|---------|----------|
| Inicio | home | ✅ | — | — |
| Horóscopo | zodiac | ✅ | — | ¿El usuario sabe qué es "Horóscopo" vs "signos"? |
| Tarot | tarot | ✅ | — | — |
| Luna | moon | ✅ | — | Podría agrupar fases, calendario, tu luna |
| Yo | user | ⚠️ | Claridad | "Yo" es ambiguo. ¿Perfil?, ¿Configuración?, ¿Mis cosas? |

**Evaluación**:
- ¿Son las cinco áreas correctas? → Sí, cubren los pilares del producto
- ¿Falta una función principal? → Buscador no está en bottom nav (solo en drawer)
- ¿Etiquetas entendibles? → "Yo" es el punto débil
- ¿Estado activo claro? → Sí (icono filled vs outline)
- ¿La barra tapa contenido? → Sí, ~56px fijos. Pero es estándar en mobile
- ¿Respeta safe-area? → Sí (`pb-safe` en el contenedor)
- ¿Tap targets adecuados? → Sí (>44px)
- ¿Se siente nativa o web? → Más nativa que web — buen trabajo

### Mobile Navigation Drawer

- **Correcto**: Animación gestual (Framer Motion), snap points, cierre al navegar
- **Correcto**: Links diferenciados para autenticados vs no autenticados
- **Correcto**: Se oculta cuando el path es `/mi-espacio` (evita redundancia)
- **Mejorable**: El drawer duplica varios links de la bottom nav — considerar si es necesario

### Header

- **Correcto**: SkipLink para accesibilidad
- **Correcto**: Logo clickeable → Home
- **Correcto**: Hamburguesa solo en mobile/tablet
- **Mejorable**: Sin buscador en header (está en drawer)

---

## ANEXO D — EVALUACIÓN DE CALIDAD VISUAL 2026

| Categoría | Puntuación | Observación |
|-----------|-----------|-------------|
| Identidad | 8/10 | Fuerte, distintiva, reconocible |
| Jerarquía | 4/10 | Plana; todo compite; nada domina |
| Tipografía | 8/10 | Fraunces display + Manrope body: excelente combinación |
| Espaciado | 5/10 | Excesivo en mobile; generoso en desktop (correcto) |
| Densidad | 4/10 | Baja densidad de información en mobile; demasiado scroll |
| Consistencia | 7/10 | Paleta, tipografía, bordes consistentes |
| Microinteracciones | 5/10 | Animaciones de estrellas (bueno); pocos hover/pressed states |
| Feedback táctil | 4/10 | Escasos estados de pressed/active |
| Motion | 6/10 | Animaciones SVG + drawer gestual; sin transiciones entre secciones |
| States | 5/10 | Hover, focus, active, disabled cubiertos parcialmente |
| Accesibilidad | 6/10 | aria-labels, reduced-motion, skip-link; contraste por revisar |
| Mobile polish | 3/10 | Primer viewport mal resuelto; texto potencialmente cortado |
| Sensación premium | 6/10 | Buena base; placeholders y espacio vacío restan |
| Originalidad | 7/10 | No parece un blog genérico; tiene personalidad |

**Advertencia**: El espacio vacío NO es minimalismo premium. Un exceso de padding sin función (especialmente en mobile) es un fallo de diseño, no una elección estética.

---

## ANEXO E — DEAD ENDS (callejones sin salida)

| Después de... | ¿Próxima acción? | ¿Es relevante? | ¿Ayuda a descubrir? |
|---------------|------------------|----------------|---------------------|
| Leer horóscopo | ❌ No hay | — | — |
| Leer luna de hoy | ❌ No hay | — | — |
| Tirada de tarot | ❌ No hay "probar otra" | — | — |
| Compatibilidad | ❌ No hay "probar otra pareja" | — | — |
| Guardar lectura | ❌ No hay "ver mis lecturas" | — | — |
| Crear perfil | ❌ No hay onboarding post-registro | — | — |

**Conclusión**: Creovision no guía al usuario después de completar una acción. Cada experiencia termina en un callejón sin salida. Esto reduce sesiones múltiples y exploración de otros servicios.

---

## ANEXO F — VALUE DENSITY POR VIEWPORT (móvil 390×844)

| Viewport | Qué ve | Qué aprende | Qué puede tocar | Valor | CTA |
|----------|--------|-------------|-----------------|-------|-----|
| 1 (0-740px) | Luna decorativa, eyebrow, H1 parcial, descripción parcial | Que es sobre tarot y luna | Nada (CTA fuera de viewport) | Bajo | ❌ |
| 2 (740-1480px) | CTAs hero, Moon Today section | Que puede sacar carta, consultar luna | "Sacar una carta", "Consultar mi luna" | Medio-Alto | ✅ |
| 3 (1480-2220px) | Compatibility, Zodiac Selector | Que puede comparar signos, ver su signo | 2 selects + botón, 12 signos | Medio | ✅ |
| 4 (2220-2960px) | Featured Tarot | Que hay tiradas de amor, trabajo, decisiones | "Comenzar tirada" × 3 | Alto | ✅ |
| 5 (2960-3700px) | Featured Guides (placeholder) | Que "próximamente" habrá guías | Nada real | Bajo | ❌ |
| 6 (3700-4440px) | Explore Topics, Personal Space | Que puede explorar temas, crear cuenta | 6 categorías, "Abrir mi espacio" | Medio | ✅ |
| 7 (4440-5180px) | Newsletter (demo) | Que hay un newsletter (no funcional) | Nada real | Nulo | ❌ |

**Viewports decorativos**: 1 (parcialmente)
**Viewports informativos**: 3, 5
**Viewports interactivos**: 2, 4, 6
**Viewports muertos**: 5 (placeholder), 7 (demo)

**Densidad de valor**: 4 viewports con valor real de 7 = **57% de eficiencia**

---

## ANEXO G — PRIORIZACIÓN COMPLETA

### P0 — Impide comprender, comenzar o acceder

| # | Problema | Componente |
|---|----------|------------|
| P0-1 | CTA no visible en primer viewport móvil | HomeHero.tsx |
| P0-2 | Home idéntica para usuario nuevo y recurrente | HomePage.tsx |
| P0-3 | Horóscopo diario invisible (daily_insight: false) | homeConfig.ts |
| P0-4 | Tiradas Trabajo y Decisiones con rutas ocultas | public-features.ts |
| P0-5 | Callejones sin salida tras cada experiencia | Arquitectura |

### P1 — Reduce conversión, descubrimiento o revisita

| # | Problema | Componente |
|---|----------|------------|
| P1-1 | Featured Guides es placeholder | FeaturedGuidesSection.tsx |
| P1-2 | Newsletter es demo no funcional | HomeNewsletterSection.tsx |
| P1-3 | 10 secciones compiten sin jerarquía clara | homeConfig.ts |
| P1-4 | Exceso de padding vertical en todas las secciones | Múltiples |
| P1-5 | Sin comunicación de cambio diario | MoonTodaySection, Hero |
| P1-6 | Sin signo persistente para usuario recurrente | ZodiacSelector, useSelectedSign |

### P2 — Reduce calidad, claridad o sensación premium

| # | Problema | Componente |
|---|----------|------------|
| P2-1 | Label "Yo" ambiguo en bottom nav | MobileNavigationDrawer.tsx |
| P2-2 | Sin indicador de scroll horizontal en ZodiacSelector | ZodiacSelector.tsx |
| P2-3 | Headline de Featured Tarot excesivamente largo | FeaturedReadingsSection.tsx |
| P2-4 | Sin iconos en Explore Topics | ExploreTopicsSection.tsx |
| P2-5 | "Ver tarot" redundante con CTA del hero | FeaturedReadingsSection.tsx |

### P3 — Refinamiento visual/microinteracción

| # | Problema | Componente |
|---|----------|------------|
| P3-1 | Estados hover/pressed inconsistentes | Varios |
| P3-2 | Sin transiciones entre secciones | HomePage.tsx |
| P3-3 | MoonTodayCard no clickeable | MoonTodayCard.tsx |
| P3-4 | Sin skeleton para FeaturedReadings | FeaturedReadingsSection.tsx |

---

*Fin de la auditoría. Documento generado el 8 de agosto de 2026.*
*NO se ha modificado ningún archivo del proyecto.*