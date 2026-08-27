# ESTRATEGIA CORRECTIVA DE CREOVISION

> **Nota de lectura:** este documento conserva el diagnóstico y la estrategia iniciales. Sus tablas describen el estado observado antes de las implementaciones posteriores; el estado actual debe consultarse en `AUDITORIA_IMPLEMENTADO.md`, `AUDITORIA_NO_IMPLEMENTADO.md`, `MATRIZ_CUMPLIMIENTO.md` y `docs/validation/creovision-final-report.md`.

**Objetivo:** cerrar las brechas verificadas sin convertir capacidades futuras en pantallas simuladas ni crear SQL sin una función real que lo consuma.

## Principios de ejecución

Primero se corrigen privacidad, ciclo de vida de datos, sincronización de rama y pruebas del MVP. Después se elige un grupo pequeño de funcionalidades de alto valor. Cada fase debe cumplir el criterio del documento maestro: interfaz, lógica, conexión, datos, validaciones, errores, navegación, móvil, pruebas y evidencia.

No se debe crear una tabla de Numerología, Runas, Tránsitos o Diario solo para marcar una casilla. Cada módulo debe tener un flujo completo y una razón de producto. El SQL se prepara únicamente después de cerrar el modelo y las políticas RLS.

## Fase 0 — Auditoría y control de cambios

| Elemento      | Decisión                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Problema      | El documento tiene 636 casillas y el repositorio cubre solo un subconjunto. La rama local y el remoto divergen cuatro commits.  |
| Solución      | Mantener esta matriz como fuente de control; trabajar solo en `redesign/fases-1-5` y revisar `git status` antes de cada commit. |
| Pantallas     | No aplica.                                                                                                                      |
| Componentes   | No añadir componentes todavía.                                                                                                  |
| Backend       | No modificar backend en esta fase.                                                                                              |
| SQL/migración | No crear SQL nuevo. Separar SQL confirmado de SQL no verificado.                                                                |
| APIs/datos    | No aplica.                                                                                                                      |
| Dependencias  | Requiere el inventario y la matriz actuales.                                                                                    |
| Tests         | Repetir build, `content:check`, `pending:check` y verificación de dependencias.                                                 |
| Aceptación    | Cualquier nueva tarea queda vinculada a una fila de la matriz y tiene evidencia.                                                |
| Prioridad     | P0                                                                                                                              |

## Fase 1 — Privacidad y ciclo de vida de datos natales

| Elemento      | Decisión                                                                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problema      | La tabla natal privada existe y tiene RLS, pero exportación y eliminación de cuenta no la incluyen explícitamente; la limpieza actual convierte campos en NULL.                 |
| Solución      | Añadir `profile_astrology_birth_data` a exportación y eliminación; decidir documentadamente si limpiar la fila o borrarla. Mantenerla fuera de `profiles` y del perfil público. |
| Pantallas     | Perfil privado: mostrar estado de guardado, exportación y eliminación coherentes.                                                                                               |
| Componentes   | `AstrologyProfileSection`, controles de privacidad y confirmación de borrado.                                                                                                   |
| Backend       | Actualizar `exportAccountFn` y `deleteAccountFn`; derivar siempre `userId` de sesión.                                                                                           |
| SQL/migración | No requiere tabla nueva. Verificar FK `ON DELETE CASCADE`, RLS, grants y políticas existentes. Regenerar tipos Supabase.                                                        |
| APIs/datos    | Solo tabla privada; nunca RPC público ni analytics.                                                                                                                             |
| Dependencias  | Tabla natal privada ya creada; sesión autenticada.                                                                                                                              |
| Tests         | Guardar, actualizar, cargar, limpiar; exportar; eliminar cuenta; intentar acceso cruzado con dos usuarios.                                                                      |
| Aceptación    | El usuario A nunca ve datos de B; exportación incluye sus datos; eliminación deja cero datos natales; ningún perfil público contiene esos campos.                               |
| Prioridad     | P0                                                                                                                                                                              |

## Fase 2 — Baseline remoto y rama

