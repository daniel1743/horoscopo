# Auditoria Codex de Contradicciones - Creovision

Fecha de auditoria: 2026-07-30
Repositorio: `horoscopo`
Rama declarada: `feature/fase-2c-general-transit-engine`
Dominio revisado: `https://www.creovision.io`
Supabase correcto observado: `mmfendqrucasrcsfsvpw`
Supabase antiguo prohibido: `kjthdlbuoojcxadglmne`

## 1. Veredicto independiente

No apruebo la clasificacion "listo para publicacion". La aplicacion compila y varias rutas responden, pero hay contradicciones materiales entre seed, codigo, RLS anonimo y produccion. El hallazgo mas importante es que el contenido remoto publico no coincide con varias cifras de auditorias previas: horoscopos publicos remotos son 0, compatibilidad publica remota son 3 pares, tarot publico remoto son 8 cartas demo, articulos publicos remotos son 1 articulo demo y luna publica remota son 8 fases demo.

La auditoria maestra acierta en la direccion general: plataforma tecnicamente amplia pero con contenido insuficiente. Sin embargo, sus cifras de 57 rutas y aproximadamente 50 pares de compatibilidad no quedan demostradas por esta revision.

## 2. Metodologia

Se contrastaron afirmaciones con estas fuentes:

- FUENTE A - CODIGO: `src/routes`, `src/lib`, `src/server`, `src/services`, repositorios Supabase.
- FUENTE B - TESTS: `npx vitest run src/lib/account/auth-profile.test.ts`; builds previos de esta sesion con `npm run build`.
- FUENTE C - SEEDS: `supabase/seed/horoscopes-demo.sql`, `supabase/seed/tarot-demo.sql`.
- FUENTE D - MIGRACIONES: `supabase/migrations/*`.
- FUENTE F - CLIENTE PUBLICO: consultas REST con publishable key bajo RLS anonimo.
- FUENTE H - PRODUCCION: `GET https://www.creovision.io/...` en rutas publicas seleccionadas.
- FUENTE I - LOCAL: `GET http://127.0.0.1:8080/auth/update-password` en revision previa inmediata.

No se uso `service_role`, no se ejecuto SQL, no se modificaron datos, no se hizo deploy y no se imprimieron claves.

## 3. Limitaciones

- No se obtuvo una sesion autenticada de usuario real para probar FUENTE G.
- No se uso service role; por tanto "total absoluto remoto" solo puede afirmarse cuando RLS publico permite verlo. Donde no, se marca no verificado.
- Las pruebas de produccion fueron HTTP GET y no recorridos E2E completos con interaccion.
- No se verificaron carpetas de spam/correo ni dashboards privados de Supabase.
- La worktree estaba sucia antes de este informe; esta auditoria no revierte ni normaliza cambios previos.

## 4. Fuentes revisadas

- `documentacion/AUDITORIA_MAESTRA_FUNCIONAL_CREOVISION.md`
- `documentacion/fase-2b/AUDITORIA_CLINE_FASE_2B.md`
- `supabase/seed/horoscopes-demo.sql`
- `supabase/seed/tarot-demo.sql`
- `supabase/migrations/20260727225111_*.sql`
- `supabase/migrations/20260727230101_*.sql`
- `supabase/migrations/20260727231128_*.sql`
- `supabase/migrations/20260727234835_*.sql`
- `supabase/migrations/20260728000558_*.sql`
- `supabase/migrations/20260728001017_*.sql`
- `src/routes/**`
- `src/lib/horoscope/repository.ts`
- `src/repositories/supabase-compatibility.repository.ts`
- `src/repositories/supabase-tarot.repository.ts`
- `src/services/tarot.service.ts`
- `src/lib/tarot/card-selection.ts`
- `src/lib/moon/moon.functions.ts`
- `src/server/moon/astronomy-moon-engine.ts`
- `src/routes/api/ai/respond.ts`
- `src/lib/ai/gateway.server.ts`
- `src/server/generation/*`, `src/server/planetary/*`, `src/server/aspects/*`, `src/server/transits/*`

