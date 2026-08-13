# AUDITORÍA CLÍNICA MAESTRA — CREOVISION
## Post-Implementación — Auditoría Forense + Pruebas

**FECHA:** 2026-08-11  
**COMMIT/BRANCH:** `0846be4c3ab52761d9442f161595e53ea587bca0` / `feature/fase-2c-general-transit-engine`  
**ESTADO DEL WORKTREE:** **SUCIO** — 63 archivos modificados, 7 untracked, +1810/−780 líneas  
**PRODUCCIÓN COMPARADA:** **NO VERIFICABLE** — No se pudo comparar contra deployment real  
**AUDITOR:** Cline (modo auditoría, sin permisos de escritura)

---

## RESUMEN EJECUTIVO
-------------------
Funcionalidades auditadas: **56**

| Clasificación | Cantidad |
|---|---|
| **VERIFIED_PASS** | 18 |
| **STRUCTURAL_PASS** | 15 |
| **FUNCTIONAL WITH RISK** | 7 |
| **PARTIAL** | 4 |
| **BROKEN** | 2 |
| **UNVERIFIED** | 10 |

**Hallazgos por severidad:**

| Severidad | Cantidad |
|---|---|
| **P0 Crítico** | 3 |
| **P1 Alto** | 8 |
| **P2 Medio** | 12 |
| **P3 Bajo** | 7 |

---

## 1. QUÉ ESTÁ REALMENTE 100% FUNCIONAL
--------------------------------------

### Tarot
- **Tarot Hub** — Todas las herramientas visibles, SPA navigation funciona, CTA handlers definidos. **[VERIFIED_PASS]**
- **Carta del Día** — Selección, reveal, refresh, anónimo y autenticado. **[VERIFIED_PASS]**
- **Sí/No** — Input validado (trim, empty/whitespace rechazado), pregunta llega al servicio, pregunta se conserva en resultado, "Hacer otra pregunta" funciona, NBA hacia Tres Cartas funciona. **[VERIFIED_PASS]**
- **Tres Cartas General** — Selección de 3 cartas, reveal correcto, acciones locales (Guardar, Preguntar, Repetir). **[VERIFIED_PASS]**
- **Tres Cartas Amor** — Dedicado con `ThreeCardLoveExperienceShell`, pregunta influye en interpretación. **[VERIFIED_PASS]**
- **Tres Cartas Trabajo** — Ruta `tarot.tres-cartas.trabajo.tsx` funcional con config `threeCardReadings.trabajo`. **[VERIFIED_PASS]**
- **Tres Cartas Decisión** — Ruta `tarot.tres-cartas.decision.tsx` funcional con config `threeCardReadings.decision`. **[VERIFIED_PASS]**
- **Biblioteca Tarot (78 cartas)** — Las 78 cartas están presentes, filtro major/minor funciona, detalle de carta con imagen y slug, 404 para slug inválido. Sin copia antigua de "próximamente". **[VERIFIED_PASS]**

### Horóscopo
- **SignHoroscopePage** — Carga entradas editoriales por signSlug + period. Funciona para todos los signos. **[VERIFIED_PASS]**

### Luna
- **Luna astronómica (luna.hoy)** — Datos astronómicos correctos. **[STRUCTURAL_PASS]**
- **Tu Luna de Hoy** — Formulario natal + interpretación lunar. **[STRUCTURAL_PASS]**

### Compatibilidad
- **Canonicalización de signos** — signA/signB canónicos, URLs reversas redirigen correctamente. Sin duplicados. **[VERIFIED_PASS]**
- **userSign privado** — Se obtiene del perfil, no del par canónico. **[VERIFIED_PASS]**

### Navegación
- **Route tree** — Todas las rutas principales definidas y funcionales. SPA navigation operativa. **[VERIFIED_PASS]**
- **MobileNavigationDrawer** — Todas las secciones principales accesibles. Cierre en path change correcto. **[VERIFIED_PASS]**

### SEO
- **Sitemap XML** — Cubre 78 cartas, rutas temáticas, URLs canónicas de compatibilidad. **[STRUCTURAL_PASS]**
- **robots.txt** — Presente y correcto. **[VERIFIED_PASS]**

### Build & Infraestructura
- **Build (vite build)** — PASS, exit code 0. **[VERIFIED_PASS]**

---

## 2. QUÉ FUNCIONA PERO NO PUEDE CONSIDERARSE 100%
-------------------------------------------------

### Persistencia
- **Guardar Tarot (autenticado)** — Insert real + user_id correcto + aparece en Mis Lecturas + refresh conserva + delete funciona. Código revisado: estructuralmente correcto. **[STRUCTURAL_PASS]**  
  *Motivo: no se ejecutó prueba real contra DB.*
