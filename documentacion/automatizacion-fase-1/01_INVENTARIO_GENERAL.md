# 01_INVENTARIO_GENERAL.md — INVENTARIO DEL SISTEMA Y BASE DE CÓDIGO

Este documento cataloga y clasifica cada componente técnico del repositorio Proyecto Astral, especificando su ubicación, propósito, dependencias y consumidores.

---

## 1. Arquitectura y Ruteo (TanStack Start)

* **`src/routes/__root.tsx`**:
  * *Propósito*: Shell raíz del ruteador. Carga fuentes (Fraunces + Manrope), metadatos SEO base, QueryClientProvider y envuelve con `<AppShell>`.
  * *Estado*: `REUTILIZAR SIN CAMBIOS`
* **`src/routes/_authenticated/route.tsx`**:
  * *Propósito*: Guard de autenticación para páginas privadas. `ssr: false` por uso de localStorage de Supabase.
  * *Estado*: `REUTILIZAR SIN CAMBIOS`
* **`src/routes/_authenticated/admin/route.tsx`**:
  * *Propósito*: Guard del panel administrativo. Llama a `getMyAdminRoles` en `beforeLoad` y redirige a `/mi-espacio` si carece de rol.
  * *Estado*: `REUTILIZAR Y AMPLIAR`
* **`src/config/routes.ts`**:
  * *Propósito*: Registro centralizado de URLs y helpers dinámicos (`zodiacRoute`, `articleRoute`, `tarotCardRoute`, `compatibilityRoute`).
  * *Estado*: `REUTILIZAR Y AMPLIAR`

---

## 2. Frontend y Layouts

* **`src/components/layout/AppShell.tsx`**:
  * *Propósito*: Layout global con SkipLink, SiteHeader, SiteFooter y MobileBottomNavigation.
  * *Estado*: `REUTILIZAR SIN CAMBIOS`
* **`src/components/layout/SiteHeader.tsx` & `DesktopNavigation.tsx`**:
  * *Propósito*: Header sticky con navegación superior por categorías y dropdowns accesibles por teclado.
  * *Estado*: `REUTILIZAR SIN CAMBIOS`
* **`src/components/layout/MobileNavigationDrawer.tsx`**:
  * *Propósito*: Drawer móvil secundario con bloqueo de scroll nativo y grupos de enlaces.
  * *Estado*: `REUTILIZAR SIN CAMBIOS`
* **`src/pages/HomePage.tsx`**:
  * *Propósito*: Composición reactiva basada en `homeConfig.sectionOrder`.
  * *Estado*: `REUTILIZAR SIN CAMBIOS`

---

## 3. Backend, Servicios y Server Functions

* **`src/integrations/supabase/auth-middleware.ts`**:
  * *Propósito*: Middleware de servidor (`requireSupabaseAuth`) para validar tokens JWT en cabeceras `Authorization: Bearer <token>`.
  * *Estado*: `REUTILIZAR SIN CAMBIOS`
* **`src/integrations/supabase/client.server.ts`**:
  * *Propósito*: Cliente Supabase privilegiado `service_role` envuelto en un `Proxy` lazy.
  * *Estado*: `REUTILIZAR SIN CAMBIOS`
* **`src/lib/admin/admin.functions.ts`**:
  * *Propósito*: Server functions `getMyAdminRoles` y `logAdminAction` con sanitización de metadatos.
  * *Estado*: `REUTILIZAR Y AMPLIAR`
* **`src/lib/admin/articles.functions.ts`**:
  * *Propósito*: Server functions para CRUD de artículos, control de versiones `expectedVersion` y snapshot en `content_revisions`.
  * *Estado*: `REUTILIZAR Y AMPLIAR`

---

## 4. Base de Datos (Supabase Migrations)

* **`20260727225111_4cc4d9e8-78ab-43b9-b0b5-8fde95dab88f.sql`**:
  * *Propósito*: Tablas iniciales (`profiles`, `editorial_articles`, `editorial_authors`, `editorial_categories`, `horoscopes`, `tarot_cards`, `moon_phase_content`, `compatibility_profiles`, `search_documents`).
  * *Estado*: `REUTILIZAR SIN CAMBIOS`
* **`20260728003613_e7391bad-a9ca-4b95-92e5-fffafe68131e.sql`**:
  * *Propósito*: Tablas `content_workflow`, `content_revisions` y columna `version` en `editorial_articles`.
  * *Estado*: `REUTILIZAR Y AMPLIAR`
* **`20260728004243_31991e38-38b2-4f9e-a899-bc063c8e57da.sql`**:
  * *Propósito*: Endurecimiento de funciones `SECURITY DEFINER` revocado a `PUBLIC` y `anon`.
  * *Estado*: `REUTILIZAR SIN CAMBIOS`

