# YAML 03 — LAYOUT GLOBAL Y NAVEGACIÓN

## Resumen
Se construyó el layout global reutilizable de Proyecto Astral (AppShell,
Header, navbar de escritorio con dropdowns, topbar móvil, navegación
inferior, drawer, breadcrumbs y footer único) consumiendo únicamente las
configuraciones centrales existentes (rutas, iconos, copy, navigation y
footer). No se recrearon colores, tipografías, sombras, radios ni datos.

## Componentes reutilizados
- `Container`, `Section`, `SectionHeading` (YAML 01).
- Primitiva `Icon` + `iconRegistry` central.
- `Button`, `Input` de shadcn (variantes existentes).
- `footerConfig`, `siteConfig`, `copy`, `routes`, `featureFlags`.

## Componentes creados (`src/components/layout/`)
- `AppShell.tsx` — shell global con `<main id="main-content">`, compensa la
  altura de la barra inferior en móvil y respeta `safe-area-inset`.
- `SkipLink.tsx` — enlace accesible al contenido principal.
- `SiteHeader.tsx` — header sticky, único estado de drawer, listener
  pasivo de scroll, altura compacta al hacer scroll.
- `DesktopNavigation.tsx` — navbar horizontal ≥ `lg`.
- `DesktopNavDropdown.tsx` — dropdown accesible (click, teclado
  ArrowUp/Down/Home/End, Escape, click exterior, cierre al navegar,
  `aria-haspopup`/`aria-expanded`/`aria-controls`).
- `MobileTopbar.tsx` — topbar sticky con búsqueda, cuenta y toggle.
- `MobileBottomNavigation.tsx` — barra inferior fija con cinco destinos
  desde `mobileBottomPrimary`.
- `MobileNavigationDrawer.tsx` — drawer con estado único, body scroll
  lock, cierre por overlay/Escape/navegación (`onClick={onClose}`
  síncrono), restore focus.
- `SiteFooter.tsx` — footer único, columnas en escritorio + acordeón
  móvil, newsletter con `aria-live`.
- `AppBreadcrumbs.tsx` — breadcrumbs automáticos, ocultos en `/`.
- `PageShell.tsx` — contenedor estándar con variantes de ancho, padding
  y background.
- `PageHeader.tsx` — encabezado reutilizable con variantes light/soft/dark.
- `Placeholder.tsx` — superficie mínima para rutas aún no construidas.

## Archivos modificados
- `src/routes/__root.tsx` — envuelve `<Outlet />` con `<AppShell>`, elimina
  el `Footer` anterior.
- `src/routes/index.tsx`, `src/routes/design-system.tsx` — reemplazan su
  `<main>` local por `<div>` (el `<main>` lo aporta AppShell).
- `src/config/icons.ts` — se añade `expand` (ChevronDown), `account`
  (UserRound) y `chevronRight`.
- `src/config/navigation.ts` — se añaden `desktopPrimary` (con
  `children` para dropdowns), `mobileBottomPrimary` y `drawerGroups`.
  Se preservan las claves legacy (`primaryNav`, `mobileBottomNav`,
  `footerNav`).
- Se elimina `src/components/layout/Footer.tsx` (sustituido por
  `SiteFooter.tsx`).

## Configuraciones centrales consumidas
- `routes` → todos los `Link to={routes[...]}`.
- `desktopPrimary`, `mobileBottomPrimary`, `drawerGroups` → menús.
- `footerConfig` → columnas, newsletter, copyright.
- `siteConfig` → nombre y marca.
- `copy` → CTAs (`account`, `search`, `createAccount`).
- `featureFlags.newsletter` → visibilidad del formulario.
- `iconRegistry` → todos los iconos.

## Header de escritorio
Sticky, altura 76 px → 68 px al hacer scroll > 16 px, borde sutil y
fondo con blur al desplazarse. Logo a la izquierda, navegación centrada
con estados activos (por ruta hija), acciones (búsqueda + cuenta) a la
derecha. Dropdowns accesibles con navegación completa por teclado.

## Navegación móvil
- Topbar sticky con logo compacto, búsqueda, cuenta y toggle único.
- Bottom navigation fija con `env(safe-area-inset-bottom)` y
  `aria-current="page"`.
- `AppShell` reserva `pb-[calc(64px+safe-area+16px)]` en móvil.

## Drawer
Estado único en `SiteHeader`. `body { overflow:hidden }` al abrir,
restore focus al cerrar, Escape cierra, click en overlay cierra, cada
enlace cierra sincrónicamente con `onClick={onClose}` antes de navegar.
No hay handlers duplicados (solo `onClick`).

## Footer
Consume `footerConfig`. En escritorio se muestra en 4 columnas; en móvil
se convierte en acordeón con el grupo `explore` abierto por defecto.
Newsletter con validación nativa y mensaje `aria-live`. Copyright con
año automático.

## Breadcrumbs
`AppBreadcrumbs` derivado del pathname, oculto en la home. Último ítem
sin enlace y con `aria-current="page"`. `PageShell` los inserta
automáticamente salvo `hideBreadcrumbs`.

## Rutas placeholder creadas
`/horoscopo`, `/tarot`, `/astrologia`, `/compatibilidad`, `/luna`,
`/guias`, `/mi-espacio`, `/buscar`, `/nosotros`, `/metodo`, `/ayuda`,
`/contacto`, `/privacidad`, `/terminos`, `/cookies`,
`/aviso-de-responsabilidad`. Todas usan `Placeholder` (PageShell +
PageHeader) con `head()` propio.

## Pruebas responsive
Estructuras validadas contra los breakpoints objetivo (320, 360, 390,
430, 768, 1024, 1280, 1440 px):
- < `lg`: topbar visible, bottom nav visible, navbar oculta, footer en
  acordeón.
- ≥ `lg`: navbar visible, topbar/bottom nav ocultas, footer en 4
  columnas.

## Pruebas de accesibilidad
- `<SkipLink>` funcional (`href="#main-content"`, `<main tabIndex={-1}>`).
- `nav` con `aria-label` en desktop, mobile bottom y drawer.
- Dropdowns con `aria-expanded/controls/haspopup="menu"`,
  navegación completa por teclado.
- Drawer: `role="dialog"`, `aria-modal`, focus restaurado, body scroll
  lock, Escape cierra.
- `aria-current="page"` en enlaces activos.
- Iconos decorativos con `aria-hidden`, iconos interactivos con
  `aria-label`.

## Resultados
| Comprobación | Resultado |
| --- | --- |
| `npx tsgo --noEmit` | 0 errores |
| `npm run lint` | 0 errores (6 warnings preexistentes de shadcn/ui) |
| `npm run check:centralization` | 0 imports directos de lucide, 0 rutas hard-coded nuevas, footer único |
| `npm run build` | ✅ SSR + client build |

## Confirmación final
No se recrearon colores, tipografías, sombras, radios, iconos, rutas,
menús ni configuraciones del footer. Todos los componentes del layout
consumen las fuentes centrales establecidas en YAML 01 y YAML 02.

## Congelación
Se congelan: `AppShell`, estructura del `SiteHeader`, estado único del
drawer (`SiteHeader` → `MobileNavigationDrawer`), `MobileBottomNavigation`
y estructura de `SiteFooter`. Cambios futuros solo por configuración
(rutas/copy/feature flags) o por incidencia documentada.

## Pendientes reales
- Reemplazar los placeholders por las páginas reales (horóscopo, tarot,
  luna, etc.) en fases posteriores.
- Overlay de búsqueda completa (`/buscar` es hoy placeholder).
- Backend real para newsletter y cuenta.
