# Informe operativo de Creovision

**Fecha:** 27 de agosto de 2026
**Rama:** `redesign/fases-1-5`
**Alcance:** consolidación local del rediseño, privacidad, Tarot, astrología, Comunidad, contenido/SEO, IA contextual y una primera vertical de Numerología.
**Commit local:** `ff1483b`
**Estado remoto:** Daniel confirmó manualmente Tarot, Editorial, datos natales privados y Comunidad base 01–06. Este agente no ejecutó SQL remoto, no hizo deploy, no hizo push y no modificó `main`.

## Resumen ejecutivo

La rama conserva el núcleo existente y añade extensiones verificables sin presentar el documento maestro de 636 requisitos como terminado. El vertical Tarot ahora tiene catálogo local y remoto confirmado de 78 cartas, reversos con preferencia local, Carta del Día guardable, diario privado y cuatro tiradas: diaria, sí/no, tres cartas y decisión de dos cartas. La interpretación contextual por IA admite también la tirada de decisión, siempre dentro del perímetro Tarot autorizado.

La carta natal local incorpora placements por casa, ASC/MC/DSC/IC, cinco aspectos mayores con orbes fijos y una rueda SVG accesible. Tránsitos y sinastría calculan en memoria y no persisten fechas ni datos de terceros. La Comunidad base continúa confirmada en Supabase; comentarios, follows y reportes/moderación de comentarios están implementados en código y SQL local, pero requieren aplicar manualmente los lotes 07 y 08 y ejecutar pruebas autenticadas.

> **Conclusión honesta:** el producto tiene un núcleo funcional considerable, pero todavía es **PARCIAL** frente al alcance maestro. Las pruebas E2E autenticadas, la confirmación de los SQL nuevos y el deploy permanecen fuera de la ejecución autónoma autorizada.

## Estado por área

| Área | Resultado local | Estado que puede afirmarse |
| --- | --- | --- |
| Privacidad natal | Repositorio aislado en `profile_astrology_birth_data`; exportación y eliminación ampliadas | **Implementado en código; E2E pendiente** |
| Tarot | 78 cartas, reversos, biblioteca filtrable, recomendaciones, cuatro tiradas y guardado explícito | **Implementado; catálogo remoto confirmado manualmente** |
| Diario privado | Filtros por tirada/fecha, búsqueda, métricas, notas editables y borrado | **Implementado en código; E2E pendiente** |
| Astrología natal | 10 cuerpos, 12 casas iguales, cuatro ángulos, cinco aspectos y rueda accesible | **Implementado localmente; aproximación no profesional** |
| Tránsitos | Posiciones locales, velocidad/retrogradación y aspectos cruzados | **Implementado localmente; no persistente** |
| Sinastría | Dos cartas en memoria, contactos cruzados, ruta `noindex,nofollow` | **Implementado localmente; E2E pendiente** |
| Comunidad base | Posts, feed, likes, reposts, reportes y moderación de posts | **SQL 01–06 confirmado; E2E pendiente** |
| Comunidad ampliada | Comentarios, follows y reportes/moderación de comentarios | **Código + SQL 07–08 local; no aplicado remotamente** |
| Editorial/SEO | 12 Guías, categorías, filtro de temas, 78 fichas Tarot y sitemap de 135 URLs | **Implementado localmente; crawler/performance no verificados** |
| IA | Chat con streaming, cuotas, RAG limitado y contexto Tarot/horóscopo/artículos | **Implementado localmente; proveedor/producción no verificados** |
| Numerología | Camino de Vida calculado en memoria, significados 1–9/11/22/33 y aviso de límites | **Implementado localmente; sin SQL por diseño** |

## Cambios funcionales relevantes

El Tarot conserva la preferencia de cartas invertidas únicamente en `localStorage`; no se sincroniza con Supabase ni aparece en analytics. La nueva tirada de decisión usa dos posiciones declarativas y evita convertir la lectura en una orden. La IA recibe las cartas ya seleccionadas, no puede cambiarlas y no está conectada a datos natales, tránsitos, sinastría o Numerología.

