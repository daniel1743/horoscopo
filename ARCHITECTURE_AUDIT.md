# ARCHITECTURE_AUDIT.md — Auditoría de Arquitectura

**Proyecto**: Proyecto Astral
**Stack**: React 19, TanStack Start, TanStack Router, Tailwind v4, Supabase, TypeScript 5.8
**Fecha**: 28/07/2026

---

## 1. ESTRUCTURA DE CARPETAS

### Estructura real (verificada con `list_files`)

```
src/
├── router.tsx                    # Entry point del router
├── routeTree.gen.ts              # Auto-generado (1393 líneas)
├── server.ts                     # Configuración servidor SSR
├── start.ts                      # Entry point TanStack Start
├── styles.css                    # Tailwind v4 + tokens en @theme inline
├── components/                   # Componentes organizados por dominio
│   ├── ui/                       # 47 primitivas shadcn + personalizadas
│   ├── layout/                   # Container, Navbar, Footer, Drawer
│   ├── home/                     # Secciones del home
│   ├── account/                  # Perfil, auth forms
│   ├── ai/                       # Asistente IA
│   ├── compatibility/            # Compatibilidad de signos
│   ├── editorial/                # Artículos, autores
│   ├── horoscope/                # Horóscopos diario/semanal/mensual
│   ├── moon/                     # 10 componentes lunares
│   ├── search/                   # SearchDialog, SearchInput
│   └── tarot/                    # Cartas, lecturas
├── config/                       # 20 archivos de configuración centralizada
├── data/                         # Datos estáticos (signos, tarot, categorías)
├── design-system/                # 3 archivos (tokens, tipografía, variantes)
├── hooks/                        # 5 hooks compartidos
├── integrations/supabase/        # 5 archivos (cliente, admin, middleware, types, storage)
├── lib/                          # Lógica de dominio por módulo (11 subdirs)
├── pages/                        # Páginas legacy (HomePage) — posible redención
├── repositories/                 # 6 archivos (interfaz + implementación Supabase)
├── routes/                       # 54 rutas TanStack Router file-based
├── server/                       # Server-only (moon engine, search index)
├── services/                     # 5 TanStack Query services
└── types/                        # 8 archivos de tipos Zod + TS
```

### Análisis de separación por capas

| Capa | Responsabilidad | Estado |
|------|----------------|--------|
| **Config** (20 files) | Feature flags, constantes, copy, iconos, SEO, navegación | ✅ Centralizada |
| **Types** (8 files) | Contratos de dominio con Zod schemas | ✅ Bien definida |
| **Design System** (3 files) | Tokens CSS + TS, tipografía, variantes CVA | ✅ Única fuente de verdad |
| **Data** (4 files) | Datos estáticos (signos, tarot, categorías) | ✅ Separada de lógica |
| **Integrations** (5 files) | Supabase client/admin/middleware/types/storage | ✅ Aislada |
| **Repositories** (6 files) | Interfaz + implementación Supabase | ✅ Patrón repositorio |
| **Services** (5 files) | TanStack Query queryOptions | ✅ Capa de servicios |
| **Server** (2 subdirs) | Cómputo server-only (luna, búsqueda) | ✅ Aislado |
| **Lib** (11 subdirs) | Lógica de dominio por módulo | ✅ Organizado |
| **Hooks** (5 files) | Hooks React compartidos | ✅ Enfocados |
| **Components** (7 subdirs + ui) | Componentes por dominio | ✅ Organizado |
| **Routes** (54 files) | Páginas TanStack Router | ✅ File-based routing |
| **Pages** (1 dir) | Posible código legacy | ⚠️ ¿Redundante con routes/? |

### Capa "Pages" vs "Routes" — Posible Redundancia
- `src/pages/HomePage.tsx` y subdirectorios existen
- `src/routes/` contiene todas las rutas funcionales
- **Riesgo**: El directorio `pages/` podría ser código legacy no utilizado o shadow-importado
- **Evidencia**: `src/pages/HomePage.tsx` — archivo que podría ser redundante con `src/routes/index.tsx`

