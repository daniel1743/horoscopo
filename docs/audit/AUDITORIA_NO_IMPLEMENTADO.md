# AUDITORÍA — NO IMPLEMENTADO, PARCIAL, DEFECTUOSO O NO VERIFICADO

**Proyecto:** Creovision
**Rama auditada:** `redesign/fases-1-5`
**Fecha de revisión:** 27 de agosto de 2026
**Autor:** Manus AI

## 1. Cómo leer este documento

El documento entregado por Daniel contiene 50 partes y 636 casillas. Todas las casillas aparecen sin marcar en el archivo fuente. Esta auditoría no las marca automáticamente como hechas: compara cada bloque con rutas, componentes, servicios, tipos, migraciones, validaciones y confirmaciones manuales disponibles.

Se usan cuatro estados:

| Estado | Significado |
|---|---|
| **NO** | No existe ruta, interfaz, lógica o datos suficientes para afirmar que funciona. |
| **PARCIAL** | Existe un subconjunto real, pero no cubre el alcance solicitado. |
| **DEFECTUOSO** | Existe una implementación que no cumple un requisito importante o tiene una brecha corregible. |
| **NO VERIFICADO** | Existe código o SQL, pero no hay evidencia suficiente de ejecución remota, cuenta real, producción o dispositivo real. |

> La ausencia de una migración no se presume a partir de una pantalla vacía. Se comprobó expresamente la relación entre llamadas Supabase del código y las 40 migraciones locales.

## 2. Resultado ejecutivo

El núcleo del producto existe, pero el documento maestro describe una plataforma mucho más amplia que la aplicación actual. Ya existe una primera implementación local de tránsitos, sinastría y Numerología Camino de Vida; siguen sin existir o sin estar completos los sistemas profesionales, la persistencia avanzada, astrocartografía, Lenormand, runas, oráculos, chakras, cristales, rituales, sueños, informes y notificaciones.

| Grupo | Estado global |
|---|---|
| Tarot | **PARCIAL**: 78 cartas y reversos existen; mazos, significados por áreas y tiradas avanzadas no |
| Tiradas | **PARCIAL**: carta diaria, sí/no, tres cartas y decisión; faltan muchas tiradas temáticas |
| Diario Tarot | **PARCIAL**: filtros, búsqueda, notas y métricas; faltan campos avanzados y exportación específica |
| Carta natal | **PARCIAL**: 10 cuerpos, rueda, ángulos, casas iguales y aspectos mayores; no sistemas profesionales |
| Casas | **PARCIAL**: 12 casas iguales y planetas por casa; faltan regentes, sistemas configurables e interpretación completa |
| Aspectos | **PARCIAL**: cinco aspectos mayores con orbes fijos; faltan aspectos menores y configuración |
| Sol/Luna/Ascendente | **PARCIAL**: Sol, Luna, ASC, DSC, MC e IC; no dominantes |
| Luna | **PARCIAL**: fases, calendario y próximos eventos; no tránsitos, retorno, tiradas ni rituales |
| Horóscopo | **PARCIAL**: diario, semanal y mensual; no anual, por carta natal ni por tránsitos |
| Tránsitos/predicción | **PARCIAL**: cálculo local de snapshot, velocidades y aspectos; no calendario persistente ni predicción |
| Sinastría | **PARCIAL**: dos cartas en memoria y contactos; no persistencia de personas ni carta compuesta |
| Astrología avanzada | **PARCIAL**: aproximación tropical local con casas iguales y aspectos mayores |
| Astrocartografía | **NO** |
| Numerología | **PARCIAL**: Camino de Vida local; no otros números ni compatibilidad |
| Lenormand | **NO** |
| Runas | **NO** |
| Oráculos | **NO** |
| Chakras/energía | **NO** |
| Cristales | **NO** |
| Rituales/calendario esotérico | **NO**, salvo calendario lunar astronómico |
| Eclipses | **NO** |
| Retrogradaciones | **NO** |
| Enciclopedia esotérica | **PARCIAL**: Guías editoriales, no biblioteca temática completa |
| Sueños | **NO** |
| Integración Tarot + Astrología | **PARCIAL**: enlaces y contexto lunar; no cálculo combinado |
| IA | **PARCIAL**: asistente y RAG de contenido existente; no capacidades astrológicas avanzadas |
| Perfil | **PARCIAL** |
| Otras personas | **NO** |
| Notificaciones | **NO** |
| Búsqueda | **PARCIAL** |
| Favoritos/historial | **PARCIAL** |
| Informes | **NO** |
| Landing | **PARCIAL**: presenta el MVP, no todos los módulos del documento |
| Backend | **PARCIAL** |
| Responsive/UX | **NO VERIFICADO** integralmente |
| SEO | **PARCIAL**: sitemap de 135 URLs y metadatos de superficies reales; falta cobertura de módulos no existentes |
| Seguridad/privacidad | **PARCIAL/NO VERIFICADO**: código natal y social ampliado; E2E y SQL nuevos pendientes |
| Testing | **PARCIAL** |

