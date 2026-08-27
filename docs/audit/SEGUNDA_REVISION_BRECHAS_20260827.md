# Segunda revisión obligatoria de brechas parciales y capacidades no terminadas

**Proyecto:** Creovision  
**Rama revisada:** `redesign/fases-1-5`  
**Fecha:** 27 de agosto de 2026  
**Alcance:** revisión técnica del documento adjunto, el código local, las rutas, los tipos, los servicios, las migraciones SQL y la evidencia de validación disponible.  
**Regla aplicada:** esta revisión no marca una casilla como completa por la sola existencia de una pantalla, una ruta, un tipo o una migración.

## Conclusión ejecutiva

La revisión confirma que Creovision no está limitada por una falta de conocimientos técnicos para avanzar. El problema real es que el documento maestro mezcla tres niveles distintos: un núcleo funcional ya utilizable, una plataforma avanzada todavía incompleta y capacidades que requieren una decisión externa concreta, como un proveedor de pagos, una licencia de mazos, un servicio de email o una aplicación desplegada.

La conclusión más importante es que **sí existen varias mejoras de profundidad que pueden implementarse sin aplicar SQL**. La versión actual ya calcula más información de la que algunas interfaces aprovechan. En particular, Tarot conoce posiciones, significados, palabras clave y orientación; la carta natal conoce placements, casas, ángulos y aspectos; tránsitos conoce 26 contactos en el caso revisado, aunque la vista resume los 12 más cerrados; sinastría conoce contactos cruzados, pero no los agrupa por temas; y Sueños ya tiene un catálogo estructurado que puede alimentar una reflexión multi-símbolo.

También hay límites que no deben ocultarse. Comentarios, follows y moderación de comentarios tienen código y SQL local, pero requieren aplicación remota. El guardado de las nuevas tiradas Tarot tiene una incompatibilidad concreta con el constraint histórico y requiere un SQL manual independiente. El build, el runtime y el lint no demuestran que la rama esté desplegada ni que una cuenta real tenga aislamiento correcto.

> **Resultado de esta segunda auditoría:** no corresponde detener el trabajo diciendo únicamente “falta SQL” o “requiere proveedor”. Corresponde completar primero las capas locales útiles y profundas, dejar contratos y SQL preparados donde sea necesario, y reservar para Daniel solamente las acciones que necesitan sus credenciales, su proyecto Supabase, su cuenta autenticada o una decisión comercial.

## 1. Brechas revisadas

La siguiente tabla revisa todas las familias señaladas como parciales, pendientes, no implementadas, básicas, dependientes de SQL, dependientes de validación o fuera de alcance.