## 5. Tabla comparativa de los tres auditores

| ID | Tema | Antigravity / auditoria maestra | Cline | Hallazgo Codex | Evidencia Codex | 3/3 | 2/3 | Contradiccion | Confianza | Accion recomendada |
|---|---|---|---|---|---|---|---|---|---|---|
| C-01 | Horoscopos | 12 diarios demo en seed / sin semanal mensual | No localizado sobre modulo funcional | Seed define 12 diarios demo; remoto publico `horoscopes` devuelve 0 | C, F, A | No | Si, sobre insuficiencia | Seed no equivale a remoto | Alto para F; Medio general | Verificar aplicacion de seeds antes de corregir |
| C-02 | Compatibilidad | Aproximadamente 50 pares | No localizado | Remoto publico tiene 3: `aries__libra`, `cancer__capricornio`, `geminis__sagitario`; esperado canonico 78 | D, F, A | No | Si, incompleto | "~50" no demostrado | Alto | Corregir solo tras decidir fuente canonica |
| C-03 | Articulos | 1 publicado demo + 1 draft | No localizado | Publico remoto ve 1 publicado demo; migracion inserta 1 publicado; draft no demostrado por RLS anonimo | D, F | No | Parcial | Draft no demostrado remotamente | Medio | Verificar con usuario admin/SQL read-only |
| C-04 | Tarot | 8 cartas, faltan 70, demo, sin imagen real | No localizado | Confirmado publico: 8 major published demo; faltan 70 de 78 | C, D, F, A | No | Si | Sin contradiccion sustantiva | Alto | Corregir despues de priorizar contenido |
| C-05 | Imagenes | "0 imagenes reales" salvo favicon | No localizado | Raster local: solo `public/favicon.ico`; SVG inline si existen; DB tiene image_key/image_url sin assets visibles publicos | A, F | No | Si | "cero imagenes" es impreciso por favicon/SVG inline | Alto | Separar imagenes funcionales de decorativas |
| C-06 | IA | Falta `LOVABLE_API_KEY`; pipeline no conectado | Cline audito AspectEngine, no IA completa | Endpoint AI existe; gateway usa `LOVABLE_API_KEY`; motores astrologicos y generador existen, pero no hay cron/publicacion automatica conectada | A | No | Si, pipeline incompleto | "solo falta key" no basta | Medio | Verificar produccion y pipeline antes de activar |
| C-07 | Auth | Declarada completa | No localizado | Codigo cubre signup/login/callback/recovery/update; produccion GET responde, pero recorridos reales contradichos por reportes recientes del usuario | A, H, I, usuario | No | Parcial | HTTP 200 no prueba auth funcional | Medio | Mantener como P0/P1 hasta E2E |
| C-08 | Luna | Calculo real astronomy-engine | No localizado | Confirmado por codigo serverFn + `astronomy-engine`; publico remoto ve 8 fases demo | A, F | No | Si | Funcionalidad de produccion no E2E | Medio-Alto | Probar E2E produccion |
| C-09 | Mi espacio | Declarado funcional | No localizado | Existen rutas/tablas/RLS y componentes; no probado con usuario autenticado real | A | No | Parcial | Estructura no equivale a flujo | Bajo-Medio | Probar con cuenta real |
| C-10 | Rutas | 57 rutas | No localizado | `rg createFileRoute` devuelve 59: 16 protegidas, 3 API, 40 publicas/layout | A | No | No | Cifra 57 refutada por inventario actual | Alto | Actualizar inventario |
| C-11 | AspectEngine | No foco en maestra | Cline: bug matematico de fase | Codigo existe y tests no fueron re-auditados profundamente en este dictamen | A, doc Cline | No | No | No demostrado por Codex | Bajo | Reauditar aparte |

## 6. Hallazgos confirmados por los tres

