# 09_PROJECT_EXECUTION_CHART.md — Mapa Visual de Ejecución

**Versión**: 2.0
**Fecha**: 28/07/2026
**Propósito**: Representación gráfica integral del ciclo de vida del proyecto.

---

## DIAGRAMA DE EJECUCIÓN

```mermaid
flowchart TD
    subgraph FASE1["FASE 1 + 1.5: Inventario y Gobierno ✅"]
        A1[Auditoría Maestra] --> A2[7 Informes de Auditoría]
        A2 --> A3[14 Documentos FASE 1]
        A3 --> B1[Constitución Inmutable]
        B1 --> B2[13 Documentos de Gobierno]
    end

    B2 --> FASE2

    subgraph FASE2["FASE 2: Estabilización P0 (25-35h)"]
        C1[2.1 Code-Splitting] --> C2[2.9 Bundle Analysis]
        C2 --> C3[2.8 Lazy-Load Libs]
        C2 --> C4[2.2 Structured Data]
        C2 --> C5[2.3 Sitemap]
        C2 --> C6[2.4 Cleanup]
        C2 --> C7[2.5 useDebounced]
        C2 --> C8[2.7 Breadcrumbs]
        C3 --> C9[2.6 Migrar Hardcodeos]
        C4 & C5 & C6 & C7 & C8 & C9 --> C10[2.10 Auditoría F2]
    end

    C10 -->|Anti-Gravity aprueba| FASE3

    subgraph FASE3["FASE 3: UX y SEO (20-30h)"]
        D1[3.4 Fuentes] --> D2[3.1 Modo Oscuro] --> D3[3.5 Accesibilidad]
        D4[3.2 Favoritos Sync] --> D5[Auditoría F3]
        D6[3.3 Iconos Zodiaco] --> D5
        D3 --> D5
    end

    D5 -->|Aprueba| FASE4

    subgraph FASE4["FASE 4: Testing (30-50h)"]
        E1[4.1 Tests Int.] --> E3[4.2 E2E]
        E2[4.3 Tests a11y] --> E4[4.4 Visual]
        E1 --> E5[4.5 CI/CD]
        E3 & E4 & E5 --> E6[Auditoría F4]
    end

    E6 -->|Aprueba| FASE5

    subgraph FASE5["FASE 5: Premium (25-40h)"]
        F1[5.2 Admin Roles] --> F5[5.5 Cierre]
        F2[5.1 Analytics] --> F5
        F3[5.3 Advanced AI] --> F5
        F4[5.4 Monitoreo] --> F5
        F5 --> PROD[🚀 PRODUCCIÓN ~98%]
    end
```

---

## PUNTOS DE CONTROL

| CP | Fase | Auditor | Criterio |
|----|------|---------|----------|
| CP-1 | 1.5 | Anti-Gravity | 13 docs completos |
| CP-2 | 2 | Anti-Gravity | Bundle reducido, rich snippets, 0 hardcodeos |
| CP-3 | 3 | Anti-Gravity | Dark mode, favoritos sync, WCAG AA |
| CP-4 | 4 | Anti-Gravity | Coverage >=70%, CI/CD, E2E pasan |
| CP-5 | 5 | Anti-Gravity | Features completas, sin deuda, docs |

---

## AGENTES POR FASE

| Fase | Principal | Soporte | Auditor |
|------|-----------|---------|---------|
| FASE 2 | Cline | Claude, Codex | Anti-Gravity |
| FASE 3 | Claude | Cline, Codex | Anti-Gravity |
| FASE 4 | Cline + Claude | Codex | Anti-Gravity |
| FASE 5 | Claude + Codex | Cline | Anti-Gravity |

---

*Derivado de: 00_MASTER_EXECUTION_ROADMAP.md, 02_MASTER_BUILD_ORDER.md.*
