# Informe final de implementación y validación — Creovision

**Fecha:** 27 de agosto de 2026  
**Rama:** `redesign/fases-1-5`  
**HEAD remoto:** `08792d4`  
**`origin/main`:** `93e6b28`

## Resumen ejecutivo

Se completó el grupo autorizado de trabajo sin fusionar ni modificar `main` y sin escribir en Supabase remoto. La rama de rediseño ahora contiene un catálogo local completo de **78 cartas Tarot**, lecturas al derecho e invertidas, tres experiencias de astrología personal calculadas en el navegador, un catálogo editorial local de **12 Guías**, fallback resiliente para Tarot y Guías, metadata SEO alineada con Creovision, un sitemap local de 53 URLs únicas y documentación SQL preparada para revisión manual.

La verificación se hizo sobre el entorno local de la rama. Esto significa que las capacidades descritas como funcionales están comprobadas en el código y en el navegador local, pero **todavía no están desplegadas en producción**. La activación de datos remotos, persistencia de perfiles natales y Comunidad sigue pendiente de revisión y ejecución manual.

> **Regla de veracidad:** una ruta, un tipo, una migración o una configuración no se considera capacidad activa por sí sola. En este informe solo se llama funcional a lo que tuvo una prueba de ejecución local o una validación automatizada explícita.

## Cambios implementados

| Área | Estado comprobado | Qué existe realmente | Qué sigue pendiente |
|---|---|---|---|
| Tarot | **Funcional local** | 78 cartas: 22 Mayores y 56 Menores; ficha por carta; significado al derecho e invertido; orientación persistida para Carta del Día; tiradas con cartas únicas | Ejecutar el seed SQL manualmente si se desea disponer del catálogo en Supabase |
| Astrología personal | **Funcional local** | `/astrologia`, `/astrologia/carta-natal`, `/astrologia/ascendente` y `/astrologia/signo-lunar`; posiciones geocéntricas, signo lunar, ascendente y 12 casas iguales | No es Placidus ni carta profesional; no persiste datos; no está desplegado en producción |
| Guías | **Funcional local** | 12 artículos originales, dos por categoría; portada, detalle, filtro por categoría y guía destacada en home; fallback cuando Supabase no responde | Aplicar manualmente el seed SQL si se quiere replicar en la base remota |
| SEO y navegación | **Completado en rama** | Marca `Creovision` en metadata fuente, canonical existente, nuevas rutas en sitemap y navegación desde los hubs | Publicar/desplegar la rama y volver a inspeccionar el sitemap público |
| Horóscopo | **Congelado y regresión verificada** | Aries mantiene lectura, tabs, contexto lunar, pregunta reflexiva y enlaces | No se alteró el motor funcional |
| Luna | **Congelado y regresión verificada** | Luna de hoy mantiene fase, iluminación, edad lunar, próximas fases y ocho fichas | No se alteró el motor funcional |
| Comunidad | **Preparada, no activada/verificada remotamente** | Migraciones, RLS y runbook existentes; interfaz preparada | `social:check` previo devolvió `fetch failed` en las cuatro comprobaciones; repetir desde un entorno con conectividad y usar cuentas de prueba |
| Newsletter anónima | **No declarada como funcional** | El formulario visual existe | No se ha demostrado envío real de emails anónimos |
| Producción | **No actualizada por esta tarea** | Los cambios están en la rama de trabajo remota | Hace falta desplegar/revisar antes de afirmar disponibilidad pública |

## Tarot: implementación y evidencia

El catálogo local contiene 78 registros únicos, con `22` Arcanos Mayores y `56` Arcanos Menores. Cada registro incluye resumen, interpretación al derecho, interpretación invertida, keywords, pregunta de reflexión, tendencia sí/no, orden de presentación y metadata SEO. La UI de Carta del Día muestra la orientación, la guarda junto con la carta en `localStorage` y la recupera al volver a la ruta. La tirada de tres cartas usa extracciones únicas y transmite la orientación a cada resultado.

La biblioteca `/tarot/cartas` y la ficha `/tarot/cartas/as-de-bastos` se probaron localmente. La ficha del As de Bastos confirmó que los Arcanos Menores también tienen página propia y ambos significados. La prueba de `/tarot/tres-cartas` mostró tres cartas diferentes y orientación integrada en el resultado. El repositorio resiliente usa el catálogo local como fallback con timeout breve para no dejar la interfaz bloqueada por una consulta remota inaccesible.

El significado del Tarot se presenta como **lenguaje simbólico de reflexión**, no como predicción determinista ni como asesoramiento médico, legal o financiero. La estructura editorial del catálogo sigue la división ampliamente documentada entre Arcanos Mayores y Menores.[1] [2]

## Astrología personal: implementación y límites

La interfaz pide fecha, hora cuando es necesaria, identificador IANA de zona horaria, coordenadas y una etiqueta opcional de lugar. El cálculo se realiza en memoria en el navegador y no envía esos datos a Supabase ni a un servicio externo. Los campos tienen `id`, `name`, labels asociados, validación de latitud/longitud y mensajes de error visibles.

La prueba reproducible usó `1990-05-15`, `14:30`, `America/Bogota`, `4.7110`, `-74.0721`. La carta mostró posiciones de Sol, Luna, Mercurio, Venus, Marte, Júpiter, Saturno, Urano, Neptuno y Plutón; ascendente en Libra a `1°47′`; y doce casas iguales. El signo lunar, probado sin hora, usó las `12:00` locales y mostró un aviso explícito de aproximación y posible cambio durante el día.