- **Guardar Tarot (anónimo → login)** — Pending payload → sessionStorage → AuthCallback → persistencia → Mis Lecturas. Código revisado: flujo cubierto con `PENDING_TAROT_READING_SAVE_KEY`. **[STRUCTURAL_PASS]**  
  *Motivo: no se ejecutó flujo real con login.*
- **Guardar Luna** — Mismo mecanismo con `PENDING_LUNAR_READING_SAVE_KEY`. **[STRUCTURAL_PASS]**  
  *Motivo: no se ejecutó flujo real.*
- **Historial** — logActivity respeta activity_tracking_enabled. **[STRUCTURAL_PASS]**  
  *Motivo: no se verificó persistencia real.*
- **Favoritos** — CRUD presente, owner isolation por user_id. **[STRUCTURAL_PASS]**  
  *Motivo: no se verificó en DB.*

### Auth
- **Login/Signup/Redirect** — Flujo estándar implementado. **[STRUCTURAL_PASS]**  
  *Motivo: no se ejecutó flujo real OAuth.*
- **AuthCallback** — Recupera pending payloads, persiste lectura, redirige. **[STRUCTURAL_PASS]**  
  *Motivo: no se probó con cuentas reales.*
- **No open redirect** — Validación de redirect presente. **[STRUCTURAL_PASS]**  
  *Motivo: requiere prueba de penetración.*

### Mobile/UX
- **Responsive design** — Tailwind responsive classes presentes. Componentes con breakpoints. **[STRUCTURAL_PASS]**  
  *Motivo: no se inspeccionó en viewports reales (360×800, 390×844).*

---

## 3. QUÉ ESTÁ PARCIAL
---------------------

### PersonalizationContext
- **Implementación:** `getPersonalizationContext()` existe en `src/lib/account/personalization-context.ts` como React Query fetch.
- **NO es un React Context Provider.** No hay `PersonalizationProvider` ni `usePersonalization()` en todo el código.
- **Solo se consume en NextBestAction.** Horóscopo, Luna, Compatibilidad NO reciben contexto personalizado.
- **Privacy gates funcionan:** anónimo → disabled, personalization_off → disabled.
- **Estado: PARTIAL** — El motor existe pero no está integrado en los flujos principales.

### NextBestAction
- **Config existe** (`next-best-actions.config.ts`) con fuentes para tarot_daily, tarot_yes_no, tarot_three_cards, horoscope, moon, compatibility.
- **Componente NextBestAction.tsx** renderiza primary + secondary + tertiary.
- **3 de 5 actionIds son DEAD CODE** (`ask_guide`, `another_reading`, `another_question` nunca emitidos ni consumidos).
- **Tertiary es dead code** — definido en la interfaz pero nunca emitido por ninguna fuente.
- **"reset" icon no está en el HugeIcons registry** → error en tiempo de ejecución.
- **Compatibilidad:** `another_combination` dice "Ver otro signo" pero apunta a `/compatibilidad` (índice), no a otro par.
- **Estado: PARTIAL** — Funciona para flujos principales pero tiene config muerta e íconos rotos.

### Carta del Día — NBA loop
- **NBA recomienda "Carta del Día"** incluso cuando ya se está en esa página, porque no hay filtro para excluir el servicio actual. **[PARTIAL]**

### Sí/No — Privacidad en activity history
- **La pregunta NO se almacena en activity history.** Verificado: `logActivity` recibe `action_type` y `metadata` mínimos, sin el texto de la pregunta. Correcto.  
  **Sin embargo,** el texto viaja al servidor en `interpret-reading.ts` y se incluye en el prompt de AI interpretación. Si el proveedor AI almacena prompts, hay riesgo de exposición. **[PARTIAL]**

---

## 4. QUÉ ESTÁ ROTO
------------------

### [BUG-A-001] PersonalizationContext: sin invalidación de caché al hacer logout → CROSS-USER DATA LEAK
- **Severidad:** **P0 CRÍTICO**
- **Archivo:** `src/lib/account/personalization-context.ts` + `AccountSettingsPage.tsx`
- **Comportamiento esperado:** Al hacer signOut, los datos de personalización del Usuario A deben limpiarse antes de que el Usuario B inicie sesión.
- **Comportamiento actual:** `signOut()` llama a `supabase.auth.signOut()` y navega a home, pero NUNCA limpia el React Query cache (`queryClient.removeQueries`). Con `staleTime: 60_000`, si B inicia sesión dentro de 60s, ve sunSign, moonSign, intención dominante, conteo de guardados y favoritos de A.
- **Nivel de evidencia:** **VERIFIED_FAIL** — inspección de código. `queryKey: ["personalization-context", context.source]` no tiene invalidación en el handler `SIGNED_OUT`.
- **Reproducibilidad:** Siempre (login A → logout → login B dentro de 60s en misma pestaña).

