# Handoff UI/UX a Codex

## Restricciones heredadas

- No cambiar logica de negocio.
- No tocar Supabase.
- No cambiar rutas publicas.
- No exponer modulos ocultos.
- No hacer Git, push ni deploy salvo orden explicita.

## Cambios recomendados primero

1. Mobile brand
   - Archivo: `src/config/site.ts` o `src/components/layout/MobileTopbar.tsx`.
   - Problema: mobile muestra "Astral".
   - Cambio: mostrar `siteConfig.name` o ajustar `shortName` a "Creovision".

2. Breadcrumbs
   - Archivo: `src/components/layout/AppBreadcrumbs.tsx`.
   - Problema: duplica Inicio cuando paginas pasan Inicio.
   - Cambio recomendado: normalizar items y eliminar Inicio duplicado si viene en `items`.

3. Overflow mobile
   - Archivos: `src/components/home/HomeHero.tsx`, `src/components/layout/Container.tsx`, `src/components/layout/PageHeader.tsx`.
   - Problema: H1 y descripciones se cortan.
   - Cambio: `max-w-full`, `break-words`, evitar `tracking-[-...]` en mobile, revisar padding y `overflow-x`.

4. Bottom navigation
   - Archivo: `src/components/layout/MobileBottomNavigation.tsx`.
   - Problema: se ve un item parcialmente cortado.
   - Cambio: distribuir con grid de columnas iguales, asegurar safe-area y padding bottom en main.

5. Loader Tirada Amor
   - Archivos: `src/components/tarot/experience/ThreeCardLoveExperienceShell.tsx`, `src/components/tarot/TarotSkeleton.tsx`.
   - Problema: pantalla vacia con "Consultando la baraja...".
   - Cambio: loader contextual dentro de card clara, con skeleton de 3 posiciones y texto rotativo breve.

## Pruebas despues de corregir

- Capturas: 1440x900, 1366x768, 390x844, 375x812.
- Rutas: `/`, `/tarot`, `/tarot/carta-del-dia`, `/tarot/si-o-no`, `/tarot/tres-cartas`, `/tarot/tres-cartas/amor`, `/tarot/cartas`, `/luna/hoy`, `/luna/calendario`, `/guias`, `/buscar`.
- Validar ocultas: `/horoscopo`, `/astrologia`, `/compatibilidad`, `/asistente` siguen 404 o noindex segun politica actual.
- Ejecutar: `npx eslint` acotado, `npm run build`.

## Veredicto tecnico

No aprobar aun como premium. La base desktop es prometedora, pero mobile tiene P0 visuales que deben corregirse antes de subir.
