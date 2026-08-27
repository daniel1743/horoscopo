# Tercera revisión exhaustiva de brechas después de las mejoras aprobadas

**Proyecto:** Creovision  
**Rama:** `redesign/fases-1-5`  
**Fecha:** 27 de agosto de 2026  
**Base de revisión:** documento maestro de 636 requisitos, segunda revisión de brechas, código local posterior a las cinco mejoras aprobadas, migraciones SQL versionadas y suite local final.  
**Restricción respetada:** no se aplicó SQL remoto, no se hizo deploy, no se hizo push y no se modificó `main`.

## Conclusión ejecutiva

La tercera revisión confirma que las cinco mejoras aprobadas fueron implementadas localmente y que las funciones existentes permanecieron utilizables en la validación estática y de runtime. La aplicación ya no presenta únicamente listas técnicas en varias de sus superficies: Tarot puede explicar la relación entre posiciones; carta natal puede convertir sus cálculos en un perfil narrativo; tránsitos y sinastría organizan sus contactos por temas; Sueños permite combinar símbolos, emoción y contexto con un diario local opt-in; y los informes pueden imprimirse desde una vista HTML local o guardarse como TXT.

Estas mejoras **no convierten el documento maestro en 100% implementado**. En varios casos el núcleo funciona, pero el alcance original pide sistemas mucho mayores. En otros casos el código está preparado, pero Supabase remoto todavía necesita SQL y una cuenta autenticada debe comprobar el flujo. Finalmente, hay capacidades que sí pueden prepararse, pero no deben activarse sin proveedor, licencia, política de datos o decisión de producto.

> **Resultado honesto:** después de esta revisión quedan menos brechas locales inmediatas en las cinco áreas priorizadas, pero aún existen brechas de alcance, precisión, persistencia, producción y módulos no construidos. El siguiente paso correcto es aplicar y verificar los bloques SQL de uno en uno; no declarar que la plataforma está completa.

## 1. Brechas revisadas y estado posterior

