# 06_RIESGOS_DE_IMPLEMENTACION.md — MATRIZ DE RIESGOS TÉCNICOS

Este documento evalúa los riesgos potenciales que podrían surgir durante la futura implementación del sistema de automatización y orquestación.

---

## 1. Clasificación de Riesgos

```text
CRITICAL : Amenaza la seguridad de las claves, causa pérdida de datos o duplica cobros/publicaciones.
HIGH     : Causa caídas de servicio, alucinaciones graves en la IA o fallos de indexación SEO.
MEDIUM   : Degradación temporal del rendimiento o fallos de formato en vistas secundarias.
LOW      : Advertencias estéticas o avisos no bloqueantes de linter.
```

---

## 2. Matriz de Riesgos Identificados

| ID | Riesgo | Nivel | Evidencia / Módulo | Consecuencia | Probabilidad | Mitigación | Agente | Fase |
| :-: | :--- | :-: | :--- | :--- | :-: | :--- | :-: | :-: |
| **R-01** | Exposición de `SUPABASE_SERVICE_ROLE_KEY` en bundle cliente | **CRITICAL** | `src/integrations/supabase/client.server.ts` | Bypass total de RLS por terceros. | Baja | Usar import dinámico en handlers de Server Functions y verificar con script de build. | Codex | Fase 2 |
| **R-02** | Doble publicación / Carreras de Concurrencia en Cron | **CRITICAL** | `src/routes/api/cron/` (Por construir) | Publicación de dos horóscopos distintos para el mismo signo y fecha. | Media | Implementar bloqueos en Postgres (`SELECT FOR UPDATE`) y restricción `UNIQUE(sign_slug, period, date_for)` en la tabla `horoscopes`. | Codex | Fase 4 |
| **R-03** | Alucinación de la IA sin contexto astronómico | **HIGH** | `src/routes/api/ai/respond.ts` | La IA inventa tránsitos o eclipses inexistentes. | Alta | Forzar el uso del `SignContextBuilder` (JSON estricto) antes de pasar el prompt a la IA. | Claude | Fase 3 |
| **R-04** | Desincronización del Buscador al publicar automático | **HIGH** | `src/server/search/search-index.service.ts` | Los horóscopos publicados no aparecen en las búsquedas del usuario. | Alta | Invocar `syncSearchDocument` dentro de la transacción de publicación del cron. | Codex | Fase 4 |
| **R-05** | Consumo descontrolado de tokens de IA por reintentos | **HIGH** | Generador de IA (Por construir) | Costos excesivos en API de OpenAI/Gemini por bucles de error. | Media | Establecer un número máximo de 3 reintentos (`max_attempts`) y activar el `FallbackEngine`. | Codex | Fase 3 |
| **R-06** | Contenido Duplicado SEO en URLs no canónicas | **MEDIUM** | `src/routes/compatibilidad.$signA.$signB.tsx` | Penalización en Google por indexar `/tauro/aries` y `/aries/tauro`. | Baja | Reutilizar el helper `normalizeSignPair` que fuerza redirección `replace: true`. | Anti-Gravity | Fase 2 |
| **R-07** | Fallo de importación de `astronomy-engine` en SSR | **MEDIUM** | `src/lib/moon/moon.functions.ts` | Error 500 en servidor por intentar empaquetar librería server-only. | Baja | Mantener `await import("@/server/...")` dentro del cuerpo de la función. | Cline | Fase 2 |
| **R-08** | Desbordamiento de memoria por caché de tránsitos | **LOW** | `src/lib/moon/timezone.ts` | Consumo progresivo de RAM en servidores Serverless. | Baja | Limitar el tamaño del mapa de caché `ZONED_PARTS_FORMATTER_CACHE`. | Cline | Fase 2 |
