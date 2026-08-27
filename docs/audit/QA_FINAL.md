# QA FINAL DE CREOVISION

**Fecha:** 27 de agosto de 2026
**Rama:** `redesign/fases-1-5`
**Alcance:** auditoría del documento maestro, código local, migraciones SQL y confirmaciones manuales del usuario.

## 1. Resumen de QA

| Grupo                           | Resultado                                                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Compilación                     | PASÓ                                                                                                            |
| Contenido editorial             | PASÓ                                                                                                            |
| Flujos pendientes contractuales | PASÓ, 11/11                                                                                                     |
| Centralización                  | Comando compuesto no ejecutable por `bun` ausente; cuatro chequeos individuales ejecutados con `tsx` y código 0 |
| Lint                            | 0 errores, 7 warnings estructurales de Fast Refresh en componentes compartidos                                  |
| Tests automatizados globales    | NO DISPONIBLES; solo dos archivos de tests de dominio                                                           |
| Tarot remoto                    | CONFIRMADO manualmente: 78 publicadas                                                                           |
| Guías remotas                   | CONFIRMADO manualmente: 12 publicadas, dos por categoría                                                        |
| Tabla natal privada             | CONFIRMADO manualmente: 9 columnas, RLS y políticas                                                             |
| Muro social base                | CONFIRMADO manualmente: tablas, RPC, RLS, políticas y permisos                                                  |
| Comunidad ampliada              | SQL 07–08 local; **NO APLICADO/NO CONFIRMADO**                                                                  |
| Runtime de dominio              | PASÓ: Tarot, natal, tránsitos, sinastría y Numerología                                                         |
| Producción                      | NO VERIFICADO                                                                                                   |
| Prueba autenticada E2E          | NO REALIZADA                                                                                                    |

## 2. Validaciones locales ejecutadas

### `npm run build`

**Resultado: PASÓ.** Vite generó el build de producción en la rama local. Esta prueba demuestra que el proyecto compila; no demuestra que las tablas remotas existan ni que la producción esté desplegada con este commit.

### `npm run content:check`

**Resultado: PASÓ.** Confirmó 12 signos, cinco lentes editoriales y tres periodos. También verificó que no permanecen las frases redundantes identificadas en el problema original y que las ocho fases lunares tienen cobertura editorial.

### `npm run pending:check`

**Resultado: PASÓ, 11/11.** El script comprueba contratos estáticos de newsletter, SEO noindex, cargas acotadas de Comunidad, guardas de doble envío, estados de perfil público y estados administrativos. No es una prueba E2E ni una consulta a Supabase.

### `npm run check:centralization`

**Resultado mixto.** `npm run check:centralization` no pudo ejecutarse porque el entorno no tiene `bun`. Se ejecutaron directamente con `npx tsx` los cuatro scripts que componen el comando: todos terminaron con código 0. El chequeo de estilos emitió un reporte informativo de valores arbitrarios históricos; no se interpreta como limpieza total de diseño.

### `npm run lint`

**Resultado actual: PASÓ sin errores.** La limpieza de la rama redujo el resultado a siete warnings `react-refresh/only-export-components` en componentes compartidos de UI y búsqueda. No quedan errores de `any`, hooks, escapes innecesarios ni directivas obsoletas. Los siete warnings son estructurales del patrón de componentes compartidos y no bloquean el build.

### Runtime checks de dominio

**Resultado: PASÓ.** El chequeo temporal fuera del repositorio validó una baraja local de 78 cartas, Carta del Día determinista, reversos desactivables, decisión con dos cartas únicas, carta natal con 10 placements/12 casas/4 ángulos, tránsitos con 10 cuerpos, sinastría con dos cartas de 10 placements y Camino de Vida determinista. No es una prueba E2E ni una validación de precisión profesional.

### Tests existentes

Solo se localizaron `src/server/moon/moon-engine.test.ts` y `src/server/planetary/planetary-engine.test.ts`. El `package.json` no tiene un script global `test`. Los tests cubren normalización, límites, determinismo, snapshots planetarios y fechas/cuerpos no soportados, pero no ejecutan la aplicación completa.

## 3. Evidencia manual de Supabase entregada por Daniel

### Tarot

Se confirmó la existencia de `public.tarot_cards`, se cargó el catálogo y se confirmó un total final de 78 cartas publicadas. Cuatro Sotas adicionales fueron archivadas, no borradas, con autorización.

### Editorial

Se confirmó la existencia de `editorial_articles`, `editorial_authors` y `editorial_categories`. Se confirmaron seis categorías, el autor editorial y las 12 Guías publicadas. El conteo por categoría mostró dos Guías en cada una. El demo quedó archivado.

### Tabla natal privada

