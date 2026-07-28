# 07_ARCHIVOS_NO_TOCAR.md — ARCHIVOS Sensibles Y CONGELADOS

Este documento cataloga los archivos esenciales de la base de código actual que **NO DEBEN SER MODIFICADOS** durante las futuras iteraciones de automatización, salvo una razón de fuerza mayor justificada y auditada.

---

## 1. Núcleo Astronómico y Matemático

* **`src/server/moon/astronomy-moon-engine.ts`**:
  * *Propósito*: Motor astronómico validado contra 11 efemérides USNO (< 2 min error).
  * *Riesgo de modificación*: Romper la precisión de las 8 fases lunares o provocar fuga de `astronomy-engine` al cliente.
  * *Agente autorizado*: **Codex** (Únicamente para extender métodos planetarios).
* **`src/lib/compatibility/normalize-sign-pair.ts`**:
  * *Propósito*: Normalizador determinista de parejas zodiacales y 78 pair keys únicas.
  * *Riesgo de modificación*: Provocar bucles de redirección infinita en `/compatibilidad/$signA/$signB` o romper SEO.
  * *Agente autorizado*: Ninguno (Congelado).
* **`src/lib/tarot/card-selection.ts`**:
  * *Propósito*: Generador determinista FNV-1a para carta del día y sorteos criptográficos `getRandomValues`.
  * *Riesgo de modificación*: Introducir sesgo modular en las tiradas o romper la estabilidad diaria de la carta.
  * *Agente autorizado*: Ninguno (Congelado).

---

## 2. Seguridad y Clientes Supabase

* **`src/integrations/supabase/client.ts`**:
  * *Propósito*: Singleton del cliente Supabase estándar para el navegador.
  * *Riesgo de modificación*: Romper el estado de autenticación en localStorage del usuario.
  * *Agente autorizado*: **Cline**.
* **`src/integrations/supabase/client.server.ts`**:
  * *Propósito*: Cliente Supabase administrativo con `service_role` mediante Proxy lazy.
  * *Riesgo de modificación*: Exponer la clave maestra de base de datos al cliente JS.
  * *Agente autorizado*: **Codex**.
* **`src/integrations/supabase/auth-middleware.ts`**:
  * *Propósito*: Middleware `requireSupabaseAuth` que valida JWT de cabeceras Bearer.
  * *Riesgo de modificación*: Dejar desprotegidas las Server Functions del panel y de la cuenta.
  * *Agente autorizado*: **Codex**.

---

## 3. Layout Global y Configuración de Rutas

* **`src/routes/__root.tsx`**:
  * *Propósito*: Shell raíz del ruteador TanStack Start, fuentes tipográficas y QueryClientProvider.
  * *Riesgo de modificación*: Romper la carga global CSS o las fuentes Google Fonts.
  * *Agente autorizado*: **Anti-Gravity**.
* **`src/components/layout/AppShell.tsx`**:
  * *Propósito*: Layout base con safe-area-inset para móviles y main container.
  * *Riesgo de modificación*: Causar overflow horizontal o superposición de la bottom nav móvil sobre el contenido.
  * *Agente autorizado*: **Anti-Gravity**.
* **`src/config/routes.ts`**:
  * *Propósito*: Registro inmutable de rutas de la aplicación.
  * *Riesgo de modificación*: Romper la resolución de URLs en enlaces del menú y footer.
  * *Agente autorizado*: **Anti-Gravity** (Solo adiciones, nunca renombrar claves existentes).

---

## 4. Migraciones de Seguridad de Postgres

* **`supabase/migrations/20260728004243_31991e38-38b2-4f9e-a899-bc063c8e57da.sql`**:
  * *Propósito*: Revocación de privilegios `EXECUTE` en funciones `SECURITY DEFINER` a `PUBLIC` y `anon`.
  * *Riesgo de modificación*: Abrir brechas de ejecución arbitraria en RPC de base de datos.
  * *Agente autorizado*: Ninguno (Migración PostgreSQL ya aplicada).
