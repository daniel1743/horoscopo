# SEO-11 — Medición post-implementación en Google Search Console

Fecha de apertura: 2026-08-19
Proyecto: Creovision.io
Agente: Claude Sonnet (Analista SEO de medición y seguimiento)
Modo: MEASUREMENT_BASELINE_NO_CODE
Prioridad: ALTA
Estado: EN_CURSO

> Regla de oro: esta fase MIDE. No modifica código. No realiza nuevas optimizaciones basadas en movimientos de pocos días. Su objetivo es establecer el baseline Día 0, definir qué observar, definir páginas y queries prioritarias, y preparar comparaciones Día 7 / 14 / 28 separando ruido de señal.

---

## 1. Objetivo

Responder, con evidencia de Search Console y metodología consistente, la siguiente pregunta:

> ¿Google empieza a descubrir, indexar y posicionar mejor las páginas trabajadas en SEO-00…SEO-10?

Objetivos operativos:

1. Establecer el baseline Día 0 real posterior al cierre técnico.
2. Definir las métricas a observar (clicks, impressions, CTR, average position).
3. Definir páginas y queries prioritarias (Tier A/B y familias dinámicas).
4. Preparar comparaciones Día 7 / Día 14 / Día 28 con ventanas idénticas.
5. Separar ruido de señales (volumen bajo, movimientos aislados, queries raras).
6. Evitar cambios impulsivos durante el congelamiento de cambios.

---

## 2. Estado técnico heredado

| Fase    | Estado                       |
| ------- | ---------------------------- |
| SEO-00  | COMPLETADO                   |
| SEO-01  | COMPLETADO                   |
| SEO-02  | COMPLETADO                   |
| SEO-03  | COMPLETADO                   |
| SEO-04  | COMPLETADO                   |
| SEO-05  | COMPLETADO                   |
| SEO-06  | COMPLETADO                   |
| SEO-06D | COMPLETADO                   |
| SEO-07  | COMPLETADO                   |
| SEO-08  | COMPLETADO                   |
| SEO-09  | COMPLETADO                   |
| SEO-10  | COMPLETADO (PASS_CON_OBSERVACIONES) |
| SEO-11  | EN_CURSO (medición)          |

Decisiones heredadas de SEO-10 (auditoría final):

```
technical_readiness: READY_WITH_P2
seo11_ready: YES
p0_count: 0
p1_count: 0
p2_count: 3
```

Los 3 P2 no bloqueantes heredados (no corregir en esta fase):

1. Objeto `structuredData` legacy sin consumidor en `seo.ts` (limpieza opcional).
2. Nodo JSON-LD `WebPage` también emitido en compatibilidad demos noindex (no contradice robots/sitemap).
3. `threeCardReadings.general.seo.description` residual obsoleto, no renderizado.

Documento de cierre técnico: `10_AUDITORIA_FINAL.md`.
Documento maestro: `README.md`.

---

## 3. Fecha Día 0

- **Fecha exacta de inicio de medición (Día 0): 2026-08-19**
- Zona horaria de registro: America/Santiago (UTC-4:00)
- Hora de apertura del documento Día 0: 14:54 (aprox.)

### Ventana de medición

| Medición | Fecha (objetivo)        | Ventana Search Console          | Acción                     |
| -------- | ----------------------- | ------------------------------- | -------------------------- |
| Día 0    | 2026-08-19              | últimos 28 días                 | baseline                   |
| Día 7    | 2026-08-26              | últimos 28 días                 | observación temprana       |
| Día 14   | 2026-09-02              | últimos 28 días                 | comparación intermedia     |
| Día 28   | 2026-09-16              | últimos 28 días                 | primera evaluación seria   |

> Regla metodológica estricta: NO mezclar ventanas al comparar. Día 0, Día 7, Día 14 y Día 28 deben usar metodología consistente. La ventana primaria es **últimos 28 días**. Las ventanas opcionales (últimos 7 días, últimos 3 meses) solo se usan para diagnóstico, nunca para la comparación principal.

---

## 4. Baseline histórico

> Nota: estos valores son la referencia histórica inicial anterior al cierre técnico. No sustituyen un baseline Día 0 real si Search Console ya dispone de datos posteriores. Se conservan únicamente para contexto.

### Sitio (ventana 28 días, histórica)

| Métrica             | Valor |
| ------------------- | ----: |
| Impressions         |   246 |
| Clicks              |     0 |
| CTR medio           |    0% |
| Average position    |  37.1 |