---

## 5. Astronomía y Motor Lunar

* **`src/server/moon/moon-engine.ts`**:
  * *Propósito*: Interfaz TypeScript pura `MoonEngine`.
  * *Estado*: `REUTILIZAR SIN CAMBIOS`
* **`src/server/moon/astronomy-moon-engine.ts`**:
  * *Propósito*: Implementación server-only basada en `astronomy-engine` v2.1.19.
  * *Estado*: `REUTILIZAR Y AMPLIAR`
* **`src/lib/moon/moon.functions.ts`**:
  * *Propósito*: Server Functions `getMoonToday`, `getMoonCalendar`, `getUpcomingMoonEvents` con importación dinámica del motor.
  * *Estado*: `REUTILIZAR SIN CAMBIOS`
* **`scripts/check-moon-accuracy.ts`**:
  * *Propósito*: Suite de validación de 11 comprobaciones contra efemérides USNO.
  * *Estado*: `REUTILIZAR SIN CAMBIOS`

---

## 6. Astrología y Zodíaco

* **`src/data/zodiac-signs.ts`**:
  * *Propósito*: Registro estático inmutable de los 12 signos zodiacales (nombres, fechas, elementos, modalidades, regentes, símbolos).
  * *Estado*: `REUTILIZAR SIN CAMBIOS`
* **`src/data/home-content.ts`**:
  * *Propósito*: Mocks de datos de demostración para horóscopos diarios.
  * *Estado*: `REEMPLAZAR` (se sustituirá por la base de datos y la IA automática).
* **`src/lib/horoscope/repository.ts`**:
  * *Propósito*: Consulta de horóscopos en Supabase (`getLatestHoroscope`).
  * *Estado*: `REUTILIZAR Y AMPLIAR`

---

## 7. Tarot y Cartomancia

* **`src/data/tarot-cards.ts`**:
  * *Propósito*: Registro estático de los 22 Arcanos Mayores.
  * *Estado*: `REUTILIZAR Y AMPLIAR` (Falta añadir Arcanos Menores para lecturas avanzadas).
* **`src/lib/tarot/card-selection.ts`**:
  * *Propósito*: Selección diaria determinista (hash FNV-1a) y sorteos interactivos sin repetición vía `crypto.getRandomValues`.
  * *Estado*: `REUTILIZAR SIN CAMBIOS`
* **`src/repositories/supabase-tarot.repository.ts`**:
  * *Propósito*: Consultas de cartas publicadas en Supabase.
  * *Estado*: `REUTILIZAR SIN CAMBIOS`

---

## 8. Sistema de IA Conversacional

* **`src/routes/api/ai/respond.ts`**:
  * *Propósito*: Endpoint HTTP de streaming con cabecera `X-AI-Meta` (metadatos codificados en Base64), límites de uso y soporte contextual.
  * *Estado*: `REUTILIZAR Y AMPLIAR`
* **`src/services/ai.service.ts`**:
  * *Propósito*: Cliente frontend `respondStreaming`.
  * *Estado*: `REUTILIZAR SIN CAMBIOS`
* **Motor de Generación Editorial Automática**:
  * *Propósito*: Generador masivo de artículos/horóscopos con Structured Outputs.
  * *Estado*: `INEXISTENTE`

---

## 9. Buscador General

* **`src/server/search/search-index.service.ts`**:
  * *Propósito*: Adaptadores de indexación `syncSearchDocument` y `removeSearchDocument`.
  * *Estado*: `REUTILIZAR Y AMPLIAR`
* **`src/services/search.service.ts`**:
  * *Propósito*: Fusión de búsquedas dinámicas RPC (`search_site`) y estáticas en `STATIC_SEARCH_DOCUMENTS`.
  * *Estado*: `REUTILIZAR SIN CAMBIOS`

---

## 10. Pruebas y Validación

* **`scripts/check-hardcoded-styles.ts`**: Validador de hexadecimales y sombras arbitrarias fuera de tokens. (`REUTILIZAR SIN CAMBIOS`)
* **`scripts/check-direct-icon-imports.ts`**: Validador de imports Lucide directos. (`REUTILIZAR SIN CAMBIOS`)
* **`scripts/check-direct-routes.ts`**: Validador de URLs internas. (`REUTILIZAR SIN CAMBIOS`)
* **`scripts/check-duplicate-layout.ts`**: Validador de Footers múltiples. (`REUTILIZAR SIN CAMBIOS`)
* **`scripts/check-compatibility-pairs.ts`**: Validador del algoritmo combinatorio de 78 parejas. (`REUTILIZAR SIN CAMBIOS`)
