# FASE 4 — Plan de Migración de 19 Imports Directos

**Fecha**: 31 de julio de 2026  
**Status**: PLAN DETALLADO (preparado, espera Fase 3)  
**Objetivo**: Reemplazar todos los imports directos de lucide-react

---

## ORDEN DE MIGRACIÓN

### Bloque 1: Componentes UI Radix (17 archivos)

#### Grupo A: Chevrons y navegación (5 archivos)

| # | Archivo | Imports | Cambio | Prioridad |
|---|---------|---------|--------|-----------|
| 1 | accordion.tsx | ChevronDown | Agregar a registry | ALTA |
| 2 | navigation-menu.tsx | ChevronDown | Agregar a registry | ALTA |
| 3 | breadcrumb.tsx | ChevronRight, MoreHorizontal | Agregar ambos | ALTA |
| 4 | pagination.tsx | ChevronLeft, ChevronRight, MoreHorizontal | Agregar todos | ALTA |
| 5 | select.tsx | Check, ChevronDown, ChevronUp | Agregar todos | ALTA |

**Acción**: 
```typescript
// ❌ ANTES
import { ChevronDown } from "lucide-react";
export function Accordion(...) {
  return <ChevronDown ... />
}

// ✅ DESPUÉS
import { Icon } from "@/components/ui/icon";
export function Accordion(...) {
  return <Icon name="expand" ... />
}
```

---

#### Grupo B: Selección y validación (6 archivos)

| # | Archivo | Imports | Cambio | Prioridad |
|---|---------|---------|--------|-----------|
| 6 | checkbox.tsx | Check | Agregar a registry | ALTA |
| 7 | radio-group.tsx | Circle | Agregar a registry | ALTA |
| 8 | context-menu.tsx | Check, ChevronRight, Circle | Agregar todos | ALTA |
| 9 | dropdown-menu.tsx | Check, ChevronRight, Circle | Agregar todos | ALTA |
| 10 | menubar.tsx | Check, ChevronRight, Circle | Agregar todos | ALTA |
| 11 | command.tsx | Search | Agregar a registry | ALTA |

**Acción**: Similar, reemplazar imports con Icon

---

#### Grupo C: Cerrar y redimensionar (4 archivos)

| # | Archivo | Imports | Cambio | Prioridad |
|---|---------|---------|--------|-----------|
| 12 | dialog.tsx | X | Agregar a registry | MEDIA |
| 13 | sheet.tsx | X | Agregar a registry | MEDIA |
| 14 | calendar.tsx | ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon | Normalizar nombres | MEDIA |
| 15 | carousel.tsx | ArrowLeft, ArrowRight | Usar chevron-left, chevron-right | MEDIA |

---

#### Grupo D: Utilities (3 archivos)

| # | Archivo | Imports | Cambio | Prioridad |
|---|---------|---------|--------|-----------|
| 16 | input-otp.tsx | Minus | Agregar a registry | BAJA |
| 17 | resizable.tsx | GripVertical | Agregar a registry | BAJA |
| 18 | sidebar.tsx | PanelLeft | Agregar a registry | BAJA |

---

### Bloque 2: Páginas de Producto (2 archivos)

| # | Archivo | Imports | Cambio | Prioridad |
|---|---------|---------|--------|-----------|
| 19 | AuthPage.tsx | Eye, EyeOff | Agregar a registry | ALTA |
| 20 | ResetPasswordPage.tsx | Eye, EyeOff | Agregar a registry | ALTA |

**Acción especial**: Verificar que aria-label esté presente

```typescript
// ❌ ANTES
<Eye onClick={toggleVisibility} />

// ✅ DESPUÉS
<Icon name="eye" onClick={toggleVisibility} aria-label="Mostrar contraseña" />
```

---

## TEMPLATE DE MIGRACIÓN POR ARCHIVO

### Paso 1: Identificar imports
```typescript
// Línea N
import { ChevronDown } from "lucide-react";
```

### Paso 2: Agregar a icon-registry.ts (si no existe)
```typescript
import { ChevronDown01Icon } from "@hugeicons/core-free-icons";
export const iconRegistry = {
  ...
  expand: ChevronDown01Icon,  // ← nuevo
  ...
}
```

### Paso 3: Reemplazar import
```typescript
// ❌ DELETE
import { ChevronDown } from "lucide-react";

// ✅ ADD
import { Icon } from "@/components/ui/icon";
```

### Paso 4: Reemplazar uso
```typescript
// ❌ ANTES
<ChevronDown width={20} height={20} className="..." />

// ✅ DESPUÉS
<Icon name="expand" size="md" className="..." />
```

### Paso 5: Verificar y compilar
```bash
npm run build
npm run lint
```

---

## DETALLES POR ARCHIVO

### accordion.tsx (Grupo A)
```typescript
// ANTES: import { ChevronDown } from "lucide-react";
// DESPUÉS: import { Icon } from "@/components/ui/icon";

// Usar:
<Icon name="expand" size="md" aria-hidden />

// Verificar: No rompe Radix internals
```

### AuthPage.tsx (Bloque 2)
```typescript
// ANTES:
import { Eye, EyeOff } from "lucide-react";
export function PasswordToggle() {
  return showPassword ? <Eye /> : <EyeOff />;
}

// DESPUÉS:
import { Icon } from "@/components/ui/icon";
export function PasswordToggle() {
  return (
    <button 
      onClick={toggleVisibility}
      aria-label={showPassword ? "Ocultar" : "Mostrar"}
    >
      <Icon name={showPassword ? "eye" : "eyeOff"} size="md" />
    </button>
  );
}

// VERIFICAR: aria-label presente
```

---

## CHECKLIST DE MIGRACIÓN

Por cada archivo:

- [ ] Leer archivo
- [ ] Identificar todos los imports de lucide-react
- [ ] Verificar equivalente en Hugeicons
- [ ] Agregar a icon-registry.ts si falta
- [ ] Reemplazar import
- [ ] Reemplazar usos (buscar por nombre de icono)
- [ ] Verificar aria-label (si es interactivo)
- [ ] Compilar (npm run build)
- [ ] Verificar sin errores TypeScript
- [ ] Marcar como completado

---

## RIESGOS Y MITIGACIONES

| Riesgo | Mitigación |
|--------|-----------|
| Radix components internamente usan los iconos | NO tocar — Radix maneja internamente |
| Nombres de Hugeicons diferentes | Usar icon-registry para mapeo semántico |
| Tamaño o stroke diferente | Ajustar en iconSizes e iconStroke |
| aria-label faltante en botones | Agregar manualmente en cada caso |
| Build rompe | Ejecutar lint incremental por archivo |

---

## ESTIMACIÓN

**Por archivo**: 3-5 minutos  
**19 archivos**: 1-1.5 horas  
**Buffer (testing, build)**: 30 minutos  
**Total estimado**: 1.5-2 horas

---

**Estado**: Preparado, aguardando Fase 3 completar