El cálculo utiliza Astronomy Engine para posiciones geocéntricas y traduce longitudes a signos tropicales de referencia.[3] El ascendente se deriva con el tiempo sideral, la longitud geográfica y el horizonte oriental. Las casas se presentan como **casas iguales**, avanzando 30° desde el ascendente. No se afirma precisión profesional, Placidus, causalidad científica ni predicción de hechos.

La migración opcional de perfiles solo añade columnas privadas; no guarda automáticamente resultados ni habilita persistencia en la UI actual. La función pública `get_public_profile` continúa omitiendo los datos natales en la versión revisada del esquema.[4]

## Guías editoriales: implementación y evidencia

Se integraron doce artículos originales, dos por cada categoría: `astrology`, `tarot`, `moon`, `compatibility`, `horoscope` y `editorial`. La portada `/guias` muestra las doce tarjetas; `/temas/tarot` filtra las dos piezas Tarot; y el detalle de la guía sobre cartas invertidas carga título, extracto, cuatro secciones, referencias, autor, índice y un solo aviso editorial global.

El contenido distingue datos astronómicos de interpretación simbólica, evita promesas absolutas y conserva fuentes de referencia en el modelo editorial. La generación local de las Guías se mantiene reproducible fuera del repositorio mediante los scripts auxiliares usados durante esta tarea; la aplicación versiona el resultado final en `src/data/editorial-guides.ts`.

## SEO, navegación y sitemap

Se corrigieron los remanentes de marca `Proyecto Astral` dentro de `src`, incluyendo títulos y Open Graph de rutas existentes. La operación no reescribió motores de Horóscopo ni Luna; solo ajustó textos de identidad y metadata. El sitemap generado en la rama contiene **53 URLs únicas**, incluyendo las tres rutas de astrología personal, seis categorías editoriales, doce detalles de Guías y el perfil editorial de autor. El inventario se generó después de comprobar que las rutas nuevas devolvían `200` y no renderizaban 404.

El sitemap local no debe confundirse con el sitemap público actualmente desplegado. Después de desplegar la rama, se debe volver a inspeccionar el host canónico `https://www.creovision.io` y comprobar paridad, redirects y canonical.

## Validaciones ejecutadas

La matriz local comprobó 14 rutas: hub y tres experiencias de Astrología, portada/detalle/filtro de Guías, Carta del Día, Sí o No, Tres cartas, biblioteca y As de Bastos, Horóscopo de Aries y Luna de hoy. Todas devolvieron `HTTP 200`, título no vacío y ningún patrón de 404. El resultado estructurado está en `creovision_route_validation.json` como archivo de apoyo de esta entrega.

La build de producción de TanStack Start terminó correctamente después de los cambios. `npm run content:check` terminó con `Auditoría editorial OK: 12 signos, 5 lentes y 3 periodos revisados.` El lint focalizado de los archivos nuevos o directamente modificados de las fases funcionales pasó. Una ejecución amplia sobre todo `src/routes` expuso deuda histórica de formato y `no-explicit-any` en código preexistente; no se usó como criterio falso de aprobación global y no se modificó esa deuda ajena a la tarea.

La auditoría DOM de Carta natal encontró seis campos con label asociado, `main#main-content`, headings principales y ausencia de overflow horizontal en el viewport probado. La consola posterior no mostró excepciones de runtime. No se pudo ejecutar un viewport móvil real con Playwright porque el repositorio no tenía esa dependencia y no se añadió una dependencia de prueba solo para esta validación; por ello el responsive móvil queda validado por CSS/layout y revisión visual de la interfaz disponible, no por una matriz automatizada de anchos.

## Commits y control de rama

| Commit | Contenido |
|---|---|
| `71a53b9` | Catálogo Tarot completo y reversos |
| `8816927` | Astrología personal y rutas funcionales |
| `2a09b71` | Catálogo real de Guías y fallback editorial |
| `efd95f0` | Seeds y documentación de activación Supabase |
| `5b6f74d` | Metadata Creovision y sitemap |
| `e81c749` | Labels y names accesibles en formulario natal |
| `08792d4` | Capitalización SEO de títulos Tarot |

La rama remota `origin/redesign/fases-1-5` coincide con `HEAD` en `08792d4`. `origin/main` permanece en `93e6b28`. No se hizo merge, rebase, amend, squash ni force-push.

## Supabase: qué está preparado y qué no

Los archivos se encuentran en `supabase/migrations/` y se acompañan con `docs/supabase-activation/README.md`. El orden recomendado es revisar primero el esquema existente, después el seed Tarot, luego el seed de Guías y finalmente la migración opcional de columnas natales. La documentación incluye queries de comprobación, condiciones de upsert y advertencias de colisiones de slug.

El seed Tarot es idempotente por `slug` y no requiere imágenes comerciales. El seed editorial archiva únicamente el slug demo conocido `articulo-de-demostracion` cuando continúa marcado `is_demo = true`; no archiva todas las filas demo. El upsert de artículos solo actualiza filas demo o la misma fila gestionada por `Equipo editorial`. La migración natal únicamente cambia el esquema de `profiles`; no calcula, no publica y no guarda resultados automáticamente.

> **No se aplicó ninguna migración ni se ejecutó ninguna escritura remota en Supabase.**

## Referencias

[1]: https://www.britannica.com/topic/tarot "Encyclopaedia Britannica — Tarot"

[2]: https://www.britannica.com/topic/Major-Arcana "Encyclopaedia Britannica — Major Arcana"

[3]: https://github.com/cosinekitty/astronomy "Astronomy Engine — documentación y código"

[4]: https://www.astro.com/swisseph/swephinfo_e.htm "Swiss Ephemeris — información técnica de referencia"

[5]: https://science.nasa.gov/moon/moon-phases/ "NASA Science — Moon Phases"

[6]: https://aa.usno.navy.mil/data/MoonPhases "U.S. Naval Observatory — Moon Phases"
