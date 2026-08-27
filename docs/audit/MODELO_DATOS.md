# MODELO DE DATOS Y SQL DE CREOVISION

**Rama auditada:** `redesign/fases-1-5`
**Fecha:** 27 de agosto de 2026

## 1. Resultado de la auditoría de dependencias

Se compararon las llamadas `.from()` y `.rpc()` del código con los archivos SQL locales disponibles.

| Métrica                                                            |                                       Resultado |
| ------------------------------------------------------------------ | ----------------------------------------------: |
| Tablas usadas por el código                                        |                                              30 |
| Tablas usadas sin migración local                                  |                                               0 |
| RPC usados por el código                                           |                                              15 |
| RPC usados sin migración local                                     |                                               0 |
| Tablas con migración pero no detectadas directamente por `.from()` |                          1: tabla natal privada |
| Migraciones manuales confirmadas por Daniel                        | Tarot, Guías, muro social y tabla natal privada |

El resultado responde a la preocupación central: **no se encontró una tabla o RPC que el código llame y que no tenga al menos una migración local**. Sin embargo, tener un archivo local no demuestra que haya sido aplicado al proyecto Supabase correcto.

## 2. Tablas actuales y propósito

| Tabla                          | Propósito                          | Acceso esperado                                           | Estado remoto                             |
| ------------------------------ | ---------------------------------- | --------------------------------------------------------- | ----------------------------------------- |
| `profiles`                     | Perfil del usuario                 | Propietario; lectura pública solo mediante RPC controlado | Tabla existe; identidad social confirmada |
| `user_roles`                   | Roles admin/editor                 | Propietario/administración                                | No confirmado en esta auditoría           |
| `user_privacy_settings`        | Preferencias privadas              | Propietario                                               | No confirmado en esta auditoría           |
| `user_favorites`               | Favoritos del MVP                  | Propietario                                               | No confirmado en esta auditoría           |
| `saved_tarot_readings`         | Lecturas Tarot guardadas           | Propietario                                               | No confirmado en esta auditoría           |
| `user_activity_history`        | Historial de actividad             | Propietario                                               | No confirmado en esta auditoría           |
| `profile_astrology_birth_data` | Datos natales privados             | Propietario con RLS                                       | Creada y verificada manualmente           |
| `horoscopes`                   | Horóscopos por signo/periodo/fecha | Lectura pública publicada; escritura protegida            | No confirmado en esta auditoría           |
| `tarot_cards`                  | Catálogo Tarot                     | Lectura pública publicada; escritura protegida            | 78 publicadas confirmadas manualmente     |
| `moon_phase_content`           | Contenido editorial de fases       | Lectura pública publicada                                 | No confirmado en esta auditoría           |
| `moon_calculation_cache`       | Caché de cálculos lunares          | Backend                                                   | No confirmado en esta auditoría           |
| `compatibility_profiles`       | Compatibilidad editorial por pares | Lectura pública publicada                                 | No confirmado en esta auditoría           |
| `editorial_categories`         | Categorías de Guías                | Lectura pública                                           | Confirmada manualmente                    |
| `editorial_authors`            | Autores editoriales                | Lectura pública                                           | Confirmada manualmente                    |
| `editorial_articles`           | Guías y artículos                  | Lectura pública publicada; escritura editorial            | 12 Guías publicadas confirmadas           |
| `content_workflow`             | Flujo editorial                    | Admin/editor                                              | No confirmado en esta auditoría           |
| `content_revisions`            | Revisiones editoriales             | Admin/editor                                              | No confirmado en esta auditoría           |
| `search_documents`             | Índice de búsqueda                 | Backend/RPC                                               | No confirmado en esta auditoría           |
| `ai_conversations`             | Conversaciones IA                  | Propietario                                               | No confirmado en esta auditoría           |
| `ai_messages`                  | Mensajes IA                        | Propietario                                               | No confirmado en esta auditoría           |
| `ai_memories`                  | Memorias IA                        | Propietario                                               | No confirmado en esta auditoría           |
| `ai_user_preferences`          | Preferencias IA                    | Propietario                                               | No confirmado en esta auditoría           |
| `ai_feedback`                  | Feedback IA                        | Propietario                                               | No confirmado en esta auditoría           |
| `ai_usage_daily`               | Cuotas IA                          | Backend                                                   | No confirmado en esta auditoría           |
| `admin_audit_log`              | Auditoría admin                    | Admin/backend                                             | No confirmado en esta auditoría           |
| `community_posts`              | Posts sociales                     | Propietario; lectura pública controlada                   | Confirmada manualmente                    |
| `community_post_likes`         | Me gusta                           | Propietario                                               | Confirmada manualmente                    |
| `community_post_reposts`       | Republicaciones                    | Propietario                                               | Confirmada manualmente                    |
| `community_post_reports`       | Reportes de publicaciones          | Usuario autenticado/admin                                 | Confirmada manualmente                    |
| `community_post_comments`      | Comentarios                        | Lectura pública solo por RPC; escritura autenticada       | SQL local 07 pendiente                   |
| `community_profile_follows`    | Seguimiento de perfiles            | RPC por username; tabla cerrada a anon                    | SQL local 07 pendiente                   |
| `community_comment_reports`    | Reportes de comentarios            | Usuario autenticado/admin                                 | SQL local 08 pendiente                   |