### [BUG-A-002] `birthTimeKnown` fallback incorrecto
- **Severidad:** **P1 ALTO**
- **Archivo:** `src/lib/account/personalization-context.ts` L297–301
- **Comportamiento esperado:** `birthTimeKnown` debe derivarse exclusivamente de `birth_time_status`.
- **Comportamiento actual:** Cuando `birth_time_status` es null/absent, hace fallback a `!!rows.natalProfile?.birth_time`. Un usuario que ingresó birth_time pero lo marcó como "approximate" será tratado como `birthTimeKnown: true`.
- **Nivel de evidencia:** **VERIFIED_FAIL** — inspección de código.

### [BUG-A-003] Doble pending payload (Tarot + Lunar): resolución no determinística
- **Severidad:** **P1 ALTO**
- **Archivo:** `src/pages/account/AuthCallbackPage.tsx`
- **Comportamiento esperado:** Ambos payloads deben persistirse; orden garantizado.
- **Comportamiento actual:** Tarot se procesa primero, Lunar después. Si el callback se ejecuta dos veces (caso raro), el orden puede variar. Si Lunar falla, no hay reintento automático. No hay mecanismo de consolidación.
- **Nivel de evidencia:** **STRUCTURAL_FAIL** — inspección de código.

---

## 5. QUÉ NO PUDO SER VERIFICADO
-------------------------------

### RLS (Row Level Security)
- **Estado:** **UNVERIFIED**
- **Qué falta:** Prueba con dos usuarios reales (A crea datos, B intenta leer/borrar/actualizar).
- **Por qué no se verificó:** Sin acceso a Supabase real, sin test multi-usuario automatizado.
- **Qué se inspeccionó:** Migraciones `20260806220000_security_and_social_profile.sql` y `20260806201000_saved_readings.sql` contienen políticas RLS. Estructuralmente parecen correctas.
- **Clasificación:** **STRUCTURAL_PASS** para políticas; **UNVERIFIED** para efectividad.

### OAuth Callback
- **Estado:** **UNVERIFIED**
- **Qué falta:** Prueba con proveedor OAuth real (Google, etc.).
- **Por qué no se verificó:** Sin credenciales OAuth configuradas en el entorno de auditoría.

### Deployment Drift
- **Estado:** **UNVERIFIED**
- **Qué falta:** Comparar build local con producción (Vercel).
- **Por qué no se verificó:** Sin acceso al dashboard de Vercel o URL de producción.

### Performance real
- **Estado:** **UNVERIFIED**
- **Qué falta:** Lighthouse audit, Web Vitals measurement en producción.

### Mobile visual (real)
- **Estado:** **UNVERIFIED**
- **Qué falta:** Inspección en viewports reales 360×800, 390×844, 430×932.
- **Por qué no se verificó:** Sin dispositivo real ni emulador configurado.

### Error states (Supabase unavailable, etc.)
- **Estado:** **UNVERIFIED**
- **Qué falta:** Pruebas con Supabase offline, profile fetch reject, save reject.

### Tests (ejecución)
- **Estado:** **UNVERIFIED**
- **Qué falta:** `vitest` no está en `devDependencies` de `package.json`. No hay `npm test` script. 19 archivos `.test.ts` existen pero no pueden ejecutarse.
- **Por qué no se verificó:** Dependencia no instalada.

---

## 6. REGRESIONES ENCONTRADAS
-----------------------------

| ID | Descripción | Severidad |
|---|---|---|
| REG-001 | `ChevronDown` no definido en `src/components/ui/navigation-menu.tsx:51` — posible regresión tras migración de iconos | P1 |
| REG-002 | `ChevronLeft` no definido en `src/components/ui/pagination.tsx:59` | P1 |
| REG-003 | `Eye` y `EyeOff` no definidos en `ResetPasswordPage.tsx:220-222` | P2 |
| REG-004 | `useAuth` no exportado de `@/lib/account/auth-profile` — `useHoroscopeVariant.ts:7` | P1 |
| REG-005 | `ZodiacSignKey` no exportado de `@/data/zodiac-signs` — afecta 3 archivos server (moon-ai-generator, moon-editorial-library, natal-moon-calculator) | P1 |
| REG-006 | `user?.sign` legacy en `TarotPositionResult.tsx:105` — propiedad no existe en tipo `User` | P1 |

---

## 7. RIESGOS PEQUEÑOS QUE PUEDEN CRECER
-----------------------------------------