### Páginas (histórico)

| Página                                 | Impressions | Average position |
| -------------------------------------- | ----------: | ---------------: |
| `/compatibilidad/geminis/sagitario`    |          73 |             38.0 |
| `/tarot/tres-cartas`                   |          66 |             39.8 |
| `/compatibilidad/cancer/capricornio`   |          31 |             54.3 |
| `/luna/fases/luna-creciente`           |          26 |             48.1 |

### Controles fuertes (histórico)

| Página                     | Average position |
| -------------------------- | ---------------: |
| `/`                        |              4.1 |
| `/tarot/carta-del-dia`     |              5.6 |
| `/horoscopo`               |              5.8 |
| `/tarot/tres-cartas/trabajo` |              6.6 |
| `/luna`                    |             19.4 |

### Queries (histórico)

| Query                            | Average position |
| -------------------------------- | ---------------: |
| `geminis y sagitario`            |             31.9 |
| `sagitario y geminis`            |             31.4 |
| `sagitario geminis`              |             37.0 |
| `geminis y sagitario juntos`     |             37.4 |
| `compatibilidad geminis y sagitario` |          41.8 |
| `tarot 3 cartas`                 |             52.3 |
| `tarot tres cartas`              |             28.8 |
| `luna creciente`                 |             53.6 |

Advertencia de volumen: el volumen es bajo (246 impresiones / 0 clics / 28 días). Estos datos priorizan observación, no demuestran causalidad.

---

## 5. Baseline Día 0

### Estado de captura

| Fuente de datos          | Estado                                   |
| ------------------------ | ---------------------------------------- |
| Google Search Console    | PENDIENTE_DE_CAPTURA_MANUAL              |
| API Search Analytics     | NO_DISPONIBLE_EN_ESTA_FASE               |
| Valor de referencia      | known_original_baseline (sección 4)      |

> IMPORTANTE: el agente de esta fase no dispone de acceso directo/al navegador a Search Console ni a su API. Por tanto, el snapshot Día 0 real no puede ser capturado automáticamente. Para no inventar conclusiones, se registra `INSUFFICIENT_DATA` en todos los campos que requieren lectura directa de Search Console. La captura manual deberá completarse antes de evaluar Día 7 / Día 14 / Día 28.

### Protocolo de captura Día 0 (manual, checklist a ejecutar dentro de Search Console)

Para cada dimensión solicitada, se debe registrar:

1. Sitio: clicks, impressions, CTR, average position (ventana últimos 28 días).
2. Page: click/impression/CTR/position por página prioritaria.
3. Query: click/impression/CTR/position por query prioritaria.
4. Device: split desktop/mobile.
5. Country: split por país.

### Plantilla de snapshot — sitio

| Métrica             | Día 0 (últimos 28d) | Día 7 | Día 14 | Día 28 | Tendencia |
| ------------------- | ------------------- | ----- | ------ | ------ | --------- |
| Clicks              | INSUFFICIENT_DATA   |       |        |        |           |
| Impressions         | INSUFFICIENT_DATA   |       |        |        |           |
| CTR                 | INSUFFICIENT_DATA   |       |        |        |           |
| Average position    | INSUFFICIENT_DATA   |       |        |        |           |

---

## 6. Páginas prioritarias

### TIER_A_PROTECTED_CONTROLS (controles observacionales protegidos)

| Ruta                         | Rol            |
| ---------------------------- | -------------- |
| `/`                          | Control fuerte |
| `/horoscopo`                 | Control fuerte |
| `/tarot/carta-del-dia`       | Control fuerte |
| `/tarot/tres-cartas/trabajo` | Control fuerte |

### TIER_A_OPTIMIZED (páginas intervenidas prioritarias)

| Ruta                                 | Fase de intervención principal |
| ------------------------------------ | ------------------------------ |
| `/luna`                              | SEO-04                         |
| `/tarot/tres-cartas`                 | SEO-05                         |
| `/compatibilidad/geminis/sagitario`  | SEO-06 / SEO-06D               |

### TIER_B

| Ruta                                 |
| ------------------------------------ |
| `/compatibilidad/cancer/capricornio` |
| `/compatibilidad/aries/libra`        |
| `/luna/fases/luna-creciente`         |
| `/tarot/cartas/el-loco`              |
| `/tarot/cartas/as-de-copas`          |

### Familias dinámicas (cobertura a monitorear)

