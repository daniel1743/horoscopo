# 11_PLAN_DE_DELEGACION.md — PLAN DE DELEGACIÓN DE AGENTES ESPECIALIZADOS

Este documento asigna las responsabilidades de construcción futura a cada agente de IA especializado (Anti-Gravity, Cline, Claude, Codex) según sus fortalezas técnicas y el nivel de riesgo del módulo.

---

## 1. Perfiles y Capacidades de los Agentes

* **Anti-Gravity**: Especialista en UI, sistemas de diseño, maquetación Tailwind, formularios, tablas, componentes de panel y documentación visual.
* **Cline**: Especialista en investigación, auditorías estáticas, ejecución de scripts de prueba, comprobación de imports y verificación de regresiones.
* **Claude**: Especialista en diseño conceptual profundo, ingeniería de prompts, estructuración de contextos astrológicos y resolución de ambigüedades.
* **Codex**: Especialista en algoritmos matemáticos server-only, Server Functions, concurrencia, idempotencia en Cron, RLS y migraciones Postgres.

---

## 2. Matriz de Asignación de Tareas Futuras

| Tarea futura | Agente principal | Agente de apoyo | Razón de asignación | Riesgo | Prerrequisitos |
| :--- | :---: | :---: | :--- | :---: | :--- |
| **Construcción del `PlanetaryEngine` y `AspectEngine`** | **Codex** | Cline | Requiere cálculos angulares server-only exactos usando `astronomy-engine`. | HIGH | Ninguno. |
| **Diseño del `SignContextBuilder` y Reglas Astrológicas** | **Claude** | Anti-Gravity | Exige coherencia simbólica y estructuración del JSON de contexto. | HIGH | `PlanetaryEngine`. |
| **Ingeniería de Prompts y Esquemas Zod (Structured Outputs)** | **Claude** | Codex | Garantiza que la IA no alucine eventos astronómicos. | HIGH | `SignContextBuilder`. |
| **Validadores de Calidad y Similitud** | **Codex** | Cline | Lógica algorítmica estricta de comparación de texto. | MEDIUM | Esquemas Zod de IA. |
| **Orquestación de Cron Jobs y Endpoint Seguro** | **Codex** | Anti-Gravity | Control de concurrencia, idempotencia y firma en Supabase. | CRITICAL | Validadores de contenido. |
| **UI de Monitoreo e Horóscopos en Panel `/admin`** | **Anti-Gravity** | Cline | Maquetación visual reutilizando el layout de administración. | LOW | Endpoint Cron. |
| **Media Library en Supabase Storage (Fase D)** | **Anti-Gravity** | Codex | Componentes de subida de archivos y políticas RLS de buckets. | MEDIUM | RLS de Supabase. |
| **Auditoría de Regresiones y Pruebas E2E** | **Cline** | Anti-Gravity | Ejecución de scripts `check-*.ts` y comprobación de build. | LOW | Implementación lista. |
