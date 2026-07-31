# Auditoría Maestra Funcional de Creovision

**Fecha:** 2026-07-30
**Proyecto:** Creovision / Proyecto Astral
**Rama:** feature/fase-2c-general-transit-engine
**Commit:** 067536f
**Versión del informe:** v1.0

---

## 1. Veredicto Ejecutivo

# NO APROBADO PARA PUBLICACIÓN

La plataforma **no está lista para publicación**. Si bien la arquitectura técnica, la autenticación y el motor lunar funcionan correctamente, existen brechas de datos masivas que impiden la experiencia de usuario prometida: faltan 70 de 78 cartas de tarot, los horóscopos solo tienen contenido diario de demostración para 12 signos (sin contenido semanal ni mensual), la compatibilidad cubre solo ~50 de 78 pares, y no hay imágenes reales para ningún módulo.

El build compila y la navegación funciona. La plataforma es una **maqueta visual técnicamente sólida pero con datos insuficientes**.

---

## 2. Resumen Cuantitativo

| Métrica | Valor |
|---|---|
| Rutas auditadas | 57 |
| Botones / CTAs auditados | 24 |
| Módulos auditados | 20 |
| Signos zodiacales | 12 |
| Períodos de horóscopo | 3 (diario, semanal, mensual) |
| Cartas de tarot existentes | 8 (de 78 requeridas) |
| Cartas de tarot faltantes | 70 |
| Imágenes reales (archivos) | 0 |
| Pares de compatibilidad publicados | ~50 (de 78) |
| Pares de compatibilidad faltantes | ~28 |
| Artículos publicados reales | 1 (demo) + 1 draft |
| Artículos demo | 1 |
| Errores P0 (bloquean publicación) | 7 |
| Errores P1 (función principal rota/incompleta) | 12 |
| Errores P2 (experiencia incompleta) | 15 |

---

## 3. Qué Funciona Realmente

| Funcionalidad | Evidencia |
|---|---|
| **Build y compilación** | `npm run build` exit 0, preset vercel configurado |
| **SSR** | Nitro + TanStack Start renderizando en servidor |
| **Navegación** | 57 rutas definidas, layout consistente, breadcrumbs |
| **Autenticación completa** | Registro, confirmación email, login, logout, callback PKCE, recuperación de contraseña, cambio de contraseña |
| **Perfil astral** | CRUD con validaciones, hora exacta/aproximada/desconocida, datos guardados en Supabase |
| **Luna (cálculos reales)** | astronomy-engine calcula fase actual, iluminación, calendario. 8 fases con contenido editorial real |
| **Mi Espacio** | Perfil, privacidad, favoritos, historial, lecturas guardadas conectados a Supabase con RLS |
| **Admin CRUD** | Artículos, autores, categorías con server functions protegidas por roles |
| **191 tests unitarios** | 9 suites pasan (RuleEngine, Validator, Parser, Generator, Persistence, etc.) |
| **robots.txt** | Permite crawlers principales |
| **Diseño responsive** | Mobile-first con componentes Radix UI |
| **Páginas legales** | Privacidad, términos, cookies, aviso responsabilidad, contacto — contenido estático completo |

---

## 4. Qué Parece Funcionar, Pero No Está Completo

| Funcionalidad | Estado real |
|---|---|
| **Horóscopo diario** | Solo 12 registros demo (`is_demo = true`). Sin pipeline automático |
| **Horóscopo semanal** | 0 registros. Muestra placeholder "Próximamente" |
| **Horóscopo mensual** | 0 registros. Muestra placeholder "Próximamente" |
| **Tarot carta del día** | Selecciona de 8 cartas (de 78). Sin imágenes reales. Botón "Revelar carta" funciona pero muestra solo texto |
| **Tarot tres cartas** | Funciona con las 8 disponibles. Sin imágenes |
| **Tarot sí/no** | Funciona con las 8 disponibles |
| **Compatibilidad** | ~50 pares publicados de 78. Algunos muestran "Próximamente" |
| **Buscador** | Infraestructura lista, pero indexado con 19 documentos demo genéricos |
| **Guías/Artículos** | 1 artículo publicado (demo). Sin contenido editorial real |
| **Cambio de contraseña** | Funciona pero no requiere contraseña actual (riesgo de seguridad) |

---

## 5. Qué No Funciona