## 3. Brechas detalladas por parte del documento

### Parte 4 — Tarot completo: **PARCIAL**

**Sí existen:** 78 cartas, 22 Mayores, 56 Menores, Bastos, Copas, Espadas, Oros/Pentáculos, As a diez, Paje, Caballero, Reina y Rey, significado general, palabras clave, significado al derecho y significado invertido.

**No existen o están incompletos:** diferentes mazos; Rider-Waite; Marsella; Thoth; arquitectura de cambio de mazo; selector de mazo; imágenes de cartas; zoom; información del mazo; significados separados para amor, trabajo, dinero, espiritualidad, emociones, psicología, persona, situación, consejo, obstáculo, futuro, positivo, negativo, simbolismo, elemento, numerología y correspondencia astrológica.

La inversión es **PARCIAL**: las 78 cartas tienen texto `reversed`, la selección produce orientación invertida y existe un control local para activar/desactivar reversos. No hay estadísticas persistidas de cartas invertidas, y las categorías bloqueo, exceso, interiorización, retraso y sombra no son campos separados; están mezcladas dentro del texto invertido y no se pueden filtrar o analizar como dimensiones independientes.

### Parte 5 — Tiradas Tarot: **PARCIAL**

**Disponible:** una carta, Tarot sí/no, tres cartas y la tirada declarativa de decisión de dos cartas. La tirada de tres cartas tiene las posiciones influencia, observación y próximo paso; decisión usa dos posiciones orientadas a apoyar y revisar.

**No disponible:** pasado/presente/futuro; situación/acción/resultado; todas las tiradas de amor —qué siente, piensa, intenciones, futuro de relación, compatibilidad, nueva relación, ex pareja, reconciliación, ruptura, soltería, alma gemela, llama gemela, obstáculos y qué saber de una persona—; todas las tiradas de trabajo —trabajo actual, cambio, oportunidad, carrera, proyecto, emprendimiento, jefe/equipo y decisiones—; todas las tiradas de dinero —finanzas, prosperidad, oportunidad, bloqueos, inversión y negocio—; todas las tiradas espirituales —propósito, camino, energía, bloqueos, sombra, lecciones, crecimiento y sueños—.

Tampoco existen Cruz Celta, Cruz simple, Herradura, Árbol de la vida, tirada astrológica, tirada de chakras, anual, mensual, semanal, cumpleaños, Luna nueva, Luna llena o Rueda del año.

No existe constructor de tiradas personalizadas: no se pueden crear tiradas, definir posiciones o significados, elegir cantidad de cartas, elegir cartas manualmente, introducir cartas físicas, guardar una tirada personalizada, editarla, compartirla, exportarla ni generar PDF. Las cuatro lecturas disponibles sí pueden guardarse como lectura Tarot básica, pero eso no equivale a un sistema de tiradas personalizadas.

### Parte 6 — Diario e historial Tarot: **PARCIAL**

Existe una pantalla de lecturas guardadas con fecha, cartas, posiciones, interpretación, nota y eliminación. Existe historial de actividad general y favoritos separados.

No existe un diario Tarot completo con pregunta guardada, hora de lectura, estado emocional, resultado posterior, etiquetas, exportación específica, cartas recurrentes, palos recurrentes, números recurrentes, reversos recurrentes o detección de patrones. Sí existe búsqueda local, filtro por tipo/periodo, métricas básicas, edición de notas y borrado. La pregunta original se excluye deliberadamente del guardado actual por privacidad, de modo que no debe anunciarse como disponible.

La edición actual es **PARCIAL** porque permite editar la nota, no todos los campos de una entrada. Las lecturas guardadas aceptan `daily`, `yes_no`, `three_cards` y `decision` en el código local; la confirmación E2E y la compatibilidad remota de la nueva clave siguen pendientes.