El hub editorial deja de enviar a filtros de consulta sin efecto. `/guias?tema=...` valida el parámetro, lo asocia a una categoría editorial existente y muestra una señal de contexto con salida hacia todas las guías. El sitemap generado desde el catálogo local contiene las 78 fichas Tarot, `/tarot/decision`, `/astrologia/transitos`, `/temas`, `/numerologia/camino-de-vida` y excluye `/astrologia/sinastria` por su `noindex,nofollow`.

La nueva ruta `/numerologia/camino-de-vida` acepta una fecha de nacimiento sin guardarla, incluirla en URL, enviarla a una API o asociarla a un perfil. Usa reducción determinista por partes de la fecha y conserva 11, 22 y 33 como números maestros. El contenido se presenta como interpretación cultural y reflexiva, no como ciencia, diagnóstico ni predicción.

La Comunidad ampliada incluye comentarios bajo demanda, follow por username mediante RPC seguro, reporte de cada comentario y una bandeja administrativa que reúne reportes de publicaciones y comentarios. Los lotes `07_comments_and_follows.sql` y `08_comment_reports_and_moderation.sql` son **SQL manual pendiente**; la interfaz muestra fallback cuando el lote 07 no existe, pero no debe declararse activa en remoto hasta que Daniel aplique y verifique ambos bloques.

## Datos, seguridad y SQL pendiente

El detector local reconstruido comparó las llamadas del código con los SQL versionados y encontró **30 tablas usadas, 15 RPC usados, 0 tablas faltantes y 0 RPC faltantes**. Esta comprobación demuestra coherencia local, no existencia en el proyecto Supabase remoto.

| Bloque | Estado | Acción de Daniel al final |
| --- | --- | --- |
| `profile_astrology_birth_data` | Confirmado manualmente | Ejecutar pruebas de guardar, recuperar, borrar y exportar |
| Comunidad 01–06 | Confirmado manualmente | Ejecutar pruebas reales de post, like, repost, reporte y moderación |
| `07_comments_and_follows.sql` | Local, no aplicado | Aplicar como bloque SQL independiente y capturar resultado |
| `08_comment_reports_and_moderation.sql` | Local, no aplicado | Aplicar después de 07 y verificar bandeja/admin/RLS |
| Numerología | No requiere SQL | Probar cálculo local sin datos reales compartidos |

No se debe aplicar un seed a ciegas ni ejecutar un bloque contra una tabla equivocada. Cada bloque nuevo debe comprobarse en el proyecto Supabase correcto y, si falla por objeto existente o ausente, documentar el estado antes de continuar.

## Validaciones locales

| Comprobación | Estado actual | Evidencia o límite |
| --- | --- | --- |
| `npx tsc --noEmit` | **PASÓ** | 0 errores después del soporte Tarot decisión, Comunidad y Numerología |
| `npm run lint` | **PASÓ** | 0 errores; 7 warnings estructurales `react-refresh/only-export-components` |
| `npm run build` | **PASÓ** | Vite/Nitro generó el build y actualizó `routeTree.gen.ts`; no implica deploy |
| `npm run seo:sitemap` | **PASÓ** | 135 URLs, 78 fichas Tarot y sin sinastría |
| Detector Supabase local | **PASÓ** | 30 tablas, 15 RPC, 0 faltantes; no confirma remoto |
| `npm run content:check` | Pendiente en suite final | Debe repetirse después de la consolidación |
| `npm run pending:check` | Pendiente en suite final | Debe repetirse después de la consolidación |
| Runtime Tarot/natal/tránsitos/sinastría | Pendiente en suite final | Se ejecutará con archivos temporales fuera del repositorio |
| E2E autenticado | Pendiente | Requiere sesión, SQL aplicado y pruebas de Daniel |

No se añadió Vitest ni otro runner porque el repositorio no lo tenía instalado y no se autorizó introducir una dependencia de pruebas solo para esta continuidad. Los tests de dominio existentes siguen siendo útiles, pero no sustituyen E2E.

## Pendientes y límites