| Familia | Estado posterior | Qué funciona actualmente | Qué sigue faltando |
|---|---|---|---|
| Tarot y catálogo | **PARCIAL funcional** | 78 cartas, reversos, biblioteca, carta diaria, sí/no, tres cartas, decisión y pasado/presente/futuro. | Mazos alternativos, imágenes licenciadas, correspondencias, significados por área, tiradas temáticas completas, constructor y estadísticas persistentes. |
| Síntesis Tarot | **IMPLEMENTADA localmente** | Lectura por posición, orientación, palabras compartidas, contraste, progresión, relación entre cartas, síntesis y pregunta final. | Revisión editorial de todas las combinaciones posibles y E2E de guardado/compartir. |
| Diario Tarot | **PARCIAL** | Guardado explícito, notas, filtros, búsqueda y métricas. | Pregunta, estado emocional, etiquetas, patrones y compatibilidad remota de `decision`/`past_present_future` hasta aplicar SQL Tarot 01. |
| Carta natal | **PARCIAL ampliada** | 10 cuerpos, casas iguales, ASC/MC/DSC/IC, 5 aspectos, Big Three, dominantes descriptivos y narrativa de placements/casas/aspectos. | Nodo, Lilith, Quirón, Fortuna, Vértice, regentes, sistemas de casas alternativos, efemérides profesionales y validación de precisión externa. |
| Tránsitos | **PARCIAL ampliada** | 10 cuerpos, velocidades, retrogradación, 26 contactos en el caso probado, ranking por orbe y agrupación temática. | Calendario temporal, historial, alertas, notificaciones, retornos, progresiones y técnicas predictivas. |
| Sinastría | **PARCIAL ampliada** | Dos cartas en memoria, contactos cruzados, agrupación por seis temas y preguntas para conversar. | Carta compuesta, Davison, casas cruzadas, perfiles guardados y E2E de privacidad entre dos personas. |
| Luna | **PARCIAL** | Fase, ocho fases, calendario y próximos eventos. | Signo actual integrado, casa natal, retornos, tiradas lunares y calendario ritual. |
| Horóscopo | **PARCIAL** | Diario, semanal y mensual de 12 signos, lentes editoriales y preguntas reflexivas. | Anual, personalización por natal, personalización por tránsitos y verificación de contenido remoto. |
| Compatibilidad editorial | **Núcleo funcional** | Seis dimensiones, contextos, fortalezas, desafíos, comunicación y preguntas. | Más contenido si se desea; no debe confundirse con sinastría astronómica. |
| Numerología | **PARCIAL funcional** | Camino de Vida local con números 1–9, 11, 22 y 33. | Destino, alma, personalidad, expresión, cumpleaños, ciclos personales y compatibilidad. |
| Sueños | **PARCIAL ampliada** | Diccionario de 20 símbolos, búsqueda, filtros, selección de hasta 5 símbolos, emoción, contexto, reflexión y exportación. | Catálogo mayor, diario local enriquecible, patrones y cualquier diario remoto o social. |
| Informes | **PARCIAL ampliada** | TXT, copia, descarga e impresión HTML local con opción del navegador de guardar como PDF. | PDF de servidor, historial remoto, plantillas profesionales, versionado y compartir controlado. |
| Comunidad base | **PARCIAL verificada parcialmente** | Posts, feed, likes, republicaciones, reportes y moderación base. | E2E con cuentas reales, prueba multiusuario y confirmación de producción. |
| Comunidad ampliada | **PREPARADA, no activa remotamente** | UI, repositorio, tipos, SQL 07, comentarios, follows y reportes/moderación de comentarios en código local. | Aplicar 07 y 08, verificar RLS/RPC/grants y probar con usuario y admin reales. |
| Perfil público | **PARCIAL** | Bio, aura, username, visibilidad, posts y seguimiento preparado. | Ordenación avanzada, colecciones, actividad, aislamiento multiusuario y follow remoto verificado. |
| Historial y favoritos | **PARCIAL** | Historial de actividad, favoritos y lecturas guardadas. | Campos avanzados, retención configurable, patrones y E2E de persistencia. |
| Búsqueda interna | **PARCIAL ampliada** | Sugerencias, filtros, resultados, rutas públicas y entidades nuevas. | Relevancia semántica completa, indexación de todas las entidades y búsqueda web externa. |
| IA | **PARCIAL delimitada** | Chat, streaming, cuotas, RAG e interpretación de Tarot, horóscopo y artículos; Tarot recibe la tirada nueva. | IA sobre natal, tránsitos, sinastría, Sueños o Numerología; no debe conectarse sin consentimiento y diseño de minimización. |
| Notificaciones | **NO implementadas** | No hay push ni centro de actividad persistente. | Puede prepararse un centro local visual; push exige permisos, service worker, proveedor y jobs. |
| Newsletter | **Interfaz parcial** | Formulario, consentimiento y baja preparados. | Alta/envío real, proveedor, rebotes, preferencias y retención. |
| Pagos/suscripciones | **NO implementados** | Flags desactivados; no se simula checkout. | Proveedor, webhooks, entitlements, seguridad, reembolsos y aprobación comercial. |
| Aplicación nativa | **NO implementada** | No existe proyecto iOS/Android. | Proyecto, firma, builds, pruebas de dispositivos y publicación. Una PWA sería solo una etapa distinta. |
| SEO | **PARCIAL mejorado** | Metadata, canonical, interlinking y sitemap local de 137 URLs; nuevas rutas públicas incluidas. | Deploy, crawl, Search Console, CWV, indexación y tráfico real. |
| Responsive/accesibilidad | **NO VERIFICADO integralmente** | Componentes responsive, estados y etiquetas accesibles en código. | Matriz real de móvil, tablet, escritorio, teclado, lector y táctil. |
| Seguridad/privacidad | **PARCIAL/NO VERIFICADA** | Separación natal, RLS base, fallbacks y flujo de reportes preparado. | Aplicar SQL 07/08, pruebas anon/auth/admin, aislamiento entre cuentas y producción. |

## 2. Qué estaba más avanzado de lo que indicaba la revisión anterior

La revisión anterior detectó que existían cálculos y catálogo que no se aprovechaban por completo. Después de implementar las mejoras, estas capacidades ahora sí se consumen en la experiencia:

| Dato existente | Aprovechamiento posterior |
|---|---|
| Posiciones, orientación, palabras clave y posiciones de Tarot | La nueva síntesis explica cada posición y produce una relación entre cartas con contraste, progresión y cierre. |
| Placements, casas, ángulos y aspectos natales | La carta muestra una narrativa de diez placements, patrón general y aspectos ordenados por cercanía, además de las tablas existentes. |
| 26 contactos de tránsito observados en el fixture | Se agrupan por identidad, emocionalidad, comunicación, vínculos, acción y crecimiento; se distingue intensidad y retrogradación. |
| Contactos cruzados de sinastría | Se distribuyen en comunicación, ritmo emocional, vida cotidiana, atracción, fricción/acuerdos y crecimiento. |
| Catálogo estructurado de Sueños | Se convierte en reflexión multi-símbolo con emoción, contexto, preguntas y diario local opt-in, no en frases aisladas. |
| Generadores locales de informe | Ahora alimentan TXT, copia, descarga y una página HTML de impresión que permite al navegador guardar como PDF. |

La mejora es de profundidad, no solo de cantidad de rutas. Aun así, el contenido sigue siendo simbólico y editorial; no se transformó en diagnóstico, predicción objetiva ni asesoramiento profesional.

## 3. Qué se implementó ahora y cómo se validó

### 3.1 Síntesis relacional de Tarot

El servicio local `tarot-synthesis.service.ts` crea un resultado estructurado con título, marco de la pregunta, texto por posición, relación entre cartas, síntesis y pregunta final. Reutiliza los significados derecho/invertido, palabras clave, descripciones de las posiciones y la configuración central de cada spread. Las tiradas de tres cartas, decisión y pasado/presente/futuro reciben una lectura de conjunto; sí/no mantiene su orientación breve.

La síntesis se incluye en la interpretación que se puede guardar y en el cuerpo de compartir cuando la experiencia lo habilita. La IA continúa recibiendo solo el contexto Tarot permitido. No se cambió la baraja remota ni se introdujeron datos sensibles.

### 3.2 Perfil natal estructurado

El servicio `astrology-narrative.service.ts` genera el Big Three, un patrón de elementos/modalidades/signos, una explicación de cada placement con su casa y una lista de aspectos ordenados por orbe. La interfaz conserva la rueda, las tablas y los límites, y añade una sección narrativa desplegable.

La narrativa utiliza los datos locales actuales y evita afirmar causalidad, diagnóstico o certeza. No añade planetas ni puntos que el motor no calcule y no cambia la tabla privada de datos natales.

### 3.3 Tránsitos y sinastría

El servicio `astrology-relationship.service.ts` clasifica los contactos de tránsito por temas y por cercanía del orbe, informa retrogradación cuando el snapshot la tiene y conserva una vista de todos los grupos. La sinastría reutiliza las seis dimensiones editoriales de compatibilidad para agrupar contactos cruzados y formular preguntas conversacionales.

Ambas experiencias permanecen en memoria. La sinastría conserva `noindex,nofollow`, no guarda datos de la segunda persona y no se conecta a IA.

### 3.4 Sueños

Sueños ahora permite seleccionar hasta cinco símbolos, elegir una emoción opcional, escribir contexto y obtener hilos compartidos, prompts por símbolo y una pregunta final. El diario local requiere consentimiento visible, guarda como máximo 50 entradas en el navegador, permite revisar la reflexión, exportar, borrar una entrada o borrar todo. Las entradas no pertenecen a la cuenta, no se sincronizan, no se publican y no se envían a IA.

Se conservó la búsqueda por texto y tema y se corrigió el copy de privacidad para no contradecir el nuevo modo opt-in.

### 3.5 Informes HTML imprimibles

`LocalReportActions` mantiene “Copiar texto” y “Descargar .txt” y añade “Imprimir / guardar PDF”. La acción abre una vista HTML local escapada, con estilos de pantalla e impresión, y llama al diálogo de impresión del navegador. Si el navegador bloquea la ventana emergente, se conserva el estado de error y la descarga TXT continúa disponible.

El método no activa `pdfReports`, no sube contenido, no persiste informes y no depende de una librería adicional.

## 4. Validación ejecutada

| Validación | Resultado |
|---|---:|
| `npx prettier --check src scripts` | **0** |
| `npx tsc --noEmit` | **0** |
| `npm run lint` | **0 errores**; 7 warnings estructurales conocidos de Fast Refresh |
| `npm run build` | **0** |
| `npm run content:check` | **0** |
| `npm run pending:check` | **0** |
| `npm run seo:sitemap` | **0** |
| `git diff --check` | **0** |
| Auditor de dependencias Supabase | **30 tablas, 15 RPC, 0 faltantes locales** |
| Runtime Tarot relacional | **Correcto**: 3 posiciones, relación y síntesis |
| Runtime natal narrativo | **Correcto**: 10 placements, 14 aspectos en el fixture y narrativa completa |
| Runtime tránsitos | **Correcto**: 10 cuerpos, 26 contactos y 5 grupos en el fixture |
| Runtime sinastría | **Correcto**: dos cartas de 10 placements, 34 contactos y 6 grupos en el fixture |
| Runtime Sueños/diario | **Correcto**: 3 símbolos, reflexión, guardar, cargar, exportar, borrar y limpiar |
| Runtime informes | **Correcto**: natal, tránsitos y sinastría incluyen síntesis |
| Sitemap | **137 URLs**; incluye Tarot nuevo y Sueños; excluye sinastría noindex |