### Parte 7 — Carta natal: **PARCIAL**

**Disponible:** fecha, hora, etiqueta de lugar, coordenadas, zona horaria, Sol, Luna, Mercurio, Venus, Marte, Júpiter, Saturno, Urano, Neptuno y Plutón. El modo de Luna permite hora desconocida como aproximación; carta natal y ascendente requieren hora.

**No disponible:** Nodo Norte; Nodo Sur; Lilith; Quirón; Parte de la Fortuna; Vértice; puntos configurables. Ya existe una rueda natal SVG accesible. Ciudad y país no son campos separados ni existe geocodificación: el usuario introduce coordenadas manualmente. Por eso el soporte de lugar debe considerarse **PARCIAL**.

### Parte 8 — Casas: **PARCIAL**

Se calculan y muestran 12 casas iguales, cúspide, signo y asignación de los 10 cuerpos a cada casa. La rueda y las tablas muestran esa relación. No existe regente de cada casa, aspectos por casa ni interpretación editorial completa de cada casa. No existen sistemas configurables como Placidus, Koch, Whole Sign u otros.

### Parte 9 — Aspectos: **PARCIAL**

Existe cálculo y tabla de cinco aspectos mayores: conjunción, oposición, trígono, cuadratura y sextil, con orbes fijos. No existen quincuncio, semisextil, semicuadratura, sesquicuadratura u otros aspectos menores, orbes configurables ni interpretaciones editoriales especializadas.

### Parte 10 — Sol, Luna y Ascendente: **PARCIAL**

Sol, Luna y Ascendente aparecen en las capacidades básicas, y el motor local también calcula Descendente, Medio Cielo y Fondo del Cielo. No existe Big Three como resumen formal, elemento dominante, modalidad dominante, planeta dominante ni signo dominante.

### Parte 11 — Luna: **PARCIAL**

**Disponible:** fase actual, ocho fases principales, próxima Luna nueva, próxima Luna llena, calendario lunar y páginas de fase. La Luna natal existe en la herramienta de signo lunar personal.

**No disponible:** signo lunar actual en el módulo lunar; casa natal de la Luna; tránsitos lunares; retorno lunar; lunaciones como sistema; tiradas lunares; rituales lunares. La Luna natal no está integrada con casa, tránsitos o diario, por lo que su cobertura global es parcial.

### Parte 12 — Horóscopo: **PARCIAL**

Existen diario, semanal y mensual para los 12 signos. Se muestran resumen, foco, ánimo, energía y, cuando hay contenido remoto, amor, trabajo, bienestar, número y color. El contenido editorial local incorpora contexto, importancia, observación y pregunta reflexiva.

No existe horóscopo anual. No existe personalización por carta natal ni por tránsitos. La existencia de campos en la tabla no garantiza que haya contenido publicado para cada signo y periodo; el estado remoto de las tablas base de horóscopo no fue confirmado en esta auditoría.

### Parte 13 — Tránsitos y predicción: **PARCIAL**

Existe una ruta de tránsitos que calcula localmente un snapshot de posiciones, velocidades, retrogradación y aspectos entre cuerpos de tránsito y la carta introducida. No existe calendario persistente de tránsitos, alertas, notificaciones, cambios de signo guardados, revolución solar, revolución lunar, progresiones secundarias, arco solar, retornos de Saturno/Júpiter/Venus/Luna ni predicción garantizada. No se guardan datos natales ni se envían a la IA.

### Parte 14 — Sinastría y compatibilidad: **PARCIAL**

Existe compatibilidad editorial entre dos signos con seis dimensiones, contextos, fortalezas, desafíos y preguntas reflexivas. También existe una primera sinastría local entre Persona A y Persona B: recibe dos formularios, calcula ambas cartas en memoria y muestra contactos cruzados. No existe persistencia de personas, carta compuesta, carta Davison ni planetas en casas de la otra persona.

Compatibilidad amorosa, emocional, comunicación y espiritualidad aparecen solo como contenidos editoriales o contextos limitados, no como análisis astronómico de dos cartas. No existe un análisis sexual específico independiente.

### Parte 15 — Astrología avanzada: **PARCIAL**

El motor usa aproximación tropical geocéntrica, casas iguales, cuatro ángulos, planetas por casa y cinco aspectos mayores con orbes fijos. No existen zodiaco sideral, dracónico, tradicional, moderno configurable, védico, asteroides, estrellas fijas, puntos medios, partes/lotes, direcciones primarias, dominantes o sistemas de casas configurables. La rueda natal SVG es una representación accesible de los datos calculados, no una carta profesional certificada.