| Elemento      | Decisión                                                                                                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Problema      | Hay 40 migraciones locales y solo algunas confirmaciones manuales. Los objetos base de horóscopo, Luna, compatibilidad, búsqueda, IA, cuenta, admin y métricas no fueron confirmados en esta revisión. |
| Solución      | Verificar con consultas de solo lectura cada tabla/RPC usada por el código; si falta un objeto, aplicar su migración correspondiente uno por uno. No inventar nuevos bloques.                          |
| Pantallas     | No añadir pantallas.                                                                                                                                                                                   |
| Componentes   | No añadir componentes.                                                                                                                                                                                 |
| Backend       | Comparar errores `relation does not exist` y `function does not exist` con la matriz de dependencias.                                                                                                  |
| SQL/migración | Verificar, en orden, roles/perfiles, horóscopo, Luna, compatibilidad, búsqueda, IA, admin y métricas. Tarot, Guías, muro y tabla natal ya tienen confirmación manual.                                  |
| APIs/datos    | Confirmar variables públicas y proveedor IA sin exponer secretos.                                                                                                                                      |
| Dependencias  | Requiere acceso del propietario al SQL Editor.                                                                                                                                                         |
| Tests         | Queries de existencia, grants y RPC; `social:check` solo cuando el usuario autorice consulta al proyecto correcto.                                                                                     |
| Aceptación    | Los 28 objetos usados por código responden en el proyecto Supabase correcto; cada resultado queda capturado.                                                                                           |
| Prioridad     | P0/P1                                                                                                                                                                                                  |

## Fase 3 — Calidad y pruebas del núcleo MVP

| Elemento      | Decisión                                                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Problema      | El build pasa, pero lint falla con 578 problemas y no existe script global `test`. Solo hay pruebas de motores lunar y planetario.           |
| Solución      | Crear una suite de pruebas ejecutable y corregir lint por lotes, sin mezclar refactors de producto.                                          |
| Pantallas     | No aplica inicialmente.                                                                                                                      |
| Componentes   | Añadir tests de lógica de selección Tarot, formularios y repositorios con mocks controlados.                                                 |
| Backend       | Añadir pruebas de contratos RPC y respuestas de error sin escribir producción.                                                               |
| SQL/migración | Crear fixtures de prueba separados; nunca insertar demos en producción.                                                                      |
| APIs/datos    | Probar errores de red, esquema ausente, rate limit y auth.                                                                                   |
| Dependencias  | Vitest/runner compatible con Vite, o la herramienta adoptada por el repositorio.                                                             |
| Tests         | Tarot, reversos, tres tiradas, carta natal, casas, Luna, compatibilidad, auth, permisos, APIs, SQL, SEO y responsive crítico.                |
| Aceptación    | `npm run build`, `npm run lint` y `npm run test` pasan; las pruebas de integración remota usan un proyecto de prueba o fixtures controlados. |
| Prioridad     | P1                                                                                                                                           |

## Fase 4 — Tarot completo y diario real

| Elemento      | Decisión                                                                                                                                                          |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problema      | El Tarot tiene 78 cartas y tres experiencias, pero no mazos, imágenes, significados por área, toggle de reversos, tiradas avanzadas ni diario completo.           |
| Solución      | Primero ampliar el dominio de cartas con campos editoriales separados y un solo catálogo versionado; después crear selector de mazo y tiradas declarativas.       |
| Pantallas     | `/tarot/cartas`, `/tarot/mazos`, `/tarot/tiradas`, `/tarot/diario`, detalle y lectura.                                                                            |
| Componentes   | `TarotDeckSelector`, `TarotCardGallery`, `TarotSpreadBuilder`, `TarotDiaryEntry`, `TarotStatistics`, zoom accesible.                                              |
| Backend       | Repositorios para mazos, cartas, lecturas y diario; límites de tamaño y sanitización.                                                                             |
| SQL/migración | Extender `tarot_cards` o crear tabla de mazos relacionada; añadir campos por área solo si se publican; tablas de tiradas y diario con RLS; índices y constraints. |
| APIs/datos    | Imágenes originales o con licencia; textos editoriales revisados; no copiar barajas comerciales sin autorización.                                                 |
| Dependencias  | Catálogo de 78 actual; decisión editorial sobre Rider-Waite/Marsella/Thoth.                                                                                       |
| Tests         | Conteo de cartas, palos/figuras, reversos, no repetición, toggle, lectura guardada, permisos, búsqueda y responsive.                                              |
| Aceptación    | Usuario puede elegir un mazo real, ejecutar tirada, guardar pregunta/nota según privacidad, editar/eliminar y ver estadísticas; todo persiste y tiene RLS.        |
| Prioridad     | P1/P2                                                                                                                                                             |