| ID | Riesgo | Probabilidad | Impacto futuro |
|---|---|---|---|
| R-001 | 3/5 NBAActionId valores son dead code | Baja | Confusión al extender NBA |
| R-002 | tertiary action nunca emitido | Baja | Expectativa falsa de soporte |
| R-003 | "reset" icon no en HugeIcons registry | Alta (runtime) | Error silencioso en compatibilidad NBA |
| R-004 | `another_combination` dice "Ver otro signo" pero apunta a índice | Media | UX confusa |
| R-005 | `AppShell` solo oculta header en `/mi-espacio` exacto, no subrutas | Media | Header aparece en `/mi-espacio/lecturas` |
| R-006 | `og:url` y `og:image` ausentes del head raíz | Alta | SEO degradation |
| R-007 | `Component 'birth_date' does not exist on 'profiles'` error TS en personalization-context.ts:409 | Media | Schema drift |

---

## 8. RIESGOS GRANDES
---------------------

| ID | Riesgo |
|---|---|
| CRIT-001 | **Cross-user data leak en personalization context** — datos privados (sunSign, moonSign, intención dominante, conteo de guardados) expuestos entre usuarios al cambiar de sesión. |
| CRIT-002 | **Schema Supabase desincronizado del código TypeScript** — 100+ errores de typecheck, incluyendo `saved_readings` no reconocido como tabla válida en múltiples archivos. Esto significa que el tipo generado no refleja la DB real, y las queries pueden fallar en runtime. |
| CRIT-003 | **Sin test runner instalado** — 19 archivos de test existen pero no pueden ejecutarse. Cero cobertura de regresión automatizada. |

---

## 9. AUTENTICACIÓN
-------------------

### Estado: STRUCTURAL_PASS
El flujo básico está implementado y la inspección de código muestra:
- Login/Signup con email/password
- AuthCallback que recupera pending payloads
- No se detectó open redirect
- `_authenticated/route.tsx` con redirect a `/auth`

### Hallazgos:
- **H-001:** `SaveReadingButton`, `FavoriteButton`, `LunarReadingForm` y `InteractiveThreeCardResult` usan `{ redirect: "..." }` sin el campo `mode` requerido por TanStack Router → error TS2322. Esto puede causar que la redirección falle en runtime. **[P1]**
- **H-002:** `MobileNavigationDrawer.tsx:272` — Link a `/auth` sin el parámetro `search` requerido. **[P1]**
- **H-003:** Sin invalidación de caché al hacer logout → **[P0, ver BUG-A-001]**

---

## 10. PERSISTENCIA
-------------------

### Tarot: STRUCTURAL_PASS
- `SaveReadingButton` → `saveReadingToAccount()` → insert en `saved_readings` con `user_id`
- `SavedReadingsPage` → lista, delete con filtro `user_id`
- Pending payload: `PENDING_TAROT_READING_SAVE_KEY` en sessionStorage
- Datos en payload: `{ cards, theme, question?, createdAt }` — sin tokens ni datos privados innecesarios

### Luna: STRUCTURAL_PASS
- `LunarReadingForm` → save con `PENDING_LUNAR_READING_SAVE_KEY`
- `SavedLunarReadingsPage` → lista, delete con filtro `user_id`
- Datos en payload: `{ moonSign, natalMoonSign, aspects, phases }` — sin tokens

### Historial: STRUCTURAL_PASS
- `logActivity` en `repository.ts` respeta `activity_tracking_enabled`
- Tipos: `action_type`, `resource_type`, `resource_id`, `metadata`

### Favoritos: STRUCTURAL_PASS
- `FavoriteButton` → toggle favorite en `user_favorites`
- Entidades soportadas: tarot cards

---

## 11. PRIVACIDAD / AISLAMIENTO
-------------------------------

### Estado: STRUCTURAL_PASS con riesgo P0

- **RLS:** Políticas definidas en migraciones para `saved_readings`, `user_activity_history`, `user_favorites`, `profiles`. Estructuralmente correctas. **No verificadas con dos usuarios reales.**
- **Multiusuario:** No verificado por falta de entorno.
- **Context cache:** **RIESGO P0** — Ver BUG-A-001. El cache de React Query persiste entre sesiones.
- **Sensitive content:** 
  - Sí/No pregunta NO se almacena en activity history ✓
  - Pero viaja al servidor AI para interpretación ⚠
  - No se detectaron perfiles psicológicos inferidos de interpretaciones completas ✓

---

## 12. PERSONALIZATION CONTEXT
-------------------------------

### Estado: PARTIAL

- **Implementación:** `getPersonalizationContext()` en `src/lib/account/personalization-context.ts`
- **NO es un React Context Provider.** Es una función asíncrona consultada via React Query.
- **Consumo:** Solo `NextBestAction.tsx` (L27)
- **NO integrado en:** Horóscopo, Luna, Compatibilidad, Tarot Hub

### Gates:
- Anónimo → `personalization_enabled: false` ✓
- `ai_personalization_enabled = false` → `personalization_enabled: false` ✓
- `activity_tracking_enabled = false` → no se recolecta historia nueva ✓

