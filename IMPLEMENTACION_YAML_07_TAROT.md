# IMPLEMENTACIÓN YAML 07 — SISTEMA DE TAROT

Continuación incremental de los YAML 01–06. Se construye únicamente el sistema
de tarot (hub, carta del día, sí/no, tres cartas, biblioteca y detalle de carta),
consumiendo el sistema de diseño, iconografía, rutas, layout y navegación ya
centralizados. No se recrean tokens, componentes globales, footer, drawer,
navbar, SEO ni configuración base.

## 1. Alcance

- Hub `/tarot` con selector de tiradas, guía breve de uso, y aviso.
- Carta del día en `/tarot/carta-del-dia`, estable durante todo el día.
- Consulta sí/no en `/tarot/si-o-no` (orientación, sin absolutos).
- Tirada de tres cartas en `/tarot/tres-cartas` (sin repetición).
- Biblioteca `/tarot/cartas` y detalle `/tarot/cartas/$card`.
- Integración de Home: `DailyTarotCard` ahora consume el servicio real.

Fuera de alcance (respetado): pagos, IA, historial de lecturas, almacenamiento
de preguntas o resultados, integraciones externas, arcanos menores completos.

## 2. Portabilidad

La implementación no depende de funciones exclusivas del backend gestionado:

- Migraciones SQL versionadas en `supabase/migrations/`.
- Seed portable en `supabase/seed/tarot-demo.sql` (idempotente por `card_key`).
- Cliente Supabase estándar generado (`@/integrations/supabase/client`).
- Sin `service_role`, sin edge functions, sin dependencias runtime propietarias.
- Las variables de entorno son las estándar `VITE_SUPABASE_URL` y
  `VITE_SUPABASE_PUBLISHABLE_KEY` que cualquier despliegue en Vercel puede
  aportar tras clonar el proyecto.

## 3. Base de datos

Tabla `public.tarot_cards`:

- `card_key` (único), `slug` (único), `name`, `arcana` (`major|minor`),
  `number`, `suit`, `rank`, `summary`, `upright_meaning`, `reversed_meaning`,
  `keywords` (jsonb), `reflection_question`, `yes_no_tendency`
  (`favorable|caution|open`), `image_key`, `display_order`, `status`
  (`draft|published|archived`), `is_demo`, `seo_title`, `seo_description`,
  `published_at`, `created_at`, `updated_at`.
- Constraint: publicadas exigen `published_at`.
- Trigger `set_updated_at` reutilizado.
- Índices en `status`, `arcana`, `suit`, `slug`, `card_key`.

RLS:

- `SELECT` público (rol `anon`) sólo para `status = 'published'`.
- `SELECT` para `authenticated` sobre publicadas y borradores (para roles
  editoriales según políticas ya establecidas en el proyecto).
- Escritura restringida al service_role/administración (no se ejecuta desde el
  front).

GRANTs explícitos siguiendo la convención del proyecto: `SELECT` a `anon` y
`authenticated`, `ALL` a `service_role`.

Estado inicial: **8 arcanos mayores publicados** (El Loco, El Mago, La
Sacerdotisa, La Emperatriz, Los Enamorados, La Fuerza, El Ermitaño, La
Estrella).

## 4. Arquitectura de código

```
src/types/tarot.ts                     Tipos de dominio (TarotCard, TarotReading, TarotSpread…)
src/config/tarot.ts                    Tiradas, posiciones, umbrales, mensajes y storage keys
src/lib/tarot/mappers.ts               Row Supabase → TarotCard (único traductor)
src/lib/tarot/card-selection.ts        Fecha local, selección diaria estable, sorteo seguro sin repetición
src/lib/tarot/sensitive-question.ts    Detección orientativa (client-only) de temas sensibles
src/repositories/tarot.repository.ts        Interfaz de acceso
src/repositories/supabase-tarot.repository.ts  Implementación Supabase (cliente estándar)
src/services/tarot.service.ts          Casos de uso; nunca guarda preguntas ni resultados
src/hooks/useTarotDeck.ts              React Query hook para baraja y umbral
src/components/tarot/*                 UI reutilizable (visual, posición, disclaimer, grid…)
src/pages/tarot/*                      Composición de páginas
src/routes/tarot.*.tsx                 Rutas TanStack (index, carta-del-dia, si-o-no, tres-cartas, cartas, cartas.$card)
```

