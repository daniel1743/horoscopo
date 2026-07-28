# 02_MATRIZ_REUTILIZACION.md — MATRIZ DE REUTILIZACIÓN Y AMPLIACIÓN

Esta matriz determina la viabilidad de reutilización de cada pieza identificada en el sistema para soportar la futura automatización.

---

| Componente | Existe | Estado | Evidencia | Reutilización | Ampliación necesaria | Riesgo | Acción recomendada |
| :--- | :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **Motor lunar** | Sí | REUTILIZAR SIN CAMBIOS | `src/server/moon/astronomy-moon-engine.ts` | 100% | Ninguna para la Luna. | LOW | Mantener wrapper `MoonEngine`. |
| **Motor astronómico** | Sí | REUTILIZAR Y AMPLIAR | `astronomy-engine` v2.1.19 en `package.json` | 100% | Crear wrappers server-only para efemérides planetarias completas. | LOW | Crear `src/server/astrology/planetary-engine.ts`. |
| **Cálculo planetario** | No | INEXISTENTE | Ningún archivo calcula posiciones de Sol/Mercurio/Venus/etc. | 0% | Crear funciones para calcular longitud eclíptica de 10 cuerpos celestes. | MEDIUM | Desarrollar en `src/server/astrology/`. |
| **Motor de aspectos** | No | INEXISTENTE | No hay código para calcular ángulos (0°, 60°, 90°, 120°, 180°). | 0% | Crear algoritmo angular de diferencia de longitud. | MEDIUM | Desarrollar en `src/server/astrology/aspect-engine.ts`. |
| **Motor de orbes** | No | INEXISTENTE | Sin código para tolerancias en grados. | 0% | Configurar matriz de orbes por aspecto y planeta. | LOW | Crear matriz en `src/config/astrology.ts`. |
| **Retrogradaciones** | No | INEXISTENTE | Sin cálculo de velocidad heliocéntrica/geocéntrica. | 0% | Implementar detección de vector de velocidad negativo. | MEDIUM | Extender `planetary-engine.ts`. |
| **Ingresos** | No | INEXISTENTE | Sin detección de cruce de límites de signo (0°). | 0% | Crear detector de cambio de signo zodiacal. | LOW | Extender `planetary-engine.ts`. |
| **Reglas astrológicas** | No | INEXISTENTE | Sin motor de interpretación simbólica planetaria. | 0% | Mapear aspectos a significados simbólicos neutros. | LOW | Crear `src/config/astrological-rules.ts`. |
| **Contexto por signo** | No | INEXISTENTE | Sin generador de payload estructurado previa a IA. | 0% | Crear `SignContextBuilder` (combina luna + transitos + signo). | HIGH | Desarrollar en `src/server/astrology/`. |
| **Horóscopos diarios** | Parcial | REUTILIZAR Y AMPLIAR | `src/lib/horoscope/repository.ts` y tabla `horoscopes` | 40% | Conectar el generador automático a la tabla `horoscopes`. | MEDIUM | Preservar esquema de tabla `horoscopes`. |
| **Horóscopos semanales** | Parcial | REUTILIZAR Y AMPLIAR | `src/routes/horoscopo.semana.tsx` | 30% | Crear lógica de acumulación semanal de aspectos. | MEDIUM | Extender `repository.ts`. |
| **Horóscopos mensuales** | Parcial | REUTILIZAR Y AMPLIAR | `src/routes/horoscopo.mes.tsx` | 30% | Crear lógica de acumulación mensual de aspectos. | MEDIUM | Extender `repository.ts`. |
| **IA editorial** | No | INEXISTENTE | `src/routes/api/ai/respond.ts` es solo conversacional. | 20% | Crear cliente server-only generador con Structured Outputs. | HIGH | Crear `src/server/ai/editorial-generator.ts`. |
| **Structured Outputs** | No | INEXISTENTE | No hay esquemas Zod vinculados a respuestas OpenAI/Gemini. | 0% | Definir esquemas Zod estrictos para respuestas de la IA. | HIGH | Crear `src/server/ai/schemas.ts`. |
| **Validadores** | Sí | REUTILIZAR Y AMPLIAR | Zod en `src/config/forms.ts` y `src/lib/admin/articles.functions.ts` | 50% | Crear validadores de calidad de texto y similitud. | LOW | Crear `src/server/validators/`. |
| **Similitud** | No | INEXISTENTE | Sin algoritmo Levenshtein/embeddings para evitar plagios internals. | 0% | Implementar comprobador de similitud n-gramas. | MEDIUM | Crear `src/server/validators/similarity.ts`. |
| **Cron** | No | INEXISTENTE | Flag `scheduledPublication: false` en `src/config/features.ts`. | 0% | Configurar Supabase Cron / pg_cron + endpoint seguro. | HIGH | Implementar en `src/routes/api/cron/`. |
| **Publicación** | Parcial | REUTILIZAR Y AMPLIAR | `adminPublishArticle` en `articles.functions.ts` | 60% | Crear ejecutor de publicación desatendido. | HIGH | Extender `articles.functions.ts`. |
| **Buscador** | Sí | REUTILIZAR Y AMPLIAR | `src/server/search/search-index.service.ts` | 80% | Invocar `syncSearchDocument` al publicar horóscopos automáticos. | LOW | Vincular al workflow de publicación. |
| **Fallbacks** | No | INEXISTENTE | Sin plantilla de horóscopo estático por falta de IA. | 0% | Crear fallback determinista basado en aspectos astronómicos. | MEDIUM | Crear `src/server/fallbacks/`. |
| **Logs** | Sí | REUTILIZAR Y AMPLIAR | `src/lib/error-capture.ts` | 70% | Registrar ejecuciones del cron en `admin_audit_log`. | LOW | Reutilizar `logAdminAction`. |
| **Alertas** | No | INEXISTENTE | Sin notificador de fallos de generación o API keys. | 0% | Crear servicio de alertas por email/webhook. | LOW | Crear `src/server/alerts/`. |
| **Costos** | No | INEXISTENTE | Sin medidor de tokens consumidos en generación masiva. | 0% | Registrar uso de tokens en base de datos. | LOW | Crear tabla `ai_token_usage`. |
| **Panel** | Parcial | REUTILIZAR Y AMPLIAR | Layout `/admin` en `src/routes/_authenticated/admin/` | 70% | Crear vistas para monitorear ejecuciones de horóscopos. | LOW | Añadir rutas `/admin/horoscopos`. |
| **Media library** | No | INEXISTENTE | No hay bucket ni gestor en `src/routes/_authenticated/admin/`. | 0% | Crear bucket Supabase Storage `media` y vistas. | MEDIUM | Construir en Fase D. |
| **SEO** | Sí | REUTILIZAR SIN CAMBIOS | `src/config/seo.ts` y metadatos `buildMeta` | 100% | Ninguna. | LOW | Usar `buildMeta` en páginas públicas. |
| **RLS** | Sí | REUTILIZAR SIN CAMBIOS | Migraciones `supabase/migrations/` | 100% | Añadir políticas para nuevas tablas de automatización. | LOW | Mantener patrón `has_admin_role`. |
| **Auditoría** | Sí | REUTILIZAR SIN CAMBIOS | Tabla `admin_audit_log` y `logAdminAction` | 100% | Ninguna. | LOW | Registrar acciones automáticas con actor `system`. |
| **Workflow** | Sí | REUTILIZAR Y AMPLIAR | Tabla `content_workflow` y `src/lib/admin/workflow.ts` | 90% | Soportar tipo de recurso `horoscope`. | LOW | Extender `resource_type` en funciones. |
| **Revisiones** | Sí | REUTILIZAR Y AMPLIAR | Tabla `content_revisions` | 90% | Soportar snapshots de horóscopos automáticos. | LOW | Extender `resource_type`. |