Estas pruebas son locales. No sustituyen la prueba de navegador real, la cuenta autenticada, el proyecto Supabase correcto, el rol administrativo, el crawler ni el deploy.

## 5. Qué requiere SQL manual

| Bloque | Estado | Desbloquea | Prueba inmediata obligatoria |
|---|---|---|---|
| `manual-community/07_comments_and_follows.sql` | Local, no aplicado | Comentarios, follow por username y estadísticas públicas. | Crear/eliminar comentario propio, leer comentarios por RPC, seguir/dejar de seguir y comprobar aislamiento con dos cuentas. |
| `manual-community/08_comment_reports_and_moderation.sql` | Local, no aplicado | Reporte de comentarios y moderación con auditoría. | Reportar, comprobar privacidad del reporte, listar como admin/editor, moderar y verificar que anon no ejecute RPC administrativos. |
| `manual-tarot/01_saved_readings_spreads.sql` | Local, no aplicado | Aceptar `decision` y `past_present_future` en lecturas guardadas. | Guardar cada tirada, verla en diario, filtrar, editar nota y eliminar como propietario. |

Antes de estos bloques ya puede validarse la UI estática y el fallback, pero no puede afirmarse que las RPC o constraints existan en el proyecto remoto. Daniel debe ejecutar un bloque independiente por vez, en el proyecto correcto, capturar el resultado y esperar la revisión antes de pasar al siguiente.

## 6. Qué requiere proveedor o decisión externa

| Capacidad | Preparación local posible | Bloqueo exacto | No activar todavía |
|---|---|---|---|
| Newsletter | Validación, consentimiento y adaptador desactivado. | Proveedor, API key, dominio, rebotes, bajas y retención. | Alta o envío real. |
| Push | Preferencias y centro visual local. | Service worker, VAPID/proveedor, permisos, jobs y revocación. | Solicitud de permisos o promesa de alertas. |
| Pagos | Flags y matriz de capacidades sin cobro. | Proveedor, checkout, webhooks, claves, reembolsos, impuestos y cumplimiento. | Checkout o membresía real. |
| PWA | Manifest, iconos y caché de contenido público. | Decisión PWA, estrategia offline, assets y pruebas iOS/Android. | Declararla app nativa. |
| Mazos alternativos | Arquitectura declarativa y presentación visual propia. | Licencias, imágenes, derechos y revisión editorial. | Publicar activos de terceros sin licencia. |
| PDF profesional | Impresión HTML local ya implementada. | Si se desea PDF servidor: renderizador, almacenamiento y retención. | Activar `pdfReports` como servicio remoto. |
| IA avanzada | Especificación de consentimiento y minimización. | Decisión explícita sobre datos privados, proveedor, prompts y retención. | Enviar natal, tránsitos o datos de terceros automáticamente. |
| Astrocartografía | Especificación y prototipo de datos no público. | Motor validado, mapas, proyección y criterios de precisión. | Recomendaciones geográficas deterministas. |

La existencia de un proveedor no justifica detener todo el trabajo: las capas locales preparables deben construirse primero. Pero tampoco justifica activar una integración ficticia.

## 7. Qué no puede completarse todavía y por qué

**Activación y pruebas remotas.** No se puede probar desde este entorno que SQL 07, SQL 08 o el constraint Tarot funcionen en el Supabase de Daniel porque no se autorizó una escritura remota y no se dispone de su sesión de usuario, rol admin y proyecto desplegado. Sí quedaron código, tipos, migraciones, fallbacks y pruebas específicas preparados.

**Precisión astrológica profesional.** No se puede declarar una carta profesional mientras el motor use aproximación tropical, casas iguales, puntos limitados y orbes fijos sin la especificación de efemérides, sistemas de casas y validación externa requerida. Sí se puede seguir enriqueciendo la narrativa del modelo actual, dejando el límite visible.