**Regla arquitectónica**: los componentes y páginas NUNCA acceden a Supabase.
Consumen `TarotService`, que a su vez depende de la interfaz `TarotRepository`.
Esto permite reemplazar backend sin tocar la UI.

## 5. Reglas de comportamiento

- **Carta del día**: se calcula por hash determinista sobre `YYYY-MM-DD` local +
  una semilla anónima persistida en `localStorage`. Se guarda `(cardKey,
  dateKey)`; mientras el día no cambie, aparece la misma carta. Al cambiar de
  fecha, se renueva. No se registra en Supabase.
- **Aleatoriedad interactiva**: `crypto.getRandomValues` con muestreo por
  rechazo para evitar sesgo modular. Nunca `Math.random`.
- **Sin repetición**: la tirada de tres cartas usa sorteo sin reemplazo.
- **Sí/no**: nunca entrega un "sí" o "no" absoluto. Muestra "más cerca de sí",
  "más cerca de la cautela" u "todavía está abierto", siempre acompañado del
  significado simbólico completo.
- **Preguntas**: opcionales, máx. 240 caracteres, sólo viven en memoria. No se
  envían a Supabase, no se persisten, no se registran en analytics.
- **Temas sensibles**: detección heurística en cliente (salud, autolesión,
  violencia, financiero, legal). No bloquea la lectura; muestra un aviso
  orientativo.
- **Aviso legal**: `TarotReadingDisclaimer` se muestra en cada página relevante
  y recuerda que el tarot no sustituye decisiones profesionales.
- **Estado de baraja incompleta**: si hay menos cartas que el umbral configurado
  (`6` en desarrollo, `22` en producción), las páginas interactivas muestran
  `TarotDeckIncompleteState` en vez de la experiencia.

## 6. Rutas

Registradas en `src/config/routes.ts`:

| Ruta | Propósito |
| --- | --- |
| `/tarot` | Hub principal, selector de tiradas |
| `/tarot/carta-del-dia` | Carta del día |
| `/tarot/si-o-no` | Consulta orientativa |
| `/tarot/tres-cartas` | Tirada de tres cartas |
| `/tarot/cartas` | Biblioteca |
| `/tarot/cartas/$card` | Detalle de carta |

Helper `tarotCardRoute(slug)` centraliza el link a detalle.

## 7. Integración con Home

`src/components/home/DailyTarotCard.tsx` fue modificado exclusivamente para
reemplazar los datos mock por el servicio real (`tarotService.getDailyCard`).
No se rediseñó ni se movió del layout de Home. Cuando el backend no está
disponible, el CTA se mantiene visible con mensaje neutral.

## 8. Accesibilidad

- Encabezados jerárquicos, `aria-labelledby` en cada sección.
- Focus visible respetado a través de los componentes centrales.
- Botones nunca dependen del hover para transmitir información.
- Todas las visualizaciones de cartas son puramente CSS/tipografía: no se usan
  imágenes con texto embebido y no se copian ilustraciones de barajas
  comerciales.

## 9. Validaciones

- `npx tsgo --noEmit`: sin errores.
- `npm run lint`: sin errores (advertencias preexistentes de `react-refresh`
  no relacionadas con el sistema de tarot).
- `npm run build`: éxito.
- `npm run check:centralization`: sin regresiones nuevas.
- Base de datos: `SELECT count(*) FROM tarot_cards WHERE status='published'` →
  **8**.

## 10. Congelación

La arquitectura queda congelada. Cualquier ampliación futura (arcanos menores,
tiradas nuevas) debe:

1. Añadir cartas mediante nuevo seed o inserción respetando `card_key` único.
2. Añadir tiradas nuevas en `src/config/tarot.ts` sin tocar servicios ni UI
   existentes.
3. Reutilizar `TarotService`, `TarotRepository`, `TarotCardVisual`,
   `TarotPositionResult`, `TarotReadingResult` y demás piezas ya creadas.
4. No introducir persistencia de preguntas o resultados sin revisar la
   política de privacidad.