## 3. RPC actuales

| RPC                             | Propósito                  | Estado                                 |
| ------------------------------- | -------------------------- | -------------------------------------- |
| `get_public_profile`            | Perfil público controlado  | Confirmado manualmente                 |
| `list_public_community_posts`   | Feed mundial               | Confirmado manualmente; responde vacío |
| `list_public_community_reposts` | Feed de republicaciones    | Confirmado manualmente; responde vacío |
| `list_public_profile_posts`     | Posts del perfil público   | Confirmado manualmente; responde vacío |
| `list_public_profile_reposts`   | Reposts del perfil público | Confirmado manualmente; responde vacío |
| `list_open_community_reports`   | Reportes para moderación   | Existencia confirmada; `anon` revocado |
| `moderate_community_report`     | Moderación                 | Existencia confirmada; `anon` revocado |
| `search_site`                   | Búsqueda                   | Migración local; remoto no confirmado  |
| `search_suggest`                | Sugerencias                | Migración local; remoto no confirmado  |
| `list_public_community_comments` | Comentarios públicos              | SQL local 07 pendiente              |
| `get_public_profile_follow_stats` | Conteos públicos de follow       | SQL local 07 pendiente              |
| `toggle_public_profile_follow` | Follow por username                | SQL local 07 pendiente              |
| `list_open_community_comment_reports` | Reportes de comentarios     | SQL local 08 pendiente              |
| `moderate_community_comment_report` | Moderación de comentarios     | SQL local 08 pendiente              |
| `admin_product_metrics`         | Métricas agregadas         | Migración local; remoto no confirmado  |

## 4. Migraciones confirmadas manualmente

| Bloque                                                          | Qué se confirmó                                                                         |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `20260827095000_create_tarot_cards_manual.sql` + seed           | Tabla Tarot y catálogo final de 78 publicadas; cuatro Sotas archivadas con autorización |
| `20260827100500_create_editorial_schema_manual.sql` + taxonomía | Tablas editoriales, seis categorías y autor editorial                                   |
| `20260827101000_seed_real_editorial_guides.sql`                 | 12 Guías reales publicadas y demo archivado                                             |
| `manual-community/01` a `05`                                    | Identidad social, posts, interacciones, feeds y moderación                              |
| `manual-community/06_revoke_anon_moderation.sql`                | Revocación de `anon` en funciones administrativas                                       |
| `20260827102500_create_private_astrology_birth_data.sql`        | Tabla natal privada, RLS, políticas, columnas y permisos                                |

## 5. Migraciones locales existentes pero no confirmadas

Las migraciones históricas de roles, horóscopos, cuenta, Tarot base, IA, Luna, compatibilidad, búsqueda, administración, workflow editorial y métricas tienen archivos locales y objetos coherentes con el código. No se afirma que falten; solo no se recibió evidencia manual de su existencia en el proyecto remoto durante esta auditoría.

