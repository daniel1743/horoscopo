#!/bin/bash

# Script de verificación SEO post-deployment
# Ejecutar: bash scripts/verify-seo.sh https://www.creovision.io

DOMAIN=${1:-"http://localhost:3000"}

echo "=================================="
echo "🔍 VERIFICACIÓN SEO - Creovision"
echo "=================================="
echo "Domain: $DOMAIN"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar robots.txt
echo "1️⃣  Verificando robots.txt..."
if curl -s "$DOMAIN/robots.txt" | grep -q "Sitemap:"; then
    echo -e "${GREEN}✅ robots.txt accesible y contiene sitemap${NC}"
else
    echo -e "${RED}❌ robots.txt no accesible o mal configurado${NC}"
fi
echo ""

# 2. Verificar sitemap.xml
echo "2️⃣  Verificando sitemap.xml..."
if curl -s "$DOMAIN/sitemap.xml" | grep -q "<urlset"; then
    URL_COUNT=$(curl -s "$DOMAIN/sitemap.xml" | grep -c "<url>")
    echo -e "${GREEN}✅ sitemap.xml accesible con $URL_COUNT URLs${NC}"
else
    echo -e "${RED}❌ sitemap.xml no accesible${NC}"
fi
echo ""

# 3. Verificar meta tags en home
echo "3️⃣  Verificando meta tags en Home..."
HOME_HTML=$(curl -s "$DOMAIN/")

if echo "$HOME_HTML" | grep -q '<meta name="description"'; then
    echo -e "${GREEN}✅ Meta description presente${NC}"
else
    echo -e "${RED}❌ Meta description faltante${NC}"
fi

if echo "$HOME_HTML" | grep -q '<meta property="og:title"'; then
    echo -e "${GREEN}✅ Open Graph tags presentes${NC}"
else
    echo -e "${RED}❌ Open Graph tags faltantes${NC}"
fi

if echo "$HOME_HTML" | grep -q '<meta name="twitter:card"'; then
    echo -e "${GREEN}✅ Twitter Cards presentes${NC}"
else
    echo -e "${RED}❌ Twitter Cards faltantes${NC}"
fi
echo ""

# 4. Verificar structured data
echo "4️⃣  Verificando structured data (JSON-LD)..."
if echo "$HOME_HTML" | grep -q 'application/ld+json'; then
    JSON_LD_COUNT=$(echo "$HOME_HTML" | grep -c 'application/ld+json')
    echo -e "${GREEN}✅ Structured data presente ($JSON_LD_COUNT bloques)${NC}"
else
    echo -e "${YELLOW}⚠️  Structured data no detectado${NC}"
fi
echo ""

# 5. Verificar canonical URL
echo "5️⃣  Verificando canonical URL..."
if echo "$HOME_HTML" | grep -q '<link rel="canonical"'; then
    echo -e "${GREEN}✅ Canonical URL presente${NC}"
else
    echo -e "${YELLOW}⚠️  Canonical URL no detectado${NC}"
fi
echo ""

# 6. Verificar título
echo "6️⃣  Verificando título de página..."
TITLE=$(echo "$HOME_HTML" | grep -o '<title>[^<]*</title>' | sed 's/<[^>]*>//g')
TITLE_LENGTH=${#TITLE}

if [ $TITLE_LENGTH -gt 0 ] && [ $TITLE_LENGTH -le 60 ]; then
    echo -e "${GREEN}✅ Título: '$TITLE' ($TITLE_LENGTH caracteres)${NC}"
elif [ $TITLE_LENGTH -gt 60 ]; then
    echo -e "${YELLOW}⚠️  Título demasiado largo: $TITLE_LENGTH caracteres (máx 60)${NC}"
else
    echo -e "${RED}❌ Título faltante${NC}"
fi
echo ""

# 7. Verificar headers de seguridad
echo "7️⃣  Verificando security headers..."
HEADERS=$(curl -sI "$DOMAIN/")

if echo "$HEADERS" | grep -qi "X-Frame-Options"; then
    echo -e "${GREEN}✅ X-Frame-Options presente${NC}"
else
    echo -e "${YELLOW}⚠️  X-Frame-Options faltante${NC}"
fi

if echo "$HEADERS" | grep -qi "X-Content-Type-Options"; then
    echo -e "${GREEN}✅ X-Content-Type-Options presente${NC}"
else
    echo -e "${YELLOW}⚠️  X-Content-Type-Options faltante${NC}"
fi
echo ""

# 8. Test de páginas críticas
echo "8️⃣  Verificando páginas críticas..."

CRITICAL_PAGES=(
    "/horoscopo/hoy"
    "/tarot/carta-del-dia"
    "/luna/hoy"
    "/astrologia/carta-natal"
)

for page in "${CRITICAL_PAGES[@]}"; do
    STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$DOMAIN$page")
    if [ "$STATUS" = "200" ]; then
        echo -e "${GREEN}✅ $page (200 OK)${NC}"
    else
        echo -e "${RED}❌ $page ($STATUS)${NC}"
    fi
done
echo ""

# 9. Verificar sitemap contiene rutas clave
echo "9️⃣  Verificando rutas clave en sitemap..."
SITEMAP=$(curl -s "$DOMAIN/sitemap.xml")

if echo "$SITEMAP" | grep -q "/horoscopo/hoy"; then
    echo -e "${GREEN}✅ Horóscopo en sitemap${NC}"
else
    echo -e "${RED}❌ Horóscopo faltante en sitemap${NC}"
fi

if echo "$SITEMAP" | grep -q "/tarot"; then
    echo -e "${GREEN}✅ Tarot en sitemap${NC}"
else
    echo -e "${RED}❌ Tarot faltante en sitemap${NC}"
fi

if echo "$SITEMAP" | grep -q "/luna"; then
    echo -e "${GREEN}✅ Luna en sitemap${NC}"
else
    echo -e "${RED}❌ Luna faltante en sitemap${NC}"
fi
echo ""

# 10. Resumen final
echo "=================================="
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "=================================="
echo ""
echo "✅ Pasos completados exitosamente"
echo "⚠️  Advertencias (revisar pero no crítico)"
echo "❌ Errores críticos (requieren corrección)"
echo ""
echo "Próximos pasos:"
echo "1. Corregir cualquier ❌ crítico"
echo "2. Registrar sitio en Google Search Console"
echo "3. Enviar sitemap manualmente"
echo "4. Monitorear indexación en 1-2 semanas"
echo ""
echo "Tools recomendadas:"
echo "- Google Rich Results Test: https://search.google.com/test/rich-results"
echo "- PageSpeed Insights: https://pagespeed.web.dev/"
echo "- Schema Validator: https://validator.schema.org/"
echo ""
