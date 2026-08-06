# 🚀 Checklist Post-Deployment SEO

Ejecutar estos pasos **inmediatamente después** de hacer deploy a producción.

---

## ✅ Verificación Inmediata (Día 1)

### 1. Verificar Archivos SEO Básicos

```bash
# Test local antes de deploy
npm run dev

# Verificar en navegador:
http://localhost:3000/sitemap.xml
http://localhost:3000/robots.txt

# O con curl:
curl http://localhost:3000/sitemap.xml
curl http://localhost:3000/robots.txt
```

**Esperado**:
- ✅ `sitemap.xml` muestra XML válido con ~80 URLs
- ✅ `robots.txt` muestra configuración correcta con referencia a sitemap

### 2. Deploy a Producción

```bash
vercel --prod
```

### 3. Ejecutar Script de Verificación

```bash
# Dar permisos de ejecución
chmod +x scripts/verify-seo.sh

# Ejecutar verificación
bash scripts/verify-seo.sh https://www.creovision.io
```

**Revisar output y corregir** cualquier ❌ crítico.

### 4. Verificación Manual en Navegador

Visitar estas URLs en **modo incógnito**:

- [ ] https://www.creovision.io/
- [ ] https://www.creovision.io/sitemap.xml
- [ ] https://www.creovision.io/robots.txt
- [ ] https://www.creovision.io/horoscopo/hoy
- [ ] https://www.creovision.io/tarot/carta-del-dia
- [ ] https://www.creovision.io/luna/hoy

**Verificar en cada página**:
- [ ] Título en pestaña del navegador (<60 caracteres)
- [ ] No hay errores en consola (F12)
- [ ] Página carga en <3 segundos

### 5. Verificar Meta Tags

Instalar extensión: **SEO Meta in 1 Click** (Chrome/Edge)

En cada página principal, verificar:
- [ ] Title presente y único
- [ ] Meta description presente (<160 caracteres)
- [ ] Canonical URL correcto
- [ ] Open Graph tags (og:title, og:description, og:image)
- [ ] Twitter Cards

---

## 📊 Registro en Herramientas (Día 1-2)

### 1. Google Search Console

**URL**: https://search.google.com/search-console

**Pasos**:
1. [ ] Hacer clic en "Agregar propiedad"
2. [ ] Seleccionar "Prefijo de URL"
3. [ ] Ingresar: `https://www.creovision.io`
4. [ ] Verificar propiedad (método: HTML tag)
   - Copiar meta tag de verificación
   - Agregar a `<head>` del sitio
   - Re-deploy
   - Clic en "Verificar"
5. [ ] Una vez verificado:
   - Ir a "Sitemaps"
   - Agregar sitemap: `sitemap.xml`
   - Clic en "Enviar"
6. [ ] Configurar:
   - País de destino: España
   - Idioma: Español
7. [ ] Esperar 24-48h para primeros datos

### 2. Bing Webmaster Tools

**URL**: https://www.bing.com/webmasters

**Pasos**:
1. [ ] Registrarse con cuenta Microsoft
2. [ ] "Agregar sitio"
3. [ ] Ingresar: `https://www.creovision.io`
4. [ ] Verificar (método: HTML tag o importar desde Google)
5. [ ] Enviar sitemap: `https://www.creovision.io/sitemap.xml`
6. [ ] Configurar país/idioma

### 3. Google Analytics 4 (Opcional)

**URL**: https://analytics.google.com/

**Pasos**:
1. [ ] Crear propiedad GA4
2. [ ] Obtener Measurement ID (G-XXXXXXXXXX)
3. [ ] Agregar a variables de entorno:
   ```
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
4. [ ] Implementar tracking (si aún no existe)

---

## 🧪 Testing y Validación (Día 2-3)

### 1. Google Rich Results Test

**URL**: https://search.google.com/test/rich-results

**Test en**:
- [ ] Home: `https://www.creovision.io/`
- [ ] Horóscopo: `https://www.creovision.io/horoscopo/hoy`
- [ ] Artículo (si existe): `https://www.creovision.io/guias/[slug]`

**Esperado**: ✅ "Eligible for rich results"

### 2. Schema Markup Validator

**URL**: https://validator.schema.org/

Pegar el HTML de la home y verificar:
- [ ] Organization schema válido
- [ ] WebSite schema válido
- [ ] Sin errores críticos

### 3. PageSpeed Insights

**URL**: https://pagespeed.web.dev/

Test en:
- [ ] Home
- [ ] Horóscopo Hoy
- [ ] Tarot Diario

**Metas**:
- Performance: >80
- Accessibility: >90
- Best Practices: >90
- SEO: 100