### Parte 16 — Astrocartografía: **NO**

No existe mapa mundial, líneas planetarias, ASC, DSC, MC, IC, interpretación geográfica ni recomendaciones de lugares para amor, trabajo o crecimiento.

### Parte 17 — Numerología: **PARCIAL**

Existe `/numerologia/camino-de-vida`, que calcula en memoria el Camino de Vida a partir de una fecha, conserva 11, 22 y 33 como números maestros y ofrece una interpretación editorial, práctica y pregunta reflexiva. No existe destino, alma, personalidad, expresión, cumpleaños, madurez, año/mes/día personal, numerología del nombre ni compatibilidad numerológica. La fecha no se guarda, no aparece en URL, metadata, analytics ni Comunidad.

### Partes 18 a 25 — Esoterismo avanzado: **NO**

No existen Lenormand —36 cartas, significados, combinaciones, tiradas, diario—; Runas —Elder Futhark, 24 runas, significados, invertidas, tiradas y diario—; biblioteca de oráculos; Chakras —siete chakras, test, meditación, correspondencias, cristales, colores y mantras—; biblioteca de cristales y sus correspondencias; rituales y calendario esotérico; eclipses; retrogradaciones; ingresos planetarios; aspectos astrológicos; ni festividades esotéricas.

El calendario lunar astronómico existente no cubre el calendario ritual solicitado. No se encontraron rutas, tipos de dominio, repositorios, tablas o RPC para estos módulos.

### Parte 26 — Enciclopedia esotérica: **PARCIAL**

Existen Guías editoriales públicas sobre conceptos de astrología, Tarot y Luna. No existe una enciclopedia estructurada navegable de Tarot, astrología, signos, planetas, casas, aspectos, Luna, numerología, runas, Lenormand, cristales, chakras, rituales, símbolos, sueños y terminología como entidades independientes.

### Parte 27 — Sueños: **NO**

No existe diccionario, buscador, símbolos, interpretaciones tradicional/psicológica/espiritual, diario de sueños, fecha, emociones, símbolos recurrentes ni patrones.

### Parte 28 — Integración Tarot + Astrología: **PARCIAL**

Existen enlaces entre horóscopo, Luna, Tarot, compatibilidad y Guías; existe contexto lunar en el horóscopo y una experiencia de Tarot diaria. No existe cálculo combinado de carta natal + Tarot, carta del día según tránsito, Tarot según Luna/fase, Tarot ↔ planetas/signos/casas, Tarot de cumpleaños, revolución solar ni Tarot mensual basado en carta natal.

### Parte 29 — IA esotérica: **PARCIAL**

Existe asistente con preguntas generales, interpretación de Tarot, explicación de horóscopo, preguntas sobre artículos, recomendaciones, conversación, streaming, cuotas, memoria y feedback. El RAG usa Tarot, horóscopos y artículos publicados; el contexto Tarot incluye ahora la tirada de decisión.

No están implementados contextos específicos de carta natal, tránsitos, sinastría, sueños, numerología o interpretación combinada. No existe una relación entre la IA y la tabla natal privada. La IA no debe afirmar capacidades sobre módulos inexistentes.

### Parte 30 — Perfil del usuario: **PARCIAL/DEFECTUOSO**

Existe cuenta, fecha natal básica en el perfil histórico, nueva sección de datos natales privados, perfil público opt-in, aura, preferencias, favoritos, lecturas guardadas e historial. No existe numerología, mazo favorito, diario completo, personas guardadas ni ordenamiento libre de todos los objetos esotéricos.

**Estado de privacidad:** el código local ya incluye `profile_astrology_birth_data` en exportación y eliminación explícita; la tabla no se proyecta en perfil público ni Comunidad. Falta la prueba autenticada real del ciclo de guardar, recuperar, borrar, exportar y eliminar cuenta. El contrato E2E debe verificar además aislamiento entre usuarios y ausencia de acceso anónimo.

### Parte 31 — Otras personas: **NO**

No existe creación, nombre, fecha, hora, lugar, carta natal, compatibilidad, sinastría, guardado, edición o eliminación de perfiles de otras personas.

### Parte 32 — Notificaciones: **NO**