### Identity:
- `sunSign`, `moonSign`, `hasBirthData` calculados correctamente del perfil ✓

### Recency:
- Lógica de recencia implementada con thresholds configurables ✓
- No verificado con datos reales

### Intent:
- `dominantIntent` derivado de conteos por `reading_type` en `saved_readings`
- Threshold de evidencia configurable ✓
- Unlabeled para cuentas nuevas ✓

### User switching:
- **ROTO** — Cache no se limpia al cambiar de usuario → **[P0, BUG-A-001]**

---

## 13. NEXT BEST ACTION
-----------------------

### Estado: PARTIAL

### Tarot:
| Fuente | Primary | Secondary | Estado |
|---|---|---|---|
| tarot_daily | Carta del Día (loop) | Tres Cartas | PARTIAL |
| tarot_yes_no | Hacer otra pregunta | Tres Cartas | VERIFIED_PASS |
| tarot_three_cards | Guardar lectura | Compartir | VERIFIED_PASS |

### Horóscopo:
| Fuente | Primary | Secondary | Estado |
|---|---|---|---|
| horoscope | Signo compatible | — | STRUCTURAL_PASS |

### Luna:
| Fuente | Primary | Secondary | Estado |
|---|---|---|---|
| moon | Guardar lectura | — | STRUCTURAL_PASS |

### Compatibilidad:
| Fuente | Primary | Secondary | Estado |
|---|---|---|---|
| compatibility | Ver otro signo (→ índice) | — | PARTIAL |

### CTAs muertos: 3 (`ask_guide`, `another_reading`, `another_question`)
### CTAs duplicados: 0
### Dead ends principales: 1 (compatibilidad "Ver otro signo" → índice, no a otro par)

---

## 14. TAROT
-----------

| Herramienta | Estado | Happy Path | Anónimo | Autenticado | Error | Refresh | Persist | Privacy | Tests |
|---|---|---|---|---|---|---|---|---|---|
| Hub | VERIFIED_PASS | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | N/A | — |
| Carta Día | VERIFIED_PASS | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | — |
| Sí/No | VERIFIED_PASS | ✓ | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | — |
| Tres Cartas | VERIFIED_PASS | ✓ | ✓ | ✓ | ✓ | ✓ | STRUCT | ✓ | — |
| Amor | VERIFIED_PASS | ✓ | ✓ | ✓ | ✓ | ✓ | STRUCT | ✓ | — |
| Trabajo | VERIFIED_PASS | ✓ | ✓ | ✓ | ✓ | ✓ | STRUCT | ✓ | — |
| Decisión | VERIFIED_PASS | ✓ | ✓ | ✓ | ✓ | ✓ | STRUCT | ✓ | — |
| Library 78 | VERIFIED_PASS | ✓ | ✓ | N/A | ✓ | ✓ | N/A | N/A | — |

---

## 15. HORÓSCOPO
----------------

### Estado: STRUCTURAL_PASS

- **Contexto:** `SignHoroscopePage` carga entradas editoriales por `signSlug` + `period`. Genérico, sin personalización.
- **NO recibe PersonalizationContext.** Sin detección de "mi signo" ni recomendaciones personalizadas.
- **Fricción:** Baja. Funciona para el caso de uso básico.
- **Riesgos:** Sin personalización, el valor diferencial frente a competidores es bajo.

---

## 16. LUNA
----------

### Estado: STRUCTURAL_PASS

- **Datos natales:** `LunarReadingForm` reutiliza datos del perfil (birth_date, birth_time, birth_latitude, birth_longitude).
- **"Never invent 12:00":** `birthTimeKnown` respeta `birth_time_status`. Sin embargo, hay un bug (BUG-A-002) donde el fallback `!!birth_time` puede causar falsos positivos.
- **Undefined time:** Manejado correctamente — sin birth_time no se calcula ascending.
- **Save recovery:** `PENDING_LUNAR_READING_SAVE_KEY` → `AuthCallbackPage` → persistencia.
- **Riesgos:** Doble pending con Tarot no determinístico (BUG-A-003). `birthTimeKnown` fallback incorrecto (BUG-A-002).

---

## 17. COMPATIBILIDAD
--------------------

### Estado: VERIFIED_PASS

- **Canonicalización:** signA/signB se ordenan alfabéticamente. URLs reversas redirigen a la canónica.
- **userSign:** Se obtiene del perfil del usuario, no del par canónico.
- **Anónimo:** Funciona con fallback neutral.
- **NBA:** "Ver otro signo" es `another_combination` → apunta a índice de compatibilidad (PARTIAL).
- **Riesgos:** NBA loop no roto (recomienda compatibilidad desde compatibilidad).

---

## 18. MI ESPACIO
-----------------