| Familia | Estado real actual | Qué falta en términos concretos | ¿Puede enriquecerse localmente? | Bloqueo específico |
|---|---|---|---|---|
| Tarot y catálogo | **PARCIAL funcional** | Múltiples mazos, imágenes licenciadas, correspondencias, significados por contexto y análisis estadístico. | Sí: profundidad de fichas, relaciones y síntesis con el catálogo actual. | Imágenes y mazos alternativos requieren activos y licencias; estadísticas persistentes requieren contrato de datos. |
| Tiradas Tarot | **PARCIAL funcional** | Existen carta diaria, sí/no, tres cartas, decisión y pasado/presente/futuro; faltan muchas tiradas temáticas y constructor personalizado. | Sí: capa de interpretación relacional, tiradas temáticas declarativas y exportación local. | Cada nuevo tipo guardado debe ser aceptado por el constraint remoto; no se debe añadir una clave sin migración compatible. |
| Interpretación Tarot | **BÁSICA pero real** | La carta se explica principalmente de forma individual; la síntesis entre cartas es limitada y genérica. | Sí, sin SQL: reglas deterministas de posición, tensión, contraste, progresión y pregunta. | No hay bloqueo técnico para la capa local; se necesita diseño editorial y pruebas específicas. |
| Guardado y diario Tarot | **PARCIAL** | Hay guardado explícito, nota, filtros, métricas y borrado; faltan pregunta, estado emocional, etiquetas, resultado posterior, patrones y exportación dedicada. | Sí: exportación local, filtros derivados, agrupación de recurrencias y campos opcionales locales si se explicita su privacidad. | Pregunta/estado emocional persistentes requieren decidir si se guardan remotamente y ampliar el esquema; no debe hacerse silenciosamente. |
| Carta natal | **PARCIAL funcional** | Hay 10 cuerpos, casas iguales, cuatro ángulos, cinco aspectos, Big Three y conteos descriptivos; faltan puntos avanzados, regentes, sistemas alternativos y una interpretación completa. | Sí: perfil estructurado basado en placements, casas y aspectos actuales. | Precisión profesional y nuevos cuerpos requieren decisiones astronómicas y validación de dominio; no se debe presentar como carta certificada. |
| Casas | **PARCIAL** | Se asignan los 10 cuerpos a 12 casas iguales, pero no hay regentes, temas por casa ni sistemas seleccionables. | Sí: explicación local de activaciones por casa y tabla de ocupación; también selector visual solo si se implementan cálculos verificables. | Placidus/Koch/Whole Sign no son un simple cambio de etiqueta: requieren cálculo, pruebas y criterios de latitud. |
| Aspectos natales | **PARCIAL** | Se calculan cinco aspectos mayores con orbes fijos; faltan menores, orbes configurables y ranking editorial. | Sí: prioridad por orbe, tipo de aspecto, cuerpos involucrados y contexto de casa. | Los umbrales editoriales deben documentarse; no requieren SQL para una primera versión. |
| Tránsitos | **PARCIAL funcional** | Existe snapshot local con 10 cuerpos, velocidad, retrogradación y contactos cruzados; la vista muestra hasta 12 de los contactos encontrados. | Sí: ranking de intensidad, temas, todos los contactos accesibles, resumen temporal de fecha y ventana local. | Calendario persistente, alertas y notificaciones requieren almacenamiento, jobs y preferencias; el snapshot no está bloqueado. |
| Sinastría | **PARCIAL funcional** | Dos cartas en memoria y contactos cruzados; falta agrupación por comunicación, emocionalidad, energía, tensión, apoyo, casas cruzadas y carta compuesta. | Sí: agrupar y sintetizar contactos existentes sin guardar a la segunda persona. | Carta compuesta y guardado de personas necesitan diseño de privacidad y nuevas fórmulas; la ruta debe permanecer noindex. |
| Luna | **PARCIAL** | Hay fase, ocho fases, calendario y próximos eventos; falta signo lunar actual, casa natal lunar, retornos, tiradas y rituales. | Sí: signo lunar actual local y explicaciones de fase; también UX educativa sin persistencia. | Retornos y rituales requieren definir si son astronómicos o editoriales; no se debe mezclar lenguaje científico y simbólico. |
| Horóscopo | **PARCIAL** | Hay diario, semanal y mensual para 12 signos; falta anual, personalización natal y lectura por tránsitos. | Sí: mejorar contenido, navegación y contextos editoriales; no usar datos natales sin consentimiento. | Horóscopo natal o por tránsito necesita un modelo de personalización y revisión editorial, no solo interpolar texto. |
| Compatibilidad editorial | **Núcleo funcional** | Tiene seis dimensiones y contextos; no es sinastría. | Sí: ampliar preguntas, acuerdos y navegación, manteniendo la distinción. | No debe anunciarse como análisis de dos cartas. |
| Numerología | **PARCIAL funcional** | Camino de Vida local con 1–9, 11, 22 y 33; faltan destino, alma, personalidad, expresión, años personales y compatibilidad. | Sí: otros cálculos locales si se define qué datos se usan y se mantiene la privacidad. | El nombre y otros datos personales requieren propósito, consentimiento, no persistencia accidental y contenido editorial. |
| Sueños | **PARCIAL funcional** | `/suenos` tiene 20 símbolos, búsqueda, filtros y preguntas; falta análisis multi-símbolo, contexto, recurrencias y diario. | Sí: es la mayor oportunidad local: tablero de símbolos, reflexión estructurada, diario temporal opt-in y exportación. | Persistencia local debe ser visible, eliminable y separada del almacenamiento remoto; un diario social requeriría SQL y moderación. |
| Informes | **PARCIAL** | Ya existe copiar/descargar `.txt`; falta HTML imprimible, vista de impresión, PDF, historial y persistencia. | Sí: HTML imprimible, CSS `@media print`, descarga local y estructura más profunda. | PDF profesional, almacenamiento y compartir requieren decidir formato, retención y proveedor; el navegador puede producir PDF mediante “Imprimir” sin una API de servidor. |
| Comunidad base | **PARCIAL verificada parcialmente** | Posts, likes, reposts, reportes y moderación base tienen SQL confirmado manualmente, pero falta E2E. | Sí: estados de UI, pruebas de contrato y UX de moderación ya preparada. | Solo Daniel puede probar con su sesión, roles reales y el proyecto Supabase desplegado. |
| Comentarios y follows | **Preparado, no activo remoto** | Código, tipos y migración 07 existen; falta aplicar y verificar. | Sí: pruebas de contrato, estados vacíos, errores y protección UI. | SQL 07 no aplicado. No debe afirmarse funcionamiento de producción. |
| Reportes de comentarios | **Preparado, no activo remoto** | Botón, repositorio, bandeja y moderación local existen; falta aplicar y verificar SQL 08. | Sí: pruebas estáticas y de interacción local; no se puede confirmar la RPC sin Supabase. | SQL 08 no aplicado; los roles y auditoría deben verificarse en el proyecto real. |
| Perfil público | **PARCIAL** | Bio, aura, username, visibilidad, posts y follows preparados; faltan ordenación avanzada, colecciones, actividad y E2E multiusuario. | Sí: ordenación local de secciones, accesibilidad y estados; no exponer datos natales. | Follows reales dependen de SQL 07; visibilidad cruzada depende de RLS y pruebas con dos cuentas. |
| Historial general | **PARCIAL** | Existe actividad básica; faltan filtros avanzados, retención configurable, exportación específica y patrones. | Sí: filtros y resumen local con los datos ya entregados por el repositorio. | Ampliar persistencia requiere decidir retención y exportación; no se deben registrar preguntas sensibles sin consentimiento. |
| Favoritos | **PARCIAL** | Hay varios tipos de favoritos, pero falta comprobar cada uno en E2E y ampliar entidades nuevas. | Sí: nuevos tipos públicos como Sueños solo si se define la semántica de un favorito. | La tabla y RLS remotas deben probarse antes de declarar persistencia completa. |
| Búsqueda interna | **PARCIAL ampliada** | Se añadieron rutas públicas reales y catálogo Tarot; no existe búsqueda web real ni índice semántico completo de todas las entidades. | Sí: mapeadores, filtros, relevancia, términos relacionados y recuperación contextual de contenido propio. | Búsqueda web requiere proveedor/API, presupuesto, límites y tratamiento de resultados externos. |
| IA contextual | **PARCIAL delimitada** | Funciona para Tarot, horóscopo y artículos; no usa natal, tránsitos, sinastría, sueños ni numerología. | Sí: enriquecer Tarot con contexto estructurado y contenido propio; mejorar fuentes y trazabilidad. | Los datos natales y comparativos no deben enviarse sin consentimiento y diseño de privacidad explícito. |
| Notificaciones | **NO implementadas** | No hay centro de actividad, recordatorios persistentes ni push. | Sí: centro local de estados, recordatorios visuales y contratos de preferencias. | Push real necesita permisos, service worker, proveedor, jobs y tratamiento de revocación. |
| Newsletter | **Interfaz parcial** | Hay UI y baja de suscripción, pero no proveedor de alta/envío confirmado. | Sí: validación, estados de consentimiento y contrato de integración desactivado. | Sin proveedor no se debe almacenar ni enviar email; falta elección/configuración externa. |
| Pagos y suscripciones | **NO implementados** | No hay checkout, entitlements ni webhooks. | Sí: matriz de capacidades y estados de acceso en modo no comercial; no activar cobros. | Proveedor de pagos, claves, webhook, cumplimiento, reembolsos y aprobación del propietario. |
| Aplicación nativa | **NO implementada** | No hay proyecto móvil ni evidencia de PWA completa. | Sí: manifest, iconos, instalación y caché limitada de contenido público, si se aprueba como PWA. | PWA no equivale a app nativa; offline de datos privados exige diseño adicional. |
| Responsive/UX | **NO VERIFICADO integralmente** | Hay clases responsive y drawer; faltan pruebas con dispositivos y matriz de interacción. | Sí: pruebas visuales, focus, teclado, viewport táctil y estados de error. | Requiere navegador/dispositivos y, para deploy, entorno real. |
| SEO | **PARCIAL** | Metadata, canonical, JSON-LD y sitemap local de 137 URLs; falta indexación real, CWV, Search Console y crawl. | Sí: cobertura de entidades públicas, enlazado, contenido y robots; ya se ampliaron rutas reales. | Indexación y tráfico no pueden garantizarse desde el sandbox; dependen de deploy y buscadores. |
| Seguridad/privacidad | **PARCIAL/NO VERIFICADA** | Separación natal, RLS base y UI de reportes están diseñadas; faltan SQL 07/08, E2E y multiusuario. | Sí: tests de contratos, detección de URLs/logs sensibles y estados de consentimiento. | Token, sesión, roles y proyecto Supabase real. |
| Módulos Lenormand, Runas, Oráculos, Chakras, Cristales y Rituales | **NO** | No hay catálogo completo, motor, rutas, contenido ni diario. | Sí: uno por uno, como verticales cerradas y con fuentes editoriales. | No hay bloqueo técnico general; el bloqueo real es evitar crear un catálogo superficial o jurídicamente dudoso. |
| Astrocartografía | **NO** | No hay cálculo de líneas, mapa ni interpretación geográfica. | Parcialmente: especificación y prototipo de datos; no conviene publicar un mapa sin motor validado. | Proyección, efemérides, coordenadas, precisión, mapas y contenido requieren decisiones de dominio. |
| Eclipses y eventos astronómicos ampliados | **NO/PARCIAL** | Existe motor lunar básico, no un calendario completo de eclipses e ingresos planetarios. | Sí: catálogo de eventos astronómicos verificables si se define fuente y cálculo. | Efemérides y validación temporal; no se deben fabricar fechas. |