## Fase 5 — Astrología profesional limitada: casas y aspectos

| Elemento      | Decisión                                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Problema      | La carta actual tiene 10 cuerpos, ascendente y casas iguales, pero no gráfico, puntos avanzados, planetas por casa ni aspectos.                              |
| Solución      | Antes de publicar resultados avanzados, elegir efemérides y precisión, implementar aspectos con orbes documentados y asignación de casas coherente.          |
| Pantallas     | `/astrologia/carta-natal`, gráfico natal, tabla de placements, casas y aspectos.                                                                             |
| Componentes   | `NatalChartWheel`, `PlanetTable`, `HouseTable`, `AspectTable`, selector de sistema de casas.                                                                 |
| Backend       | Motor local o server-side reproducible; no guardar resultados deterministas salvo historial explícito.                                                       |
| SQL/migración | No requiere SQL para cálculo local; solo tabla privada si se guardan configuraciones o lecturas.                                                             |
| APIs/datos    | Elegir Astronomy Engine/Swiss Ephemeris u otra fuente apropiada; validar licencia y precisión.                                                               |
| Dependencias  | Datos natales privados; decisión sobre tropical/sideral y casas.                                                                                             |
| Tests         | Fechas de referencia, límites de signo, zona horaria/DST, orbes, aspectos, latitudes extremas y comparación con fuente de referencia.                        |
| Aceptación    | Gráfico y tablas reproducibles; cada resultado indica sistema zodiacal, efemérides, casas, precisión y limitaciones; no se presenta como certeza científica. |
| Prioridad     | P2                                                                                                                                                           |

## Fase 6 — Tránsitos y astrología avanzada

| Elemento      | Decisión                                                                                                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problema      | No existe ningún flujo de tránsitos, retrogradaciones, eclipses, revoluciones, progresiones o astrocartografía.                                                                         |
| Solución      | Implementar en subfases: snapshot planetario; comparación con carta natal; calendario; alertas; después revoluciones/progresiones; astrocartografía solo tras validar mapa y precisión. |
| Pantallas     | `/astrologia/transitos`, calendario, detalle de tránsito, ajustes de alertas, `/astrocartografia`.                                                                                      |
| Componentes   | `TransitTimeline`, `TransitDetail`, `RetrogradeBadge`, `AstroMap`, filtros de fecha y planeta.                                                                                          |
| Backend       | Jobs o cálculo bajo demanda; caché segura; notificaciones solo con consentimiento.                                                                                                      |
| SQL/migración | Tablas de preferencias, eventos y alertas con RLS; índices por usuario/fecha; no guardar datos natales en tablas públicas.                                                              |
| APIs/datos    | Efemérides y mapas con fuente/licencia explícita.                                                                                                                                       |
| Dependencias  | Fase 5, datos natales, precisión y timezone.                                                                                                                                            |
| Tests         | Fechas planetarias, retrogradación, cambios de signo, aspectos y aislamiento de usuarios.                                                                                               |
| Aceptación    | El sistema muestra eventos reproducibles y limitaciones; las alertas respetan opt-in y se pueden eliminar.                                                                              |
| Prioridad     | P2                                                                                                                                                                                      |

## Fase 7 — Compatibilidad avanzada y otras personas

