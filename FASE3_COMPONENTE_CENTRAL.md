# FASE 3 — Componente Central Icon + Registry Hugeicons

**Fecha**: 31 de julio de 2026  
**Status**: PREPARADO (esperando Fase 2 completar)  
**Objetivo**: Adaptar icon-registry.ts y componente Icon para Hugeicons

---

## PLAN FASE 3

### Paso 1: Reemplazar src/config/icons.ts

**Archivo actual**: Importa de lucide-react  
**Archivo nuevo**: Importará de @hugeicons/core-free-icons

**Cambios**:
```typescript
// ❌ ANTES (lucide-react)
import { Search, ChevronDown, ... } from "lucide-react";

// ✅ DESPUÉS (Hugeicons)
import { Search01Icon, ChevronDown01Icon, ... } from "@hugeicons/core-free-icons";
```

### Paso 2: Verificar componente Icon

**Archivo**: src/components/ui/icon.tsx  
**Estado**: ✅ No requiere cambios significativos

**Verificaciones**:
- ✅ Acepta `name: IconName`
- ✅ Renderiza `Component` del registro
- ✅ Fallback defensivo
- ✅ Accesibilidad correcta

**Cambio mínimo** (si es necesario):
```typescript
// Si Hugeicons usa propiedad diferente para stroke:
<Component
  ref={ref}
  width={px}
  height={px}
  strokeWidth={...}  // Verificar si es compatible
  ...
/>
```

### Paso 3: Agregar nuevas claves semánticas

**Claves a agregar**:
```typescript
check: CheckIcon,
chevronLeft: ChevronLeft01Icon,
chevronUp: ChevronUp01Icon,
moreHorizontal: MoreHorizontal01Icon,
minus: Minus01Icon,
gripVertical: GripVertical01Icon,
eye: Eye01Icon,
eyeOff: EyeOff01Icon,
panelLeft: PanelLeft01Icon,
```

### Paso 4: Ajustar iconStroke si es necesario

Hugeicons puede usar valores diferentes de stroke por defecto. Ajustar:
```typescript
export const iconStroke = {
  default: 1.5,      // Verificar con Hugeicons
  decorative: 1.25,  // Verificar con Hugeicons
} as const;
```

---

## LISTA DE VERIFICACIÓN FASE 3

- [ ] npm install @hugeicons completó
- [ ] `@hugeicons/react` en package.json
- [ ] `@hugeicons/core-free-icons` en package.json
- [ ] package-lock.json actualizado
- [ ] Reemplazar src/config/icons.ts
- [ ] Importar iconos de @hugeicons/core-free-icons
- [ ] Agregar 9 claves faltantes
- [ ] Mantener nombres semánticos
- [ ] Verificar tipo `IconName`
- [ ] Verificar componente Icon sin errores TypeScript
- [ ] Build sin errores

---

## TEMPLATE LISTO

Archivo: `ICON_REGISTRY_HUGEICONS_TEMPLATE.ts`

**Estado**: Preparado, aguardando confirmación de Hugeicons instalado

---

## PRÓXIMOS PASOS

1. **Confirmar Fase 2**: npm install completó ✅
2. **Ejecutar Fase 3**: Reemplazar icon-registry.ts
3. **Verificar**: Build sin errores
4. **Continuar Fase 4**: Migrar 19 imports directos

---

**Status**: Aguardando npm install background (ID: byyaw7ceq)