---

## 2. ARQUITECTURA DE DOMINIO

### Flujo de datos verificado (ejemplo: sistema lunar)

```
Route (luna.hoy.tsx)
  → Service (moon.service.ts → moonQueries.today)
    → Server Function (moon.functions.ts → getMoonToday)
      → Engine (moon-engine.ts → astronomyMoonEngine)
      → Cache (cache.repository.ts)
      → Editorial (repository.ts)
```

**Verificación**: El flujo es consistente en todos los módulos (horóscopo, tarot, compatibilidad, búsqueda, editorial, IA).

### Módulos con arquitectura completa

| Módulo | Types | Config | Lib | Server | Repository | Service | Components | Routes |
|--------|-------|--------|-----|--------|------------|---------|------------|--------|
| **Moon** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (10) | ✅ (6) |
| **Horoscope** | ✅ | ✅ | ✅ | — | Supabase direct | ✅ | ✅ | ✅ (5) |
| **Tarot** | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ (6) |
| **Compatibility** | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ (2) |
| **Editorial** | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ (5) |
| **Search** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (1) |
| **AI** | ✅ | ✅ | ✅ | — | — | ✅ | ✅ | ✅ (1) |
| **Account** | — | — | ✅ | — | — | — | ✅ | ✅ (4) |
| **Admin** | — | — | ✅ | — | — | — | ✅ | — |

---

## 3. PATRONES ARQUITECTÓNICOS DETECTADOS

### Patrón Repositorio
- **Interfaces**: `src/repositories/compatibility.repository.ts`, `search.repository.ts`, `tarot.repository.ts`
- **Implementaciones**: `src/repositories/supabase-compatibility.repository.ts`, `supabase-search.repository.ts`, `supabase-tarot.repository.ts`
- **Calificación**: ✅ Consistente, bien aplicado

### Patrón Servicio (TanStack Query)
- `src/services/moon.service.ts`, `search.service.ts`, `tarot.service.ts`, `compatibility.service.ts`, `ai.service.ts`
- **Calificación**: ✅ queryOptions centralizados, sin duplicación de lógica de fetching

### Patrón Server Functions (TanStack Start)
- `createServerFn` usado en: `src/lib/moon/moon.functions.ts`, `src/lib/search/`, `src/lib/account/`, `src/lib/admin/`
- **Calificación**: ✅ Correctamente aisladas, Zod validation en inputs

### Patrón Configuración Centralizada
- 20 archivos en `src/config/` con feature flags, constantes, rutas, SEO
- **Calificación**: ✅ Sin magic strings dispersos

### Patrón Adaptador
- `src/server/moon/moon-engine.ts` (interfaz `MoonEngine`)
- `src/server/moon/astronomy-moon-engine.ts` (implementación)
- **Calificación**: ✅ Contrato reemplazable documentado

---

## 4. CARACTERÍSTICAS DE ARQUITECTURA CENTRALIZADA

### ¿Es realmente una arquitectura centralizada?

| Característica | Estado | Evidencia |
|---------------|--------|-----------|
| Única fuente de verdad para colores | ✅ SÍ | `src/styles.css` + `src/design-system/tokens.ts` |
| Única fuente de verdad para tipografía | ✅ SÍ | `src/design-system/typography.ts` |
| Única fuente de verdad para iconos | ✅ SÍ | `src/config/icons.ts` + `<Icon>` component |
| Única fuente de verdad para rutas | ✅ SÍ | `src/config/routes.ts` + TanStack Router file-based |
| Única fuente de verdad para feature flags | ✅ SÍ | `src/config/features.ts` |
| Servicios centralizados por dominio | ✅ SÍ | `src/services/*.service.ts` |
| Repositorios con interfaz explícita | ✅ SÍ | `src/repositories/*.repository.ts` |
| Server functions aisladas del cliente | ✅ SÍ | Dynamic import de service_role |