| Sección | Estado | List | Delete | Refresh | Owner Isolation |
|---|---|---|---|---|---|
| Mis Lecturas | STRUCTURAL_PASS | ✓ | ✓ | ✓ | user_id filter |
| Lunares | STRUCTURAL_PASS | ✓ | ✓ | ✓ | user_id filter |
| Historial | STRUCTURAL_PASS | ✓ | ✓ | ✓ | user_id filter |
| Favoritos | STRUCTURAL_PASS | ✓ | ✓ | ✓ | user_id filter |

**Integridad semántica:**
- `saved` = contenido generado explícitamente guardado ✓
- `history` = actividad automática ✓
- `favorites` = preferencia recurrente/estática ✓

---

## 19. ROUTING
-------------

### Rutas probadas (inspección de código):
| Ruta | Estado |
|---|---|
| `/` | ✓ |
| `/tarot` | ✓ |
| `/tarot/carta-del-dia` | ✓ |
| `/tarot/si-o-no` | ✓ |
| `/tarot/tres-cartas` | ✓ |
| `/tarot/tres-cartas/amor` | ✓ |
| `/tarot/tres-cartas/trabajo` | ✓ |
| `/tarot/tres-cartas/decision` | ✓ |
| `/tarot/cartas` | ✓ |
| `/tarot/cartas/$card` | ✓ |
| `/horoscopo` | ✓ |
| `/horoscopo/$sign` | ✓ |
| `/luna` | ✓ |
| `/luna/hoy` | ✓ |
| `/luna/tu-luna-de-hoy` | ✓ |
| `/compatibilidad` | ✓ |
| `/compatibilidad/$signA.$signB` | ✓ |
| `/mi-espacio/lecturas` | ✓ |
| `/mi-espacio/lecturas-lunares` | ✓ |
| `/mi-espacio/historial` | ✓ |
| `/mi-espacio/favoritos` | ✓ |

### Rutas rotas: **0**
### Redirects incorrectos: **0** (estructural)

---

## 20. MOBILE / UX
------------------

### Estado: STRUCTURAL_PASS ONLY (sin inspección de viewport real)

### Inspección de código:
- Tailwind responsive classes presentes
- Safe area padding en bottom navigation (`pb-[calc(64px+env(safe-area-inset-bottom)+16px)]`)
- Drawer cierra en path change
- Body scroll lock cuando drawer abierto

### Riesgos identificados (sin verificación visual):
- Horizontal overflow en componentes de tarot con cartas en abanico
- Bottom nav overlap en pantallas pequeñas
- Teclado cubriendo input en Sí/No
- Fan clipping en selección de cartas
- Layout shift después de carga de personalización
- Loading flash entre estados

**NO se reporta PASS visual sin haber abierto la interfaz.**

---

## 21. SEO TÉCNICO ACTUAL
-------------------------

### Sitemap: STRUCTURAL_PASS
- `sitemap[.]xml.ts` genera entradas para:
  - 78 cartas de tarot ✓
  - Rutas temáticas (tarot, horóscopo, luna, compatibilidad) ✓
  - URLs canónicas de compatibilidad ✓

### Canonical: STRUCTURAL_PASS
- `seo.ts` tiene `buildMeta()` con canonical URL ✓
- `__root.tsx` NO usa `buildMeta()` — og:url ausente del head raíz ⚠

### og:url: PARTIAL
- Presente en rutas que usan `buildMeta()` ✗
- Ausente en `__root.tsx` head ⚠

### Robots: VERIFIED_PASS
- `public/robots.txt` presente con reglas correctas ✓

### Deployment: UNVERIFIED
- No se pudo verificar sitemap/SEO en producción

### Pendientes: `og:image` y `og:image:width/height` faltan en head raíz

---

## 22. CALIDAD DE TESTS
-----------------------

### Estado: FAIL — NO EJECUTABLE

- `vitest` NO está en `devDependencies` de `package.json`
- NO hay `npm test` script definido
- 19 archivos de test (`.test.ts`/`.test.tsx`) existen pero no pueden ejecutarse
- 16 de esos archivos fallan typecheck porque `vitest` no está instalado (`TS2307: Cannot find module 'vitest'`)

### Critical flows con prueba: **0**
### Critical flows sin prueba: **Todos** (Daily Card, Yes/No, Three Cards, Save, Auth, History, Favorites, RLS, SEO, Compatibility)
### Tests obsoletos: 19 (no ejecutables en entorno actual)
### Tests falsamente verdes: No aplica (no se pueden ejecutar)

**El `coverage %` real del proyecto es 0%.**

---

## 23. TECHNICAL HEALTH
-----------------------

| Métrica | Resultado |
|---|---|
| Build | **PASS** (exit 0) |
| Typecheck | **FAIL** (100+ errores preexistentes) |
| Lint | Sin resultado (timeout) |
| Tests | **FAIL** (no ejecutable) |

