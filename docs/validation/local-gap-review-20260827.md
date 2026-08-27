# Revisión autónoma de brechas locales — 27 de agosto de 2026

## Conclusión ejecutiva

La documentación maestra todavía no permite afirmar que Creovision esté completa. La revisión posterior confirmó, sin ejecutar escrituras remotas, que aún había mejoras realizables localmente. Se completaron varias de ellas en `redesign/fases-1-5`: discoverability de Astrología, centralización de flags, una nueva tirada temática de Tarot, un diccionario simbólico de sueños, un resumen descriptivo de carta natal, informes de texto locales y accesos adicionales desde la landing.

Estas implementaciones son **código local validado**, no evidencia de que el entorno remoto ya las sirva. Las funciones sociales ampliadas y la compatibilidad de nuevas tiradas con el diario dependen de los bloques SQL manuales indicados al final.

## Mejoras completadas en local

| Superficie | Estado local | Evidencia | Dependencia remota restante |
|---|---|---|---|
| Hub de Astrología | **IMPLEMENTADO localmente** | `/astrologia` ahora enlaza carta natal, ascendente, Luna, tránsitos y sinastría; metadata actualizada. | Prueba visual y E2E autenticada de natal/tránsitos/sinastría. |
| Búsqueda interna | **IMPLEMENTADO localmente** | Se añadieron páginas públicas reales: Tarot decisión, Tarot ampliado, Astrología, tránsitos, sinastría, temas, Numerología y Sueños. | La consulta remota de documentos continúa dependiendo del catálogo de búsqueda existente. |
| Flags de funcionalidades | **IMPLEMENTADO localmente** | Se registraron flags para las nuevas superficies y se conectaron al índice estático. | Ninguna para el registro; el comportamiento final debe observarse en deploy. |
| Tarot pasado/presente/futuro | **IMPLEMENTADO localmente** | Nueva configuración declarativa, motor de tres cartas únicas, ruta pública, navegación, IA Tarot y guardado/diario tipados. | Aplicar `manual-tarot/01_saved_readings_spreads.sql` para que el constraint remoto acepte `decision` y `past_present_future`. |
| Resumen natal | **IMPLEMENTADO localmente** | Big Three, elemento dominante, modalidad dominante y signo más repetido calculados en memoria. | E2E del cálculo con datos reales; no equivale a astrología profesional. |
| Informes locales | **IMPLEMENTADO localmente** | Copiar o descargar `.txt` para carta natal, tránsitos y sinastría; no se persiste ni se envía a IA. | PDF, historial de informes y almacenamiento remoto siguen fuera de alcance. |
| Diccionario de sueños | **IMPLEMENTADO localmente** | `/suenos` con 20 símbolos editoriales, búsqueda, filtros, preguntas reflexivas y aviso de privacidad. | Revisión editorial/SEO en producción; no tiene diario persistente. |
| Landing | **IMPLEMENTADO localmente** | La sección de valor enlaza Tarot decisión, tránsitos y Camino de Vida mediante rutas reales. | Verificación visual, performance y conversión con tráfico real. |

## Validaciones ejecutadas

La suite local posterior a estos cambios registró los siguientes resultados:

| Validación | Resultado |
|---|---:|
| `npx tsc --noEmit` | **0** |
| `npm run build` | **0** |
| `npm run content:check` | **0** |
| `npm run pending:check` | **0** |
| `npm run seo:sitemap` | **0** |
| `git diff --check` | **0** |
| `npx prettier --check src scripts` | **0** |
| `npm run lint` | **0 errores**, con los 7 warnings estructurales ya conocidos de Fast Refresh |
| Auditor de dependencias Supabase | **30 tablas usadas, 15 RPC usados, 0 faltantes locales** |
| Runtime Tarot nuevo | **Correcto**: tres posiciones y cartas únicas |
| Runtime natal | **Correcto**: 10 placements, 12 casas, 4 ángulos, 14 aspectos en el caso de prueba y resumen finito |
| Runtime tránsitos | **Correcto**: 10 cuerpos, 26 aspectos en el caso de prueba y velocidades finitas |
| Runtime sinastría | **Correcto**: dos cartas de 10 placements y contactos finitos |
| Runtime Sueños e informes | **Correcto** |
| Sitemap generado | **137 URLs**; incluye Tarot nuevo y `/suenos`, excluye `/astrologia/sinastria` por noindex |

Los runtime checks son pruebas deterministas y locales. No sustituyen las pruebas autenticadas ni demuestran que Supabase remoto tenga aplicados los contratos pendientes.

## Lo que todavía puede mejorar sin SQL

La revisión no autoriza a declarar maduras las siguientes áreas: la precisión astrológica profesional, sistemas de casas alternativos, validación contra efemérides externas, calendario predictivo de tránsitos, carta compuesta, notificaciones, proveedor de newsletter, pagos, suscripciones, aplicación nativa, búsqueda web de IA y PDF profesional. Algunas podrían construirse en código, pero hacerlo ahora sin diseño de producto, consentimiento, proveedor y pruebas sería crear superficies incompletas o prometer capacidades inexistentes.

El informe local de texto sí quedó implementado como una mejora acotada y explícita. **`pdfReports` continúa desactivado**; no se simuló un PDF ni se añadió una dependencia innecesaria.

## Bloques que requieren acción manual de Daniel

| Bloque | Estado | Motivo |
|---|---|---|
| `supabase/migrations/manual-community/07_comments_and_follows.sql` | **PENDIENTE remoto** | Crea comentarios y follows seguros mediante RLS y RPCs; la UI tiene fallback hasta aplicarlo. |
| `supabase/migrations/manual-community/08_comment_reports_and_moderation.sql` | **PENDIENTE remoto** | Añade reportes y moderación de comentarios; sin este bloque no debe afirmarse que los comentarios estén moderados en producción. |
| `supabase/migrations/manual-tarot/01_saved_readings_spreads.sql` | **PENDIENTE remoto** | Amplía el constraint de `saved_tarot_readings.spread_type` para las claves `decision` y `past_present_future`. |
| E2E autenticada | **PENDIENTE** | Requiere sesión, datos de prueba del usuario y confirmación de aislamiento entre cuentas. |
| Deploy y verificación crawler | **PENDIENTE** | No se ejecutó deploy ni se hicieron escrituras remotas; el sitemap solo fue generado localmente. |

> **Estado honesto:** Creovision avanzó en código local, pero todavía es una entrega **PARCIAL** hasta aplicar los SQL pendientes, ejecutar E2E autenticada y observar el build desplegado. No se debe interpretar el resultado de esta revisión como cumplimiento total del documento maestro.

## Commits locales

La rama autorizada es `redesign/fases-1-5`. Los commits anteriores de consolidación son `ff1483b` y `3581b12`. Las mejoras de esta revisión quedan pendientes de su propio commit local después de la última inspección de diff; no se ha hecho push.
