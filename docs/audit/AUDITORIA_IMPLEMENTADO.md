# AUDITORÍA — IMPLEMENTADO Y RESPALDADO

**Proyecto:** Creovision
**Rama auditada:** `redesign/fases-1-5`
**Fecha de revisión:** 27 de agosto de 2026
**Autor:** Manus AI

## 1. Alcance y regla de honestidad

Este documento contiene únicamente capacidades que tienen evidencia en el código, en una migración SQL existente, en una validación local o en una confirmación manual del usuario en Supabase. No significa que el documento maestro esté completado: el documento maestro contiene 636 casillas y todas fueron entregadas sin marcar. La clasificación correcta para muchas áreas es **parcial**, porque existe un núcleo funcional pero no el alcance completo solicitado.

> Una pantalla, un tipo TypeScript o una migración aislada no se consideran por sí solos prueba de una funcionalidad completa. Para clasificar algo como implementado se exige, cuando corresponde, interfaz, lógica, conexión, datos, validación y una evidencia explícita.

Las principales fuentes de evidencia son el registro de rutas [1], los feature flags [2], el motor astrológico [3], el catálogo Tarot [4], el repositorio de cuenta [5], las dependencias Supabase [6] y los resultados de validación local [7]. Las confirmaciones de Supabase indicadas como **confirmadas manualmente** proceden de las capturas entregadas por Daniel durante esta sesión.

## 2. Resumen de capacidades que sí existen

| Área                | Estado de lo que sí existe                                                                                  | Evidencia de activación                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Aplicación base     | React, TypeScript, Vite, TanStack Router/Start, Tailwind y Supabase configurados                            | Código local; build exitoso                                           |
| Tarot               | Catálogo local de 78 cartas, Arcanos Mayores/Menores, cuatro palos, figuras, lectura al derecho e invertida | Código local; tabla/seed Tarot confirmados manualmente                |
| Tiradas Tarot       | Carta del día, sí/no, tres cartas y decisión de dos cartas                                                 | Código local; flags activos                                           |
| Astrología personal | 10 cuerpos, ASC/MC/DSC/IC, 12 casas iguales y cinco aspectos mayores con orbes fijos                      | Código local; runtime determinista; no es carta profesional           |
| Luna                | Snapshot de fase, ocho fases, calendario y próximos eventos                                                 | Código y pruebas de motor lunar                                       |
| Horóscopo           | Diario, semanal y mensual para 12 signos, con contenido editorial estructurado                              | Código; tablas y contenido remoto no confirmados aquí                 |
| Compatibilidad      | Compatibilidad editorial por par de signos y seis dimensiones                                               | Código y migración existentes; remoto no confirmado en esta auditoría |
| Guías               | Catálogo editorial de 12 Guías, seis categorías y autor editorial                                           | Confirmado manualmente en Supabase                                    |
| Comunidad           | Posts, feed mundial, posts de perfil, Me gusta, republicaciones, reportes y moderación; comentarios/follows/reportes de comentarios preparados | Base 01-06 confirmada; SQL 07-08 pendiente; E2E pendiente |
| Cuenta              | Perfil, privacidad, favoritos, lecturas Tarot guardadas, historial y preferencias                           | Código; activación remota de cada tabla base no confirmada aquí       |
| IA                  | Asistente con streaming, autenticación opcional, cuotas, RAG limitado y memoria autenticada; Tarot decisión añadido | Código; proveedor y producción no verificados                         |
| SEO base            | Metadata, canonical, robots, sitemap e interlinking para superficies existentes                             | Código; sitemap local de 135 URLs                                     |

## 3. Implementaciones funcionales verificadas por área

### 3.1 Arquitectura, navegación y superficies reales

