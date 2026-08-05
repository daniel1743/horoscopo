# Verificacion runtime del informe de Claude

Fecha: 2026-08-04

Servidor usado: `npm run dev -- --host 127.0.0.1 --port 8080`

## Resultado ejecutivo

Veredicto: INFORME DE CLAUDE PARCIALMENTE CONFIRMADO

El informe previo acerto en rutas 404 de Astrologia y placeholders informativos/legales, pero no podia afirmar "100% funcional" en grupos con datos reales sin runtime. La verificacion mostro:

- Tarot: FUNCIONAL_VALIDADO en datos base, 78 cartas publicadas accesibles.
- Horoscopo: FUNCIONAL_CON_DATOS_PENDIENTES, 0 horoscopos publicados accesibles.
- Compatibilidad: FUNCIONAL_PARCIAL, solo 3 perfiles accesibles; no 78.
- Guias: FUNCIONAL_CON_DATOS_PENDIENTES, al menos 1 articulo publicado.
- Luna: FUNCIONAL_PARCIAL, motor de calculo disponible; `moon_content` no existe o no es accesible por REST publico.
- Astrologia: SOLO_VISUAL/ROTO_RUNTIME segun ruta.
- Informativas y legales: SOLO_VISUAL por uso de `Placeholder`.

## Datos reales verificados

| Recurso | Resultado |
|---|---|
| `tarot_cards` publicadas | 78 accesibles |
| `horoscopes` publicados | 0 accesibles |
| `compatibility_profiles` | 3 accesibles |
| `editorial_articles` publicados | al menos 1 accesible |
| `moon_content` publicado | 404, tabla no accesible o no existe |

No se imprimieron secretos ni valores de variables.

## Matriz de rutas

| Grupo | Funcion | Ruta | Afirmacion de Claude | Resultado de Codex | Evidencia runtime | Error o limitacion | Debe mostrarse en menu | Accion |
|---|---|---|---|---|---|---|---|---|
| Home | Inicio | `/` | Funcional | FUNCIONAL_PARCIAL | HTTP 200, 6628 ms | Promocionaba horoscopo sin datos y `/tarot/tiradas` 404 | Si | CTA corregido y secciones de horoscopo ocultas |
| Horoscopo | Hub | `/horoscopo` | 100% funcional | FUNCIONAL_CON_DATOS_PENDIENTES | HTTP 200, datos publicados 0 | Ruta renderiza estado vacio | No temporalmente | Oculto en menu, footer, sitemap, busqueda y Home |
| Horoscopo | Hoy | `/horoscopo/hoy` | 100% funcional | FUNCIONAL_CON_DATOS_PENDIENTES | HTTP 200, datos publicados 0 | Sin contenido real publicado | No temporalmente | RouteKey/ruta conservada |
| Horoscopo | Semana | `/horoscopo/semana` | 100% funcional | FUNCIONAL_CON_DATOS_PENDIENTES | HTTP 200, datos publicados 0 | Sin contenido real publicado | No temporalmente | RouteKey/ruta conservada |
| Horoscopo | Mes | `/horoscopo/mes` | 100% funcional | FUNCIONAL_CON_DATOS_PENDIENTES | HTTP 200, datos publicados 0 | Sin contenido real publicado | No temporalmente | RouteKey/ruta conservada |
| Tarot | Hub | `/tarot` | 100% funcional | FUNCIONAL_VALIDADO | HTTP 200 | Sin bloqueo observado en smoke | Si | Sin ocultar |
| Tarot | Carta del dia | `/tarot/carta-del-dia` | 100% funcional | FUNCIONAL_VALIDADO | HTTP 200, `tarot_cards` 78 | No se ejecuto browser click en esta pasada | Si | Sin ocultar |
| Tarot | Si o no | `/tarot/si-o-no` | 100% funcional | FUNCIONAL_VALIDADO | HTTP 200, `tarot_cards` 78 | No se ejecuto browser click en esta pasada | Si | Sin ocultar |
| Tarot | Tres cartas | `/tarot/tres-cartas` | 100% funcional | FUNCIONAL_VALIDADO | HTTP 200, `tarot_cards` 78 | IA no probada en navegador aqui | Si | Sin ocultar |
| Tarot | Tirada Amor | `/tarot/tres-cartas/amor` | 100% funcional | FUNCIONAL_VALIDADO | HTTP 200, `tarot_cards` 78 | IA/fallback ya validado en tareas previas; no deploy | Si | Sin ocultar |
| Tarot | Biblioteca | `/tarot/cartas` | 22 arcanos | FUNCIONAL_VALIDADO | HTTP 200, `tarot_cards` 78 | Informe previo subestimaba catalogo | Si | Sin ocultar |
| Tarot | Todas tiradas | `/tarot/tiradas` | No destacado | ROTO_RUNTIME | HTTP 404 | Home tenia CTA indirecto a esa URL | No | CTA cambiado a `/tarot` |
| Astrologia | Hub | `/astrologia` | 0% funcional | SOLO_VISUAL | HTTP 200, componente `Placeholder` | No hay funcion de usuario | No | Oculto de menu/footer/sitemap |
| Astrologia | Carta natal | `/astrologia/carta-natal` | NO_IMPLEMENTADO | ROTO_RUNTIME | HTTP 404 | RouteKey existe, ruta no | No | Oculto por grupo |
| Astrologia | Ascendente | `/astrologia/ascendente` | NO_IMPLEMENTADO | ROTO_RUNTIME | HTTP 404 | RouteKey existe, ruta no | No | Oculto por grupo |
| Astrologia | Signo lunar | `/astrologia/signo-lunar` | NO_IMPLEMENTADO | ROTO_RUNTIME | HTTP 404 | RouteKey existe, ruta no | No | Oculto por grupo |
| Compatibilidad | Hub | `/compatibilidad` | 100% funcional | FUNCIONAL_PARCIAL | HTTP 200, 3 perfiles | No hay cobertura 78 comprobada | Si | Mantener, con backlog de contenido |
| Luna | Hub | `/luna` | 95% funcional | FUNCIONAL_PARCIAL | HTTP 200 | Motor runtime carga | Si | Mantener |
| Luna | Hoy | `/luna/hoy` | 95% funcional | FUNCIONAL_VALIDADO | HTTP 200 | Calculo astronomico disponible | Si | Mantener |
| Luna | Calendario | `/luna/calendario` | 95% funcional | FUNCIONAL_VALIDADO | HTTP 200 | Redireccion/render OK | Si | Mantener |
| Luna | Fases | `/luna/fases` | 95% funcional | FUNCIONAL_PARCIAL | HTTP 200, `moon_content` 404 | Contenido editorial no accesible | Si | Mantener como calculo/base |
| Guias | Index | `/guias` | 100% funcional | FUNCIONAL_CON_DATOS_PENDIENTES | HTTP 200, al menos 1 articulo | Contenido escaso | Si | Mantener |
| Buscar | Pagina | `/buscar` | 100% funcional | FUNCIONAL_PARCIAL | HTTP 307 sin query | Requiere prueba con query/browser | Si via icono | Mantener |
| Asistente | Pagina | `/asistente` | 100% funcional | FUNCIONAL_PARCIAL | HTTP 200 | No se probo mensaje en esta pasada | Si en drawer | Mantener |
| Auth | Login | `/auth` | 100% funcional | REQUIERE_CONFIGURACION | HTTP 307 | Requiere prueba de credenciales/Supabase Auth | Si como acceso cuenta | Mantener |
| Reset | Recuperacion | `/reset-password` | 100% funcional | REQUIERE_CONFIGURACION | HTTP 200 | No se envio email real | Si si aplica | Mantener |
| Informativas | Nosotros | `/nosotros` | Placeholder | SOLO_VISUAL | HTTP 200, `Placeholder` | Sin contenido real | Si, no critico | Mantener visible |
| Informativas | Metodo | `/metodo` | Placeholder | SOLO_VISUAL | HTTP 200, `Placeholder` | Sin contenido real | Si, no critico | Mantener visible |
| Informativas | Ayuda | `/ayuda` | Placeholder | SOLO_VISUAL | HTTP 200, `Placeholder` | Sin contenido real | Si, no critico | Mantener visible |
| Informativas | Contacto | `/contacto` | Placeholder | SOLO_VISUAL | HTTP 200, `Placeholder` | Sin formulario funcional | Si, no critico | Mantener visible |
| Legal | Privacidad | `/privacidad` | Placeholder | SOLO_VISUAL | HTTP 200, `Placeholder` | Bloqueante legal para launch | Si | Mantener visible, backlog P0 |
| Legal | Terminos | `/terminos` | Placeholder | SOLO_VISUAL | HTTP 200, `Placeholder` | Bloqueante legal para launch | Si | Mantener visible, backlog P0 |
| Legal | Cookies | `/cookies` | Placeholder | SOLO_VISUAL | HTTP 200, `Placeholder` | Bloqueante legal para launch | Si | Mantener visible, backlog P0 |
| Legal | Aviso | `/aviso-de-responsabilidad` | Placeholder | SOLO_VISUAL | HTTP 200, `Placeholder` | Bloqueante legal para launch | Si | Mantener visible, backlog P0 |