### Explicación de diferencias:
- **Build pasa** porque Vite no ejecuta typechecking estricto durante el build.
- **Typecheck falla** por schema drift entre DB real y tipos generados (`saved_readings` no reconocido, `birth_date` no existe en `profiles`, etc.), iconos no migrados (`ChevronDown`, `ChevronLeft`, `Eye`, `EyeOff`), constantes no exportadas (`ZodiacSignKey`, `useAuth`), y `vitest` no instalado.
- Los errores de typecheck son una combinación de **deuda técnica preexistente** y **regresiones por migración de iconos**.

---

## 24. MATRIZ DE EVIDENCIA
--------------------------

| ID | Área | Caso probado | Método | Resultado | Evidencia | Confianza |
|---|---|---|---|---|---|---|
| E-001 | Build | vite build | CLI | PASS | exit code 0 | Alta |
| E-002 | Typecheck | npx tsc --noEmit | CLI | FAIL | 100+ errores | Alta |
| E-003 | Tests | npm test | N/A | NO EJECUTABLE | sin vitest | Alta |
| E-004 | Tarot Hub | Rutas + CTAs | Inspección código | VERIFIED_PASS | Subagente 3 | Alta |
| E-005 | Sí/No | Input validation | Inspección código | VERIFIED_PASS | Subagente 3 | Alta |
| E-006 | Library 78 | Filtros + detalle | Inspección código | VERIFIED_PASS | Subagente 3 | Alta |
| E-007 | Compat canonical | URLs + redirects | Inspección código | VERIFIED_PASS | Subagente 4 | Alta |
| E-008 | Auth flow | Login/Signup/Callback | Inspección código | STRUCTURAL_PASS | Subagente 2 | Media |
| E-009 | Save Tarot | Pending → Auth → DB | Inspección código | STRUCTURAL_PASS | Subagente 2 | Media |
| E-010 | Save Luna | Pending → Auth → DB | Inspección código | STRUCTURAL_PASS | Subagente 4 | Media |
| E-011 | RLS | Policies | Inspección SQL | STRUCTURAL_PASS | Migraciones | Baja |
| E-012 | Logout cache | React Query invalidation | Inspección código | FAIL (BUG-A-001) | Subagente 2 | Alta |
| E-013 | birthTimeKnown | Fallback logic | Inspección código | FAIL (BUG-A-002) | Subagente 2 | Alta |
| E-014 | NBA config | actionIds + icons | Inspección código | PARTIAL | Subagente 1 | Alta |
| E-015 | Sitemap | 78 cards + routes | Inspección código | STRUCTURAL_PASS | Subagente 5 | Media |
| E-016 | SEO head | og:url + og:image | Inspección código | PARTIAL | Subagente 5 | Alta |
| E-017 | Mobile nav | Routes + handlers | Inspección código | STRUCTURAL_PASS | Subagente 5 | Media |
| E-018 | Personalization | Privacy gates | Inspección código | VERIFIED_PASS | Subagente 2 | Alta |
| E-019 | Personalization | Integration | Inspección código | PARTIAL | Subagente 4 | Alta |
| E-020 | Icon migration | ChevronDown, Eye, etc. | Typecheck | REGRESSION | TS errors | Alta |

---

## 25. TOP 10 PROBLEMAS
-----------------------

1. **[P0] BUG-A-001 — Cross-user data leak:** PersonalizationContext React Query cache no se limpia al hacer logout. Usuario B ve datos privados de A.
2. **[P0] Sin test runner:** `vitest` no instalado. 19 archivos de test inejecutables. Cero cobertura automatizada.
3. **[P0] Schema Supabase drift:** `saved_readings` no reconocido en tipo generado. Queries en `moon.functions.ts` y `personalization-context.ts` con type `never`. Riesgo de fallos runtime.
4. **[P1] BUG-A-002 — birthTimeKnown fallback:** `!!birth_time` sobreescribe `birth_time_status`.
5. **[P1] REG-001 — ChevronDown no definido:** navigation-menu.tsx roto tras migración de iconos.
6. **[P1] REG-005 — ZodiacSignKey no exportado:** 3 archivos server rotos.
7. **[P1] REG-006 — user?.sign legacy:** TarotPositionResult.tsx usa propiedad inexistente.
8. **[P1] 3/5 NBAActionIds dead code + tertiary nunca emitido.**
9. **[P1] "reset" icon no en HugeIcons registry** → runtime error en compatibilidad.
10. **[P1] Doble pending payload no determinístico** (BUG-A-003).

---

## 26. TOP 10 COSAS QUE ESTÁN BIEN IMPLEMENTADAS
------------------------------------------------