No hay hallazgos que pueda declarar confirmados por los tres con evidencia independiente completa. Solo se localizaron dos documentos previos relevantes y Cline audita principalmente AspectEngine, no todos los modulos funcionales solicitados.

## 7. Hallazgos confirmados por dos de tres

- Tarot incompleto: 8 cartas existentes, faltan 70 para una baraja de 78. Evidencia Codex: API publica `tarot_cards` devuelve 8 filas published demo.
- Imagenes funcionales insuficientes: no hay raster local salvo favicon; tarot/luna usan `image_key` sin asset local observado. Evidencia Codex: inventario local y API publica.
- Pipeline IA/generacion no debe considerarse listo por existir endpoint. Evidencia Codex: endpoint `/api/ai/respond` es asistente streaming; pipeline de horoscopos generados existe en `src/server/generation` pero no se observo cron/publicacion conectada.
- Luna usa calculo real en codigo: `src/lib/moon/moon.functions.ts` importa dinamicamente `astronomy-moon-engine`; el motor usa `astronomy-engine`.

## 8. Hallazgos contradictorios

- Horoscopos: "12 diarios demo" es verdad en seed, pero falso como dato remoto publico actual. API publica `horoscopes` devolvio `*/0`.
- Compatibilidad: "~50 pares" no se sostiene. Migracion y API publica muestran 3 pares demo publicados.
- Rutas: no son 57 por inventario actual, son 59 `createFileRoute`.
- Imagenes: "cero imagenes" es impreciso. Existe `public/favicon.ico` y SVG inline; lo correcto es "sin imagenes funcionales raster para tarot/luna/signos/articulos observadas localmente".

## 9. Hallazgos no demostrados

- Total absoluto remoto con filas ocultas por RLS.
- Total visible autenticado normal.
- Separacion de usuarios en Mi espacio.
- Produccion funcional completa para auth, tarot, luna, compatibilidad y guardado.
- Existencia real de draft editorial remoto.
- Resolucion de `image_key` en Storage privado o buckets no publicos.
- Cifra exacta de botones funcionales E2E; se inventariaron apariciones de CTAs, no se ejecuto E2E de cada boton.

## 10. Estado real de Supabase

Consulta publica bajo RLS anonimo, proyecto `mmfendqrucasrcsfsvpw`:

| Tabla | Resultado publico |
|---|---:|
| `horoscopes` | 0 |
| `tarot_cards` | 8 |
| `compatibility_profiles` | 3 |
| `editorial_articles` | 1 |
| `moon_phase_content` | 8 |
| `search_documents` | consulta anonima usada fallo 400 por seleccion/campos; no concluyente |

Esto no prueba total absoluto remoto si existen filas no publicas.

## 11. Estado real de horoscopos

- Seeds: `supabase/seed/horoscopes-demo.sql` define 12 filas `daily`, `is_demo=true`, `published_at=now()`.
- Migraciones: crean tabla y RLS; no se observo insert masivo de horoscopos en migraciones.
- Remoto publico: 0 filas.
- Visible anonimo: 0.
- Visible autenticado: no probado.
- Frontend: `src/lib/horoscope/repository.ts` consulta Supabase; `HoroscopePeriodPage` muestra mensaje de ausencia si `entries.length === 0`.
- Fallback local: no se observo fallback local de contenido de horoscopo; hay estado vacio.
- Dictamen: la afirmacion "12 horoscopos demo" solo es valida como seed, no como produccion/remoto actual.

## 12. Estado real de tarot

