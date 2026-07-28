# 11_MASTER_GLOSSARY.md — Glosario Maestro del Proyecto

**Versión**: 2.0
**Fecha**: 28/07/2026

---

## 1. TÉRMINOS ARQUITECTÓNICOS Y TECNOLÓGICOS

| Término | Definición |
|---------|------------|
| **TanStack Start** | Framework isomórfico React + Vite. SSR/CSR y Server Functions |
| **Server Function** | Función exclusiva servidor Node.js. Puente seguro cliente ↔ servidor |
| **RLS** | Row Level Security. Filtra filas PostgreSQL según token JWT |
| **SECURITY DEFINER** | Función SQL ejecutada con privilegios del creador |
| **service_role** | Clave Supabase que omite RLS. Solo server-only |
| **CVA** | Class Variance Authority. Variantes de componentes type-safe |
| **shadcn/ui** | 47 primitivas UI basadas en Radix |
| **Zod** | Validación de esquemas TypeScript-first |
| **FTS** | Full-Text Search PostgreSQL. Motor del buscador |
| **SSR** | Server-Side Rendering (rutas públicas) |
| **CSR** | Client-Side Rendering (rutas autenticadas) |
| **Code-Splitting** | División del bundle en chunks bajo demanda |
| **Lazy Loading** | Carga diferida vía `lazyRouteComponent` |
| **Bundle Analysis** | Análisis de tamaño del bundle (rollup-plugin-visualizer) |
| **JSON-LD** | Structured data para rich snippets |
| **Snapshot** | Copia JSONB del estado pre-modificación |
| **Control de Concurrencia Optimista** | `WHERE version = $expectedVersion` |
| **Idempotencia** | Misma acción repetida = mismo resultado sin duplicados |

---

## 2. TÉRMINOS ASTRONÓMICOS Y ASTROLÓGICOS

| Término | Definición |
|---------|------------|
| **Efemérides** | Tablas de posiciones celestes para momentos dados |
| **Longitud Eclíptica** | Ángulo 0°-360° desde el punto vernal |
| **Fase Lunar** | Porcentaje de iluminación visible (8 fases) |
| **Signo Zodiacal Lunar** | Signo donde está la Luna según longitud eclíptica |
| **Aspecto Angular** | Ángulo entre astros: Conjunción(0°), Sextil(60°), Cuadratura(90°), Trígono(120°), Oposición(180°) |
| **Orbe** | Tolerancia en grados para aspecto válido |
| **Retrogradación** | Movimiento aparente inverso planetario |
| **Punto Vernal** | 0° Aries en zodíaco Tropical |
| **Zodíaco Tropical** | 12 signos de 30° desde punto vernal |
| **Carta Natal** | Mapa planetario al nacer (no implementado) |

---

## 3. TÉRMINOS DE IA Y AUTOMATIZACIÓN

| Término | Definición |
|---------|------------|
| **Structured Outputs** | API LLM fuerza respuesta según esquema Zod |
| **Rate Limiting** | Control de frecuencia de requests OpenAI |
| **SignContextBuilder** | Servicio que empaqueta clima astronómico en JSON determinista |
| **MoonEngine** | Contrato del motor astronómico (astronomy-engine wrapper) |

---

## 4. TÉRMINOS EDITORIALES Y DE CONTENIDO

| Término | Definición |
|---------|------------|
| **Workflow Editorial** | Ciclo: draft → in_review → approved → published → archived |
| **Reading Time** | Tiempo estimado de lectura (palabras ÷ 200) |
| **CMS** | Content Management System en `/admin` |
| **FTS** | Full-Text Search indexando artículos en `search_documents` |

---

## 5. INFRAESTRUCTURA

| Término | Definición |
|---------|------------|
| **Supabase** | Backend: PostgreSQL, Auth, Storage, Edge Functions |
| **bun** | Runtime y package manager JS |
| **Vite** | Build tool base de TanStack Start |
| **Tailwind v4** | CSS utility-first con tokens `@theme inline` |
| **Nitro** | Servidor web en producción |

---

*Derivado de: Auditoría Maestra, DESIGN_SYSTEM_AUDIT.md, SECURITY_AUDIT.md, 04_CONTRATOS_EXISTENTES.md (FASE 1).*