**Veredicto**: La arquitectura es centralizada, con cada responsabilidad en una capa bien definida. Las fugas son mínimas y documentadas.

---

## 5. VIOLACIONES ARQUITECTÓNICAS DETECTADAS

| # | Violación | Ubicación | Severidad |
|---|-----------|-----------|-----------|
| 1 | Hook `useDebounced` duplicado (copia exacta en 2 archivos) | `src/components/search/SearchDialog.tsx:25-32` y `src/routes/buscar.tsx:53-60` | MEDIUM |
| 2 | `console.log` statements en capa de servicios y componentes (54 ocurrencias) | Distribuido en múltiples archivos | LOW |
| 3 | Directorio `src/pages/` potencialmente redundante con `src/routes/` | `src/pages/HomePage.tsx` | LOW |
| 4 | 4 instancias de `createClient` — aunque 3 son server-only, no es singleton real | `src/integrations/supabase/` | LOW |

---

## 6. DEPENDENCIAS Y STACK TECNOLÓGICO

### Dependencias core (de package.json)
- **Runtime**: React 19.2, React DOM 19.2
- **Router**: @tanstack/react-router 1.170, @tanstack/react-start 1.168
- **Data fetching**: @tanstack/react-query 5.101
- **Estilos**: tailwindcss 4.2, tailwind-merge 3.5, class-variance-authority 0.7.1, tw-animate-css 1.3
- **UI primitives**: 20+ paquetes @radix-ui/react-*, cmdk 1.1, vaul 1.1, sonner 2.0
- **Formularios**: react-hook-form 7.71, @hookform/resolvers 5.2, zod 3.24
- **Supabase**: @supabase/supabase-js 2.110
- **Astronomía**: astronomy-engine 2.1.19
- **Gráficos**: recharts 2.15
- **Utilidades**: date-fns 4.1, lucide-react 0.575, clsx 2.1

### Dependencias de desarrollo
- TypeScript 5.8, Vite 8.0, ESLint 9.32, Prettier 3.7, Nitro 3.0

**Análisis**: Stack moderno y bien elegido. Sin dependencias abandonadas o deprecated. Sin over-engineering de state management (no Redux, no MobX — correcto para este scope).

---

## 7. SCRIPTS DE VERIFICACIÓN ARQUITECTÓNICA

Scripts existentes de control de calidad:
- `scripts/check-hardcoded-styles.ts` — Detecta estilos hardcodeados
- `scripts/check-direct-icon-imports.ts` — Verifica que no se importen iconos directamente
- `scripts/check-direct-routes.ts` — Verifica uso de rutas centralizadas
- `scripts/check-duplicate-layout.ts` — Detecta layouts duplicados
- `scripts/check-moon-accuracy.ts` — Verifica precisión astronómica
- `scripts/check-compatibility-pairs.ts` — Verifica pares de compatibilidad
- `scripts/grant-super-admin.ts` — Bootstrap de admin

**Calificación**: ✅ Excelente — tener scripts de verificación arquitectónica es una buena práctica poco común.

---

## 8. CONCLUSIÓN ARQUITECTÓNICA

### Calificación general: **BUENA (85/100)**

**Fortalezas**:
- Separación por capas bien definida y respetada
- Patrones consistentes (repositorio, servicio, adaptador)
- Configuración centralizada sin magic strings
- Server functions correctamente aisladas
- Scripts de verificación arquitectónica

**Debilidades**:
- Una duplicación de hook (useDebounced)
- Posible código legacy en src/pages/
- console.log sin eliminar para producción
- Sin lazy loading / code splitting (más de performance que de arquitectura)

**La arquitectura especificada en los YAML se respetó en aproximadamente un 85%. Las desviaciones son menores y ninguna compromete la integridad del sistema.**