No existen notificaciones para carta diaria, horóscopo, fases, eclipses, retrogradaciones, tránsitos, diario o recordatorios. El flag `pushNotifications` está desactivado y no hay tabla, servicio, endpoint, proveedor ni preferencias de notificación.

### Parte 33 — Buscador global: **PARCIAL**

El buscador indexa artículos, autores, categorías, horóscopos, cartas Tarot, fases lunares, compatibilidad, documentos estáticos de signos/páginas y la página pública de Camino de Vida. No indexa planetas, casas, aspectos, cristales, chakras, runas, Lenormand, sueños, rituales ni resultados privados de tránsitos o sinastría.

### Parte 34 — Favoritos e historial: **PARCIAL**

Existen favoritos de artículos, cartas Tarot, signos, Guías y horóscopos; lecturas Tarot guardadas; historial de actividad; consultas IA persistidas y preferencias de privacidad. No existen favoritos de rituales, cristales, sueños, personas o tránsitos. El historial no cubre todos los objetos del documento y no existe analítica de patrones Tarot.

### Parte 35 — Informes: **NO**

No existe generador de informes de carta natal, compatibilidad, revolución solar, tránsitos, numerología, Tarot anual/mensual, PDF, compartir o imprimir como informe compuesto. El `pdfReports` flag está desactivado.

### Parte 36 — Landing page: **PARCIAL**

La landing enlaza Tarot, carta natal, horóscopo, Luna, compatibilidad, Guías, IA, calendario lunar y espacio personal. Las nuevas rutas de tránsitos, sinastría y Numerología se exponen desde navegación contextual, no como promesas de precisión profesional. Sigue sin existir una biblioteca completa de módulos esotéricos; no debe anunciarse.

### Partes 37 y 38 — Menú, navegación y pantallas: **PARCIAL**

La navegación actual es coherente para el MVP existente e incluye accesos contextuales a Tarot decisión, tránsitos, sinastría y Camino de Vida. No existen ubicaciones reales para mazos alternativos, revoluciones, progresiones, astrocartografía, Lenormand, runas, oráculos, cristales, chakras, rituales, sueños, calendario esotérico o biblioteca completa.

### Parte 39 — Base de datos/SQL: **PARCIAL; no hay dependencia usada sin migración**

El detector local reconstruido encontró 30 tablas y 15 RPC usados por el código, con **0 tablas sin migración local y 0 RPC sin migración local**. Esto responde a la preocupación de una funcionalidad ya escrita pero sin SQL local: no se descubrió ningún objeto Supabase llamado por el código que carezca de una migración versionada.

Los tipos manuales locales ya incluyen `profile_astrology_birth_data`, comentarios, follows y los reportes de comentarios. Deben regenerarse desde el proyecto Supabase correcto después de aplicar los lotes 07 y 08; la tipificación local no confirma por sí sola la existencia remota.

### Parte 40 — Backend y funciones: **PARCIAL**

Los servicios, validaciones, autenticación, autorización, errores, carga, vacío y fallos existen para varias áreas del MVP. No existe backend para los módulos faltantes. La tabla natal privada ya está integrada explícitamente en exportación y eliminación de cuenta en código, pero falta una prueba autenticada real. La moderación social base está creada y protegida; la moderación de comentarios requiere aplicar y probar los lotes 07 y 08.

### Parte 41 — Calidad de cálculos: **PARCIAL**

El motor local documenta sistema tropical aproximado, casas iguales, coordenadas, zona horaria y manejo de horario de verano. La Luna y el motor planetario tienen pruebas unitarias de dominio.

Ya están implementados como cálculos locales las retrogradaciones de tránsitos, cinco aspectos mayores, orbes fijos, cuatro ángulos y casas iguales. No están implementados efemérides avanzadas certificadas, sistemas de casas configurables, precisión profesional ni comparación exhaustiva con una fuente externa. No se debe presentar el motor actual como carta profesional.

### Parte 42 — Responsive y UX: **NO VERIFICADO integralmente**

Hay código responsive, navegación móvil, drawer, estados de carga, estados vacíos, errores y atributos de accesibilidad. Sin embargo, no existe evidencia completa de pruebas manuales en móvil, tablet y desktop para cartas, gráficos, carta natal, calendarios, formularios, modales, diario, tablas y mapas. Los gráficos y mapas exigidos ni siquiera existen en varias áreas.

### Parte 43 — SEO: **PARCIAL**