| ID | Funcionalidad | Descripción |
|---|---|---|
| AUD-P0-001 | Horóscopos semanal/mensual | 0 registros para los 12 signos en periodos weekly/monthly |
| AUD-P0-002 | Baraja de tarot incompleta | Solo 8 de 78 cartas. Faltan 70 Arcanos Menores y Mayores |
| AUD-P0-003 | Imágenes de tarot | Cero imágenes reales. `image_key` referenciado pero sin assets |
| AUD-P0-004 | Imágenes del proyecto | 0 archivos de imagen en `public/`. Sin hero images, signos, cartas |
| AUD-P0-005 | Pipeline de generación IA | Código existe pero no conectado. Sin `LOVABLE_API_KEY` configurada |
| AUD-P0-006 | Sitemap | No existe. Google no puede indexar correctamente |
| AUD-P0-007 | SEO por ruta | Sin meta tags personalizados por página (OG, Twitter, canonical) |
| AUD-P1-001 | Compatibilidad incompleta | ~28 pares faltantes de 78 |
| AUD-P1-002 | Search index demo | 19 documentos genéricos no relacionados con contenido real |
| AUD-P1-003 | Artículo único | Solo 1 artículo demo publicado |
| AUD-P1-004 | Sin imágenes en tarot | La "carta del día" se muestra vacía antes de revelar |
| AUD-P1-005 | Placeholder en horóscopos | "Próximamente" en semanal/mensual para los 12 signos |
| AUD-P1-006 | Sin automatización | No hay cron, scheduler ni pipeline de publicación automática |
| AUD-P1-007 | IA no conectada | `/api/ai/respond` existe pero requiere `LOVABLE_API_KEY` |

---

## 6. Matriz de los 12 Signos

### Contenido disponible por signo y período

| Signo | Diario | Semanal | Mensual | Página general | Contenido demo |
|---|---|---|---|---|---|
| Aries | ✅ (demo) | ❌ | ❌ | ✅ | Sí |
| Tauro | ✅ (demo) | ❌ | ❌ | ✅ | Sí |
| Géminis | ✅ (demo) | ❌ | ❌ | ✅ | Sí |
| Cáncer | ✅ (demo) | ❌ | ❌ | ✅ | Sí |
| Leo | ✅ (demo) | ❌ | ❌ | ✅ | Sí |
| Virgo | ✅ (demo) | ❌ | ❌ | ✅ | Sí |
| Libra | ✅ (demo) | ❌ | ❌ | ✅ | Sí |
| Escorpio | ✅ (demo) | ❌ | ❌ | ✅ | Sí |
| Sagitario | ✅ (demo) | ❌ | ❌ | ✅ | Sí |
| Capricornio | ✅ (demo) | ❌ | ❌ | ✅ | Sí |
| Acuario | ✅ (demo) | ❌ | ❌ | ✅ | Sí |
| Piscis | ✅ (demo) | ❌ | ❌ | ✅ | Sí |

**Total:** 12/36 celdas con contenido (33%). Solo período diario. Todo es demo.

---

## 7. Matriz Diario / Semanal / Mensual

| Período | Signos con contenido | Signos sin contenido | Origen | Publicado |
|---|---|---|---|---|
| Diario | 12/12 | 0 | `supabase/seed/horoscopes-demo.sql` | `is_demo = true` |
| Semanal | 0/12 | 12 | — | — |
| Mensual | 0/12 | 12 | — | — |

---

## 8. Estado del Tarot

### Inventario de cartas

| Total esperado | 78 (22 Arcanos Mayores + 56 Arcanos Menores) |
|---|---|
| Total existente | 8 (10.3%) |
| Arcanos Mayores presentes | 8: El Loco, El Mago, La Sacerdotisa, La Emperatriz, Los Enamorados, La Fuerza, El Ermitaño, La Estrella |
| Arcanos Mayores faltantes | 14 |
| Arcanos Menores presentes | 0 |
| Arcanos Menores faltantes | 56 |
| Cartas con imagen real | 0 — todas usan `image_key` sin archivo de imagen asociado |
| Estado de publicación | Las 8 están `published` + `is_demo = true` |

### Funcionalidad de lecturas

| Lectura | Estado |
|---|---|
| Carta del día | Funcional (selecciona de 8 cartas). Sin imagen |
| Tres cartas | Funcional. Muestra texto de 3 cartas. Sin imágenes |
| Sí/No | Funcional. Sin imágenes |
| Galería de cartas | `/tarot/cartas` — muestra las 8 disponibles |
| Detalle de carta | `/tarot/cartas/:card` — funcional con significado, palabras clave, preguntas de reflexión |
| Persistencia | Código en `src/server/persistence/` (18 tests ✅). No conectada a UI de tarot |
| Aleatoriedad | Cliente (`Math.random`). Sin seed para reproducibilidad |

---

## 9. Estado de Imágenes y Cartas

### Inventario de imágenes