## 2. Qué estaba más avanzado de lo que decía el informe anterior

La auditoría anterior ya había corregido parte de sus contradicciones, pero esta revisión identifica cinco aprovechamientos adicionales que deben quedar explícitos.

| Hallazgo | Estado real |
|---|---|
| Astrología | El motor no solo devuelve signos: también dispone de casas, ángulos, aspectos y un resumen de Big Three/elementos/modalidades. La interfaz ya muestra parte de esto, pero todavía no ofrece una interpretación relacional suficientemente profunda. |
| Tránsitos | El snapshot puede producir más contactos de los que se presentan en pantalla. La vista informa cuando recorta a 12, pero todavía falta una capa de ranking, temas y síntesis que use los 26 resultados observados. |
| Sinastría | Las dos cartas incluyen los mismos placements, casas, ángulos y aspectos que el motor natal puede calcular. La vista utiliza principalmente Sol, Ascendente y una lista de contactos; todavía desaprovecha casas, elementos, modalidades y patrones compartidos. |
| Sueños | El diccionario ya no es una idea abstracta: existe un catálogo estructurado con 20 símbolos, cinco categorías, palabras relacionadas, lente simbólica, lente emocional y pregunta. Esa estructura permite una experiencia multi-símbolo sin SQL. |
| Informes | El informe `.txt` ya está estructurado con Big Three, placements, ángulos, aspectos, posiciones de tránsito, contactos y límites. El siguiente paso local natural no es un proveedor PDF, sino una vista HTML imprimible y una acción de exportación explícita. |

