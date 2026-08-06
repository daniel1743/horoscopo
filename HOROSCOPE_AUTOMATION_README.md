# Sistema de Horóscopos Automatizado con IA

Sistema completo de generación automática de horóscopos usando DeepSeek AI, con soporte de 4 variantes por signo y publicación programada vía Vercel Cron.

## 🎯 Características

- ✅ **Generación automática** diaria, semanal y mensual
- ✅ **4 variantes por signo** para personalización (48 horóscopos por período)
- ✅ **Contexto astronómico real** usando astronomy-engine
- ✅ **Pipeline de calidad robusto** (anti-genérico, validación editorial)
- ✅ **Persistencia dual**: DB para usuarios autenticados, localStorage para visitantes
- ✅ **Scheduling con Vercel Cron** (diario 1:00, semanal lunes 1:00, mensual día 1)

## 📋 Requisitos Previos

1. **Cuenta DeepSeek**: Obtener API key en [platform.deepseek.com](https://platform.deepseek.com)
2. **Proyecto Supabase**: Base de datos PostgreSQL configurada
3. **Vercel Pro/Enterprise**: Para Vercel Cron (gratis en plan Pro)

## 🚀 Instalación

### 1. Migración de Base de Datos

Ejecutar la migración SQL en Supabase:

```bash
# Navegar a Supabase Dashboard > SQL Editor
# Copiar y ejecutar: supabase/migrations/20260805010000_horoscope_variants_system.sql
```

La migración crea:
- Columnas `variant_id` y `generation_metadata` en tabla `horoscopes`
- Tabla `user_horoscope_assignments` para tracking de variantes
- Tabla `horoscope_generation_logs` para monitoring
- Función `get_or_assign_variant()` para asignación consistente

### 2. Variables de Entorno

Configurar en **Vercel Dashboard** > **Settings** > **Environment Variables**:

```bash
# DeepSeek API
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Cron Security (generar con: openssl rand -base64 32)
CRON_SECRET=tu_token_secreto_super_seguro_aqui

# Supabase (ya existentes)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... # Necesario para cron jobs
```

**Importante**: El `CRON_SECRET` debe ser único y seguro. Vercel Cron lo enviará en cada request.

### 3. Desplegar a Vercel

```bash
# Build local para verificar
npm run build

# Deploy
vercel --prod
```

Vercel detectará automáticamente el archivo `vercel.json` y configurará los cron jobs.

### 4. Verificar Configuración

Hacer request GET al health check endpoint:

```bash
curl -X GET https://tu-dominio.vercel.app/api/cron/generate \
  -H "Authorization: Bearer TU_CRON_SECRET"
```

Respuesta esperada:
```json
{
  "healthy": true,
  "checks": {
    "cronSecretConfigured": true,
    "deepseekApiKeyConfigured": true,
    "supabaseConfigured": true
  },
  "message": "Sistema de generación automática operativo"
}
```

## 🕒 Scheduling

Los cron jobs están configurados en `vercel.json`:

| Frecuencia | Schedule | Endpoint |
|------------|----------|----------|
| **Diario** | `0 1 * * *` | `/api/cron/generate?period=daily` |
| **Semanal** | `0 1 * * 1` | `/api/cron/generate?period=weekly` |
| **Mensual** | `0 1 1 * *` | `/api/cron/generate?period=monthly` |

Todos se ejecutan a la **1:00 AM** (zona horaria del servidor).

### Monitorear Cron Jobs

1. **Vercel Dashboard** > **Deployments** > **Cron Logs**
2. Ver logs en tiempo real: `vercel logs --follow`
3. Consultar tabla `horoscope_generation_logs` en Supabase

## 🧪 Testing Manual

### Generar Horóscopos Manualmente

```bash
curl -X POST https://tu-dominio.vercel.app/api/cron/generate \
  -H "Authorization: Bearer TU_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "period": "daily",
    "signs": ["aries", "tauro"],
    "variants": [1, 2]
  }'
```

Respuesta:
```json
{
  "success": true,
  "batchId": "batch-daily-2026-08-05-...",
  "stats": {
    "totalRequested": 8,
    "totalGenerated": 8,
    "totalFailed": 0,
    "successRate": 100,
    "averageQualityScore": 78.5,
    "tokensUsed": {
      "input": 48000,
      "output": 28800
    }
  },
  "status": "completed"
}
```

## 💰 Costos Estimados

### DeepSeek API Pricing
- **Input**: ~$0.14 por millón de tokens
- **Output**: ~$0.28 por millón de tokens

### Cálculo Mensual (48 horóscopos/día)
```
Diario:    $0.015/día × 30 = $0.45
Semanal:   $0.015 × 4  = $0.06
Mensual:   $0.015 × 1  = $0.015
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:     ~$0.50 - $2.00/mes
```

**Nota**: Precio puede variar según temperatura, max_tokens y retries.

## 📊 Arquitectura de Variantes

### 4 Estrategias de Variación

| ID | Estrategia | Enfoque | Keywords |
|----|-----------|---------|----------|
| 1 | **Práctico** | Acción y resultados | actuar, lograr, construir |
| 2 | **Emocional** | Relaciones y sentimientos | sentir, conectar, compartir |
| 3 | **Reflexivo** | Crecimiento personal | reflexionar, comprender, crecer |
| 4 | **Intuitivo** | Espiritualidad y sincronicidad | percibir, fluir, confiar |

### Asignación de Variantes

- **Usuarios logueados**: Hash consistente basado en `user_id + sign + date` (guardado en DB)
- **Visitantes**: Hash consistente basado en `sessionId + sign + date` (guardado en localStorage)

Mismo usuario/visitante siempre ve la misma variante para un día dado.

## 🔍 Pipeline de Calidad

Cada horóscopo generado pasa por 4 validaciones:

1. **Estructural**: JSON válido, campos requeridos presentes
2. **Editorial**: Sin contenido prohibido (promesas absolutas, predicciones deterministas)
3. **Anti-genérico**: Detecta clichés, verifica mención de tránsitos planetarios
4. **Diversidad**: Las 4 variantes deben tener <40% similitud entre sí

Score mínimo aceptable: **40/100**

## 🛠️ Troubleshooting

### Cron Jobs No Se Ejecutan

1. Verificar que el plan de Vercel incluye Cron (Pro o Enterprise)
2. Revisar logs: `vercel logs --follow`
3. Verificar que `vercel.json` está en la raíz del proyecto
4. Re-deploy: `vercel --prod`

### Error de Autorización

```
{"error": {"code": "unauthorized", "message": "Token de autorización inválido"}}
```

**Solución**: Verificar que `CRON_SECRET` en Vercel coincide con el token usado.

### DeepSeek API Error 429 (Rate Limit)

**Solución**: 
- Reducir frecuencia de generación temporal
- Aumentar delay entre requests (implementar throttling)
- Contactar DeepSeek para aumentar rate limit

### Horóscopos No Aparecen en Frontend

1. Verificar que `published_at` no es NULL:
   ```sql
   SELECT * FROM horoscopes WHERE published_at IS NULL;
   ```
2. Si existen sin publicar, actualizar manualmente:
   ```sql
   UPDATE horoscopes 
   SET published_at = now() 
   WHERE published_at IS NULL AND variant_id IS NOT NULL;
   ```

## 📁 Estructura de Archivos

```
src/
├── server/horoscope-automation/
│   ├── astronomical-context.ts      # Posiciones planetarias reales
│   ├── batch-generator.ts           # Generador principal (12×4)
│   ├── deepseek-provider.ts         # Adaptador DeepSeek API
│   ├── quality-validator.ts         # Pipeline anti-genérico
│   └── variant-strategy.ts          # 4 estrategias de variación
├── lib/horoscope/
│   ├── repository.ts                # CRUD con variantes
│   └── visitor-storage.ts           # localStorage para visitantes
├── routes/api/cron/
│   └── generate.ts                  # Endpoint cron
├── types/
│   └── horoscope-automation.ts      # Tipos del sistema
└── supabase/migrations/
    └── 20260805010000_horoscope_variants_system.sql
```

## 🔐 Seguridad

- ✅ Endpoint `/api/cron/generate` protegido con Bearer token
- ✅ `CRON_SECRET` nunca expuesto al cliente (no prefix `VITE_`)
- ✅ `DEEPSEEK_API_KEY` solo server-side
- ✅ RLS habilitado en todas las tablas
- ✅ Rate limiting en generación (max 1 batch cada 20h)

## 📈 Monitoring y Métricas

### Consultas SQL Útiles

```sql
-- Horóscopos generados hoy
SELECT period, COUNT(*) as total, AVG((generation_metadata->>'qualityScore')::numeric) as avg_quality
FROM horoscopes
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY period;

-- Logs de generación recientes
SELECT batch_id, period, date_for, status, total_generated, total_failed, 
       generation_stats->>'durationSeconds' as duration
FROM horoscope_generation_logs
ORDER BY created_at DESC
LIMIT 10;

-- Distribución de variantes
SELECT variant_id, COUNT(*) as count
FROM horoscopes
WHERE DATE(date_for) = CURRENT_DATE
GROUP BY variant_id;
```

## 🚀 Próximos Pasos

1. **Dashboard Admin**: Ver estadísticas de generación
2. **A/B Testing**: Medir engagement por variante
3. **Notificaciones**: Email/push cuando se publican nuevos horóscopos
4. **Fallback Lovable**: Si DeepSeek falla, usar proveedor alternativo
5. **Cache**: Redis para reducir llamadas a DB

## 📞 Soporte

- **Issues**: [GitHub Issues](enlace-a-tu-repo)
- **DeepSeek Docs**: [platform.deepseek.com/docs](https://platform.deepseek.com/docs)
- **Vercel Cron Docs**: [vercel.com/docs/cron-jobs](https://vercel.com/docs/cron-jobs)

---

**Versión**: 1.0.0  
**Última actualización**: 2026-08-05