Existe un registro central de rutas públicas y privadas. Las rutas públicas actuales cubren inicio, horóscopo, Tarot, astrología personal, Luna, compatibilidad, Guías, Comunidad, búsqueda, asistente, información legal y perfiles públicos. El área autenticada cubre Mi espacio, perfil, favoritos, lecturas, publicaciones, historial, configuración, privacidad y memoria [1].

La aplicación incluye navegación de escritorio, navegación móvil con drawer, topbar móvil, buscador global y CTA contextual de cuenta. El comportamiento está implementado en componentes reutilizables y el chequeo de centralización no reportó error. La comprobación visual exhaustiva en navegadores reales, tabletas y dispositivos táctiles todavía no forma parte de la evidencia de este documento.

### 3.2 Tarot: catálogo de 78 cartas

El catálogo local contiene exactamente 78 entradas de carta: 22 Arcanos Mayores y 56 Arcanos Menores. Los Menores están distribuidos en Bastos, Copas, Espadas y Oros/Pentáculos, con As, números del dos al diez, Paje, Caballero, Reina y Rey. El catálogo contiene nombre, slug, arcano, palo, rango, orden, palabras clave, resumen, significado al derecho, significado invertido, pregunta reflexiva y tendencia para sí/no [4].

La baraja remota `public.tarot_cards` fue creada y cargada manualmente. Daniel confirmó 78 cartas publicadas. Las cuatro filas adicionales que correspondían a Sotas fueron archivadas, no borradas, con autorización explícita. Esta es una confirmación remota real del catálogo base; no implica que existan otros mazos visuales.

El componente visual de carta está implementado con un diseño simbólico local de gradientes, nombre, número y etiqueta de carta invertida. El propio componente declara que no usa imágenes de barajas comerciales [8]. Por tanto, lo implementado es una presentación visual funcional y sin problemas de licenciamiento, no una biblioteca de ilustraciones Rider-Waite, Marsella o Thoth.

### 3.3 Tarot: selección, reversos y tiradas disponibles

La carta diaria es determinista durante el día para cada semilla anónima local y almacena localmente carta, fecha y orientación. Las tiradas interactivas usan `crypto.getRandomValues` cuando está disponible, y la tirada de tres cartas evita repeticiones [9]. Las cartas invertidas tienen significado separado para las 78 entradas, y las lecturas muestran la orientación al derecho o invertida.

Las cuatro experiencias habilitadas son: carta del día, Tarot sí/no, tirada de tres cartas y tirada de decisión de dos cartas. La configuración central deja explícitos estos tipos y define posiciones declarativas para cada tirada [10]. La tirada de decisión usa dos posiciones, “lo que apoya” y “lo que conviene revisar”, sin presentar una orden o certeza sobre el futuro. También existen preguntas opcionales con límite de 240 caracteres, disclaimers de uso reflexivo y una pregunta final claramente presentada como pregunta para la persona, no como respuesta que deba enviar al sistema.

La fase actual añade una preferencia local para permitir o desactivar cartas invertidas. Por defecto conserva el comportamiento anterior, y la elección se guarda únicamente en el dispositivo mediante una clave no sensible. El servicio de Tarot consulta esa preferencia en las cuatro tiradas; no se envía a analytics ni se sincroniza con la cuenta.

### 3.4 Astrología personal local

El motor de astrología calcula localmente posiciones eclípticas geocéntricas en aproximación tropical para Sol, Luna, Mercurio, Venus, Marte, Júpiter, Saturno, Urano, Neptuno y Plutón. También calcula ascendente y 12 casas iguales a partir del ascendente [3]. La interfaz muestra los placements de esos cuerpos, el ascendente, las cúspides y el signo de cada casa.

La entrada valida fecha, hora cuando el modo la exige, zona horaria IANA, latitud y longitud. La conversión de hora local a UTC contempla la representación de la zona horaria y rechaza entradas no representables de manera segura. El modo de Luna permite omitir la hora y marca el resultado como aproximado. El propio producto explica que este cálculo no es una carta profesional, no usa Placidus y no es una predicción determinista.

