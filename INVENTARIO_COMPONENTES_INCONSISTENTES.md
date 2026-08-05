# Inventario de componentes inconsistentes

| Componente/archivo | Problema visual | Impacto | Prioridad | Recomendacion |
|---|---|---|---|---|
| `src/components/layout/MobileTopbar.tsx` | Usa `siteConfig.shortName` que hoy es "Astral" | Marca inconsistente | P0 | Mostrar "Creovision" o una abreviatura aprobada |
| `src/components/layout/AppBreadcrumbs.tsx` + paginas | Agrega Inicio automaticamente y paginas tambien lo pasan | Breadcrumb duplicado | P0 | Definir contrato unico |
| `src/components/home/HomeHero.tsx` | H1 con ancho fijo por caracteres y tracking negativo | Texto cortado en mobile | P0 | Reglas responsive por breakpoint |
| `src/components/tarot/TarotSkeleton.tsx` | Skeleton generico, pequeno y con mucho vacio | Carga poco premium | P1 | Skeleton contextual por pantalla |
| `src/components/tarot/experience/ThreeCardLoveExperienceShell.tsx` | `min-h-[60vh]` y loader centrado tarde | Pantalla vacia en mobile | P0 | Estado inicial compacto y progresivo |
| `src/components/layout/MobileBottomNavigation.tsx` | Barra fija puede cubrir contenido y muestra item parcial | Navegacion movil insegura | P1 | Revisar distribucion, safe-area y padding inferior global |
| `src/components/home/FeaturedReadingsSection.tsx` | Tarjetas destacadas dependen de estados ocultos filtrados | Riesgo de huecos si hay pocos items | P2 | Layout adaptativo con 1/2/3 items |
| `src/components/editorial/EditorialCard.tsx` | Card editorial con hover fuerte | Puede competir con estilo sereno | P2 | Homologar sombras/radios |
| `src/components/ui/*` | Muchas variantes heredadas shadcn/Lovable | Riesgo de inconsistencia | P2 | Crear matriz oficial de variantes |

## Matriz de variantes recomendada

- Boton primario: una accion principal por estado.
- Boton secundario: navegacion alternativa o accion de menor prioridad.
- Boton icono: search, menu, cerrar, anterior/siguiente con `aria-label`.
- Card funcional: lectura/tirada con CTA.
- Card editorial: guia/articulo.
- Card informativa: datos lunares o disclaimer.
- Loader: skeleton contextual, no overlay salvo bloqueo real.
- Error: mensaje humano + accion de recuperacion.