Existe metadata compartida, canonical, Open Graph, Twitter Card, JSON-LD básico, robots, sitemap, URLs limpias e interlinking para páginas existentes. El sitemap local contiene 135 URLs, incluyendo 78 fichas Tarot, Camino de Vida, Tarot decisión, tránsitos y temas.

Ya existe arquitectura SEO para cada carta individual, Camino de Vida, Tarot decisión, tránsitos y temas. No se deben añadir al sitemap casas, planetas, aspectos, sinastría, runas, Lenormand, cristales, sueños, rituales o bibliotecas que no tengan una página pública real; sinastría permanece fuera por `noindex,nofollow`.

### Parte 44 — Seguridad y privacidad: **PARCIAL/NO VERIFICADO**

**Existe:** autenticación Supabase, middleware de sesión, autorización de roles, RLS en tablas privadas, validación de entradas, límites de IA, separación de secretos server-only, eliminación/exportación básica, privacidad pública del perfil mediante RPC y tabla natal separada con RLS propietario.

**Pendiente o incompleto:** prueba autenticada del ciclo completo natal y cuenta; regeneración de tipos desde Supabase tras aplicar SQL nuevo; prueba con dos usuarios para confirmar aislamiento; prueba de roles admin/editor; revisión integral de sanitización de contenido generado por usuarios; verificación de configuración remota de secretos y proveedor; evidencia de no exposición en logs/analytics en una ejecución real. Los reportes de comentarios aún requieren aplicar el lote 08.

### Parte 45 — Testing: **PARCIAL**

Existen tests de motor lunar y planetario, build, chequeo editorial, chequeo de flujos pendientes y chequeo de centralización. No existe una suite integral para Tarot, reversos, tiradas, persistencia, carta natal, casas, aspectos, tránsitos, sinastría, numerología, runas, Lenormand, autenticación, permisos, APIs, SQL, responsive y SEO crítico.

La suite local consolidada pasó TypeScript, lint, build, contenido, contratos pendientes, sitemap, detector Supabase y `git diff --check`; lint quedó con 0 errores y 7 warnings estructurales de Fast Refresh. El repositorio no tiene script `test` global en `package.json`, y los runtime checks temporales no sustituyen E2E.

## 4. SQL existente pero remoto no confirmado

Las siguientes migraciones tienen archivo local y objetos que el código puede utilizar, pero **no fueron confirmadas mediante capturas de Supabase en esta auditoría**. Esto no significa que falten en Supabase; significa que no se debe afirmar que están activas sin una consulta de verificación:

| Área | Migración local cuya aplicación remota no está confirmada |
|---|---|
| Roles y taxonomía inicial | `20260727225111_4cc4d9e8-78ab-43b9-b0b5-8fde95dab88f.sql` |
| Restricción de funciones base | `20260727225124_0dea4d31-4ef5-4e19-b758-df9c2858db31.sql` |
| Horóscopos | `20260727230101_2fe3d69c-3b93-4165-8737-b7ed960dbff2.sql` |
| Tarot histórico/base | `20260727231128_1f543f88-da2f-493d-9d27-7281fad13262.sql` |
| IA | `20260727232643_17818d1d-884a-4c3e-ae9e-9992ea357b18.sql` |
| Cuenta y perfiles base | `20260727233657_1a7c8205-39fe-4060-bb5d-e350d48bfa6f.sql` |
| Restricción de helpers de Auth | `20260727233709_c39f9cbb-3dcb-43a3-be9e-871127760dcb.sql` |
| Luna y caché | `20260727234835_5231a61a-d04f-49a8-9ef7-e932647d9ded.sql` |
| Compatibilidad | `20260728000558_3390019b-a577-42c7-b624-bdf71eabcd64.sql` |
| Helper adicional de signos | `20260728000612_8120f1af-9bb8-4dc0-82c2-161fcbc1b65c.sql` |
| Seed de compatibilidad | `20260728001017_336aadc0-b1d8-450f-be52-69008c80a8e6.sql` |
| Buscador | `20260728001445_801242a1-aeab-4f9f-9288-a05adce7d446.sql` |
| Admin base | `20260728003217_287ce022-32a5-4b56-b452-c4b1496bfd34.sql` |
| Workflow editorial | `20260728003613_e7391bad-a9ca-4b95-92e5-fffafe68131e.sql` |
| Restricción de perfil y helpers | `20260728004243_31991e38-38b2-4f9e-a899-bc063c8e57da.sql` |
| Métricas de producto | `20260827001000_product_metrics.sql` |

