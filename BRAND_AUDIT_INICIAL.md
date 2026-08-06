# AUDITORÍA INICIAL - Sistema de Brand Assets Creovision

**Fecha**: 2026-08-06  
**Estado**: En proceso

---

## 1. DIAGNÓSTICO INICIAL

### Archivo Fuente Encontrado
✅ **Ruta**: `public/LOGO_CREOVISION.svg`  
✅ **Formato**: SVG (Scalable Vector Graphics)  
✅ **Tamaño**: 86,133 bytes (~84KB)  
✅ **ViewBox**: `0 0 500 500` (cuadrado)  
✅ **Generador**: Adobe Illustrator 27.5.0

### Problemas Identificados en el Asset Original

1. **Fondo azul claro (`#E9F7FF`)** presente en capa BACKGROUND
   - Debe eliminarse para producción
   - Necesita transparencia real

2. **ViewBox cuadrado 500x500**
   - El logo+wordmark probablemente no llena todo el canvas
   - Necesita recorte al bounding box real

3. **Estructura del SVG**:
   - Capa `BACKGROUND`: Rectángulo azul claro 500x500
   - Capa `OBJECTS`: Contenido del logo
   - Capa `WORDMARK`: Texto "Creovision"

### Assets Actuales en el Proyecto

| Archivo | Tamaño | Problema Identificado |
|---------|--------|----------------------|
| `/brand/creovision-logo.svg` | - | Probablemente derivado anterior |
| `/brand/creovision-logo-dark.svg` | - | Variante oscura |
| `/brand/creovision-logo-light.svg` | - | Variante clara |
| `/brand/creovision-logo.png` | - | Versión raster |
| `/brand/creovision-symbol.png` | - | Isotipo existente |
| `/brand/creovision-symbol.svg` | - | Isotipo SVG |
| `/favicon.ico` | 335 bytes | ⚠️ Extremadamente pequeño - casi invisible |
| `/favicon.svg` | 2KB | ⚠️ Probablemente con márgenes excesivos |
| `/favicon-16x16.png` | 307 bytes | ⚠️ Muy pequeño |
| `/favicon-32x32.png` | 562 bytes | ⚠️ Muy pequeño |
| `/apple-touch-icon.png` | 5.8KB | Existente |
| `/icons/icon-192x192.png` | 7.7KB | Existente PWA |
| `/icons/icon-512x512.png` | 39KB | Existente PWA |
| `/icons/icon-maskable-*` | Varios | Existen |

### Implementación Actual del Header

**Archivo**: `src/components/layout/SiteHeader.tsx`

```typescript
// Desktop (línea 63-72)
<img 
  src="/brand/creovision-logo.svg" 
  alt="Creovision" 
  className="h-[38px] w-auto object-contain block dark:hidden" 
/>
```

**Problema reportado**: Logo extremadamente pequeño, casi ilegible.

**Análisis**: 
- Altura CSS: `38px` (razonable)
- Si el logo se ve diminuto con esta altura, el problema está en el asset:
  - Canvas con márgenes transparentes excesivos
  - ViewBox mal ajustado
  - Contenido muy pequeño respecto al canvas

### Manifest Actual

✅ **Existe**: `public/manifest.webmanifest`  
✅ **Válido**: Estructura correcta  
✅ **Iconos referenciados**: 192x192, 512x512, maskable  

**Colors**:
- `background_color`: `#FFF8F2` (crema)
- `theme_color`: `#FF7F73` (coral)

### Referencias en `__root.tsx`

✅ Metadata correctamente configurada:
```typescript
{ rel: "icon", href: "/favicon.ico", sizes: "any" },
{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
{ rel: "icon", href: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
{ rel: "icon", href: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
{ rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
{ rel: "manifest", href: "/manifest.webmanifest" },
```

---

## 2. PROBLEMAS CONFIRMADOS

### A. Logo en Header
- ✅ **Código correcto**: altura 38px, object-contain
- ❌ **Asset defectuoso**: Canvas con exceso de espacio vacío
- ❌ **Resultado**: Logo diminuto, palabra ilegible

### B. Favicon
- ❌ **Casi invisible**: 335 bytes para .ico es sospechosamente pequeño
- ❌ **Pálido**: Colores suaves pierden presencia a 16x16
- ❌ **Probable**: Uso del logo completo reducido, no un isotipo optimizado

### C. Iconos PWA
- ✅ **Existen** todos los tamaños requeridos
- ⚠️ **Sin verificar**: Si usan isotipo o logo completo
- ⚠️ **Sin verificar**: Si maskable cumplen zona segura

---

## 3. PLAN DE ACCIÓN

### Fase 1: Preparar Master Asset
1. Abrir `LOGO_CREOVISION.svg`
2. Eliminar capa BACKGROUND (fondo azul)
3. Calcular bounding box real del contenido
4. Ajustar viewBox al contenido + margen 3-5%
5. Exportar `creovision-logo-master.svg` (limpio)
6. Exportar `creovision-logo-master.png` @ 2000px width (high-res)

### Fase 2: Logo para Header
1. Usar master con transparencia
2. Asegurar que el contenido llena ~90% del canvas
3. Verificar legibilidad a 40px altura

### Fase 3: Extraer Símbolo
1. Identificar isotipo en el SVG
2. Extraer solo símbolo (sin "Creovision")
3. Ajustar canvas al símbolo
4. Exportar `creovision-symbol-master.svg`

### Fase 4: Favicon Optimizado
1. Tomar símbolo
2. Optimizar para 16x16:
   - Simplificar detalles mínimos
   - Reforzar contraste
   - Ocupar 86-92% del canvas
3. Generar:
   - favicon.svg (optimizado)
   - favicon-16x16.png
   - favicon-32x32.png  
   - favicon-48x48.png
   - favicon.ico (con 3 tamaños embebidos)

### Fase 5: PWA Icons
1. Regenerar desde símbolo master
2. Tamaños: 72, 96, 128, 144, 152, 192, 384, 512
3. Maskable: 192, 512 con fondo sólido + zona segura

### Fase 6: Apple Touch Icon
1. 180x180px
2. Fondo sólido (crema `#FFF8F2`)
3. Símbolo centrado

### Fase 7: Validación
1. Test visual en Chrome
2. Verificar legibilidad
3. DevTools > Application > Manifest
4. HTTP 200 en todos los assets

---

## SIGUIENTE PASO

Proceder a extraer y limpiar el master asset desde `LOGO_CREOVISION.svg`.