| Elemento      | Decisión                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Problema      | La compatibilidad actual es editorial por signo; no hay perfiles A/B, sinastría, carta compuesta ni Davison.                          |
| Solución      | Crear perfiles privados de otras personas y un motor de comparación, separado de la compatibilidad editorial.                         |
| Pantallas     | Selector Persona A/B, formulario privado, `/astrologia/sinastria`, resultados y administración de perfiles guardados.                 |
| Componentes   | `PersonProfileForm`, `SynastryChart`, `CrossAspectTable`, `SavedPeopleList`.                                                          |
| Backend       | CRUD privado por propietario; evitar exposición de datos de terceros; consentimiento y borrado.                                       |
| SQL/migración | `saved_people` con RLS; opcionalmente resultados no persistentes; constraints para datos de nacimiento.                               |
| APIs/datos    | Mismo motor validado de Fase 5.                                                                                                       |
| Dependencias  | Privacidad natal y Fase 5.                                                                                                            |
| Tests         | A/B aislados, borrado, cartas incompletas, falta de hora y aspectos cruzados.                                                         |
| Aceptación    | Se puede crear/editar/eliminar una persona y calcular sinastría sin que los datos aparezcan en perfiles, Comunidad, URLs o analytics. |
| Prioridad     | P2                                                                                                                                    |

## Fase 8 — Esoterismo modular

| Elemento      | Decisión                                                                                                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problema      | Numerología, Lenormand, Runas, Oráculos, Chakras, Cristales, Rituales y Sueños no existen.                                                                                 |
| Solución      | No construir los ocho a la vez. Elegir uno mediante demanda; comenzar por una biblioteca editorial pequeña, con disclaimers responsables y diario solo si hay caso de uso. |
| Pantallas     | Una ruta de biblioteca y detalle para el módulo elegido; no añadir menú vacío.                                                                                             |
| Componentes   | Catálogo, detalle, búsqueda, favorito y, si aplica, tirada/diario.                                                                                                         |
| Backend       | Servicios deterministas para cálculos; repositorios para contenido; moderación si hay texto del usuario.                                                                   |
| SQL/migración | Una migración por módulo únicamente cuando exista dominio y contenido; RLS para diarios/favoritos.                                                                         |
| APIs/datos    | Fuentes editoriales, revisión de afirmaciones de salud/finanzas y etiquetado de tradición/interpretación.                                                                  |
| Dependencias  | Búsqueda, favoritos, SEO y navegación.                                                                                                                                     |
| Tests         | Conteos de mazos, cálculos, entradas inválidas, permisos y mobile.                                                                                                         |
| Aceptación    | El módulo elegido tiene ruta, contenido real, búsqueda, estados y evidencia; los demás permanecen fuera del menú y sitemap.                                                |
| Prioridad     | P2/P3                                                                                                                                                                      |

## Fase 9 — Integración, IA, informes y notificaciones

| Elemento      | Decisión                                                                                                                                      |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Problema      | La IA existe, pero no conoce carta natal/tránsitos; no hay informes ni notificaciones.                                                        |
| Solución      | Conectar la IA solo a datos explícitamente autorizados y ya implementados; después construir informes y, por separado, notificaciones opt-in. |
| Pantallas     | Asistente contextual; centro de informes; preferencias de notificación.                                                                       |
| Componentes   | `ContextSourcePicker`, `ReportBuilder`, `ReportPreview`, `NotificationPreferences`.                                                           |
| Backend       | Validación de contexto, rate limit, jobs de notificación y generación de informes.                                                            |
| SQL/migración | Preferencias, informes privados, entregas y notificaciones con RLS; nunca exponer prompts o datos natales.                                    |
| APIs/datos    | Proveedor LLM, correo/push y render PDF solo tras configurar secretos reales.                                                                 |
| Dependencias  | Módulos fuente, privacidad, cuotas y proveedor.                                                                                               |
| Tests         | Prompt injection, límites, datos ausentes, exportación, PDF, opt-in/out y eliminación.                                                        |
| Aceptación    | La IA cita o identifica su contexto; no inventa capacidades; el informe se puede descargar/eliminar; las notificaciones se pueden desactivar. |
| Prioridad     | P2/P3                                                                                                                                         |

