# 03_MAPA_DEPENDENCIAS.md — MAPA DE DEPENDENCIAS Y ORDEN DE CONSTRUCCIÓN

Este documento establece las dependencias técnicas, funcionales y de seguridad del sistema de automatización, fijando el orden obligatorio de implementación.

---

## 1. Diagrama de Flujo Arquitectónico Objetivo

```mermaid
flowchart TD
  subgraph Capa 1: Efemérides & Astrología Pura [Server-Only]
    A1[astronomy-engine] --> A2[Planetary Engine: Posiciones 10 cuerpos]
    A2 --> A3[Aspect Engine: Ángulos & Orbes]
    A3 --> A4[Transit Engine: Retrogradaciones e Ingresos]
  end

  subgraph Capa 2: Contexto Estructurado
    A4 --> B1[SignContextBuilder: Combinación Luna + Transitos + Signo]
  end

  subgraph Capa 3: Generación por IA & Validación
    B1 --> C1[AI Editorial Generator: Structured Outputs Zod]
    C1 --> C2[Content Validator: Longitud, Formato & Tono]
    C2 --> C3[Similarity Checker: Detección Plagios]
  end

  subgraph Capa 4: Persistencia & Workflow
    C3 --> D1[Supabase: Tabla horoscopes]
    D1 --> D2[Content Workflow: Estado draft / approved]
    D2 --> D3[Content Revisions: Snapshot v1]
  end

  subgraph Capa 5: Orquestación & Publicación
    E1[pg_cron / Supabase Cron] --> E2[Cron Endpoint: /api/cron/publish]
    E2 --> D2
    D2 -->|Aprobado & Hora alcanzada| F1[Publicación Automática]
    F1 --> F2[Search Indexer: syncSearchDocument]
    F1 --> F3[Audit Logger: logAdminAction]
  end

  subgraph Capa 6: Resiliencia & Fallback
    C1 -.->|Fallo IA / Timeout| G1[Fallback Engine: Horóscopo Determinista]
    G1 --> D1
  end
```

---

## 2. Clasificación de Dependencias

### A. Dependencias Técnicas
1. **`Planetary Engine` depende de `astronomy-engine`** (Librería instalada v2.1.19).
2. **`Aspect Engine` depende de `Planetary Engine`** (Necesita las longitudes eclípticas exactas).
3. **`AI Editorial Generator` depende de `SignContextBuilder`** (No se puede invocar la IA sin un payload de contexto astronómico JSON estructurado previo).
4. **`Cron Endpoint` depende de `auth-middleware.ts` / firma secreta** (No se debe exponer ningún endpoint de ejecución desatendida sin validar token/shared secret).

### B. Dependencias de Datos
1. **`horoscopes` tabla depende de `zodiac-signs.ts`** (Foreign keys / validación de slugs de signos).
2. **`Search Indexer` depende de la tabla `search_documents` y la función RPC `search_site`**.

### C. Dependencias de Seguridad
1. **`Content Workflow` depende de `has_admin_role` / `user_roles`** (Ninguna Server Function o Cron debe saltarse los roles salvo cuando actúe con `service_role` tras validar la firma del Cron).

---

## 3. Orden Obligatorio de Construcción

```text
Paso 1: Motor de Efemérides Planetarias (Planetary Engine)
  ↓
Paso 2: Motor de Aspectos y Orbes (Aspect Engine)
  ↓
Paso 3: Constructor de Contexto por Signo (SignContextBuilder)
  ↓
Paso 4: Esquemas Zod y Generador IA con Structured Outputs
  ↓
Paso 5: Validadores de Calidad y Similitud
  ↓
Paso 6: Adaptador de Workflow para Horóscopos en Base de Datos
  ↓
Paso 7: Endpoint Cron y Orquestación de Publicación Programada
  ↓
Paso 8: Sincronizador Automático del Buscador y Registro de Auditoría
```

---

## 4. Matriz de Paralelización

### Elementos que PUEDEN desarrollarse en paralelo:
* **UI del Panel Administrativo de Horóscopos** (`src/routes/_authenticated/admin/horoscopos.tsx`) se puede maquetar en paralelo mientras se construye el `Planetary Engine`, consumiendo tipos mock.
* **Módulos de Alertas y Logs de Tokens** se pueden construir de forma independiente.

### Elementos que NO DEBEN desarrollarse en paralelo:
* **NO construir los Prompts de la IA** antes de congelar el JSON de salida del `SignContextBuilder`. Si cambia la estructura del contexto astronómico, los prompts quedarán obsoletos.
* **NO implementar el Endpoint Cron** antes de tener completamente funcional y probado el flujo de publicación manual con validación.
