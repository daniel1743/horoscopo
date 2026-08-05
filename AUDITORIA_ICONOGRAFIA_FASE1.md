# AUDITORÍA FASE 1 — Iconografía en Creovision

**Fecha**: 31 de julio de 2026  
**Status**: AUDITORÍA COMPLETADA  
**Objetivo**: Identificar todas las fuentes de iconografía antes de migración

---

## RESUMEN EJECUTIVO

| Métrica | Cantidad |
|---------|----------|
| **Paquetes de iconografía detectados** | 1 (lucide-react) |
| **Componentes UI con imports directos** | 17 |
| **Páginas con imports directos** | 2 |
| **Archivos con Icon name= | 49 |
| **Archivo central existente** | ✅ src/config/icons.ts |
| **Componente Icon centralizado** | ✅ src/components/ui/icon.tsx |
| **Total de claves semánticas registradas** | 16 (lucide) |

---

## HALLAZGOS PRINCIPALES

### ✅ YA EXISTE CAPA CENTRAL

**Archivo**: `src/config/icons.ts`
- ✅ Registro semántico tipado
- ✅ 16 claves semánticas definidas
- ✅ Importa lucide-react
- ✅ Exporta `IconName` tipado

**Archivo**: `src/components/ui/icon.tsx`
- ✅ Componente centralizado funcional
- ✅ Propiedades: name, size, decorative, label
- ✅ Fallback defensivo (return null)
- ✅ Warning en desarrollo
- ✅ Accesibilidad: aria-hidden, aria-label

### ⚠️ IMPORTS DIRECTOS FUERA DE CAPA CENTRAL

**Localización**: 19 archivos con imports de lucide-react

#### Componentes UI (Radix):
1. **accordion.tsx** — ChevronDown
2. **breadcrumb.tsx** — ChevronRight, MoreHorizontal
3. **calendar.tsx** — ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon
4. **carousel.tsx** — ArrowLeft, ArrowRight
5. **checkbox.tsx** — Check
6. **command.tsx** — Search
7. **context-menu.tsx** — Check, ChevronRight, Circle
8. **dialog.tsx** — X
9. **dropdown-menu.tsx** — Check, ChevronRight, Circle
10. **input-otp.tsx** — Minus
11. **menubar.tsx** — Check, ChevronRight, Circle
12. **navigation-menu.tsx** — ChevronDown
13. **pagination.tsx** — ChevronLeft, ChevronRight, MoreHorizontal
14. **radio-group.tsx** — Circle
15. **resizable.tsx** — GripVertical
16. **select.tsx** — Check, ChevronDown, ChevronUp
17. **sheet.tsx** — X
18. **sidebar.tsx** — PanelLeft

#### Páginas/Componentes de Producto:
19. **AuthPage.tsx** — Eye, EyeOff
20. **ResetPasswordPage.tsx** — Eye, EyeOff

---

## INVENTARIO DETALLADO

### CATEGORÍA 1: Componentes UI Radix (MIGRAR)