## Fase 10 — SEO, landing y producción

| Elemento      | Decisión                                                                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Problema      | SEO cubre 53 URLs reales, pero no los módulos futuros; la producción y el remoto de la rama no están sincronizados.                            |
| Solución      | No ampliar sitemap hasta que existan páginas y contenido. Después de cada módulo, añadir metadata, canonical, interlinking, JSON-LD y sitemap. |
| Pantallas     | Landing solo con funciones reales; nuevas páginas públicas por módulo terminado.                                                               |
| Componentes   | SEO helpers, cards, breadcrumbs y enlaces contextuales.                                                                                        |
| Backend       | Generación de sitemap de contenido publicado; exclusión de privados.                                                                           |
| SQL/migración | Solo seed de contenido publicado con estados y fechas; no incluir demos en sitemap.                                                            |
| APIs/datos    | Validar dominio, robots, canonical y datos estructurados.                                                                                      |
| Dependencias  | Contenido real y rutas terminadas.                                                                                                             |
| Tests         | Crawler de rutas, 200/404, metadata, canonical, robots, sitemap, mobile y performance.                                                         |
| Aceptación    | Ningún enlace a función inexistente; sitemap solo contiene 200 indexables; privadas no aparecen; producción coincide con commit verificado.    |
| Prioridad     | P1/P2                                                                                                                                          |

## Orden operativo recomendado

| Orden | Trabajo                                             | Motivo                                                    |
| ----: | --------------------------------------------------- | --------------------------------------------------------- |
|     1 | Privacidad natal y ciclo export/delete              | Corrige el riesgo más sensible antes de guardar más datos |
|     2 | Sincronizar rama y verificar migraciones históricas | Evita errores `relation/function does not exist`          |
|     3 | Suite de pruebas y lint por lotes                   | Aumenta confiabilidad del núcleo existente                |
|     4 | Tarot completo/diario                               | Aprovecha la base más madura y el catálogo ya confirmado  |
|     5 | Casas/aspectos con precisión documentada            | Base necesaria para tránsitos y sinastría                 |
|     6 | Tránsitos y astrología avanzada                     | Alto costo técnico; depende de cálculo correcto           |
|     7 | Sinastría y otras personas                          | Depende de privacidad y aspectos                          |
|     8 | Elegir un módulo esotérico de alto valor            | Evita dispersar producto y SQL                            |
|     9 | IA contextual, informes y notificaciones            | Dependen de módulos reales y proveedores                  |
|    10 | SEO final y producción                              | Solo después de pruebas y contenido real                  |

## Definición de terminado para cada fase

Una fase solo se cierra cuando existe una demostración reproducible, una ruta accesible, datos reales o cálculo verificable, validación de inputs, errores y estados vacíos, política de privacidad, pruebas automatizadas proporcionales, comprobación móvil y documentación de cualquier SQL aplicado. La ausencia de cualquiera de estos elementos mantiene el estado en **PARCIAL**, **NO VERIFICADO** o **NO IMPLEMENTADO**.

## Actualización de ejecución — 27 de agosto de 2026

La rama `redesign/fases-1-5` completó localmente el bloque de privacidad natal y ciclo de vida de cuenta, la sincronización manual de tipos y la estabilización estática. También se implementó un vertical real de Tarot/diario: preferencia local de cartas invertidas, guardado explícito de Carta del Día en la tabla privada existente, filtros y edición de notas en `/mi-espacio/lecturas`, y validación temporal de determinismo y sorteo sin repetición.

Esta actualización no marca como completados aspectos, tránsitos, sinastría, módulos esotéricos, IA avanzada, notificaciones ni newsletter con proveedor. El siguiente paso operativo es desplegar la rama y ejecutar pruebas autenticadas. No se creó SQL nuevo para la slice Tarot/diario; cualquier nueva persistencia futura deberá diseñarse y entregarse como migración RLS separada.