- Remoto publico: 8 cartas.
- Nombres: El Loco, El Mago, La Sacerdotisa, La Emperatriz, Los Enamorados, La Fuerza, El Ermitano, La Estrella.
- `arcana`: todas `major`.
- `status`: todas `published`.
- `is_demo`: todas `true`.
- `image_key`: presente en todas; no se probo resolucion real en Storage con objeto concreto.
- Assets locales: no hay imagen raster local de cartas.
- Mapper: `src/lib/tarot/mappers.ts`.
- UI: `TarotCardVisual`/experiencias muestran representacion visual de UI, no imagen raster real de carta.
- Carta del dia: usa deck publicado y seleccion determinista por fecha/semilla anonima.
- Tres cartas: usa `drawUniqueCards`, sin repeticion.
- Si/No: usa `drawOneCard` sobre la baraja publicada disponible.

## 13. Estado real de compatibilidad

- Total canonico esperado: 78 pares unicos con repeticion propia incluida.
- Seeds/migraciones: migracion `20260728001017_*` inserta 3 demo publicados.
- Remoto publico: 3.
- Publicados: 3, todos `is_demo=true`.
- No demo: 0 visibles anonimamente.
- Pair keys presentes: `aries__libra`, `cancer__capricornio`, `geminis__sagitario`.
- Pares faltantes canonicos: 75. Lista: `aries__aries`, `aries__tauro`, `aries__geminis`, `aries__cancer`, `aries__leo`, `aries__virgo`, `aries__escorpio`, `aries__sagitario`, `aries__capricornio`, `aries__acuario`, `aries__piscis`, `tauro__tauro`, `tauro__geminis`, `tauro__cancer`, `tauro__leo`, `tauro__virgo`, `tauro__libra`, `tauro__escorpio`, `tauro__sagitario`, `tauro__capricornio`, `tauro__acuario`, `tauro__piscis`, `geminis__geminis`, `geminis__cancer`, `geminis__leo`, `geminis__virgo`, `geminis__libra`, `geminis__escorpio`, `geminis__capricornio`, `geminis__acuario`, `geminis__piscis`, `cancer__cancer`, `cancer__leo`, `cancer__virgo`, `cancer__libra`, `cancer__escorpio`, `cancer__sagitario`, `cancer__acuario`, `cancer__piscis`, `leo__leo`, `leo__virgo`, `leo__libra`, `leo__escorpio`, `leo__sagitario`, `leo__capricornio`, `leo__acuario`, `leo__piscis`, `virgo__virgo`, `virgo__libra`, `virgo__escorpio`, `virgo__sagitario`, `virgo__capricornio`, `virgo__acuario`, `virgo__piscis`, `libra__libra`, `libra__escorpio`, `libra__sagitario`, `libra__capricornio`, `libra__acuario`, `libra__piscis`, `escorpio__escorpio`, `escorpio__sagitario`, `escorpio__capricornio`, `escorpio__acuario`, `escorpio__piscis`, `sagitario__sagitario`, `sagitario__capricornio`, `sagitario__acuario`, `sagitario__piscis`, `capricornio__capricornio`, `capricornio__acuario`, `capricornio__piscis`, `acuario__acuario`, `acuario__piscis`, `piscis__piscis`.
- Inversion de orden: `normalizeSignPair` normaliza a orden zodiacal y URL canonica.

## 14. Estado real de articulos

- Migracion editorial inserta 1 articulo publicado demo.
- Remoto publico: 1 articulo `articulo-de-demostracion`, `status=published`, `is_demo=true`, `image_url=null`.
- Draft remoto: no demostrado con RLS anonimo.
- Archived remoto: no demostrado.
- Con imagen publico: 0.
- Sin imagen publico: 1.

## 15. Estado real de imagenes

- Raster local: `public/favicon.ico` solamente.
- SVG locales como archivo: ninguno observado.
- SVG inline: existen en `HomeHero`, `MoonPhaseVisual`, `AuthPage` y otros componentes.
- Favicon: existe.
- Supabase Storage: consultas publicas a buckets comunes devolvieron respuesta 200 con cuerpo nulo/sin objetos listados; no concluye sobre buckets privados.
- URLs externas: no se inventariaron como funcionales.
- `image_url` DB: articulo publico tiene `null`.
- `image_key` DB: tarot y luna lo tienen, pero sin asset local.
- Imagenes visibles: hay visuales SVG/CSS; no hay cartas/luna/signos como imagen raster real observada.

