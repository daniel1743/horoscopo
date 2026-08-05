# Handoff: Sección "Tiradas Destacadas" en Home

Este documento detalla cómo está estructurada la nueva sección presentacional de Tiradas Destacadas en la página de inicio, y cómo el equipo de Backend/Codex puede activarlas posteriormente.

## Archivos Creados y Modificados
- **`src/components/home/FeaturedReadingCard.tsx`**: Componente visual puro para una tarjeta individual. Soporta los estados `enabled` y `coming_soon`. Si recibe `href` y está `enabled`, usa el `<Link>` de `@tanstack/react-router`.
- **`src/components/home/FeaturedReadingsSection.tsx`**: Contenedor principal de la sección. Mapea la configuración y presenta el Grid responsivo de tarjetas, y el botón "Ver todas".
- **`src/config/home.ts`**: Se agregó la configuración `featuredTarot` donde se listan las tiradas y su estado.
- **`src/pages/HomePage.tsx`**: Se integró `FeaturedReadingsSection` bajo el identificador `featured_tarot` en el registry de la Home.

## Configuración y Activación Futura

Toda la lógica de qué tarjetas mostrar, cuáles están activas y hacia dónde apuntan reside de manera declarativa en `src/config/home.ts`.

Actualmente:
- **Amor**: Activo (`status: "enabled"`), apunta a `/tarot/tres-cartas/amor`.
- **Trabajo**: Próximamente (`status: "coming_soon"`).
- **Decisiones**: Próximamente (`status: "coming_soon"`).

### Cómo Activar una Tirada Próximamente

Cuando la lógica y la UI de la tirada de Trabajo o Decisiones esté lista:

1. Abre `src/config/home.ts`.
2. Busca el array `items` dentro de `featuredTarot`.
3. Cambia el objeto de la tirada correspondiente:
   ```typescript
   {
     slug: "trabajo",
     title: "Tarot del Trabajo",
     description: "...",
     status: "enabled", // <-- Cambiar a "enabled"
     badge: "Disponible", // <-- Cambiar el badge
     ctaLabel: "Comenzar tirada", // <-- Cambiar el call to action
     href: "/tarot/tres-cartas/trabajo", // <-- Añadir la ruta real
     icon: "briefcase",
   }
   ```
4. El componente `FeaturedReadingCard` detectará el cambio de estado y automáticamente hará el botón clickeable y habilitará los efectos visuales (hover, bordes, sombras) sin necesidad de modificar JSX.

## Acción "Ver todas las tiradas"

El botón principal al final de la sección actualmente dispara un `console.log` para simular la navegación, ya que la vista del catálogo (`/tarot/tiradas`) posiblemente no existe todavía.
Para integrarlo:
1. Ir a `src/components/home/FeaturedReadingsSection.tsx`.
2. Envolver el botón con `<Link to={config.action.href}>` o usar un hook `useNavigate`, dependiendo del approach de enrutamiento preferido.
3. Asegurarse de que la ruta exista en `routes.ts`.