La ruta pública expuesta incluye `/astrologia`, `/astrologia/carta-natal`, `/astrologia/ascendente`, `/astrologia/signo-lunar` y `/astrologia/transitos` [1]. La carta natal ahora incluye una rueda SVG accesible, ángulos ASC/MC/DSC/IC, casas iguales y cinco aspectos mayores con orbes fijos. Tránsitos calcula posiciones locales, velocidad/retrogradación y contactos cruzados. Esto sigue siendo una primera aproximación tropical/equidistante: no se declara astrología profesional, Placidus, precisión ephemerídica certificada ni predicción.

### 3.5 Persistencia privada de datos natales

La interfaz autenticada permite cargar, guardar, recuperar y solicitar la eliminación de fecha, hora, zona horaria, lugar y coordenadas natales. El repositorio local usa exclusivamente `public.profile_astrology_birth_data`, nunca el RPC de perfil público [11].

La tabla privada fue creada manualmente en Supabase y Daniel confirmó: nueve columnas, RLS activo, cuatro políticas por propietario y ausencia de permisos para `anon` y `public`. Las políticas permiten a `authenticated` seleccionar, insertar, actualizar y eliminar únicamente cuando `auth.uid() = user_id`. La tabla no expone resultados calculados, y los resultados de carta natal, ascendente y Luna siguen calculándose localmente.

Esta capacidad se considera **preparada y protegida a nivel de base de datos**. El código local ya incluye la tabla en exportación y eliminación de cuenta, y la limpieza natal elimina explícitamente su fila privada. La prueba autenticada desde la interfaz y la comprobación del ciclo completo siguen pendientes porque esta rama no se ha desplegado.

### 3.6 Luna y calendario lunar

El motor lunar define contratos para snapshot, calendario mensual, eventos de fase y próximo evento principal [12]. La interfaz contiene Luna de hoy, calendario, listado de fases, detalle de fase y próximos eventos. El registro de contenido contempla las ocho fases principales y el chequeo editorial local confirmó cobertura de esas fases.

La implementación sí cubre fase lunar actual, fases principales, calendario y próximos eventos. No se confunde este núcleo con Luna natal en casa, retorno lunar, tránsitos lunares, tiradas lunares o rituales lunares.

### 3.7 Horóscopo editorial

Existen rutas para horóscopo diario, semanal y mensual, tanto hub general como detalle por signo [1]. La vista de signo muestra resumen, foco, ánimo, energía, amor, trabajo, bienestar, número y color cuando esos campos están publicados en la entrada remota. También integra contexto lunar, favoritos, actividad de historial, enlaces internos y opción explícita de compartir una lectura en Comunidad.

La capa editorial local contiene para cada uno de los 12 signos una idea central, contexto, por qué importa, qué observar y pregunta reflexiva. La vista separa estas secciones con títulos comprensibles y explica que la pregunta es para hacérsela a uno mismo. El chequeo de contenido confirmó 12 signos, cinco lentes y tres periodos [7].

### 3.8 Compatibilidad editorial por signos

Existe una experiencia de selección y detalle por pareja de signos. El modelo editorial contempla dimensiones de comunicación, ritmo emocional, vida cotidiana, atracción, gestión de conflicto y crecimiento, además de contextos romántico, amistad y colaboración, fortalezas, desafíos, recomendaciones de comunicación y preguntas reflexivas [13].

Esta implementación es compatibilidad editorial signo contra signo. No es sinastría astronómica entre dos cartas natales, ni carta compuesta, ni carta Davison.

También existe `/astrologia/sinastria`: calcula en memoria dos cartas introducidas en el formulario y muestra contactos entre placements. No persiste datos de la segunda persona, no los incluye en la URL y la ruta lleva `noindex,nofollow`. La comprobación de interfaz autenticada y el uso con datos reales siguen pendientes.

### 3.9 Guías editoriales