La acción correcta es verificar objetos, no volver a ejecutar seeds a ciegas. Ante un error `relation does not exist` o `function does not exist`, debe aplicarse únicamente la migración que corresponda y documentar el resultado.

## 6. SQL que todavía no existe porque la función tampoco existe

Existe SQL local pendiente para comentarios, follows y reportes de comentarios (`manual-community/07_comments_and_follows.sql` y `08_comment_reports_and_moderation.sql`). También existe una vertical local de numerología que procesa la fecha en memoria y, por diseño, no necesita SQL. No existe SQL para aspectos persistidos, tránsitos persistidos, sinastría/personas guardadas, astrocartografía, Lenormand, runas, oráculos, chakras, cristales, rituales, sueños, informes almacenados, notificaciones, perfiles de otras personas ni mazos alternativos. Esto es correcto mientras esas funciones no tengan un diseño de privacidad y persistencia aprobado.

## 7. Brecha de tipos

`src/integrations/supabase/types.ts` contiene tipos manuales para `profile_astrology_birth_data`, comentarios, follows y las RPC asociadas. Estos tipos acompañan SQL local que aún no está confirmado remotamente; deben regenerarse desde el proyecto Supabase correcto después de aplicar los lotes finales, evitando que los casts `as never` oculten diferencias de esquema.

## 8. SQL mínimo necesario para las siguientes fases

| Necesidad                               | ¿SQL nuevo ahora? | Decisión                                                             |
| --------------------------------------- | ----------------- | -------------------------------------------------------------------- |
| Completar exportación/eliminación natal | No                | Cambiar primero server functions; reutilizar tabla existente         |
| Verificar baseline MVP                  | No                | Consultas de solo lectura; aplicar migración histórica solo si falta |
| Tarot avanzado/diario                   | No todavía        | Diseñar modelo de mazos, spreads y diario primero                    |
| Aspectos/tránsitos                      | No todavía        | Validar motor y precisión antes de persistir eventos                 |
| Sinastría/personas                      | No todavía        | Diseñar privacidad y RLS antes de tablas                             |
| Esoterismo                              | No para Numerología | La vertical Camino de Vida es local y no persiste fecha de nacimiento |
| Comunidad: comentarios/follows/reportes | Sí                | Aplicar manualmente 07 y 08 después de revisar el remoto              |
| Informes                                | No todavía        | Definir formato, privacidad y almacenamiento                         |
| Notificaciones                          | No todavía        | Elegir proveedor, opt-in y jobs                                      |

## 9. Regla operativa

Cada SQL futuro debe venir acompañado de: objeto que crea, ruta que lo usa, rol que lo ejecuta, política RLS, datos de prueba no productivos, query de verificación y criterio de rollback. Ninguna funcionalidad debe quedar “guindando” por falta de migración.

## Actualización de ejecución — 27 de agosto de 2026

La ampliación del vertical Tarot/diario no añadió tablas, RPC ni llamadas `.from()` nuevas. Reutiliza `saved_tarot_readings`, `listSavedReadings`, `saveTarotReading`, `updateSavedReadingNote` y `deleteSavedReading`, que ya estaban inventariados. La preferencia de cartas invertidas vive únicamente en `localStorage` y no constituye persistencia Supabase ni dato personal sincronizado.

La vertical de comentarios y follows requiere aplicar manualmente `manual-community/07_comments_and_follows.sql`; la moderación de comentarios requiere además `manual-community/08_comment_reports_and_moderation.sql`. Ninguno de esos dos lotes se ha ejecutado remotamente. La nueva página de Numerología (`/numerologia/camino-de-vida`) calcula localmente y no crea una dependencia Supabase. El detector reconstruido se ejecutó después de todos los cambios: **30 tablas usadas, 15 RPC usados, 0 tablas faltantes y 0 RPC faltantes en el SQL local**. Esta ausencia de faltantes locales no confirma que los objetos estén aplicados en el proyecto remoto.