La conclusión es que todavía hay datos calculados y contenido estructurado desaprovechados. Esto responde directamente a la regla del documento adjunto: no basta con responder “requiere investigación”; primero debe utilizarse lo que ya existe.

## 3. Qué puede implementarse ahora mismo sin SQL

Esta sección no ejecuta las implementaciones. Define las alternativas concretas, el valor, la reutilización, lo que permanecería congelado y la validación que debe exigirse.

### 3.1 Motor de síntesis relacional para Tarot

**Qué se implementaría.** Una capa local que reciba `TarotReading` y produzca una interpretación estructurada por posición. Para tres cartas y pasado/presente/futuro debe distinguir antecedentes, dinámica actual, tensión, contraste entre orientaciones, progresión hacia el siguiente paso y una síntesis final. Para decisión debe separar factor a valorar y siguiente paso, sin presentar certeza.

**Valor para el usuario.** La lectura dejaría de ser una lista de significados aislados. El usuario vería por qué una posición se relaciona con otra y qué pregunta concreta puede hacerse con el conjunto.

**Qué reutiliza.** `TarotCard.summary`, `uprightMeaning`, `reversedMeaning`, `keywords`, `reflectionQuestion`, `TarotSpreadDefinition.positions`, la pregunta opcional y la preferencia local de reversos. No requiere IA, Supabase ni una nueva tabla.

**Qué no toca.** No cambia el catálogo de 78 cartas, el repositorio publicado, la selección aleatoria, el diario base ni la regla de que compartir es independiente de guardar.