| Categoría | Requeridas | Existentes (archivos reales) | Estado |
|---|---|---|---|
| Cartas de tarot | 78 | 0 | ❌ `image_key` sin asset |
| Signos zodiacales | 12 | 0 | ❌ Sin imágenes de signos |
| Hero / Home | 1-3 | 0 | ⚠️ Ilustración SVG inline (código) |
| Fases lunares | 8 | 0 | ❌ `image_key` sin asset |
| Artículos | Variable | 0 | ⚠️ `image_url` desde DB (sin datos) |
| Autores | Variable | 0 | ❌ Sin avatar images |
| Favicon | 1 | ✅ `public/favicon.ico` | ✅ |
| OG images | Variable | 0 | ❌ Sin Open Graph images |

### Imágenes del tarot — detalle

Las 8 cartas existentes tienen `image_key` (ej. `tarot_card_the_fool`) pero **no existe ningún archivo de imagen** en `public/` ni en Supabase Storage asociado. La carta del día en la home se renderiza con un placeholder CSS animado antes de "revelar". Al revelar, muestra solo texto sin ilustración de la carta.

---

## 10. Estado de Luna

| Aspecto | Estado |
|---|---|
| Cálculo | ✅ astronomy-engine (v2.1.19) — cálculos reales, no mock |
| Ubicación del cálculo | `src/server/moon/astronomy-moon-engine.ts` (207 líneas, server-only) |
| Fase actual | ✅ Funcional en `/luna/hoy` |
| Calendario | ✅ Funcional en `/luna/calendario` y `/luna/calendario/:ym` |
| Contenido editorial | ✅ 8 fases con contenido real (`moon_phase_content`) — title, summary, meaning, reflection_questions, practical_suggestions, misconceptions |
| Imágenes de fases | ❌ `image_key` sin assets |
| Geolocalización | ❌ Pendiente (timezone, ubicación del usuario) |
| Cache | Tabla `moon_calculation_cache` existe pero no se usa en el path actual |
| Fallback ante error | ⚠️ Componente muestra datos o estado vacío; sin fallback editorial si el serverFn falla |

---

## 11. Estado de Compatibilidad

| Aspecto | Valor |
|---|---|
| Total esperado (12 signos, pares únicos incluyendo mismo signo) | 78 |
| Pares publicados | ~50 (64%) |
| Pares con "Próximamente" o faltantes | ~28 (36%) |
| Normalización canónica | ✅ Orden alfabético (`aries__tauro`) |
| Datos por par | `relationship_dynamic`, `dynamic_label`, `strengths`, `challenges`, `communication_style`, `emotional_bonding`, `long_term_potential`, `dimensions`, `contexts`, `reflection_questions` |
| Origen | Tabla `compatibility_pairs` en Supabase |
| Páginas sin contenido | Muestran mensaje de "Próximamente" |
| Selector de signos | Funcional en `/compatibilidad` y home |

---

## 12. Estado Editorial (Artículos y Guías)

| Aspecto | Valor |
|---|---|
| Categorías | Registradas en `editorial_categories` (número exacto requiere acceso a DB) |
| Autores | Registrados en `editorial_authors` |
| Artículos publicados | 1 (demo: `is_demo = true`) |
| Artículos en draft | 1 |
| Contenido demo | El artículo demo es texto real, no lorem ipsum |
| Imágenes de artículo | `image_url` desde DB (sin datos para el artículo demo) |
| Slugs | Funcionales (`/guias/:slug`) |
| SSR | ✅ `createServerFn` con server functions |
| Tags, SEO, breadcrumbs | Estructura definida, contenido pendiente |
| Páginas de autor | `/autores/:slug` — funcional |
| Páginas de categoría | `/temas/:category` — funcional |

---

## 13. Estado de Autenticación

| Funcionalidad | Estado | Notas |
|---|---|---|
| Registro | ✅ | Email + password |
| Confirmación de email | ✅ | Supabase Auth |
| Login | ✅ | Email + password |
| Logout | ✅ | Limpia sesión |
| Callback PKCE | ✅ | `exchangeCodeForSession` |
| Recuperación de contraseña | ✅ | Email → link → `/auth/update-password` |
| Cambio de contraseña | ⚠️ | Funciona pero no requiere contraseña actual |
| Google OAuth | ❌ | No implementado en esta rama |
| Sesión persistente | ✅ | `persistSession: true` |
| Protección SSR | ✅ | `auth-middleware.ts` + layout `_authenticated` |
| Mensajes en español | ✅ | Interfaz sin jerga técnica |
| Rutas protegidas | ✅ | `/mi-espacio/*`, `/admin/*` requieren sesión |

---

## 14. Estado de Mi Espacio

