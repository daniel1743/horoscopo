# Fix: Enlaces "Leer" de Fases Lunares se Quedan en la Misma Página

## Diagnóstico

✅ **Rutas configuradas correctamente**:
- `luna.tsx` → `<Outlet />`
- `luna.fases.tsx` → `<Outlet />`
- `luna.fases.index.tsx` → Índice de 8 fases
- `luna.fases.$slug.tsx` → Página individual
- `routeTree.gen.ts` → Actualizado con `/luna/fases/$slug`

⚠️ **Problema**: Los enlaces no navegan, se quedan en la misma página.

## Soluciones

### 1. Limpiar Caché y Reconstruir (MÁS PROBABLE)

```bash
# 1. Detener dev server (Ctrl+C)

# 2. Limpiar caché de Vite
rm -rf node_modules/.vite
rm -rf .vercel
rm -rf dist

# 3. Regenerar routeTree
npm run dev
# O manualmente:
# npx tsr generate

# 4. Limpiar caché del navegador
# Chrome: Ctrl+Shift+Delete → Limpiar caché
# O abrir en ventana incógnita
```

### 2. Verificar que no Hay Errores en Consola

Abrir DevTools (F12) y revisar:
- **Console**: Buscar errores de JavaScript
- **Network**: Ver si las requests se hacen correctamente
- **React DevTools**: Verificar que `<Link>` se renderiza correctamente

### 3. Probar Navegación Directa

En lugar de hacer clic, escribir directamente en la barra de direcciones:

```
http://localhost:3000/luna/fases/luna-nueva
http://localhost:3000/luna/fases/cuarto-creciente
http://localhost:3000/luna/fases/luna-llena
```

**Si funciona por URL directa pero NO por clic** → Problema de hidratación o event listeners.

### 4. Verificar Componente MoonPhaseGrid

El componente usa `<Link>` de TanStack Router correctamente:

```tsx
<Link
  to="/luna/fases/$slug"
  params={{ slug: meta.slug }}
>
```

**Verificar que no hay**:
- `onClick` que previene navegación
- `href="#"` que sobrescribe
- CSS `pointer-events: none`

### 5. Regenerar routeTree Manualmente

```bash
# Si el problema persiste
npx tsr generate --force
npm run dev
```

### 6. Verificar en Build de Producción

A veces funciona en dev pero no en build:

```bash
npm run build
npm run preview
# Probar en http://localhost:4173
```

## Test Rápido

Ejecuta esto en la consola del navegador cuando estés en `/luna/fases`:

```javascript
// Test 1: Verificar que Link está renderizado
document.querySelectorAll('a[href*="luna-nueva"]').length
// Debe ser > 0

// Test 2: Verificar href
document.querySelector('a[href*="luna-nueva"]').getAttribute('href')
// Debe ser algo como "/luna/fases/luna-nueva"

// Test 3: Simular clic programático
document.querySelector('a[href*="luna-nueva"]').click()
// ¿Navega?
```

## Solución Temporal (Si nada funciona)

Modificar `MoonPhaseGrid.tsx` para usar navegación imperativa:

```tsx
import { useNavigate } from "@tanstack/react-router";

export function MoonPhaseGrid() {
  const navigate = useNavigate();
  
  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {MOON_PHASE_ORDER.map((key) => {
        const meta = MOON_PHASE_REGISTRY[key];
        return (
          <li key={key}>
            <button
              onClick={() => navigate({ to: "/luna/fases/$slug", params: { slug: meta.slug } })}
              className="group block h-full w-full text-left focus-visible:outline-none"
            >
              <Card className="...">
                {/* contenido */}
              </Card>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
```

## Verificación Final

Después de aplicar las soluciones, verifica:

1. ✅ Clic en "Luna nueva" → Navega a `/luna/fases/luna-nueva`
2. ✅ Muestra título "Luna nueva" en el encabezado
3. ✅ Muestra contenido de la fase (o "Ficha en preparación")
4. ✅ Navegación anterior/siguiente funciona
5. ✅ URL en navegador cambia correctamente

## Causa Más Probable

**Caché de Vite/Navegador desactualizado**. La solución #1 debería resolver el 90% de los casos.

---

**Si nada de esto funciona**, comparte:
- URL exacta donde estás
- Errores en consola (F12)
- Resultado de los tests JavaScript
- Screenshot del elemento `<a>` inspeccionado