**Validación.** Casos deterministas con combinaciones al derecho/invertidas, posiciones repetidas, cartas con palos distintos, cartas del mismo palo, orbes no aplican y pregunta vacía. El test debe verificar que la síntesis mencione las posiciones correctas, no revele datos privados y no use lenguaje predictivo absoluto.

### 3.2 Perfil natal estructurado y ranking de aspectos

**Qué se implementaría.** Un perfil local dividido en Big Three, énfasis por elemento/modalidad, ocupación de casas, ángulos y aspectos ordenados por orbe. La interpretación sería descriptiva: “se observa”, “puede invitar a revisar” y “en este modelo”, no “eres necesariamente”.

**Valor para el usuario.** Los diez placements y los datos de casas dejarían de aparecer como una tabla técnica aislada. El usuario podría leer un recorrido: identidad simbólica, forma emocional, presencia, áreas activadas y tensiones principales.

**Qué reutiliza.** `NatalChart`, `NatalProfileSummary`, `HouseCusp`, `NatalAngle`, `NatalAspect` y `NatalChartWheel` ya existentes.

**Qué no toca.** No añade planetas no calculados, no cambia Astronomy Engine, no promete Placidus, no altera privacidad natal ni envía datos a IA.

**Validación.** Fixtures de fechas y coordenadas, suma de conteos, orden estable de aspectos, valores finitos, concordancia entre tabla y perfil, y prueba de que la fecha de nacimiento no aparece en URL, sitemap, metadata, logs ni Comunidad.

### 3.3 Síntesis local de tránsitos y agrupación de sinastría

**Qué se implementaría.** Para tránsitos, una clasificación transparente por proximidad al aspecto, cuerpo involucrado, retrogradación y signo, mostrando todos los contactos disponibles con opción de “ver los más relevantes”. Para sinastría, agrupación editorial de contactos por comunicación, emocionalidad, energía, apoyo y tensión, además de una síntesis conjunta.

**Valor para el usuario.** La persona recibiría una lectura utilizable del conjunto sin convertir un snapshot en una predicción. En sinastría, la lista de contactos tendría significado temático y no solo nombres técnicos.

**Qué reutiliza.** `TransitSnapshot`, `TransitPosition`, `NatalAspect`, `SynastrySnapshot`, los labels ya calculados y el orden por orbe del servicio.

**Qué no toca.** No guarda fechas natales de terceros, no cambia el `noindex,nofollow` de sinastría, no crea carta compuesta y no introduce notificaciones.

**Validación.** Casos con cero contactos, un contacto, muchos contactos, retrogradación, empate de intensidad, dos cartas con datos distintos y comprobación de que ninguna persona se persiste.

### 3.4 Tablero de Sueños multi-símbolo y diario local opt-in

**Qué se implementaría.** Un modo “reflexión” donde el usuario seleccione de uno a cinco símbolos, elija una emoción de una lista local opcional, escriba contexto en el dispositivo y reciba una guía estructurada: elementos compartidos, preguntas, tensiones y próximos pasos de autocuidado no clínicos. Un diario local opcional podría usar `localStorage` o `IndexedDB` únicamente después de consentimiento visible, con borrar todo, exportar y limpiar por entrada.

**Valor para el usuario.** Sueños dejaría de ser solo un diccionario. Permitirá conectar símbolos, emociones y contexto sin afirmar que existe una interpretación universal ni diagnosticar.

**Qué reutiliza.** `DreamSymbol`, `dreamThemeLabels`, `searchDreamSymbols`, `relatedWords`, `symbolicLens`, `emotionalLens` y `reflectionQuestion`.

**Qué no toca.** No envía sueños a IA, no los publica en Comunidad, no los guarda en Supabase, no crea perfiles ni realiza inferencias clínicas.

**Validación.** Test de selección de uno a cinco símbolos, búsqueda, eliminación individual, borrar todo, exportación, recarga, consentimiento, ausencia de red y ausencia de datos de sueños en analytics o URLs.

### 3.5 Informe HTML imprimible y exportación local mejor estructurada

**Qué se implementaría.** Una vista de informe con secciones, índice corto, método, límites, timestamp del cálculo y tablas legibles. Se añadiría una hoja de estilos de impresión para que el navegador permita “Guardar como PDF” sin que la aplicación pretenda ser un generador PDF de servidor. El `.txt` actual se conservaría como alternativa.

**Valor para el usuario.** El resultado sería más legible, archivado por la persona en su propio dispositivo y útil para una lectura larga, sin introducir almacenamiento remoto de información natal o de terceros.