Se confirmó `public.profile_astrology_birth_data` con nueve columnas: `user_id`, `birth_date`, `birth_time`, `birth_timezone`, `birth_place_label`, `birth_latitude`, `birth_longitude`, `created_at` y `updated_at`.

Se confirmó RLS activo. Se confirmaron cuatro políticas para `authenticated`, cada una limitada por `auth.uid() = user_id`. La consulta de grants no mostró permisos para `anon` ni `public`; `authenticated` tiene operaciones necesarias y `service_role` conserva acceso administrativo.

### Muro social

Se confirmaron cuatro tablas: `community_posts`, `community_post_likes`, `community_post_reposts` y `community_post_reports`. Se confirmaron seis RPC del muro y cuatro tablas con RLS activo. Se confirmaron 12 políticas de propietario.

Los feeds de comunidad, republicaciones, publicaciones de perfil y republicaciones de perfil respondieron sin error y sin filas, porque no se insertaron datos de prueba. La consulta de permisos mostró inicialmente `anon` en las funciones administrativas; se aplicó una corrección y se confirmó que `anon` ya no tiene `EXECUTE` sobre `list_open_community_reports` ni `moderate_community_report`. Las funciones públicas de lectura permanecen accesibles a visitantes.

## 4. Pruebas que faltan obligatoriamente

| Prueba                            | Estado                          | Motivo                                                                                             |
| --------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------- |
| Guardar datos natales desde la UI | Pendiente de E2E                | El código local ya usa la tabla privada; requiere deploy y cuenta autenticada                      |
| Recuperar datos natales           | Pendiente de E2E                | Requiere deploy y cuenta autenticada                                                               |
| Eliminar datos natales            | Código corregido, E2E pendiente | La limpieza local elimina explícitamente la fila privada; falta probarla con una cuenta real       |
| Exportar datos natales            | Código corregido, E2E pendiente | `exportAccountFn` ya enumera `profile_astrology_birth_data`; falta comprobar respuesta autenticada |
| Eliminar cuenta con datos natales | Código corregido, E2E pendiente | `deleteAccountFn` ya incluye la tabla privada y relaciones sociales; falta ejecutar el flujo real  |
| Publicar post real                | Pendiente                       | No se insertaron datos de prueba                                                                   |
| Me gusta/repost real              | Pendiente                       | Requiere dos cuentas o una cuenta autenticada desplegada                                           |
| Ocultar/eliminar post             | Pendiente                       | No probado desde UI                                                                                |
| Reporte y moderación con rol      | Pendiente                       | No probado con admin/editor real                                                                   |
| Acceso cruzado entre usuarios     | Pendiente                       | No se hizo prueba multiusuario                                                                     |
| Acceso anónimo a tablas sociales  | Parcial                         | RLS y grants revisados, falta petición con token anon real                                         |
| Producción                        | Pendiente                       | No se hizo deploy ni revisión del dominio                                                          |
| Responsive real                   | Pendiente                       | Falta matriz móvil/tablet/desktop                                                                  |
| SEO real con crawler              | Pendiente                       | Solo se inspeccionó código/sitemap local                                                           |
| Provider IA real                  | Pendiente                       | No se verificaron secretos ni proveedor de producción                                              |

## 5. Errores y riesgos abiertos

1. El lint ya no tiene errores; permanecen siete warnings estructurales de Fast Refresh en componentes compartidos.
2. El tipo `profile_astrology_birth_data` fue añadido manualmente a `types.ts`; conviene regenerarlo desde el esquema remoto cuando exista un flujo seguro para ello.
3. La privacidad natal y el ciclo de exportación/eliminación están corregidos en código local, pero siguen sin prueba E2E desplegada.
4. La rama local parte de `8352e46` y quedó consolidada en el commit local `ff1483b`; no se ha hecho push.
5. El estado remoto de las migraciones históricas de horóscopo, Luna, compatibilidad, búsqueda, IA, cuenta, admin y métricas no fue confirmado mediante capturas.
6. El muro social base está preparado a nivel de base y código, pero no se ha probado en la aplicación desplegada. Comentarios, follows y reportes de comentarios tienen SQL local 07–08 pendiente y no deben declararse activos hasta su aplicación y verificación.
7. Los módulos restantes —mazos alternativos, informes, notificaciones, astrocartografía, Lenormand, runas, oráculos, chakras, cristales, rituales y sueños— siguen sin implementación completa. Tránsitos, sinastría y Numerología Camino de Vida sí tienen una primera implementación local con límites explícitos.

## 6. Criterio de cierre QA

La auditoría no considera el producto terminado. El cierre del MVP requiere sincronizar la rama autorizada, desplegar, probar con cuentas autenticadas y repetir las comprobaciones de privacidad, comunidad y contenido. El cierre del documento maestro exigiría además los módulos avanzados enumerados en `AUDITORIA_NO_IMPLEMENTADO.md`.

