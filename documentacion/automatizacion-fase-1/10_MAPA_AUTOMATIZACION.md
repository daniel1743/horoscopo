# 10_MAPA_AUTOMATIZACION.md — MAPA DE BRECHAS PARA AUTOMATIZACIÓN

Este documento compara la base de código actual contra la cadena de valor objetivo necesaria para operar la plataforma de manera autónoma.

---

## 1. Comparativa del Flujo Objetivo

```text
Flujo Objetivo:
Cálculo astronómico → aspectos → reglas astrológicas → contexto por signo
→ generación IA → validación → workflow → cron → publicación
→ indexación → monitoreo → fallback
```

---

## 2. Estado Detallado por Etapa

| Etapa del Flujo | Estado | Cobertura | Archivo de Referencia / Evidencia | Brecha o Acción Requerida |
| :--- | :---: | :---: | :--- | :--- |
| **1. Cálculo astronómico** | **EXISTE** | 100% (Luna) | `src/server/moon/astronomy-moon-engine.ts` | Extender cálculos a los 10 cuerpos celestes. |
| **2. Aspectos planetarios** | **INEXISTENTE** | 0% | Ninguno | Crear `aspect-engine.ts` (ángulos y orbes). |
| **3. Reglas astrológicas** | **INEXISTENTE** | 0% | Ninguno | Crear catálogo estático de significados simbólicos. |
| **4. Contexto por signo** | **INEXISTENTE** | 0% | Ninguno | Crear `SignContextBuilder` (JSON intermedio). |
| **5. Generación IA** | **INEXISTENTE** | 0% | `src/routes/api/ai/respond.ts` (Es solo chat) | Crear generador masivo con Structured Outputs. |
| **6. Validación** | **PARCIAL** | 40% | Zod en `src/config/forms.ts` | Crear comprobador de calidad y n-gramas de similitud. |
| **7. Workflow** | **EXISTE** | 90% | `src/lib/admin/workflow.ts` | Extender a tipo de recurso `horoscope`. |
| **8. Cron / Orquestador** | **INEXISTENTE** | 0% | Flag `scheduledPublication: false` | Configurar Supabase Cron y endpoint seguro. |
| **9. Publicación** | **PARCIAL** | 60% | `articles.functions.ts` (`adminPublishArticle`) | Crear ejecutor de publicación desatendido. |
| **10. Indexación** | **EXISTE** | 80% | `src/server/search/search-index.service.ts` | Invocar `syncSearchDocument` en la publicación. |
| **11. Monitoreo** | **EXISTE** | 80% | `src/lib/admin/admin.functions.ts` (`logAdminAction`) | Registrar fallos de automatización en audit log. |
| **12. Fallback** | **INEXISTENTE** | 0% | Ninguno | Crear plantilla de horóscopo astronómico determinista. |