## 16. Estado real de IA

| Etapa | Estado Codex |
|---|---|
| PlanetaryEngine | IMPLEMENTADO Y TESTEADO; conexion a publicacion no demostrada |
| AspectEngine | IMPLEMENTADO Y TESTEADO; Cline reporta bug matematico no revalidado aqui |
| General Transit Engine | IMPLEMENTADO Y TESTEADO; no observado conectado a cron/publicacion |
| Reglas astrologicas | IMPLEMENTADAS/PARCIALES en `src/server/rules` |
| Generacion estructurada | IMPLEMENTADA Y TESTEADA en `src/server/generation` |
| Prompts | IMPLEMENTADOS en generacion y asistente |
| Gateway proveedor | IMPLEMENTADO para Lovable AI en `src/lib/ai/gateway.server.ts` |
| Validacion | IMPLEMENTADA en `src/server/validation` |
| Persistencia | IMPLEMENTADA/TESTEADA en `src/server/persistence`, conexion productiva a tabla no demostrada |
| Publicacion | AUSENTE/NO DEMOSTRADA para pipeline automatico de horoscopos |
| Cron | AUSENTE |
| Reintentos | PARCIAL: gateway marca retryable, no se observo politica de reintento completa |
| Fallback | IMPLEMENTADO en generador |
| Deduplicacion | NO DEMOSTRADA |
| Monitoreo | PARCIAL/logs; no monitoreo productivo demostrado |

No es correcto declarar "IA lista" solo porque `/api/ai/respond` existe.

## 17. Estado real de Luna

- Calculo real: confirmado por `astronomy-engine` en `src/server/moon/astronomy-moon-engine.ts`.
- ServerFn: confirmado en `src/lib/moon/moon.functions.ts`.
- Calendario/fase actual: codigo conectado por `moonQueries`; produccion GET `/luna` responde 200, no E2E.
- Contenido editorial remoto publico: 8 fases published demo.
- Imagenes: `image_key` sin asset raster local observado.
- Cache: tabla/cache existe en codigo, uso efectivo no demostrado en path principal.
- Fallback/error si servidor cae: componentes `MoonUnavailableState` existen; comportamiento real no probado.

## 18. Estado real de autenticacion

- Registro/login/recuperacion/callback/update password: codigo existe.
- `/auth/update-password`: produccion GET 200 y contiene texto de actualizar contrasena; local previo tambien 200.
- PKCE recovery: implementacion reciente procesa `code` y `PASSWORD_RECOVERY`.
- Logout/persistencia: codigo existe, no E2E autenticado completo.
- Cambio voluntario desde configuracion: `AccountSettingsPage` usa `updateUser({ password })`; separado del recovery.
- Riesgo actual: reportes del usuario indican comportamientos intermitentes y bundles/cache con `/rest/v1/auth/v1`; por tanto auth critica debe quedar como no completamente aprobada hasta E2E en produccion.

## 19. Estado real de Mi espacio

- Rutas protegidas existen bajo `/_authenticated`.
- Guard usa `supabase.auth.getUser()` y redirige a `/auth`.
- Tablas/RLS para perfil, favoritos, lecturas, historial y privacidad existen en migraciones.
- Componentes y funciones existen.
- No se probo con usuario real: persistencia tras recarga, separacion de usuarios y errores RLS quedan NO PROBADOS.

## 20. Estado local vs produccion

Produccion GET revisado:

| Ruta | Estado |
|---|---:|
| `/` | 200 |
| `/auth` | 200 |
| `/auth/update-password` | 200 |
| `/horoscopo/hoy` | 200 |
| `/tarot` | 200 |
| `/tarot/carta-del-dia` | 200 |
| `/compatibilidad` | 200 |
| `/luna` | 200 |
| `/buscar` | 200 |
| `/mi-espacio` | 200 |