## Referencias internas

[1]: ../../scripts/check-editorial-quality.mjs "Chequeo editorial"
[2]: ../../scripts/check-pending-flows.mjs "Chequeo de flujos pendientes"
[3]: ../../src/services/astrology.service.ts "Motor astrológico"
[4]: ../../src/lib/account/account.functions.ts "Exportación y eliminación"
[5]: ../../src/lib/astrology/profile-repository.ts "Persistencia natal"
[6]: ../../src/integrations/supabase/types.ts "Tipos Supabase"


## 7. Revisión autónoma posterior — brechas que sí podían cerrarse localmente

Se incorporó una nueva validación posterior al cierre anterior. El hub de Astrología ahora descubre carta natal, ascendente, Luna, tránsitos y sinastría. El índice de búsqueda y los feature flags centrales reconocen las rutas nuevas sin añadir superficies privadas.

Tarot ahora incluye localmente la tirada `past_present_future`, con tres posiciones, cartas únicas, síntesis reflexiva, integración en IA Tarot, guardado explícito y filtro del diario. El constraint remoto de `saved_tarot_readings.spread_type` todavía requiere el bloque manual `supabase/migrations/manual-tarot/01_saved_readings_spreads.sql`; no se ha aplicado.

La carta natal muestra Big Three y conteos descriptivos de elemento, modalidad y signo. Natal, tránsitos y sinastría pueden copiar o descargar un informe `.txt` local bajo acción explícita; no se activa `pdfReports`, no se persiste y no se envía a IA. `/suenos` ofrece un diccionario público con 20 símbolos, búsqueda y filtros, sin diario ni almacenamiento.

La suite posterior pasó `npx tsc --noEmit`, `npm run build`, `npm run content:check`, `npm run pending:check`, `npm run seo:sitemap`, `npx prettier --check src scripts`, `npm run lint` y `git diff --check`. El sitemap local alcanzó 137 URLs, incluyendo Tarot pasado/presente/futuro y Sueños, y excluyendo sinastría por `noindex`. El runtime externo pasó Tarot, natal, tránsitos, sinastría, Sueños e informes. El auditor Supabase sigue reportando 30 tablas usadas, 15 RPC usados y 0 faltantes locales.

El estado final continúa siendo **PARCIAL**: falta aplicar SQL 07, 08 y `manual-tarot/01`, ejecutar E2E autenticada/multiusuario, desplegar y verificar el dominio, así como decidir futuros proveedores para notificaciones, newsletter, pagos y PDF si se desea construirlos.

## 8. QA posterior a las cinco mejoras aprobadas — 27 de agosto de 2026

Se ejecutó una nueva suite después de integrar síntesis Tarot, narrativa natal, agrupación de tránsitos/sinastría, diario local de Sueños e informes HTML imprimibles. Todos los comandos terminaron con código 0, salvo que `npm run lint` conserva los siete warnings estructurales ya descritos y no presenta errores.

| Prueba | Resultado final |
|---|---|
| `npx prettier --check src scripts` | PASÓ |
| `npx tsc --noEmit --pretty false` | PASÓ |
| `npm run lint` | PASÓ; 0 errores y 7 warnings Fast Refresh conocidos |
| `npm run build` | PASÓ; regeneró el árbol de rutas |
| `npm run content:check` | PASÓ |
| `npm run pending:check` | PASÓ |
| `npm run seo:sitemap` | PASÓ; 137 URLs |
| `git diff --check` | PASÓ |
| Auditor local Supabase | PASÓ; 30 tablas, 15 RPC y 0 faltantes locales |

El runtime temporal externo también pasó con fixtures deterministas: Tarot con 3 posiciones y relación; natal con 10 placements y 14 aspectos; tránsitos con 26 contactos en 5 grupos; sinastría con 34 contactos en 6 grupos; Sueños con tres símbolos, reflexión, migración/persistencia local, exportación, borrado y limpieza; e informes con las nuevas secciones narrativas. El archivo temporal fue eliminado después de la ejecución y no se añadió un runner ni dependencia al repositorio.

La evidencia sigue siendo local. No demuestra la activación de SQL remoto, E2E con cuentas, aislamiento multiusuario, rol administrativo, deploy, crawler, proveedor IA, responsive real ni precisión astrológica profesional. En especial, la ventana “Imprimir / guardar PDF” es una vista HTML local que delega el PDF al navegador; no es un generador PDF de servidor.

## 9. Criterio de cierre posterior

La tranche local queda validada y puede detenerse antes de SQL. El orden operativo pendiente es: Comunidad 07, Comunidad 08 y Tarot manual 01, cada uno aplicado manualmente por Daniel con captura/resultado y verificación posterior antes del siguiente. Después corresponde E2E autenticada y multiusuario, no otra afirmación de que el producto está completo.