**Core Web Vitals**:
- LCP: <2.5s
- FID: <100ms
- CLS: <0.1

### 4. Mobile-Friendly Test

**URL**: https://search.google.com/test/mobile-friendly

**Test**: `https://www.creovision.io/`

**Esperado**: ✅ "Page is mobile friendly"

### 5. Test de Seguridad

**URL**: https://securityheaders.com/

**Test**: `https://www.creovision.io/`

**Esperado**: Grade A o B

---

## 📈 Monitoreo (Semana 1-4)

### Semana 1

- [ ] Revisar GSC diariamente para errores de rastreo
- [ ] Verificar que sitemap muestra "Success" (puede tardar 2-3 días)
- [ ] Revisar Coverage report en GSC
- [ ] Corregir cualquier error 404

### Semana 2

- [ ] Verificar primeras páginas indexadas (GSC → Coverage)
- [ ] Revisar primeras queries en GSC → Performance
- [ ] Verificar que structured data aparece en GSC
- [ ] Solicitar indexación manual de páginas principales:
  - En GSC, ir a "URL Inspection"
  - Ingresar URL
  - Clic en "Request Indexing"

### Semana 3-4

- [ ] Monitorear impresiones y clics (GSC → Performance)
- [ ] Identificar queries que generan tráfico
- [ ] Optimizar páginas con alto CTR pero bajo ranking
- [ ] Crear contenido para queries con impresiones pero sin clics

---

## 🎯 Metas de Indexación

| Timeframe | Meta | Verificación |
|-----------|------|--------------|
| 48 horas | Sitio verificado en GSC/Bing | ✅ Verificado |
| 1 semana | 10-20 páginas indexadas | GSC → Coverage |
| 2 semanas | 40-60 páginas indexadas | GSC → Coverage |
| 4 semanas | 70-80 páginas indexadas | GSC → Coverage |

---

## 🐛 Troubleshooting Común

### Problema: Sitemap no se procesa en GSC

**Solución**:
1. Verificar que `sitemap.xml` es accesible públicamente
2. Verificar que el XML es válido (sin errores de sintaxis)
3. Re-enviar en GSC
4. Esperar 24-48h

### Problema: Páginas no se indexan

**Soluciones**:
1. Verificar que no están bloqueadas en `robots.txt`
2. Verificar que no tienen `noindex` en meta tags
3. Verificar que están en el sitemap
4. Solicitar indexación manual en GSC
5. Asegurar que tienen enlaces internos desde páginas indexadas

### Problema: Rich snippets no aparecen

**Soluciones**:
1. Validar structured data en Rich Results Test
2. Esperar 4-8 semanas (Google toma tiempo)
3. Asegurar que el contenido es de alta calidad
4. Verificar que el JSON-LD está en el HTML renderizado

### Problema: Performance baja en PageSpeed

**Soluciones**:
1. Optimizar imágenes (usar WebP, lazy loading)
2. Minimizar CSS/JS no usado
3. Implementar CDN
4. Habilitar compresión Brotli/Gzip
5. Reducir tiempo de respuesta del servidor

---

## 📞 Contactos y Recursos

### Support
- **Google Search Central**: https://support.google.com/webmasters
- **Bing Webmaster Help**: https://www.bing.com/webmasters/help

### Community
- **r/SEO**: https://www.reddit.com/r/SEO/
- **WebmasterWorld**: https://www.webmasterworld.com/
- **Search Engine Journal**: https://www.searchenginejournal.com/

### Tools Adicionales
- **Screaming Frog** (SEO Spider): Auditoría técnica
- **Ahrefs** / **SEMrush**: Análisis de keywords y backlinks
- **GTmetrix**: Performance testing
- **WebPageTest**: Testing avanzado

---

## ✅ Checklist Final

**Antes de considerar completo**:

- [ ] ✅ Sitio verificado en Google Search Console
- [ ] ✅ Sitio verificado en Bing Webmaster Tools
- [ ] ✅ Sitemap enviado y procesándose
- [ ] ✅ robots.txt accesible y correcto
- [ ] ✅ Meta tags verificados en páginas principales
- [ ] ✅ Structured data válido (Rich Results Test)
- [ ] ✅ Performance >80 en PageSpeed Insights
- [ ] ✅ Mobile-friendly verificado
- [ ] ✅ Security headers implementados
- [ ] ✅ Primeras páginas indexadas (1-2 semanas)
- [ ] ✅ Monitoring configurado (GSC + Analytics)

---

**Estado**: ⏳ Ejecutar después de deployment  
**Tiempo estimado**: 2-3 horas  
**Responsable**: Equipo técnico + SEO manager