Esto solo prueba respuesta HTML; no prueba recorrido funcional, datos correctos ni autenticacion.

## 21. Reclasificacion P0/P1/P2/P3

P0:

- Autenticacion critica con reportes recientes de fallo/intermitencia en login/recovery en produccion o cache: P0 hasta E2E estable.
- Posible exposicion de secretos en `.env` local: P0 operativo local, requiere rotacion fuera de esta auditoria.

P1:

- Horoscopos remotos publicos 0.
- Compatibilidad publica real 3/78.
- Tarot incompleto 8/78.
- Mi espacio no probado E2E con usuario real.
- Pipeline de generacion/publicacion ausente o no conectado.

P2:

- Imagenes funcionales faltantes.
- SEO/sitemap/OG si no estan completos.
- Contenido editorial insuficiente.
- Buscador no verificado con indice real.

P3:

- Mejoras visuales, microinteracciones, avatares y optimizaciones menores.

## 22. Lista segura de correcciones inmediatas

Solo despues de aprobar esta auditoria y sin mezclar con migraciones masivas:

- Resolver E2E de autenticacion en produccion/cache y confirmar que no se llama `/rest/v1/auth/v1`.
- Alinear variables de produccion de Vercel/Supabase URL con raiz del proyecto.
- Documentar que seeds no estan aplicados remotamente para horoscopos.
- Ajustar auditoria/ruta de inventario de rutas de 57 a 59.

## 23. Lista de asuntos que deben dejarse para despues

- Crear masivamente compatibilidades.
- Completar 78 cartas de tarot.
- Activar IA automatica o cron.
- Crear nuevas migraciones de contenido.
- Eliminar demo data.
- Reconstruir motores astronomicos.
- Agregar imagenes decorativas no criticas.

## 24. Evidencias

Comandos/consultas ejecutadas:

- `rg --files documentacion . | rg "AUDITOR|audit|Cline|MAESTRA"`
- `rg -n "createFileRoute\\(" src/routes`
- `Get-ChildItem -Recurse -File public,src -Include *.png,*.jpg,*.jpeg,*.webp,*.gif,*.avif,*.ico,*.svg`
- REST publico Supabase con publishable key: `horoscopes`, `tarot_cards`, `compatibility_profiles`, `editorial_articles`, `moon_phase_content`.
- `Invoke-WebRequest https://www.creovision.io/<ruta>` para 10 rutas publicas.
- `npx vitest run src/lib/account/auth-profile.test.ts`: 18 tests passed.
- `npm run build`: exit 0 en esta sesion.

No se ejecutaron INSERT/UPDATE/DELETE/DROP/ALTER ni service role.

## 25. Dictamen final

LISTA A - CORREGIR AHORA

- Auth produccion/cache: eliminar definitivamente llamadas `/rest/v1/auth/v1` y validar login/recovery/update-password E2E.
- Variables de despliegue: confirmar que Vercel usa URL raiz `https://mmfendqrucasrcsfsvpw.supabase.co`, no endpoint REST.
- Riesgo de secretos locales: rotar claves expuestas en `.env` si alguna fue compartida o commiteada.

LISTA B - VERIFICAR ANTES DE CORREGIR

- Horoscopos: decidir si se aplican seeds o si se crea pipeline; no asumir que hay 12 remotos.
- Compatibilidad: confirmar con SQL read-only/admin si existen filas no publicas antes de planear carga.
- Articulos: verificar draft con admin/read-only; anon solo ve 1 publicado demo.
- Mi espacio: probar cuenta real, persistencia, separacion de usuarios y RLS.
- AspectEngine: reauditar hallazgo de Cline con caso adversarial.

LISTA C - DEJAR PARA DESPUES

- Completar tarot 78 cartas.
- Imagenes de cartas, signos, fases y OG.
- Sitemap/SEO avanzado.
- Cron y publicacion automatica.
- Mejoras visuales y comerciales no criticas.
