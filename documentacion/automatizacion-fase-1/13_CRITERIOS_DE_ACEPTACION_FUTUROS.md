# 13_CRITERIOS_DE_ACEPTACION_FUTUROS.md — CRITERIOS DE ACEPTACIÓN VERIFICABLES

Este documento especifica los criterios de aceptación cuantitativos y probables para evaluar el éxito de las futuras fases de automatización.

---

## 1. Criterios para el Motor Astronómico y Aspectos (Fase 2)

* **C-01 (Determinismo)**: Dos llamadas consecutivas a `PlanetaryEngine.getPositions(instantUtc)` para el mismo timestamp UTC exacto deben devolver valores de longitud eclíptica idénticos (diferencia 0.00000°).
* **C-02 (Precisión de Aspectos)**: El `AspectEngine` debe identificar una conjunción como "exacta" cuando la diferencia angular sea inferior a 0.1° y asignarla correctamente como "aplicando" o "separando" según los vectores de velocidad.

---

## 2. Criterios para el Generador por IA y Validadores (Fase 3)

* **C-03 (Cumplimiento de Esquema Zod)**: El 100% de las respuestas generadas por la IA deben validar con éxito el esquema Zod `HoroscopeOutputPayload`. Cualquier respuesta con campos nulos o formateo incorrecto debe ser rechazada antes de tocar la base de datos.
* **C-04 (Control de Plagio Interno)**: Ningún horóscopo generado puede tener un índice de similitud trigrama (Jaccard) superior a 0.65 respecto a los horóscopos de los últimos 30 días del mismo signo.

---

## 3. Criterios para Orquestación, Cron y Seguridad (Fase 4)

* **C-05 (Idempotencia en Ejecución)**: Disparar el endpoint `/api/cron/publish` múltiples veces en el mismo minuto para el mismo signo y fecha debe resultar en **exactamente 1 horóscopo publicado** y 0 duplicados en la base de datos.
* **C-06 (Sincronización Inmediata del Buscador)**: Inmediatamente tras la publicación de un horóscopo por el cron, la función RPC `search_site(signo)` debe incluir el nuevo contenido en los primeros 3 resultados.
* **C-07 (Resiliencia por Fallback)**: Si la llamada a la API de IA sufre un timeout superior a 8000 ms, el sistema debe responder en menos de 150 ms devolviendo el contenido generado por el `FallbackEngine` determinista, registrando un aviso en `admin_audit_log`.