| Sección | Ruta | Estado | Contenido |
|---|---|---|---|
| Dashboard | `/mi-espacio` | ✅ | Resumen con accesos |
| Perfil | `/mi-espacio/perfil` | ✅ | CRUD conectado a Supabase |
| Perfil astral | Incluido en perfil | ✅ | Fecha, hora, lugar. Validaciones. RLS |
| Favoritos | `/mi-espacio/favoritos` | ✅ | Conectado a `user_favorites` |
| Lecturas | `/mi-espacio/lecturas` | ✅ | Conectado a `user_readings` |
| Historial | `/mi-espacio/historial` | ✅ | Conectado a `user_history` |
| Privacidad | `/mi-espacio/privacidad` | ✅ | Preferencias + exportación/eliminación de cuenta |
| Configuración | `/mi-espacio/configuracion` | ✅ | Ajustes de cuenta |
| Memoria IA | `/mi-espacio/memoria` | ⚠️ | Placeholder — infraestructura lista, sin IA conectada |

---

## 15. Estado del Perfil Astral

| Campo | Estado |
|---|---|
| Fecha de nacimiento | ✅ Validada |
| Hora de nacimiento | ✅ Con estado: exact / approximate / unknown |
| Lugar de nacimiento | ✅ Ciudad, región, país, código de país |
| Zona horaria | ✅ |
| Latitud / Longitud | ✅ |
| `profile_completed_at` | ✅ Auto-registrado |
| RLS | ✅ Usuario solo ve/edita su propio perfil |
| Uso en funcionalidades | ❌ Los datos natales no alimentan horóscopos personalizados (pendiente) |

---

## 16. Estado del Buscador

| Aspecto | Estado |
|---|---|
| Infraestructura | ✅ `search_index` + `search_documents` con índices |
| API | ✅ `/api/search` + `/api/search/suggestions` con server functions |
| UI | ✅ `/buscar` con query, filtros y paginación |
| Datos indexados | ❌ 19 documentos demo genéricos (tipos: page, blog, service, psychic, product) no relacionados con el contenido real del proyecto |
| Indexación automática | ❌ Sin trigger para reindexar al crear/editar contenido |
| Contenido real indexado | 0 documentos |

---

## 17. Estado de IA

| Aspecto | Estado |
|---|---|
| Gateway | ✅ `src/lib/ai/gateway.server.ts` — conecta con Lovable AI Gateway |
| Configuración | ❌ Sin `LOVABLE_API_KEY` configurada |
| Modelos | `AI_MODEL_FAST`, `AI_MODEL_REASONING`, `AI_MODEL_SAFETY` — opcionales, con defaults |
| Rate limiting | ✅ `rate-limit.server.ts` implementado |
| RAG / Retrieval | ✅ `retrieval.server.ts` implementado |
| API endpoint | `/api/ai/respond` — devuelve error 500 sin API key |
| Pipeline de horóscopos | Código completo (`generation/`, `validation/`, `rules/`) pero sin conexión al endpoint |
| Tarot con IA | No implementado |
| Asistente | `/asistente` — placeholder con UI de chat, sin backend conectado |
| Memoria IA | `/mi-espacio/memoria` — infraestructura lista, sin IA |

**Conclusión IA:** Todo el código de IA está implementado y testeado (191 tests unitarios pasan), pero **no está conectado** porque falta `LOVABLE_API_KEY`. La plataforma funciona completamente sin IA para las funcionalidades actuales (los horóscopos demo y el tarot estático no usan IA).

---

## 18. Contenido Demo o Provisional

| Texto / Patrón | Archivo(s) | Ruta(s) | Cuándo aparece | Impacto |
|---|---|---|---|---|
| `is_demo = true` | `supabase/seed/horoscopes-demo.sql`, `supabase/seed/tarot-demo.sql`, migraciones | `/horoscopo/*`, `/tarot/*`, `/compatibilidad/*` | Todo el contenido de horóscopos, tarot y compatibilidad está marcado demo | **Alto** — los usuarios ven contenido marcado como demo |
| "Próximamente" | `src/routes/horoscopo.semana.tsx`, `src/routes/horoscopo.mes.tsx`, `src/pages/compatibility/CompatibilityResultPage.tsx` | `/horoscopo/semana`, `/horoscopo/mes`, pares faltantes de compatibilidad | Cuando no hay datos para el período o par | **Alto** — 24 rutas de horóscopo + ~28 pares de compatibilidad |
| "No encontramos resultados" | `src/routes/buscar.tsx` | `/buscar` | Búsqueda sin resultados | Medio |
| `image_key` sin asset | `src/lib/tarot/mappers.ts`, `src/lib/moon/repository.ts` | `/tarot/*`, `/luna/fases/*` | Todas las cartas y fases lunares | **Alto** — sin imágenes en todo el sitio |
| Placeholder CSS | `src/components/tarot/DailyTarotCard.tsx` | Home, `/tarot/carta-del-dia` | Antes de "revelar" la carta | Medio — experiencia degradada |
| Documentos search demo | `src/server/search-index.ts` | `/buscar` | Búsqueda devuelve resultados genéricos no relacionados | Medio |

---

