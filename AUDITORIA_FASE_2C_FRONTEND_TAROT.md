# AUDITORÍA FASE 2C — FRONTEND TAROT

**Fecha:** 2026-07-31
**Estado:** Lectura sin modificaciones
**Objetivo:** Validar arquitectura actual y preparar conexión de imágenes Supabase Storage

---

## 1. ESTADO ACTUAL DE LA BASE DE DATOS

### Cartas en `public.tarot_cards`
- **Total:** 78 cartas
  - Arcanos Mayores: 22
  - Arcanos Menores (wands): 14
  - Arcanos Menores (cups): 14
  - Arcanos Menores (swords): 14
  - Arcanos Menores (pentacles): 14

### Propiedades críticas
```
status = 'draft'       (todas las 78)
is_demo = true         (todas las 78)
published_at = NULL    (todas las 78)
image_key ≠ null       (todas las 78)
```

### Ejemplo de valores
```json
{
  "id": "uuid-123",
  "card_key": "the_fool",
  "slug": "el-loco",
  "name": "El Loco",
  "arcana": "major",
  "image_key": "tarot_major_00_the_fool",
  "status": "draft",
  "is_demo": true,
  "published_at": null
}
```

---

## 2. FUENTE ACTUAL DE CARTAS

### Consulta principal: `supabase-tarot.repository.ts`
**Archivo:** `src/repositories/supabase-tarot.repository.ts:12-25`

```typescript
async function selectPublished(filter?: {
  arcana?: TarotArcana;
  suit?: TarotSuit;
}): Promise<TarotCard[]> {
  let q = cli()
    .from("tarot_cards")
    .select(TAROT_CARD_COLUMNS)
    .order("display_order", { ascending: true });
  if (filter?.arcana) q = q.eq("arcana", filter.arcana);
  if (filter?.suit) q = q.eq("suit", filter.suit);
  const { data, error } = await q;
  if (error) throw error;
  return (data as TarotCardRow[] | null)?.map(mapTarotCardRow) ?? [];
}
```

**CRÍTICO:** NO filtra por `published_at` ni `status`. Devuelve todas las filas.

### Consumo de la consulta
- **Punto de entrada:** `TarotService.loadDeck()` → `supabaseTarotRepository.getPublishedCards()`
- **Propagación:** TarotService → páginas de tarot → componentes

---

## 3. FILTROS APLICADOS

| Lugar | Filtro | Efecto |
|-------|--------|--------|
| `supabase-tarot.repository.ts` | Ninguno | Lee todas las cartas (draft + published) |
| `search-source-registry.ts` | `status='published' AND published_at IS NOT NULL AND published_at ≤ NOW()` | Excluye drafts de búsqueda |
| Componentes | Ninguno | Renderizan todo lo que reciben |

**Estado actual:** Las 78 cartas en draft están disponibles en la UI pero EXCLUIDAS de búsqueda.

---

## 4. MAPPER DE IMÁGENES ACTUAL

**Archivo:** `src/components/tarot/TarotCardVisual.tsx:52-62`

```typescript
function getTarotImageUrl(imageKey: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://mmfendqrucasrcsfsvpw.supabase.co";
  let subfolder = "unknown";
  if (imageKey.startsWith("tarot_major_")) subfolder = "major";
  else if (imageKey.startsWith("tarot_wands_")) subfolder = "wands";
  else if (imageKey.startsWith("tarot_cups_")) subfolder = "cups";
  else if (imageKey.startsWith("tarot_swords_")) subfolder = "swords";
  else if (imageKey.startsWith("tarot_pentacles_")) subfolder = "pentacles";

  return `${supabaseUrl}/storage/v1/object/public/tarot/${subfolder}/${imageKey}.webp`;
}
```

**PROBLEMAS:**
1. Hardcodea el dominio de Supabase en cada componente
2. Duplica lógica si existe en múltiples sitios
3. NO usa `supabase.storage.from().getPublicUrl()` (método oficial)
4. Fallback a URL hardcodeada si `VITE_SUPABASE_URL` no existe
5. Subfolder "unknown" no es validado

---

## 5. COMPONENTES QUE USAN IMÁGENES

| Componente | Archivo | Ubicación | Referencia |
|------------|---------|-----------|-----------|
| `TarotCardVisual` | `src/components/tarot/TarotCardVisual.tsx:36` | Renderiza `<img>` con `getTarotImageUrl()` | Línea 36 |
| `TarotPositionResult` | `src/components/tarot/TarotPositionResult.tsx` | Importa y usa `TarotCardVisual` | - |
| `TarotCardGrid` | `src/components/tarot/TarotCardGrid.tsx` | Importa y usa `TarotCardVisual` | - |
| `DailyTarotCard` | `src/components/home/DailyTarotCard.tsx` | Componente home, usa `TarotCardVisual` | - |
| `TarotCardDetailPage` | `src/pages/tarot/TarotCardDetailPage.tsx` | Página de detalle, usa `TarotCardVisual` | - |

---

## 6. FLUJO DE DATOS ACTUAL

```
TarotService.loadDeck()
    ↓
supabaseTarotRepository.getPublishedCards()
    ↓
selectPublished() [NO FILTER]
    ↓
Supabase.from('tarot_cards').select() → 78 cartas draft
    ↓
mapTarotCardRow() → TarotCard[] (con imageKey)
    ↓
Componentes de tarot
    ↓
TarotCardVisual(card)
    ↓
getTarotImageUrl(card.imageKey)
    ↓
<img src="https://.../tarot/major/tarot_major_00_the_fool.webp" />
```