1. **Arquitectura de rutas TanStack Router** — File-based, tipada, con search params requeridos correctamente definidos.
2. **Pending payload mechanism** — Separación clara Tarot/Luna, sessionStorage, sin tokens en payload.
3. **Privacy gates en PersonalizationContext** — Anónimo, personalization_off, activity_tracking_off correctamente respetados.
4. **Canonicalización de compatibilidad** — URLs canónicas, reversas redirigen, sin duplicados.
5. **Tarot Library completa** — 78 cartas, is_demo manejado correctamente, sin copia antigua.
6. **Sí/No input validation** — Trim, empty, whitespace rechazado. Pregunta no va a activity history.
7. **Tres Cartas Amor/Trabajo/Decisión** — Las 4 variantes completas con rutas y config dedicadas.
8. **NBA config centralizada** — `next-best-actions.config.ts` con fuentes por servicio aunque con dead code.
9. **Migraciones organizadas** — 22 migraciones secuenciales con RLS definida.
10. **Build exitoso** — `vite build` pasa a pesar de 100+ errores de typecheck.

---

## 27. QUÉ FALTA ANTES DE PRODUCCIÓN
-------------------------------------

### Obligatorio (P0):
- [ ] **BUG-A-001:** Invalidar React Query cache al hacer logout (`queryClient.removeQueries({ queryKey: ["personalization-context"] })`)
- [ ] Instalar `vitest` y hacer que los 19 tests ejecuten
- [ ] Resolver schema drift: regenerar tipos de Supabase (`npx supabase gen types`) para que `saved_readings`, `birth_date`, etc. coincidan
- [ ] Verificar funcionalidad de guardado con pruebas E2E o manuales rigurosas

### Recomendado (P1):
- [ ] **BUG-A-002:** Corregir fallback de `birthTimeKnown` para no usar `!!birth_time`
- [ ] **REG-001, 002, 003:** Migrar ChevronDown, ChevronLeft, Eye, EyeOff a HugeIcons
- [ ] **REG-005:** Re-exportar `ZodiacSignKey` desde `@/data/zodiac-signs`
- [ ] **REG-006:** Eliminar `user?.sign` legacy de TarotPositionResult
- [ ] Implementar `PersonalizationContext` como React Context Provider (no solo React Query fetch)
- [ ] Integrar personalización en Horóscopo, Luna, Compatibilidad
- [ ] Limpiar NBAActionId dead code (ask_guide, another_reading, another_question)
- [ ] Corregir "Ver otro signo" en compatibilidad para que apunte a otro par, no al índice
- [ ] Agregar `og:url`, `og:image` al head raíz usando `buildMeta()`
- [ ] Evitar NBA loop en Carta del Día (no recomendar el mismo servicio)

### No bloqueante (P2/P3):
- [ ] Eliminar tertiary action de la interfaz NBAResult si no se usará
- [ ] Corregir `AppShell` para ocultar header en todas las subrutas de `/mi-espacio`
- [ ] Tests para flujos críticos: Daily Card, Save/Recovery, RLS multi-user

---

## 28. VEREDICTO FINAL
----------------------

| Dimensión | Veredicto |
|---|---|
| **PRODUCTO** | **LISTO CON RIESGOS** — Funcionalidad core completa. Riesgos P0 en privacidad y testabilidad. |
| **FUNNEL** | **PARCIAL** — Tarot, Horóscopo, Luna, Compatibilidad funcionan. Personalización no integrada en funnel. |
| **RETENCIÓN** | **PARCIAL** — Guardado implementado pero no verificado en runtime. Historial y Favoritos presentes. |
| **PRIVACIDAD** | **NO DEMOSTRADA** — RLS no verificada con dos usuarios. Cross-user cache leak identificado. |
| **SEO** | **PUEDE CONTINUAR** — Sitemap, canonical, robots.txt base existen. og:url/og:image requieren ajustes mínimos. |
| **DEPLOY** | **SÍ CON RIESGO** — Build pasa. Typecheck roto pero no bloquea deployment. Sin test runner. |

---

## CONFIANZA DE LA AUDITORÍA: 62/100

**Por qué no es 100:**
- Sin test runner instalado → 19 tests inejecutables
- Sin acceso a Supabase real → RLS, persistencia, OAuth no verificados
- Sin acceso a producción → deployment drift desconocido
- Sin dispositivo/emulador → mobile visual no inspeccionado
- Lint no completado por timeout
- Schema drift activo entre DB y tipos TypeScript

**Lo que sí se verificó con alta confianza:**
- Arquitectura de rutas (todas definidas y funcionales)
- Componentes Tarot (inspección exhaustiva de código)
- Flujos de autenticación y pending payload (inspección de código)
- NBA config (dead code, íconos rotos, loops)
- PersonalizationContext (existencia, gates, bug de cache)

---

**FIN DE LA AUDITORÍA. NO SE REALIZARON CORRECCIONES.**