**Confirmadas manualmente por Daniel:** estructura/seed Tarot final; esquema editorial, taxonomía, autor y 12 Guías; tabla natal privada; cinco SQL sociales del muro más corrección de permisos. Las migraciones manuales de Tarot/Editorial sustituyeron el problema de copiado inicial, pero no deben mezclarse con el estado no confirmado de la base histórica.

## 5. Respuesta directa a la preocupación de SQL olvidado

No encontré una función que esté siendo llamada por el código y carezca totalmente de una migración SQL local. El detector produjo `missing_tables=0` y `missing_rpcs=0`.

Sí encontré tres categorías que deben permanecer visibles para no repetir el problema:

1. **SQL existente, aplicación remota no confirmada:** la tabla anterior enumera migraciones históricas que deben verificarse si algún módulo base presenta `relation does not exist`.
2. **SQL confirmado, pero E2E o tipos remotos pendientes:** la tabla natal privada existe y funciona a nivel de tabla/RLS; el código local ya la incluye en exportación/eliminación, pero falta probar el flujo con una cuenta real y regenerar tipos desde el proyecto remoto.
3. **Funcionalidad local sin SQL por diseño o SQL aún pendiente:** tránsitos, sinastría y Numerología calculan en memoria y no requieren tablas nuevas. Comentarios, follows y reportes de comentarios sí tienen código y migraciones locales; deben aplicarse manualmente `07_comments_and_follows.sql` y `08_comment_reports_and_moderation.sql`. Lenormand, runas, oráculos, chakras, cristales, rituales, sueños, informes y notificaciones todavía no tienen código ni SQL; no hay que crear SQL ficticio ahora.

## 6. Pendientes que deben entrar en el cierre operativo

| Prioridad | Brecha o dependencia | Corrección necesaria |
|---|---|---|
| P0 | SQL 07 y 08 no aplicado remotamente | Aplicar manualmente, uno por uno, y verificar RLS/RPC antes de usar comentarios/follows/reportes |
| P0 | No existe E2E autenticado | Probar natal, cuenta, Tarot diario, Comunidad base/ampliada e aislamiento entre usuarios |
| P1 | Tipos manuales no regenerados desde el proyecto remoto | Regenerar tipos después de confirmar el esquema final y comparar el diff |
| P1 | Responsive/UX sin matriz de dispositivos | Revisar rutas nuevas en móvil, tablet y desktop, incluidos formularios y rueda SVG |
| P1 | Calidad astronómica limitada | Comparar con una fuente externa antes de llamar profesional al resultado; mantener disclaimers |
| P2 | Tarot sin mazos alternativos ni significados por área | Diseñar dominio, licencias, contenido y pruebas antes de añadir imágenes |
| P2 | Informes, notificaciones, astrocartografía y esoterismo adicional inexistentes | Diseñar privacidad, proveedor, contenido y persistencia antes de crear nuevas rutas |
| P2 | No hay suite global de pruebas | Evaluar un runner en una decisión separada; los runtime checks actuales no sustituyen E2E |

## 7. Conclusión

El producto no está completo según el documento maestro. El estado honesto es: **MVP real y parcialmente activado, con Tarot, astrología local, Comunidad y Numerología ampliados en código, SQL nuevo pendiente y una cantidad importante de módulos todavía inexistentes**. No hay evidencia para declarar 100% de cumplimiento.

La consolidación local quedó en el commit `ff1483b`. Después Daniel debe aplicar los bloques SQL 07 y 08 uno por uno, capturar sus resultados y ejecutar las pruebas autenticadas y multiusuario. Las mejoras futuras deben priorizarse solo después de esa evidencia.


## Revisión de brechas posterior — 27 de agosto de 2026

La revisión autónoma posterior cerró varias brechas que sí podían resolverse en código local: discoverability de las experiencias astrológicas, flags para rutas nuevas, Tarot pasado/presente/futuro, resumen descriptivo natal, informes de texto locales, diccionario de sueños y enlaces adicionales desde la landing. Estas mejoras deben considerarse **IMPLEMENTADAS localmente**, pero todavía requieren pruebas visuales/E2E y observación en deploy.

La parte 5 ya no debe declarar pasado/presente/futuro como inexistente: ahora existe como tirada local con tres posiciones y queda incluida en el diario y la IA Tarot. Las demás tiradas temáticas, mazos alternativos, imágenes licenciadas, constructor de tiradas y estadísticas avanzadas siguen pendientes.