| Archivo | Línea | Icono Actual | Uso Semántico | Hugeicons Equivalente | Riesgo | Acción |
|---------|-------|--------------|---------------|-----------------------|--------|--------|
| accordion.tsx | 3 | ChevronDown | Expandir/contraer | ChevronDown | BAJO | MIGRAR |
| breadcrumb.tsx | 3 | ChevronRight | Separador ruta | ChevronRight | BAJO | MIGRAR |
| breadcrumb.tsx | 3 | MoreHorizontal | Más opciones | MoreHorizontal | MEDIO | MIGRAR |
| calendar.tsx | 4 | ChevronDownIcon | Selector mes | ChevronDown | BAJO | MIGRAR |
| calendar.tsx | 4 | ChevronLeftIcon | Mes anterior | ChevronLeft | BAJO | MIGRAR |
| calendar.tsx | 4 | ChevronRightIcon | Mes siguiente | ChevronRight | BAJO | MIGRAR |
| carousel.tsx | 3 | ArrowLeft | Diapositiva anterior | ChevronLeft | BAJO | MIGRAR |
| carousel.tsx | 3 | ArrowRight | Diapositiva siguiente | ChevronRight | BAJO | MIGRAR |
| checkbox.tsx | 3 | Check | Marca de verificación | Check | BAJO | MIGRAR |
| command.tsx | 6 | Search | Búsqueda | Search | BAJO | MIGRAR |
| context-menu.tsx | 3 | Check | Marca de verificación | Check | BAJO | MIGRAR |
| context-menu.tsx | 3 | ChevronRight | Submenu | ChevronRight | BAJO | MIGRAR |
| context-menu.tsx | 3 | Circle | Radio sin marca | Circle | BAJO | MIGRAR |
| dialog.tsx | 5 | X | Cerrar diálogo | X | BAJO | MIGRAR |
| dropdown-menu.tsx | 5 | Check | Marca de verificación | Check | BAJO | MIGRAR |
| dropdown-menu.tsx | 5 | ChevronRight | Submenu | ChevronRight | BAJO | MIGRAR |
| dropdown-menu.tsx | 5 | Circle | Radio sin marca | Circle | BAJO | MIGRAR |
| input-otp.tsx | 3 | Minus | Separador | Minus | BAJO | MIGRAR |
| menubar.tsx | 3 | Check | Marca de verificación | Check | BAJO | MIGRAR |
| menubar.tsx | 3 | ChevronRight | Submenu | ChevronRight | BAJO | MIGRAR |
| menubar.tsx | 3 | Circle | Radio sin marca | Circle | BAJO | MIGRAR |
| navigation-menu.tsx | 4 | ChevronDown | Expandir | ChevronDown | BAJO | MIGRAR |
| pagination.tsx | 2 | ChevronLeft | Página anterior | ChevronLeft | BAJO | MIGRAR |
| pagination.tsx | 2 | ChevronRight | Página siguiente | ChevronRight | BAJO | MIGRAR |
| pagination.tsx | 2 | MoreHorizontal | Más páginas | MoreHorizontal | MEDIO | MIGRAR |
| radio-group.tsx | 3 | Circle | Radio sin marca | Circle | BAJO | MIGRAR |
| resizable.tsx | 1 | GripVertical | Mango redimensionable | GripVertical | BAJO | MIGRAR |
| select.tsx | 5 | Check | Marca de verificación | Check | BAJO | MIGRAR |
| select.tsx | 5 | ChevronDown | Expandir dropdown | ChevronDown | BAJO | MIGRAR |
| select.tsx | 5 | ChevronUp | Contraer dropdown | ChevronUp | BAJO | MIGRAR |
| sheet.tsx | 6 | X | Cerrar sheet | X | BAJO | MIGRAR |
| sidebar.tsx | 4 | PanelLeft | Toggle sidebar | PanelLeft | BAJO | MIGRAR |

### CATEGORÍA 2: Páginas de Producto (MIGRAR)

| Archivo | Línea | Icono Actual | Uso Semántico | Hugeicons Equivalente | Riesgo | Acción |
|---------|-------|--------------|---------------|-----------------------|--------|--------|
| AuthPage.tsx | 4 | Eye | Mostrar contraseña | Eye | BAJO | MIGRAR |
| AuthPage.tsx | 4 | EyeOff | Ocultar contraseña | EyeOff | BAJO | MIGRAR |
| ResetPasswordPage.tsx | 3 | Eye | Mostrar contraseña | Eye | BAJO | MIGRAR |
| ResetPasswordPage.tsx | 3 | EyeOff | Ocultar contraseña | EyeOff | BAJO | MIGRAR |

### CATEGORÍA 3: Ya usando Icon centralizado (VERIFICAR)

**49 archivos usan `<Icon name=` correctamente**:
- ✅ TarotContextualGuide.tsx
- ✅ DailyTarotCard.tsx
- ✅ TarotCardVisual.tsx
- ✅ SiteHeader.tsx
- ✅ MobileNavigationDrawer.tsx
- ✅ MobileBottomNavigation.tsx
- ✅ SearchDialog.tsx
- ✅ Y 41 más...

**Estado**: CORRECTO (no requiere cambios)

---

## REGISTROS ACTUALES vs HUGEICONS