**Mazos alternativos con imágenes.** No se puede publicar un mazo de terceros sin una licencia verificable o activos propios aprobados. Sí puede mantenerse una capa textual y visual original, que es la que actualmente funciona.

**Pagos, email y push.** No se puede activarlos sin proveedor, claves, webhooks, políticas y pruebas. Sí pueden quedar contratos, flags y estados preparados. Activar un botón que no realiza una operación real sería defectuoso.

**App nativa.** No se puede afirmar que existe una app iOS/Android sin proyecto, firma, build, pruebas de dispositivos y distribución. Una PWA puede ser una etapa local posterior, pero no sustituye silenciosamente la app solicitada.

**Cumplimiento de 636 requisitos.** No se puede declarar terminado mientras las subcasillas de cada módulo no tengan evidencia propia de contenido, lógica, persistencia, seguridad, UX, SEO, pruebas y activación. La clasificación parcial es una medida de precisión, no una señal de que la parte implementada sea necesariamente inútil.

## 8. Prioridad restante después de esta revisión

La mayor parte de la prioridad local inmediata de las cinco mejoras aprobadas quedó cubierta. Las siguientes acciones racionales son ahora:

| Prioridad | Acción | Razón |
|---:|---|---|
| 1 | Aplicar y comprobar 07, 08 y Tarot 01, en ese orden operativo indicado, un bloque por vez. | Desbloquean las funciones que ya tienen UI y evitan que una parte del código quede sin activar remotamente. |
| 2 | Ejecutar E2E autenticada y multiusuario. | Permite comprobar natal, cuenta, diario, Comunidad, RLS, anon, admin y privacidad real. |
| 3 | Verificar deploy, sitemap, crawler, responsive y rendimiento. | Convierte evidencia local en evidencia de producción. |
| 4 | Si Daniel quiere seguir sin SQL, la siguiente vertical local de alto valor sería una PWA progresiva o una expansión editorial estructurada, no pagos ficticios. | Ambas pueden prepararse sin cobrar ni almacenar datos nuevos, pero requieren una decisión explícita de producto. |
| 5 | Abrir nuevos módulos esotéricos solo uno por uno. | Lenormand, runas, chakras, cristales y rituales necesitan catálogo, criterios y QA propios; no deben crearse como pantallas vacías. |

## Criterio final

Esta revisión cumple el propósito de revisar nuevamente las brechas después de implementar las mejoras: identifica qué quedó funcional localmente, qué quedó básico por alcance, qué quedó preparado pero no activo, qué datos calculados se están utilizando, qué puede continuar localmente, qué depende de SQL, qué depende de proveedores y qué no puede afirmarse todavía.

> **Estado final:** las cinco mejoras aprobadas están implementadas en código local y validadas con la suite disponible. Creovision continúa siendo **PARCIAL** frente al documento maestro por las capacidades no construidas, los límites profesionales explícitos y la falta de E2E/deploy. El trabajo autónomo local de esta tranche termina aquí; el siguiente paso queda detenido en la aplicación manual y verificación de SQL.

## Referencias internas

[1]: ../../src/services/tarot-synthesis.service.ts "Síntesis relacional Tarot"
[2]: ../../src/services/astrology-narrative.service.ts "Narrativa natal"
[3]: ../../src/services/astrology-relationship.service.ts "Narrativas de tránsitos y sinastría"
[4]: ../../src/services/dreams.service.ts "Reflexión y diario local de Sueños"
[5]: ../../src/pages/dreams/DreamDictionaryPage.tsx "UI de Sueños"
[6]: ../../src/components/astrology/LocalReportActions.tsx "Acciones de informes locales"
[7]: ../../src/lib/astrology/report.ts "Generadores de informes enriquecidos"
[8]: ../../supabase/migrations/manual-community/07_comments_and_follows.sql "SQL manual Comunidad 07"
[9]: ../../supabase/migrations/manual-community/08_comment_reports_and_moderation.sql "SQL manual Comunidad 08"
[10]: ../../supabase/migrations/manual-tarot/01_saved_readings_spreads.sql "SQL manual Tarot 01"
[11]: ./SEGUNDA_REVISION_BRECHAS_20260827.md "Segunda revisión de brechas"
[12]: ./QA_FINAL.md "QA local y límites de evidencia"