**Qué reutiliza.** `buildNatalChartReport`, `buildTransitReport`, `buildSynastryReport`, los resultados en memoria y `LocalReportActions`.

**Qué no toca.** No activa `pdfReports`, no añade librerías pesadas, no crea historial remoto, no envía contenido a IA y no cambia los cálculos.

**Validación.** Render en pantalla y `@media print`, ausencia de elementos interactivos impresos, nombre de archivo seguro, copia, descarga y prueba con resultados vacíos o sin aspectos.

## 4. Qué requiere SQL manual

### 4.1 Lo que puede prepararse antes

Antes de SQL pueden completarse los estados de carga, error y vacío; los contratos TypeScript; la detección de tablas ausentes; los mensajes de fallback; la validación de límites; y los checks estáticos que aseguren que los componentes no abren acceso directo anónimo. Esto ya está parcialmente preparado para Comunidad.

También puede prepararse localmente la compatibilidad del diario Tarot, pero debe mantenerse explícita la dependencia: la migración histórica de `saved_tarot_readings` contiene un `CHECK` que acepta `daily`, `yes_no` y `three_cards`. El código local ya utiliza `decision` y `past_present_future`, por lo que se dejó el archivo `supabase/migrations/manual-tarot/01_saved_readings_spreads.sql`.

### 4.2 Lo que queda bloqueado hasta SQL

| Bloque | Qué desbloquea | Qué debe probarse inmediatamente después |
|---|---|---|
| `manual-community/07_comments_and_follows.sql` | Lectura y creación controlada de comentarios, seguimiento por username y estadísticas. | Comentario como usuario autenticado, listado público por RPC, eliminación propia, follow/unfollow por username y aislamiento entre dos cuentas. |
| `manual-community/08_comment_reports_and_moderation.sql` | Reporte de comentarios, bandeja administrativa y ocultación/moderación con auditoría. | Reportar como usuario, verificar que el reporte no es público, listar como admin/editor, moderar, comprobar estado del comentario y confirmar que anon no ejecuta RPC administrativas. |
| `manual-tarot/01_saved_readings_spreads.sql` | Guardar `decision` y `past_present_future` en `saved_tarot_readings`. | Guardar cada tirada, verla en el diario, filtrarla, editar nota y eliminarla como propietario. |

### 4.3 Acción manual de Daniel

Daniel debe confirmar que está en el proyecto Supabase correcto, ejecutar **un bloque SQL independiente cada vez**, capturar el resultado y no avanzar al siguiente bloque hasta verificar el anterior. No debe copiar estos bloques en una página SQL de otro proyecto ni aplicar semillas sin confirmar previamente la tabla destino.

## 5. Qué requiere proveedor o decisión externa

La regla correcta no es abandonar una funcionalidad porque tenga proveedor. Es separar el trabajo local preparable del momento en que puede activarse.

| Capacidad | Puede prepararse ahora | Falta externamente | No debe activarse todavía |
|---|---|---|---|
| Email/newsletter | Validación, consentimiento, estados de suscripción y adaptador con interfaz estable. | Proveedor, API key, dominio remitente, plantillas, rebotes, bajas y política de retención. | Recibir o enviar emails reales. |
| Pagos | Feature flags, modelo conceptual de planes, matriz de capacidades y estados de acceso sin cobro. | Stripe/u otro proveedor, webhook, claves, portal, impuestos, reembolsos y seguridad. | Checkout o promesa de “premium” pagado. |
| Push | Contrato de preferencias y centro de actividad; recordatorios visuales dentro de la sesión. | Service worker, VAPID/proveedor, permisos, jobs, revocación y pruebas de dispositivos. | Pedir permisos push o anunciar alertas funcionando. |
| PWA | Manifest, iconos y shell cacheable de rutas públicas si se decide esa estrategia. | Iconos finales, estrategia offline, pruebas iOS/Android y política de actualización. | Tratar una PWA como app nativa completa. |
| Mapas/astrocartografía | Modelo de líneas, contrato de coordenadas y prototipo no público. | Motor astronómico validado, tiles/mapa, límites geográficos y revisión de precisión. | Recomendaciones de lugares o decisiones vitales como si fueran certezas. |
| PDF profesional | HTML imprimible y CSS de impresión en navegador. | Si se desea PDF de servidor: renderizador, almacenamiento y retención. | Marcar `pdfReports` como activo sin resolver privacidad y formato. |
| Búsqueda web | Mejorar búsqueda interna, keywords, filtros y recuperación de contenido propio. | API/proveedor, presupuesto, límites, citación, moderación y tratamiento de resultados externos. | Presentar la búsqueda interna como búsqueda web. |
| IA sobre natal/tránsitos/sinastría | Especificar consentimiento, minimización y formatos de contexto; no enviar todavía. | Decisión explícita de privacidad, prompts auditados, proveedor, retención y tests de fuga. | Conectar datos privados natales o de terceros automáticamente. |