## Cambios de saneamiento aplicados

- `src/config/navigation.ts`
  - Se agrego `status: enabled | coming_soon | hidden`.
  - Se filtran grupos/items ocultos desde la misma fuente.
  - Astrologia queda oculta en desktop y drawer.
  - Horoscopo queda oculto temporalmente por falta de datos publicados.
- `src/config/features.ts`
  - `horoscope: false` temporal.
- `src/config/footer.ts`
  - Se removieron enlaces publicos a Horoscopo y Astrologia.
- `src/routes/sitemap[.]xml.ts`
  - Se removieron Horoscopo, signos dinamicos y Astrologia.
- `src/config/search-static-content.ts`
  - Los documentos zodiacales solo se indexan si `featureFlags.horoscope` esta activo.
- `src/config/home.ts`
  - Home deja de promocionar Horoscopo.
  - Se desactivan `zodiac_selector` y `daily_insight`.
  - CTA principal cambia a carta del dia.
  - CTA secundario cambia a compatibilidad.
  - CTA de tiradas destacadas cambia de `/tarot/tiradas` a `/tarot`.
- `src/components/home/FeaturedReadingsSection.tsx`
  - El CTA secundario ahora navega realmente a `/tarot`.

## Validacion tecnica

Comandos:

```bash
npx eslint src/config/navigation.ts src/config/home.ts src/config/footer.ts src/config/features.ts src/config/search-static-content.ts src/routes/sitemap[.]xml.ts src/components/home/FeaturedReadingsSection.tsx
npm run build
```

Resultado:

- ESLint acotado: OK.
- Build: OK.

Advertencias no bloqueantes:

- `vite-tsconfig-paths` deprecado.
- `src/routes/api/tarot/interpret-reading.test.ts` no exporta `Route`.
- `createServerFn().inputValidator()` deprecado en archivos existentes.

No se hizo Git ni deploy.