La infraestructura editorial de categorías, autores y artículos existe. Daniel confirmó manualmente seis categorías, el autor `Equipo editorial — Redacción de Creovision` y las 12 Guías publicadas con `is_demo = false`. La consulta por categoría confirmó dos Guías por cada una de las seis categorías. El artículo demo quedó archivado.

Las 12 Guías tienen rutas públicas individuales, tarjetas editoriales, páginas de categoría, página de autor y enlaces desde la landing. El sitemap local incluye las 12 URLs de Guías. Esta es una de las pocas áreas con activación remota confirmada de datos reales y no solo estructura.

### 3.10 Comunidad y muro social

El muro tiene ruta pública `/comunidad`, compositor autenticado, publicaciones voluntarias, filtros, tarjeta de post, acciones de Me gusta y republicación, reportes y gestión de publicaciones propias. También existe perfil público por username con posts y republicaciones, y un área autenticada para publicaciones propias.

Daniel confirmó manualmente las cinco SQL del muro y una corrección de permisos. La base contiene cuatro tablas sociales: `community_posts`, `community_post_reports`, `community_post_likes` y `community_post_reposts`. Hay seis RPC principales de lectura y moderación. Las cuatro tablas tienen RLS activo y se verificaron 12 políticas de propietario. Los feeds generales y de perfil respondieron sin error y están vacíos porque no se insertaron datos de prueba.

La comprobación final de funciones mostró que los feeds de lectura pública se pueden invocar por `anon` y `authenticated`, mientras `list_open_community_reports` y `moderate_community_report` quedaron sin `EXECUTE` para `anon`. La moderación sigue validando internamente los roles administrativos.

El muro implementado es un feed textual con Me gusta, republicaciones, reportes y moderación básica. Además, el código local contiene comentarios bajo demanda, seguimiento de perfiles y reporte/moderación de comentarios. Estas tres capacidades dependen de los lotes manuales `07_comments_and_follows.sql` y `08_comment_reports_and_moderation.sql`, que no están confirmados ni aplicados remotamente; por ello se clasifican como **PARCIALES / SQL PENDIENTE**, no como capacidad remota activa. No se presenta como una copia completa de Instagram o Facebook: notificaciones sociales, mensajes directos, multimedia, hashtags y ranking algorítmico siguen fuera del alcance.

### 3.11 Cuenta, favoritos, lecturas e historial

Existe área autenticada con perfil, configuración, favoritos, diario de Tarot, historial, publicaciones, privacidad y memoria [1]. El repositorio permite guardar favoritos de artículo, Tarot, signo, guía y horóscopo; guardar lecturas Tarot de carta diaria, sí/no, tres cartas o decisión; actualizar notas de lecturas; eliminar lecturas; consultar historial y borrar entradas o todo el historial [5]. La página privada de lecturas ahora ofrece filtros por tirada, edición explícita de notas, estados de carga/error/vacío y copy que separa guardar de compartir.

El historial respeta una preferencia de activación y evita guardar texto libre o datos sensibles. La cuenta tiene funciones autenticadas para exportar datos JSON y solicitar eliminación de cuenta. La exportación y eliminación de cuenta ya enumeran `profile_astrology_birth_data` y las tablas sociales incorporadas. Falta ejecutar una prueba autenticada real para confirmar el orden de borrado, autorización RLS y respuesta de exportación.

### 3.12 Asistente IA y memoria limitada

Existe una ruta `/asistente`, UI de chat, streaming, autenticación opcional, cookie anónima, límites diarios y persistencia autenticada de conversaciones y mensajes [14]. También existen memoria de usuario, preferencias y feedback en funciones autenticadas [15].