## 19. Promesas Incumplidas de Interfaz

| ID | Botón / Promesa | Ruta origen | Resultado real |
|---|---|---|---|
| AUD-P1-008 | "Ver mi horóscopo" (Home) | `/horoscopo/hoy` | Muestra contenido demo |
| AUD-P1-009 | "Leer horóscopo completo" | `/horoscopo/:sign` | Solo período diario demo; semanal/mensual vacío |
| AUD-P1-010 | "Revelar carta" (Home) | In-page | Muestra solo texto, sin imagen de carta |
| AUD-P1-011 | "Sacar una carta" (Home) | `/tarot/carta-del-dia` | Selecciona de 8 cartas, sin imagen |
| AUD-P1-012 | "Realizar una lectura" | `/tarot/carta-del-dia` | Funciona pero con baraja incompleta (8/78) |
| AUD-P1-013 | "Descubrir la luna de hoy" | `/luna/hoy` | ✅ Funcional |
| AUD-P1-014 | "Ver compatibilidad" (Home) | `/compatibilidad/:signA/:signB` | ⚠️ ~36% de pares sin contenido |
| AUD-P1-015 | "Ver todo" (Guías) | `/guias` | 1 artículo demo |
| AUD-P1-016 | Página de autor | `/autores/:slug` | Datos de Supabase — requiere contenido real |
| AUD-P1-017 | Buscador | `/buscar` | Indexado con datos demo genéricos |
| AUD-P1-018 | "Guardar lectura" | Tarot / Horóscopo | Código existe pero no conectado a UI |
| AUD-P1-019 | Asistente IA | `/asistente` | Placeholder — sin backend IA |
| AUD-P2-001 | Cambio de período (semanal/mensual) | `/horoscopo/:sign` | Selector funciona pero no hay datos |
| AUD-P2-002 | "Memoria IA" | `/mi-espacio/memoria` | Infraestructura sin IA |

---

## 20. Diferencias Local / Producción

| Módulo | Estado |
|---|---|
| Build | ✅ FUNCIONA LOCAL Y PRODUCCIÓN (mismo código) |
| SSR | ✅ FUNCIONA LOCAL Y PRODUCCIÓN (Nitro + TanStack Start) |
| Supabase | ⚠️ FUNCIONA SOLO LOCAL (requiere variables en Vercel) |
| Auth | ⚠️ FUNCIONA SOLO LOCAL (callback URLs configuradas para localhost) |
| IA | ❌ NO FUNCIONA (sin `LOVABLE_API_KEY` en ningún entorno) |
| Imágenes | ❌ NO FUNCIONA (sin assets en ningún entorno) |
| SEO (sitemap) | ❌ NO FUNCIONA (no generado) |

---

## 21. Errores de Consola y Red

| Ubicación | Tipo | Impacto |
|---|---|---|
| `src/server.ts` | `console.error` (SSR error capture) | Bajo — intencional para debugging |
| `src/start.ts` | `console.error` | Bajo — intencional |
| `src/lib/error-capture.ts` | Sobrescribe `console.error` | Bajo — error pipeline |
| `src/integrations/supabase/client.ts` | `console.error` si faltan variables | Medio — esperado sin config |
| `src/integrations/supabase/client.server.ts` | `console.error` si faltan variables | Medio — esperado sin config |
| `src/pages/account/AccountSettingsPage.tsx` | `console.error` en catch | Bajo — errores de usuario |
| `src/components/SectionErrorBoundary.tsx` | `console.error` solo en DEV | Bajo — solo desarrollo |
| `src/routes/__root.tsx` | `console.error` en error boundary | Bajo — intencional |

---

## 22. Seguridad