### Claves semánticas en `src/config/icons.ts`:

```typescript
search: Search → search (mismo nombre)
user: UserRound → user-circle
account: UserRound → user-circle
menu: Menu → menu
close: X → x
back: ArrowLeft → arrow-left
forward: ArrowRight → arrow-right
favorite: Heart → heart
history: History → history
calendar: CalendarDays → calendar
share: Share2 → share-2
settings: Settings → settings
login: LogIn → log-in
logout: LogOut → log-out
email: Mail → mail
premium: Sparkles → sparkles
moon: Moon → moon
sun: Sun → sun
tarot: Layers3 → layers-3
compatibility: HeartHandshake → heart-handshake
article: BookOpen → book-open
warning: TriangleAlert → alert-triangle
expand: ChevronDown → chevron-down
chevronRight: ChevronRight → chevron-right
moon_new: Circle → circle
moon_waxing_crescent: Moon → moon
moon_first_quarter: CircleDot → circle-dot
moon_waxing_gibbous: Moon → moon
moon_full: MoonStar → moon-star
moon_waning_gibbous: Moon → moon
moon_last_quarter: CircleDot → circle-dot
moon_waning_crescent: Moon → moon
```

### Iconos nuevos a agregar (desde UI components):

```typescript
check: Check → check
chevronLeft: ChevronLeft → chevron-left
chevronUp: ChevronUp → chevron-up
moreHorizontal: MoreHorizontal → more-horizontal
minus: Minus → minus
gripVertical: GripVertical → grip-vertical
eye: Eye → eye
eyeOff: EyeOff → eye-off
panelLeft: PanelLeft → panel-left
```

---

## RIESGOS IDENTIFICADOS

| Riesgo | Severidad | Descripción | Mitigación |
|--------|-----------|-------------|-----------|
| **Componentes Radix acoplados a lucide** | MEDIA | 17 componentes UI importan directamente | Crear abstracto en icon-registry.ts |
| **Nombres inconsistentes** | BAJA | ej: ChevronDownIcon vs ChevronDown | Normalizar nombres en registro |
| **Icons no disponibles en Hugeicons** | BAJA | Algunos como CircleDot podrían no existir | Verificar equivalentes exactos |
| **Accesibilidad incompleta** | MEDIA | Eye/EyeOff en AuthPage sin aria-label | Agregar label en migración |
| **Fallback débil en UI components** | MEDIA | Si clave no existe, UI Radix rompe | Usar fallbacks defensivos |

---

## PLAN DE MIGRACIÓN

### Fase 2: Instalar Hugeicons
```bash
npm install @hugeicons/react @hugeicons/core-free-icons
```

### Fase 3: Actualizar icon-registry.ts
- Importar iconos de @hugeicons/core-free-icons
- Agregar 9 claves faltantes
- Mantener nombres semánticos actuales

### Fase 4: Actualizar componentes UI Radix
- Reemplazar imports directos de lucide-react
- Usar Icon centralizado OR agregar a icon-registry.ts

### Fase 5: Actualizar AuthPage y ResetPasswordPage
- Reemplazar Eye/EyeOff imports
- Usar Icon centralizado
- Verificar aria-label

### Fase 6: Eliminar lucide-react
```bash
npm uninstall lucide-react
```

### Fase 7: ESLint + Auditoría
- Crear regla para bloquear imports de lucide-react
- Ejecutar auditoría final

---

## VEREDICTO FASE 1

```
✅ AUDITORÍA COMPLETADA

Estado actual:
- 1 librería: lucide-react
- 1 registro central: ✅ existente
- 1 componente central: ✅ existente
- 19 imports directos detectados
- 49 archivos usando Icon correctamente

Acción requerida:
- Instalar Hugeicons
- Agregar 9 claves faltantes
- Migrar 19 imports directos
- Eliminar lucide-react

Complejidad: MEDIA (19 archivos, todos UI o pattern conocido)
Riesgo: BAJO (capa central ya existe, solo es sustitución)
Tiempo estimado: 2-3 horas
```

---

**Próximo paso**: FASE 2 — Instalación de Hugeicons