La recuperación de contexto está limitada a Tarot, horóscopos y artículos editoriales publicados [16]. El asistente puede recibir el contexto de las cuatro tiradas Tarot, incluida decisión, pero no está conectado a una carta natal privada, tránsitos, numerología, sinastría, sueños o módulos esotéricos inexistentes. Las conversaciones autenticadas se persisten en las tablas IA existentes cuando la infraestructura remota está disponible; el consentimiento de memoria sigue separado y desactivado por defecto. Esta limitación se considera correcta y preferible a fingir capacidades.

### 3.13 Búsqueda global existente

Existe UI de búsqueda con sugerencias, estados de carga y estado vacío. El buscador combina resultados remotos con documentos estáticos de signos y páginas públicas [17]. El registro de fuentes indexa artículos, autores, categorías, horóscopos, cartas Tarot, fases lunares y compatibilidad [18].

La búsqueda funciona como buscador de las entidades existentes e incorpora la página pública de Camino de Vida en su registro estático. No se afirma que localice planetas, casas, aspectos, tránsitos, sinastría, runas, Lenormand, cristales, chakras, sueños o rituales como entidades indexables independientes, porque esos contenidos no están modelados en el índice editorial.

### 3.14 SEO, robots y sitemap de la superficie existente

Existe configuración compartida de títulos, descripciones, canonical, Open Graph, Twitter Card, robots y JSON-LD [19]. `public/robots.txt` permite el contenido público y bloquea auth, Mi espacio, design system y API. El sitemap local contiene 135 URLs: superficies públicas, 12 signos, seis categorías, 12 Guías y 78 fichas Tarot, además de Camino de Vida y tránsitos.

El sitemap no incluye URLs que no existen ni `/astrologia/sinastria`, cuya ruta de comparación permanece `noindex,nofollow`. La cobertura ahora incorpora fichas individuales Tarot, `/tarot/decision`, `/astrologia/transitos`, `/temas` y `/numerologia/camino-de-vida`. Sigue siendo incompleta frente al documento maestro: no incluye URLs independientes para casas, planetas, aspectos, informes o módulos esotéricos que no tengan una página pública real.

## 4. Validaciones locales realmente ejecutadas

| Comando                        | Resultado                                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| `npm run build`                | Exitoso; Vite generó el build y regeneró `routeTree.gen.ts`                                    |
| `npx tsc --noEmit`             | Exitoso; 0 errores                                                                             |
| `npm run content:check`        | Exitoso; 12 signos, cinco lentes y tres periodos                                               |
| `npm run pending:check`        | Exitoso; 11 de 11 contratos estáticos                                                        |
| `npm run seo:sitemap`          | Exitoso; sitemap local con 135 URLs, 78 cartas y sin sinastría                                  |
| `npm run lint`                 | Exitoso sin errores; 7 warnings estructurales de Fast Refresh                                  |

Los dos tests de dominio existentes cubren motor lunar y motor planetario. El runtime check temporal adicional confirmó determinismo diario, tirada decisión sin repetición, preferencia de reversos, 10 placements/12 casas/4 ángulos natales, tránsitos finitos y deterministas, sinastría determinista y Camino de Vida. No existe un script `test` en `package.json` que ejecute una suite integral; no se incorporó un runner ni una dependencia nueva al repositorio.

## 5. Conclusión de este informe

Creovision sí tiene un núcleo real: Tarot de 78 cartas con reversos y cuatro tiradas, carta natal local avanzada con limitaciones explícitas, tránsitos y sinastría locales sin persistencia, Luna y calendario, horóscopo estructurado, compatibilidad editorial, 12 Guías publicadas, numerología de Camino de Vida local, comunidad social textual, cuenta privada, búsqueda e IA acotada. Las Guías, el catálogo Tarot, la persistencia natal privada y el muro social base tienen confirmaciones manuales de Supabase en esta sesión. Comentarios, follows y reportes de comentarios permanecen en SQL local pendiente.

La conclusión no es que el documento maestro esté terminado. La conclusión es que esas capacidades concretas existen, mientras que sus extensiones avanzadas y los módulos esotéricos adicionales deben permanecer clasificados como pendientes hasta que tengan interfaz, lógica, datos, SQL, pruebas y evidencia.