Siguen pendientes la validación autenticada de privacidad natal, exportación/eliminación de cuenta, diario Tarot, publicaciones sociales, comentarios, follows y moderación. También faltan proveedor real de newsletter, notificaciones, mensajería directa, multimedia social, mazos alternativos con licencias, informes persistidos, sistemas de casas profesionales, precisión ephemerídica certificada, predicción determinista y módulos esotéricos adicionales.

La IA continúa acotada a Tarot, horóscopos y artículos editoriales publicados. La carta natal, tránsitos, sinastría y Numerología no se conectan a la IA. La compatibilidad de signos sigue siendo editorial y no equivale a sinastría astronómica.

## Estado de Git y entrega

La rama autorizada es `redesign/fases-1-5`. No se tocó `main`, no se hizo merge, rebase, force push, push ni deploy. Se revisaron `git status --short`, `git diff --stat`, `git diff --check` y el lockfile; el commit local cohesivo quedó creado como `ff1483b`. El respaldo `/home/ubuntu/horoscopo-restored-backup-20260827` se conserva como respaldo de recuperación.

## Referencias internas

[1]: ../../src/config/routes.ts "Registro central de rutas"
[2]: ../../src/config/tarot.ts "Registro declarativo de Tarot"
[3]: ../../src/services/astrology.service.ts "Motor natal local"
[4]: ../../src/services/transits.service.ts "Motor local de tránsitos"
[5]: ../../src/services/synastry.service.ts "Motor local de sinastría"
[6]: ../../src/lib/account/repository.ts "Repositorio de cuenta y Comunidad"
[7]: ../audit/MODELO_DATOS.md "Modelo de datos y SQL pendiente"
[8]: ../audit/numerologia-research.md "Investigación de referencia de Numerología"


## Revisión autónoma adicional — 27 de agosto de 2026

Después del commit de consolidación se revisaron nuevamente las brechas del documento maestro. Sin aplicar SQL ni desplegar, se cerraron localmente varias oportunidades de alto valor: el hub de Astrología ahora descubre cinco experiencias; la búsqueda interna y los flags incluyen las rutas públicas nuevas; la landing enlaza Tarot decisión, tránsitos y Camino de Vida; y el sitemap local subió a 137 URLs con `/tarot/pasado-presente-futuro` y `/suenos`, manteniendo fuera sinastría por `noindex`.

Se añadió la tirada Tarot **pasado, presente y futuro** con posiciones declarativas, cartas únicas, síntesis no determinista, IA dentro del perímetro Tarot y soporte del diario privado. El código ya contempla `decision` y `past_present_future`, pero la restricción remota histórica de `saved_tarot_readings.spread_type` necesita el SQL manual `supabase/migrations/manual-tarot/01_saved_readings_spreads.sql` antes de afirmar compatibilidad en producción.

La carta natal ahora ofrece un resumen de Big Three, elemento, modalidad y signo más repetido, calculado a partir de los puntos locales y presentado como descripción simbólica. Además, natal, tránsitos y sinastría permiten copiar o descargar un `.txt` local con posiciones, contactos y límites. No se activó PDF, persistencia de informes ni envío de estos datos a IA.

Se implementó `/suenos` como diccionario público de veinte símbolos con búsqueda, filtros, lentes emocionales y simbólicas y preguntas de reflexión. No se creó diario de sueños ni persistencia, por lo que no se añadió SQL ni se expone información personal.

La validación posterior pasó TypeScript, build, contenido, pendientes, sitemap, Prettier, lint y diff-check. El runtime externo pasó Tarot temático, natal, tránsitos, sinastría, Sueños e informes. El auditor local continúa registrando 30 tablas usadas, 15 RPC usados y 0 faltantes. Esta evidencia es local y no sustituye pruebas autenticadas, multiusuario, aplicación de SQL ni deploy.

La rama sigue siendo `redesign/fases-1-5`. Estas mejoras adicionales aún no tienen un commit posterior al `3581b12`; antes de entregar el siguiente SQL se debe crear y verificar ese commit local, sin push.