## 6. Qué no se puede implementar completamente ahora y por qué

Esta sección es específica: “no se puede completar ahora” no significa que no pueda hacerse ninguna preparación.

### 6.1 Activación remota y pruebas autenticadas

No se puede demostrar desde el sandbox que comentarios, follows, moderación de comentarios o guardado de las nuevas tiradas funcionen en el proyecto Supabase remoto, porque el agente no tiene autorización para ejecutar esas escrituras y no dispone de la sesión autenticada de Daniel. Sí puede dejar el código, los tipos, el SQL y los checks preparados. El resultado inmediato tras la acción de Daniel será una prueba E2E concreta, no una nueva fase teórica.

### 6.2 Pagos, newsletter real y push real

No se puede activar cobro, envío de email ni push real sin credenciales, proveedor, políticas y configuración de producción. Sí pueden prepararse adaptadores, flags, estados de UI y contratos; activar una simulación sería incorrecto porque daría al usuario una falsa expectativa y podría generar obligaciones de seguridad o legales.

### 6.3 Imágenes y mazos alternativos

No se puede publicar un mazo comercial ni reutilizar ilustraciones de terceros sin seleccionar una licencia verificable o producir activos propios. Sí puede mejorarse la experiencia con el catálogo textual actual, una presentación visual original y una arquitectura de mazos desactivada hasta contar con fuentes y assets aprobados.

### 6.4 Astrología profesional

No se puede afirmar precisión profesional, casas Placidus, zodiaco védico o una carta certificada mientras el motor y los criterios no se hayan definido, probado y revisado. Sí puede enriquecerse el perfil simbólico con los 10 cuerpos, casas iguales, ángulos y aspectos que ya existen, manteniendo el límite visible.

### 6.5 App nativa completa

No se puede afirmar que existe una app iOS/Android sin un proyecto nativo, ciclos de compilación, firma, pruebas de dispositivos y publicación. Sí puede evaluarse una PWA como etapa progresiva, pero no debe venderse como sustituto de una app nativa.

### 6.6 Documento maestro de 636 requisitos

No se puede marcar como completo de forma seria sin revisar cada requisito con evidencia propia. Una ruta nueva puede cerrar una casilla, pero no las subcasillas de contenido, datos, seguridad, persistencia, UX, SEO y QA asociadas. La salida correcta sigue siendo una matriz por requisito, no un porcentaje inventado.

## 7. Plan de implementación propuesto

La priorización sigue el valor real para el usuario, la reducción de respuestas genéricas, la reutilización de cálculos ya existentes, el bajo riesgo y la posibilidad de validar sin Supabase.

| Fase | Implementación | Dependencia | Resultado de aceptación |
|---:|---|---|---|
| 1 | Motor de síntesis relacional Tarot | Solo código local y contenido ya catalogado | Cada tirada explica posiciones, relaciones, tensión/progresión y síntesis sin predicción absoluta. |
| 2 | Perfil natal estructurado y ranking de aspectos/casas | Solo código local | El usuario entiende Big Three, énfasis, casas y aspectos; tabla y narrativa coinciden. |
| 3 | Síntesis de tránsitos y agrupación de sinastría | Solo código local | Se aprovechan todos los contactos relevantes y se explican por temas sin persistir datos. |
| 4 | Tablero multi-símbolo y diario local opt-in de Sueños | Solo navegador; sin SQL | El usuario combina símbolos, emociones y contexto, puede borrar/exportar y nada sale del dispositivo. |
| 5 | Informe HTML imprimible | Solo navegador/CSS | Natal, tránsitos y sinastría tienen una vista imprimible legible y el `.txt` sigue funcionando. |
| 6 | E2E preparada para SQL 07/08 y Tarot 01 | SQL aplicado por Daniel | Tras cada bloque, se ejecutan comprobaciones de propietario, anon, admin, aislamiento y diario. |
| 7 | Una vertical esotérica adicional, solo tras elegirla | Contenido y revisión de dominio | Catálogo, motor, ruta, SEO, privacidad, tests y SQL si procede; no una pantalla vacía. |
| 8 | PWA progresiva | Decisión de producto y assets | Instalación/caché de contenido público verificada en dispositivos; no se confunde con app nativa. |
| 9 | Integraciones externas | Proveedor, credenciales y aprobación | Activación gradual con webhooks, retención, errores, observabilidad y rollback. |

