# 04_CONTRATOS_EXISTENTES.md — CONTRATOS TÉCNICOS EXISTENTES EN EL SISTEMA

Este documento cataloga las interfaces, tipos, Server Functions y contratos de base de datos actualmente operativos en Proyecto Astral.

---

## 1. Contratos Astronómicos y Lunares

### A. Interfaz `MoonEngine` (`src/server/moon/moon-engine.ts`)
```typescript
export interface MoonEngine {
  readonly version: string;
  getSnapshot(instantUtc: Date, timezone: string): MoonSnapshot;
  getCalendarMonth(year: number, month: number, timezone: string): MoonCalendarDay[];
  getPhaseEvents(startUtc: Date, endUtc: Date, timezone: string): MoonPhaseEvent[];
  getNextMajorPhase(instantUtc: Date, timezone: string): MoonPhaseEvent;
}
```

### B. Tipos Lunares (`src/types/moon.ts`)
```typescript
export type MajorMoonPhaseKey = "new_moon" | "first_quarter" | "full_moon" | "last_quarter";
export type MoonPhaseKey = MajorMoonPhaseKey | "waxing_crescent" | "waxing_gibbous" | "waning_gibbous" | "waning_crescent";

export interface MoonSnapshot {
  timestamp: string;
  phase_key: MoonPhaseKey;
  phase_angle_degrees: number;
  illumination_fraction: number;
  illumination_percentage: number;
  lunar_age_days: number;
  waxing: boolean;
  next_major_phase: MoonPhaseEvent;
}
```

---

## 2. Contratos Zodiacales y de Compatibilidad

### A. Tipos Zodiacales (`src/types/compatibility.ts`)
```typescript
export type ZodiacSignKey =
  | "aries" | "tauro" | "geminis" | "cancer"
  | "leo" | "virgo" | "libra" | "escorpio"
  | "sagitario" | "capricornio" | "acuario" | "piscis";

export type CompatibilityPairKey = `${ZodiacSignKey}__${ZodiacSignKey}`;

export interface NormalizedSignPair {
  sign_a: ZodiacSignKey;
  sign_b: ZodiacSignKey;
  pair_key: CompatibilityPairKey;
  canonical_path: string;
}
```

---

## 3. Contratos Administrativos y Autorización

### A. Roles y Permisos (`src/lib/admin/roles.ts`)
```typescript
export const ADMIN_ROLES = ["super_admin", "admin", "editor", "reviewer", "media_manager"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];
```

### B. Server Function de Identidad (`src/lib/admin/admin.functions.ts`)
```typescript
export interface AdminIdentity {
  userId: string;
  roles: AdminRole[];
}

export const getMyAdminRoles: ServerFn<void, AdminIdentity>;
```

### C. Helper Server-Side de Roles (`src/lib/admin/admin.functions.ts`)
```typescript
export async function assertRole(
  context: { supabase: any; userId: string },
  allowed: readonly AdminRole[],
): Promise<AdminRole[]>;
```

### D. Workflow Editorial (`src/lib/admin/workflow.ts`)
```typescript
export type WorkflowState = "draft" | "in_review" | "changes_requested" | "approved" | "published" | "archived";

export function canTransition(from: WorkflowState, to: WorkflowState): boolean;
```

---

## 4. Contratos del Buscador

### A. Repositorio de Búsqueda (`src/repositories/search.repository.ts`)
```typescript
export interface SearchRepository {
  search(params: {
    query: string;
    filters?: SearchFilters;
    limit?: number;
    offset?: number;
    signal?: AbortSignal;
  }): Promise<SearchResult[]>;

  suggest(params: {
    query: string;
    limit?: number;
    signal?: AbortSignal;
  }): Promise<SearchSuggestion[]>;
}
```

---

## 5. Contratos de Base de Datos SQL (Postgres RPC & Functions)

### A. Función de Verificación de Rol (`supabase/migrations/`)
```sql
public.has_admin_role(_user_id uuid, _roles text[]) RETURNS boolean
```
* *Firma*: `SECURITY DEFINER`, `SET search_path = public`.
* *Privilegios*: `EXECUTE` concedido solo a `authenticated` y `service_role`.

### B. Función de Búsqueda RPC (`supabase/migrations/`)
```sql
public.search_site(p_query text, p_source_types text[], p_limit integer, p_offset integer)
RETURNS TABLE(...)
```