- `/tarot/cartas/*`
- `/luna/fases/*`
- `/horoscopo/*`
- `/compatibilidad/*` (solo pares indexables)

### Métricas por página

Mandatorias: clicks, impressions, CTR, average position.
Opcionales: top queries, device split.

### Plantilla de snapshot — página

| Página | Clicks | Impressions | CTR | Position | Top query |
| ------ | -----: | ----------: | --- | -------: | --------- |
| (por página prioritaria) | INSUFFICIENT_DATA | INSUFFICIENT_DATA | INSUFFICIENT_DATA | INSUFFICIENT_DATA | INSUFFICIENT_DATA |

---

## 7. Queries prioritarias

### Compatibilidad

| Query |
| ----- |
| `geminis y sagitario` |
| `sagitario y geminis` |
| `sagitario geminis` |
| `geminis y sagitario juntos` |
| `compatibilidad geminis y sagitario` |

### Tarot

| Query |
| ----- |
| `tarot 3 cartas` |
| `tarot tres cartas` |

### Luna

| Query |
| ----- |
| `luna creciente` |

> Regla: añadir nuevas queries SOLO si Search Console muestra impresiones reales. No inventar lista extensa de keywords objetivo.

### Plantilla de snapshot — query

| Query | Clicks | Impressions | CTR | Position | Landing principal |
| ----- | -----: | ----------: | --- | -------: | ----------------- |
| (por query prioritaria) | INSUFFICIENT_DATA | INSUFFICIENT_DATA | INSUFFICIENT_DATA | INSUFFICIENT_DATA | INSUFFICIENT_DATA |

---

## 8. Controles

### Lógica de grupo de control

Las páginas protegidas actúan como controles observacionales:

- `/`
- `/horoscopo`
- `/tarot/carta-del-dia`
- `/tarot/tres-cartas/trabajo`

Regla de interpretación: si todo el dominio sube/baja simultáneamente (controles + optimizadas), considerar movimiento general del dominio antes de atribuir efecto a páginas optimizadas.

Advertencia: esto NO constituye un experimento causal perfecto. Es un control observacional de referencia.

---

## 9. Indexación

### Auditoría de indexación (a registrar en Día 7 / 14 / 28)

- Páginas indexed / not indexed.
- Canonical seleccionado por Google (si es visible).
- Descubrimiento vía sitemap.

### Plantilla de indexación técnica

| URL | Indexada | Sitemap | Canonical | Observación |
| --- | -------- | ------- | --------- | ----------- |
| (por URL prioritaria) | INSUFFICIENT_DATA | INSUFFICIENT_DATA | INSUFFICIENT_DATA |  |

### Cobertura nueva prioritaria — Tarot 78

| Ejemplo de URL                       | Objetivo                                    |
| ------------------------------------ | ------------------------------------------- |
| `/tarot/cartas/as-de-copas`          | confirmar descubrimiento/indexación progresiva |
| `/tarot/cartas/dos-de-espadas`       | confirmar descubrimiento/indexación progresiva |

---

## 10. Sitemap coverage

Monitorear:

- Estado de fetch/lectura del sitemap (`/sitemap.xml`).
- Errores de sitemap reportados por Search Console.
- Cobertura de URLs de tarot (78 cartas publicadas desde `tarot_cards`).
- Ausencia de demos de compatibilidad en el sitemap (comportamiento correcto).

Registro:

| Elemento | Estado Día 0 | Observación |
| -------- | ------------ | ----------- |
| `/sitemap.xml` | INSUFFICIENT_DATA | verificar fetch en Search Console |
| Tarot 78 coverage | INSUFFICIENT_DATA | verificar inclusión progresiva |
| Compatibilidad demos excluidas | SIN_CAMBIO_ESPERADO | correcto si no aparecen |
| Errores de sitemap | SIN_INCIDENTE_REGISTRADO |  |

---

## 11. Tarot 78

Monitoreo de descubrimiento/indexación progresiva de las 78 cartas:

- Fuente de verdad de cartas: `tarot_cards` (catálogo publicado).
- Prioridad inicial de observación: `/tarot/cartas/as-de-copas`, `/tarot/cartas/dos-de-espadas`, `/tarot/cartas/el-loco`.
- Cartas inválidas → `notFound` (no deben aparecer indexadas como 200). Correcto si no aparecen.

Registro:

| URL de carta | Indexada | Impressions | Position | Observación |
| ------------ | -------- | ----------: | -------: | ----------- |
| `/tarot/cartas/el-loco` | INSUFFICIENT_DATA | INSUFFICIENT_DATA | INSUFFICIENT_DATA |  |
| `/tarot/cartas/as-de-copas` | INSUFFICIENT_DATA | INSUFFICIENT_DATA | INSUFFICIENT_DATA |  |
| `/tarot/cartas/dos-de-espadas` | INSUFFICIENT_DATA | INSUFFICIENT_DATA | INSUFFICIENT_DATA |  |

---

## 12. Luna

Páginas a observar:

- `/luna` (SEO-04, optimizada).
- `/luna/fases/luna-creciente` (Tier B).
- `/luna/fases/*` (familia dinámica; metadata desde `moon_phase_content`).
- `/luna/hoy`, `/luna/calendario`.

Registro:

| URL | Impressions | Position | Observación |
| --- | ----------: | -------: | ----------- |
| `/luna` | INSUFFICIENT_DATA | INSUFFICIENT_DATA |  |
| `/luna/fases/luna-creciente` | INSUFFICIENT_DATA | INSUFFICIENT_DATA |  |

---

## 13. Compatibilidad

Pares indexables (allowlist):

| Par                       | Ruta                                       |
| ------------------------- | ------------------------------------------ |
| `geminis__sagitario`      | `/compatibilidad/geminis/sagitario`        |
| `cancer__capricornio`     | `/compatibilidad/cancer/capricornio`       |
| `aries__libra`            | `/compatibilidad/aries/libra`              |

Regla de fallbacks demo: los pares fuera de la allowlist son `noindex,follow` y NO aparecen en sitemap. No esperar tráfico orgánico de fallbacks noindex. Que no aparezcan en Search Console como páginas indexadas es correcto.

Registro:

| Par                       | Impressions | Position | Observación |
| ------------------------- | ----------: | -------: | ----------- |
| `geminis__sagitario`      | INSUFFICIENT_DATA | INSUFFICIENT_DATA |  |
| `cancer__capricornio`     | INSUFFICIENT_DATA | INSUFFICIENT_DATA |  |
| `aries__libra`            | INSUFFICIENT_DATA | INSUFFICIENT_DATA |  |

---

## 14. Structured data

Regla: no esperar necesariamente rich results por `WebPage`/`CollectionPage`. Monitorear solo:

- Errores de structured data si Search Console los reporta.
- No interpretar ausencia de enhancement como fallo.

Registro:

| Elemento | Estado | Observación |
| -------- | ------ | ----------- |
| Errores de structured data reportados | SIN_INCIDENTE_REGISTRADO |  |
| Rich results esperados | NO_APLICA | WebPage/CollectionPage no garantizan rich result |

---

## 15. Device split

Monitorear split desktop/mobile para páginas prioritarias.

Registro (Día 0 objetivo, a capturar):

| Dispositivo | Impressions | Clicks | CTR | Position |
| ----------- | ----------: | -----: | --- | -------: |
| Desktop     | INSUFFICIENT_DATA | INSUFFICIENT_DATA | INSUFFICIENT_DATA | INSUFFICIENT_DATA |
| Mobile      | INSUFFICIENT_DATA | INSUFFICIENT_DATA | INSUFFICIENT_DATA | INSUFFICIENT_DATA |

Nota: opcional para la comparación principal; útil para diagnosticar caídas de ranking.

---

## 16. Día 7

Fecha objetivo: 2026-08-26.

Regla de interpretación (Día 7): observacional, NO sacar conclusiones fuertes. Buscar únicamente:

- indexación,
- nuevas impresiones,
- aparición de queries,
- errores técnicos.

Estado: PENDIENTE (no evaluado aún).

---

## 17. Día 14

Fecha objetivo: 2026-09-02.

Regla de interpretación (Día 14): empezar a observar tendencias, sin asumir causalidad. Fin del congelamiento de cambios (change_freeze Día 0 → Día 14).

Estado: PENDIENTE (no evaluado aún).

---

## 18. Día 28

Fecha objetivo: 2026-09-16.

Regla de interpretación (Día 28): primera ventana donde puede evaluarse si existen movimientos suficientemente persistentes como para decidir una segunda iteración.

Estado: PENDIENTE (no evaluado aún).

### Plantilla de comparación