---

## 7. PLACEHOLDERS GEOMÉTRICOS

**No encontrados en componentes de tarot.**
- Solamente símbolo genérico en estado "not revealed" (icono tarot)
- No hay PNG/SVG geométricos sustituyendo imágenes

---

## 8. REFERENCIAS ANTIGUAS

**Búsqueda de `tarot_card_*`:** Ninguna encontrada en código fuente.
- El patrón fue reemplazado correctamente por `tarot_{arcana}_{key}`
- Ejemplo: `tarot_major_00_the_fool` ✓

---

## 9. ARCHIVOS A MODIFICAR

### Fase B (Mapper centralizado)
1. **Crear nuevo mapper:**
   - `src/lib/tarot/image-url.ts` (nueva)
   - Función: `getTarotImageStoragePath(arcana, suit, imageKey)`
   - Retorna ruta remota validada

2. **Actualizar TarotCardVisual:**
   - `src/components/tarot/TarotCardVisual.tsx`
   - Reemplazar `getTarotImageUrl()` por import del nuevo mapper
   - Usar `supabase.storage.from().getPublicUrl()` oficial

### Fase C (Conexión de componentes)
- `src/components/tarot/TarotPositionResult.tsx`
- `src/components/tarot/TarotCardGrid.tsx`
- `src/components/home/DailyTarotCard.tsx`
- `src/pages/tarot/TarotCardDetailPage.tsx`
- Cualquier otro componente que renderice `TarotCardVisual`

### Fase D (RLS y acceso a drafts)
- `src/repositories/supabase-tarot.repository.ts`
- Evaluar si necesita mostrar drafts en desarrollo

### Fase E (Tests)
- Crear/actualizar tests para mapper
- Validar 78 rutas correctas
- Verificar HTTP 200 de URLs públicas

---

## 10. CONDICIÓN ACTUAL DE DRAFTS

**¿Cómo se accede actualmente?**
- La consulta NO filtra → retorna todos
- El repositorio NO valida `published_at`
- Resultado: drafts son visibles sin validación explícita

**Riesgo:** Si el repositorio se corrige para filtrar `published_at`, las 78 cartas desaparecerán de UI.

---

## 11. RIESGOS IDENTIFICADOS

| Riesgo | Severidad | Descripción |
|--------|-----------|-------------|
| **Hardcoding de URL** | Alta | Dominio duplicado, fallback frágil |
| **Sin validación de imageKey** | Media | `subfolder: 'unknown'` no detecta errores |
| **Sin RLS aparente** | Alta | Drafts accesibles sin autenticación en UI |
| **Duplicación lógica** | Media | getTarotImageUrl no centralizado |
| **Falta filtro published_at** | Alta | Consulta devuelve todo, incluyendo drafts intencionalmente o no |
| **Sin tests de rutas** | Media | 78 rutas sin validación automática |

---

## 12. AUDITORÍA DE CONSULTAS

### Todos los puntos que consultan tarot_cards

1. **Principal UI (TarotService → supabaseTarotRepository)**
   - Filtro: NINGUNO
   - Devuelve: Todas las 78 cartas draft

2. **Búsqueda (search-source-registry.ts)**
   - Filtro: status='published' AND published_at IS NOT NULL AND published_at ≤ NOW()
   - Devuelve: Solo publicadas (actualmente 0)

3. **Detail by slug (TarotCardDetailPage)**
   - Usa: `getCardBySlug()` → sin filtro
   - Devuelve: La carta solicitada (draft o published)

---

## 13. BUCKET STORAGE

### Configuración remota
- **Bucket:** `tarot` (público)
- **Organización:**
  ```
  tarot/
  ├── major/
  │   ├── tarot_major_00_the_fool.webp
  │   ├── tarot_major_01_the_magician.webp
  │   └── ... (22 total)
  ├── wands/
  │   ├── tarot_wands_ace.webp
  │   └── ... (14 total)
  ├── cups/ (14 total)
  ├── swords/ (14 total)
  └── pentacles/ (14 total)
  ```

### Acceso público
- URL patrón: `https://{supabase-url}/storage/v1/object/public/tarot/{folder}/{image_key}.webp`
- RLS: Público (no requiere auth)

---

## 14. VALIDACIÓN ACTUAL

### Qué existe
- ✓ Catálogo completo (78 cartas en BD)
- ✓ Imágenes subidas (78 WebP en bucket)
- ✓ Tipos TypeScript correctos
- ✓ Componentes rendering

### Qué falta
- ✗ Función centralizada de URLs
- ✗ Validación de rutas con test
- ✗ Uso del cliente oficial de Supabase Storage
- ✗ Documentación de acceso a drafts
- ✗ Tests de mapeo 78 cartas

---

## CONCLUSIÓN FASE A

### Síntesis
**Estado:** Las 78 cartas están en BD, imágenes en Storage, componentes renderizando.
**Problema:** `getTarotImageUrl()` hardcodeada, sin centralización, sin validación robusta.

### Próximos pasos
1. ✓ Auditoría completada (sin cambios)
2. → Crear mapper centralizado (`Fase B`)
3. → Conectar componentes (`Fase C`)
4. → Resolver acceso a drafts (`Fase D`)
5. → Validar con tests (`Fase E`)

---