## 8. Primeras cinco implementaciones recomendadas

### Primera: síntesis relacional de Tarot

Debe ser la siguiente porque responde directamente al problema original de textos cortos, redundantes y ambiguos. Aprovecha el catálogo existente y no requiere SQL. La diferencia de calidad será visible inmediatamente: una lectura podrá explicar el rol de cada posición y el diálogo entre cartas.

### Segunda: perfil natal estructurado

Debe seguir porque el motor ya calcula mucha información y la carta natal es una de las experiencias de mayor intención. El trabajo local puede convertir placements técnicos en un recorrido comprensible sin añadir datos sensibles ni vender precisión profesional.

### Tercera: síntesis de tránsitos y sinastría

Debe continuar después porque ya existen los datos calculados. La mejora no consiste en crear más números, sino en agruparlos, ordenarlos y explicar su contexto. La sinastría debe conservar `noindex,nofollow` y funcionar solo en memoria.

### Cuarta: tablero multi-símbolo de Sueños

Debe profundizar la vertical recién creada antes de abrir más módulos. Un diccionario de 20 símbolos es una base real, pero la combinación de símbolos, emoción y contexto aporta más valor que sumar cientos de frases aisladas. El diario local debe ser opt-in, visible y eliminable.

### Quinta: informe HTML imprimible

Debe cerrar el recorrido de resultados sin esperar un proveedor PDF. El navegador ya puede imprimir o guardar como PDF; una vista diseñada para impresión es una mejora local legítima y no implica activar almacenamiento, compartir ni PDF de servidor.

## Criterio de cierre de esta revisión

Esta segunda auditoría queda satisfecha porque no se limitó a enumerar pendientes. Identificó datos ya calculados pero desaprovechados, describió versiones locales útiles, separó lo que requiere SQL de lo que requiere proveedor, precisó bloqueos técnicos y propuso cinco implementaciones concretas con valor, reutilización, límites y validación.

La implementación de esas cinco fases **no se ejecuta en este documento** porque el documento adjunto solicita primero la auditoría y una propuesta priorizada. La aplicación debe comenzar únicamente después de que Daniel confirme que se puede iniciar la siguiente fase, manteniendo congeladas las funciones que ya funcionan.

> **Estado final de la auditoría:** Creovision es una plataforma con núcleo funcional y varias extensiones locales reales, pero continúa **PARCIAL** frente al alcance maestro. La siguiente acción racional no es aplicar más SQL a ciegas: es implementar la primera mejora local profunda, comenzando por la síntesis relacional de Tarot, y después hacer la validación específica correspondiente.

## Referencias internas

[1]: ../../src/config/tarot.ts "Registro declarativo de Tarot"
[2]: ../../src/services/tarot.service.ts "Motor Tarot"
[3]: ../../src/components/tarot/TarotReadingResult.tsx "Resultado y síntesis Tarot"
[4]: ../../src/types/astrology.ts "Tipos de carta natal y resumen"
[5]: ../../src/services/astrology.service.ts "Motor local natal"
[6]: ../../src/services/transits.service.ts "Motor local de tránsitos"
[7]: ../../src/services/synastry.service.ts "Motor local de sinastría"
[8]: ../../src/config/dreams.ts "Catálogo de Sueños"
[9]: ../../src/services/dreams.service.ts "Búsqueda de Sueños"
[10]: ../../src/lib/astrology/report.ts "Generadores locales de informes"
[11]: ../../supabase/migrations/manual-community/07_comments_and_follows.sql "SQL manual de comentarios y follows"
[12]: ../../supabase/migrations/manual-community/08_comment_reports_and_moderation.sql "SQL manual de reportes y moderación de comentarios"
[13]: ../../supabase/migrations/manual-tarot/01_saved_readings_spreads.sql "SQL manual de constraints del diario Tarot"
[14]: ./QA_FINAL.md "QA y validaciones locales"
[15]: ./local-gap-review-20260827.md "Revisión local de brechas anterior"