| Métrica | Día 0 | Día 7 | Día 14 | Día 28 | Tendencia |
| ------- | ----- | ----- | ------ | ------ | --------- |
| Clicks totales | INSUFFICIENT_DATA |  |  |  |  |
| Impressions totales | INSUFFICIENT_DATA |  |  |  |  |
| CTR medio | INSUFFICIENT_DATA |  |  |  |  |
| Posición media | INSUFFICIENT_DATA |  |  |  |  |

---

## 19. Señales positivas

### Señales fuertes

- Más impresiones con posición estable o mejor.
- Queries nuevas relevantes.
- Movimiento persistente hacia Top 20/10.
- CTR aparece al ganar posiciones.
- Más páginas dinámicas descubiertas.

### Señales medias

- Impresiones crecen antes de mejorar posición.
- Posición mejora con volumen aún pequeño.

### Señales débiles o ruido

- 1 impresión.
- 1 día aislado.
- Una query extremadamente rara.
- Cambio de posición con muy bajo volumen.

---

## 20. Señales negativas

### Técnicas (warning signals)

- Página desaparece de Search Console.
- Canonical diferente.
- Excluded by noindex inesperado.
- Server error (500).
- Sitemap fetch error.

### De performance

- Caída generalizada persistente también en páginas control.

Regla: separar siempre problema técnico de variación de ranking. Un ranking que baja unos puestos NO es por sí mismo una excepción al congelamiento.

---

## 21. Incidentes técnicos

Registro de incidentes P0 / regresiones de producción que justifiquen romper el congelamiento:

| Fecha | Incidente | Severidad | Acción | Autorizado |
| ----- | --------- | --------- | ------ | ---------- |
| —     | —         | —         | —      | —          |

Estado actual: SIN_INCIDENTES.

---

## 22. Decisiones

### Marco de decisión (aplicable en Día 28)

| Decisión   | Significado |
| ---------- | ----------- |
| KEEP       | La página muestra señal suficiente o todavía no hay razón clara para intervenir. |
| ITERATE    | Existe evidencia razonable de gap concreto que puede corregirse. |
| INVESTIGATE| Comportamiento anómalo o técnico. |
| PROTECT    | Página con mejoría/señales fuertes. No tocar. |

Regla: no recomendar cambios generales usando promedios del dominio solamente.

### Decisiones en Día 0

- Ningún cambio de código. `code_policy.modifications = NONE`.
- Baseline Día 0 queda `PENDIENTE_DE_CAPTURA_MANUAL` hasta que se completen las lecturas reales de Search Console.

---

## 23. Próxima iteración

- Próximo hito: **Día 7 (2026-08-26)** — observación temprana.
- Requiere: captura de Search Console (ventana últimos 28 días) para sitio, page, query, device y country.
- No se planifica ninguna segunda iteración de cambios SEO antes de Día 14, y la evaluación seria ocurre recién en Día 28.

---

## 24. Estado

**EN_CURSO**.

Completar esta fase solo después de evaluar el Día 28. Estados finales permitidos tras Día 28:

- COMPLETADO
- COMPLETADO_CON_NUEVA_ITERACION_RECOMENDADA
- BLOQUEADO_POR_INCIDENTE

Resumen de la fase: crear documento SEO-11, registrar Día 0 (2026-08-19), registrar baseline histórico, definir framework de medición, actualizar README y detener. No se modifica código.

---

## Anexo A — Congelamiento de cambios (change_freeze)

Periodo: Día 0 → Día 14 (2026-08-19 → 2026-09-02).

Default: NO SEO CHANGES (no cambiar titles, descriptions, canonical, internal links, content, structured data).

Excepciones permitidas:

- indexing bug
- 500
- broken canonical
- accidental noindex
- sitemap failure
- serious production regression

Regla: un ranking que baja unos puestos NO es por sí mismo excepción.

## Anexo B — Política de código

Modificaciones de código: NONE.

No ejecutar build/tests en cada medición salvo que exista incidente técnico o se sospeche regresión.

Solo documentar una urgencia si aparece error técnico P0. No corregir directamente dentro de esta fase sin nueva autorización.

## Anexo C — Reglas de interpretación (síntesis)

- Día 7: observacional. Sin conclusiones fuertes.
- Día 14: observar tendencias sin asumir causalidad.
- Día 28: primera evaluación seria.
- No optimizar por ansiedad. No cambiar una página porque en 3 días bajó posiciones.
- Usar ventanas consistentes. Proteger páginas con señales.
- Si no existen datos suficientes: documentar `INSUFFICIENT_DATA`.
- No inventar conclusiones. No atribuir causalidad sin evidencia.