| Aspecto | Estado |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` en cliente | ✅ No expuesta — solo en `client.server.ts` |
| `LOVABLE_API_KEY` en cliente | ✅ No expuesta — solo en `gateway.server.ts` |
| `VITE_` para secretos | ✅ Ningún secreto usa prefijo `VITE_` |
| RLS en Supabase | ✅ Políticas en 15 migraciones |
| Rutas admin protegidas | ✅ Layout `_authenticated` + server-side role check |
| `service_role` en admin functions | ✅ Uso correcto — solo en `.server.ts` y server functions |
| Sanitización | ⚠️ `dangerouslySetInnerHTML` en `chart.tsx` (CSS themes, bajo riesgo) |
| Rate limiting | ✅ Implementado para IA (`rate-limit.server.ts`) |
| `noindex` en rutas privadas | ❌ No implementado |
| Logs sin datos sensibles | ✅ Consola no expone PII |
| Cambio de contraseña sin contraseña actual | ⚠️ Riesgo medio — sesión hijacked permite cambiar password |

---

## 23. SEO

| Aspecto | Estado |
|---|---|
| `<title>` | ✅ Genérico en `__root.tsx` |
| `<meta description>` | ⚠️ Genérico, sin personalización por ruta |
| Canonical | ❌ No implementado |
| Open Graph | ❌ No implementado |
| Twitter Cards | ❌ No implementado |
| Schema.org | ❌ No implementado |
| `robots.txt` | ✅ Permite todos los crawlers |
| Sitemap | ❌ No existe |
| `noindex` en admin/mi-espacio/auth | ❌ No implementado |
| Páginas demo indexables | ⚠️ Los 12 horóscopos demo y las 8 cartas demo son indexables sin `noindex` |
| Páginas vacías indexables | ⚠️ `/horoscopo/semana`, `/horoscopo/mes` con "Próximamente" son indexables |
| Contenido duplicado | ⚠️ Riesgo: mismo contenido base en `/horoscopo/:sign` para diferentes signos |
| Slug canónico | ✅ Estructura de slugs implementada |

---

## 24. Responsive

| Aspecto | Estado |
|---|---|
| Mobile-first | ✅ Tailwind CSS + Radix UI responsive |
| Navegación móvil | ✅ Menú responsive |
| Formularios | ✅ Auth, perfil, admin — responsive |
| Tablas (admin) | ⚠️ Scroll horizontal en móvil (esperado para datos tabulares) |
| Cartas de tarot | ✅ Grid responsivo |
| Modal/Dialogs | ✅ Radix UI dialog responsive |
| Touch targets | ✅ Botones y enlaces con tamaño adecuado |
| Overflow | ✅ Sin overflow horizontal detectado en estructura |

---

## 25. Backlog Priorizado

### P0 — BLOQUEA PUBLICACIÓN (7)

| ID | Hallazgo |
|---|---|
| AUD-P0-001 | 0 horóscopos semanales y mensuales (24 rutas vacías) |
| AUD-P0-002 | Baraja de tarot: 8/78 cartas (faltan 70) |
| AUD-P0-003 | 0 imágenes de tarot (78 requeridas) |
| AUD-P0-004 | 0 imágenes en todo el sitio (signos, cartas, luna, hero) |
| AUD-P0-005 | Pipeline IA no conectado (sin `LOVABLE_API_KEY`) |
| AUD-P0-006 | Sin sitemap |
| AUD-P0-007 | Sin SEO por ruta (meta tags, OG, canonical) |

### P1 — FUNCIÓN PRINCIPAL ROTA O INCOMPLETA (12)

| ID | Hallazgo |
|---|---|
| AUD-P1-001 | ~28 pares de compatibilidad faltantes |
| AUD-P1-002 | Search index con datos demo no relacionados |
| AUD-P1-003 | Solo 1 artículo editorial |
| AUD-P1-004 | Carta del día sin imagen |
| AUD-P1-005 | "Próximamente" en horóscopos semanal/mensual |
| AUD-P1-006 | Sin automatización (cron/scheduler) |
| AUD-P1-007 | IA no conectada |
| AUD-P1-008 | Botón home "Ver mi horóscopo" → contenido demo |
| AUD-P1-009 | "Leer horóscopo completo" → semanal/mensual vacío |
| AUD-P1-010 | "Revelar carta" sin imagen |
| AUD-P1-011 | Baraja incompleta (8/78 cartas) |
| AUD-P1-012 | "Realizar una lectura" con baraja parcial |

### P2 — EXPERIENCIA INCOMPLETA (15)

| ID | Hallazgo |
|---|---|
| AUD-P2-001 | Selector de período sin datos |
| AUD-P2-002 | Memoria IA sin IA |
| AUD-P2-003 | Cambio de contraseña sin verificación actual |
| AUD-P2-004 | Sin Google OAuth |
| AUD-P2-005 | Sin imágenes de fases lunares |
| AUD-P2-006 | Sin imágenes de signos zodiacales |
| AUD-P2-007 | Sin avatar de autores |
| AUD-P2-008 | Sin OG images |
| AUD-P2-009 | Sin Schema.org |
| AUD-P2-010 | Sin noindex en rutas privadas |
| AUD-P2-011 | Páginas demo indexables |
| AUD-P2-012 | Console.error en producción |
| AUD-P2-013 | `is_demo = true` en todo el contenido |
| AUD-P2-014 | Sin favicon de alta resolución (solo .ico) |
| AUD-P2-015 | Asistente IA sin backend |

---

## 26. Plan Recomendado de Corrección por Fases

### FASE A — BLOQUEOS Y DATOS FALTANTES (P0)
**Objetivo:** Que la plataforma tenga contenido real suficiente para todos los recorridos críticos.

| Tarea | Hallazgos | Archivos | Agente |
|---|---|---|---|
| Completar baraja de tarot (70 cartas) | AUD-P0-002 | `supabase/migrations/` (nueva), `supabase/seed/tarot-demo.sql` | Antigravity + Codex |
| Crear/generar imágenes de cartas | AUD-P0-003, AUD-P0-004 | `public/images/tarot/`, Supabase Storage | Antigravity (inventario) + Usuario (assets) |
| Generar horóscopos semanales y mensuales (12×2 = 24) | AUD-P0-001 | `supabase/seed/` o script de generación | Antigravity (contenido) + Codex (script) |
| Completar pares de compatibilidad (~28) | AUD-P1-001 | `supabase/seed/compatibility-demo.sql` | Antigravity |
| Conectar `LOVABLE_API_KEY` | AUD-P0-005 | Vercel env vars | Usuario |
| Generar sitemap | AUD-P0-006 | `src/routes/sitemap.xml.ts` (nuevo) | Codex |
| Implementar SEO por ruta | AUD-P0-007 | `src/routes/__root.tsx`, rutas individuales | Codex |

### FASE B — TAROT COMPLETO (P1)
**Objetivo:** Experiencia de tarot con baraja completa e imágenes.

| Tarea | Hallazgos | Archivos | Agente |
|---|---|---|---|
| Completar 78 cartas con contenido | AUD-P0-002 | `supabase/seed/tarot-demo.sql` | Antigravity |
| Asignar/crear imágenes | AUD-P0-003 | Assets + DB `image_key` | Antigravity + Usuario |
| Conectar persistencia de lecturas | AUD-P1-011 | `src/lib/tarot/`, `src/server/persistence/` | Codex |
| Implementar seed para reproducibilidad | — | `src/lib/tarot/random.ts` | Codex |

### FASE C — CONTENIDO EDITORIAL (P1)
**Objetivo:** Plataforma con contenido real, no solo demo.

| Tarea | Hallazgos | Archivos | Agente |
|---|---|---|---|
| Crear 5-10 artículos reales | AUD-P1-003 | Supabase (admin panel) | Usuario + Antigravity |
| Indexar contenido en buscador | AUD-P1-002 | `src/server/search/` | Codex |
| Eliminar `is_demo = true` del contenido publicado | AUD-P2-013 | Supabase | Usuario |

### FASE D — IMÁGENES Y ASSETS (P0/P1)
**Objetivo:** Completar assets visuales del sitio.

| Tarea | Hallazgos | Archivos | Agente |
|---|---|---|---|
| Imágenes de 78 cartas de tarot | AUD-P0-003 | `public/images/tarot/` | Usuario (diseño) |
| Imágenes de 12 signos | AUD-P0-004 | `public/images/signs/` | Usuario (diseño) |
| Imágenes de 8 fases lunares | AUD-P2-005 | `public/images/moon/` | Usuario (diseño) |
| OG images | AUD-P2-008 | `public/images/og/` | Usuario (diseño) |
| Avatares de autores | AUD-P2-007 | Supabase Storage | Usuario |

### FASE E — IA Y AUTOMATIZACIÓN (P0/P1)
**Objetivo:** Conectar pipeline de generación automática.

| Tarea | Hallazgos | Archivos | Agente |
|---|---|---|---|
| Configurar `LOVABLE_API_KEY` en Vercel | AUD-P0-005 | Vercel Dashboard | Usuario |
| Conectar pipeline a endpoint `/api/ai/respond` | AUD-P1-007 | `src/lib/ai/`, `src/server/generation/` | Codex |
| Implementar cron/scheduler | AUD-P1-006 | `vercel.json` (cron), `src/server/cron/` | Codex |
| Conectar persistencia post-generación | — | `src/server/persistence/` | Codex |

### FASE F — CUENTA Y PERSISTENCIA (P2)
**Objetivo:** Completar funcionalidades de usuario.

| Tarea | Hallazgos | Archivos | Agente |
|---|---|---|---|
| Exigir contraseña actual para cambio | AUD-P2-003 | `src/pages/account/AccountSettingsPage.tsx` | Codex |
| Conectar favoritos/lecturas en UI | AUD-P1-018 | `src/components/account/` | Codex |
| Google OAuth | AUD-P2-004 | Supabase Auth + `src/routes/auth.callback.tsx` | Codex |

### FASE G — SEO Y PRODUCCIÓN (P0/P2)
**Objetivo:** Preparar para indexación y despliegue público.

| Tarea | Hallazgos | Archivos | Agente |
|---|---|---|---|
| Sitemap dinámico | AUD-P0-006 | `src/routes/sitemap.xml.ts` | Codex |
| Meta tags por ruta | AUD-P0-007 | `__root.tsx`, `horoscopo.$sign.tsx`, etc. | Codex |
| `noindex` en rutas privadas | AUD-P2-010 | `_authenticated/route.tsx` | Codex |
| Canonical URLs | AUD-P0-007 | Por ruta | Codex |
| Schema.org (Article, WebSite) | AUD-P2-009 | `__root.tsx`, `guias.$slug.tsx` | Codex |
| Verificar callback URLs en Vercel | SEC-001 | Vercel Dashboard + Supabase | Usuario |

### FASE H — PRUEBA FINAL
**Objetivo:** Verificar todos los recorridos críticos.

| Recorrido | Responsable |
|---|---|
| 12 signos × 3 períodos con contenido real | Cline (auditoría) |
| 78 cartas con imagen | Cline |
| 78 pares de compatibilidad | Cline |
| Búsqueda con contenido real | Cline |
| Auth completa (registro, confirmación, reset, cambio) | Cline |
| Perfil astral | Cline |
| Publicación en Vercel preview | Usuario |
| Responsive móvil | Cline |

---

## 27. Archivos Probablemente Implicados

| Fase | Archivos clave |
|---|---|
| A (Datos) | `supabase/seed/horoscopes-demo.sql`, `supabase/seed/tarot-demo.sql`, `supabase/migrations/` (nuevas) |
| B (Tarot) | `src/lib/tarot/mappers.ts`, `src/components/tarot/`, `src/routes/tarot.*`, `src/data/tarot.ts` |
| C (Editorial) | Supabase DB (admin panel), `src/routes/guias.*`, `src/routes/autores.*` |
| D (Imágenes) | `public/images/` (nuevo), Supabase Storage, `src/components/tarot/DailyTarotCard.tsx` |
| E (IA) | `src/lib/ai/gateway.server.ts`, `src/server/generation/`, `src/routes/api/ai/respond.ts` |
| F (Cuenta) | `src/pages/account/`, `src/components/account/`, `src/lib/ai/account.functions.ts` |
| G (SEO) | `src/routes/__root.tsx`, `src/routes/sitemap.xml.ts` (nuevo), `src/routes/_authenticated/route.tsx` |

---

## 28. Evidencias

### Tests
- `npx vitest run`: 191 tests pasan (9 suites), 4 suites sin contenido (placeholder)
- Build: `npm run build` exit 0 (~11s), genera `.output/public/` y `.output/server/`

### Migraciones
- 16 migraciones en `supabase/migrations/` aplicadas (según contexto confirmado)

### Datos en Supabase (según seeds y migraciones)
- 12 horóscopos diarios demo (`horoscopes` table, `is_demo = true`)
- 8 cartas de tarot (`tarot_cards` table, `is_demo = true`)
- ~50 pares de compatibilidad (`compatibility_pairs`)
- 1 artículo publicado demo (`editorial_articles`)
- 8 fases lunares con contenido editorial real (`moon_phase_content`)

---

## Resumen de Consola

```
═══════════════════════════════════════════════════════
AUDITORÍA MAESTRA FUNCIONAL — CREOVISION
═══════════════════════════════════════════════════════
VEREDICTO:     NO APROBADO PARA PUBLICACIÓN
P0 (bloqueos): 7   | P1 (roturas):   12   | P2 (incompleto): 15
═══════════════════════════════════════════════════════
✅ Build compila (exit 0)
✅ 191 tests unitarios pasan
✅ Autenticación completa (registro, login, reset, PKCE)
✅ Luna: cálculos astronómicos reales (8 fases)
✅ Perfil astral: CRUD completo con RLS
✅ Mi Espacio: favoritos, lecturas, historial, privacidad
❌ Horóscopos: SOLO 12 diarios demo (0 semanal, 0 mensual)
❌ Tarot: 8/78 cartas, 0 imágenes, 70 cartas faltantes
❌ Compatibilidad: ~28/78 pares faltantes
❌ Imágenes: 0 assets reales en todo el sitio
❌ Contenido editorial: 1 artículo demo
❌ Buscador: 19 docs demo genéricos (sin indexación real)
❌ IA: Desconectada (sin LOVABLE_API_KEY)
❌ SEO: Sin sitemap, sin OG, sin canonical
❌ Automatización: Sin cron/scheduler
═══════════════════════════════════════════════════════
ORDEN DE CORRECCIÓN:
FASE A → Datos (tarot 78 cartas, horóscopos, compatibilidad)
FASE B → Tarot completo (contenido + imágenes)
FASE C → Contenido editorial (artículos reales)
FASE D → Imágenes y assets
FASE E → IA y automatización
FASE F → Cuenta y persistencia
FASE G → SEO y producción
FASE H → Prueba final (20 recorridos críticos)
═══════════════════════════════════════════════════════
ARCHIVO COMPLETO:
documentacion/AUDITORIA_MAESTRA_FUNCIONAL_CREOVISION.md
═══════════════════════════════════════════════════════