## Referencias internas

[1]: ../../src/config/routes.ts "Registro central de rutas"
[2]: ../../src/config/features.ts "Feature flags"
[3]: ../../src/services/astrology.service.ts "Motor de astrología local"
[4]: ../../src/data/tarot-cards.ts "Catálogo local de Tarot"
[5]: ../../src/lib/account/repository.ts "Repositorio del área privada"
[6]: ../../supabase_dependency_audit.md "Auditoría de dependencias Supabase"
[7]: ../../scripts/check-editorial-quality.mjs "Chequeo de contenido editorial"
[8]: ../../src/components/tarot/TarotCardVisual.tsx "Visual de carta Tarot"
[9]: ../../src/lib/tarot/card-selection.ts "Selección y reversos Tarot"
[10]: ../../src/config/tarot.ts "Configuración de tiradas Tarot"
[11]: ../../src/lib/astrology/profile-repository.ts "Repositorio de persistencia natal privada"
[12]: ../../src/server/moon/moon-engine.ts "Contrato del motor lunar"
[13]: ../../src/types/compatibility.ts "Tipos de compatibilidad editorial"
[14]: ../../src/routes/api/ai/respond.ts "Endpoint del asistente IA"
[15]: ../../src/lib/ai/account.functions.ts "Memoria, preferencias y feedback de IA"
[16]: ../../src/lib/ai/retrieval.server.ts "Recuperación RAG de contenido publicado"
[17]: ../../src/services/search.service.ts "Servicio de búsqueda"
[18]: ../../src/server/search/search-source-registry.ts "Fuentes indexables"
[19]: ../../src/config/seo.ts "Configuración SEO compartida"


## 3.13 Revisión autónoma posterior — 27 de agosto de 2026

Después del cierre anterior se detectaron y corrigieron brechas de discoverability y producto que todavía podían resolverse localmente. `/astrologia` ahora muestra las cinco experiencias reales disponibles; el buscador interno y los flags centrales reconocen Tarot decisión, tránsitos, sinastría, Numerología, Sueños y la nueva tirada pasado/presente/futuro. La landing enlaza directamente a superficies reales sin prometer pagos o funciones premium inexistentes.

La vertical Tarot incorpora una tirada temática de tres posiciones —pasado, presente y futuro— con cartas únicas, preferencia local de reversos, síntesis reflexiva, IA dentro del perímetro Tarot ya autorizado, guardado explícito y filtro en el diario. La extensión del constraint remoto de `saved_tarot_readings.spread_type` quedó preparada en `supabase/migrations/manual-tarot/01_saved_readings_spreads.sql`, pero está **PENDIENTE de aplicación manual**.

La carta natal incorpora un resumen descriptivo de Big Three, conteos de elementos, modalidades y signo más repetido. También se añadieron informes `.txt` locales para carta natal, tránsitos y sinastría; se copian o descargan solo tras una acción explícita, no se persisten y no se envían a IA. Esto no activa informes PDF ni almacenamiento histórico.

Se construyó `/suenos`, un diccionario público con veinte símbolos, búsqueda, filtros, lentes emocionales y simbólicas, preguntas reflexivas y aviso de que no se guardan experiencias. Es contenido editorial inicial, no una interpretación universal ni una herramienta clínica.

La validación posterior pasó TypeScript, build, contenido, pendientes, sitemap, Prettier, lint y diff-check. El sitemap local quedó en 137 URLs: incluye `/tarot/pasado-presente-futuro` y `/suenos`, y mantiene fuera `/astrologia/sinastria` por su `noindex`. El auditor local registra 30 tablas y 15 RPC utilizados, sin faltantes entre código y SQL local; esto no demuestra que los bloques 07, 08 ni el SQL Tarot hayan sido aplicados en Supabase remoto.