La parte 10 ya no debe declarar como inexistentes el Big Three, el elemento dominante, la modalidad dominante o el signo más repetido: ahora existe un resumen descriptivo local. No equivale a planeta dominante profesional ni a interpretación astrológica validada científicamente.

La parte 27 ya no debe declarar como inexistente el diccionario de sueños: `/suenos` ofrece veinte símbolos, búsqueda, filtros y preguntas reflexivas. No existe todavía un diario de sueños, patrones personales, persistencia ni interpretación clínica/espiritual determinista.

La parte 30 de Informes debe leerse como **PARCIAL**: ahora existen informes `.txt` locales para carta natal, tránsitos y sinastría, descargables o copiables bajo acción explícita. PDF, almacenamiento histórico y reportes profesionales continúan fuera de alcance.

Continúan pendientes de acción manual los SQL `manual-community/07_comments_and_follows.sql`, `manual-community/08_comment_reports_and_moderation.sql` y `manual-tarot/01_saved_readings_spreads.sql`. Hasta que Daniel los aplique y compruebe sus resultados, comentarios, follows, reportes de comentarios y el guardado de las nuevas tiradas no deben declararse activos en Supabase remoto.

El sitemap local actualizado contiene 137 URLs, incluye `/tarot/pasado-presente-futuro` y `/suenos`, y conserva fuera `/astrologia/sinastria` por `noindex`. La suite de esta revisión pasó TypeScript, build, contenido, pendientes, sitemap, Prettier, lint y diff-check. El resultado sigue siendo una entrega **PARCIAL**, no el cumplimiento total de las 636 casillas del documento maestro.

## 8. Cierre de brechas posterior a las cinco mejoras aprobadas — 27 de agosto de 2026

La clasificación de las cinco áreas trabajadas cambia, pero no se convierte en cumplimiento total del documento maestro:

| Área | Nueva clasificación | Qué se cerró localmente | Qué sigue sin existir o sin verificar |
|---|---|---|---|
| Tarot | **PARCIAL ampliado** | Síntesis relacional por posición, keywords, contraste, progresión y pregunta contextual; decisión y pasado/presente/futuro disponibles | Mazos alternativos, imágenes licenciadas, significados por área, constructor y tiradas temáticas restantes; SQL Tarot 01 pendiente |
| Carta natal | **PARCIAL ampliado** | Big Three, patrón de elementos/modalidad/signo, narrativa de 10 placements y ranking de aspectos | Puntos avanzados, casas configurables, precisión profesional y E2E autenticada |
| Tránsitos | **PARCIAL ampliado** | Agrupación temática de todos los contactos del snapshot, intensidad, tono y retrogradación | Calendario, alertas, historial, persistencia y técnicas predictivas |
| Sinastría | **PARCIAL ampliado** | Agrupación de contactos por seis temas y preguntas conversacionales | Carta compuesta, Davison, casas cruzadas, persistencia y E2E de privacidad |
| Sueños | **PARCIAL ampliado** | Diccionario de 20 símbolos, búsqueda, selección de hasta 5, emoción, contexto, reflexión y diario local opt-in | Catálogo mayor, patrones y cualquier persistencia remota, social o clínica |
| Informes | **PARCIAL ampliado** | Copia, TXT y HTML de impresión local con “Imprimir / guardar PDF” | PDF servidor, historial, plantillas profesionales y compartir controlado |

El diario local de Sueños es una alternativa explícita y borrable, no una cuenta ni una nube. La síntesis de Tarot, natal, tránsitos y sinastría no amplía el perímetro de IA; los datos natales y de Persona B no se envían automáticamente. La ruta de sinastría mantiene `noindex,nofollow`.

El runtime específico comprobó los contratos nuevos y la suite completa pasó Prettier, TypeScript, lint, build, contenido, pendientes, sitemap, auditoría de dependencias y diff-check. Estas pruebas no sustituyen E2E, Supabase remoto, crawler, dispositivos reales ni proveedor.

Las capacidades que permanecen **NO** —Lenormand, runas, oráculos, chakras, cristales, rituales, astrocartografía, notificaciones, pagos y app nativa— no deben anunciarse ni recibir SQL ficticio. Los SQL reales todavía pendientes son únicamente los lotes manuales de Comunidad 07, Comunidad 08 y Tarot 01, cada uno sujeto a aplicación y verificación separadas.
