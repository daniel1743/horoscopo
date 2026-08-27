# Activación manual de Supabase para Creovision

Estos archivos son **preparación para revisión manual**. Ningún comando de esta tarea ha escrito en Supabase remoto. La aplicación tampoco ejecuta migraciones desde el navegador.

## Orden recomendado

1. Confirma en el panel de Supabase que las tablas base ya existen. Para Tarot deben existir `public.tarot_cards`; para Guías deben existir `public.editorial_categories`, `public.editorial_authors` y `public.editorial_articles`. Las migraciones de esquema originales están en `supabase/migrations/`.

2. Revisa y aplica manualmente `supabase/migrations/20260827100000_seed_full_tarot_catalog.sql`. Es un upsert por `slug`, contiene las **78 cartas** y añade significado al derecho, significado invertido, keywords, pregunta de reflexión, tendencia sí/no, estado publicado y metadata SEO. `image_key` es metadata simbólica; no requiere descargar ni comprar imágenes comerciales.

3. Comprueba el Tarot antes de continuar:

```sql
SELECT count(*) AS total, count(*) FILTER (WHERE arcana = 'major') AS mayores,
       count(*) FILTER (WHERE arcana = 'minor') AS menores
FROM public.tarot_cards
WHERE status = 'published';

SELECT slug, name, reversed_meaning IS NOT NULL AS has_reversed_meaning
FROM public.tarot_cards
WHERE status = 'published'
ORDER BY display_order;
```

El resultado esperado del primer query es `78 / 22 / 56`. Si hay cartas publicadas que no pertenecen a este catálogo o una colisión de slug con contenido editorial diferente, detén la operación y revisa antes de aceptar el `ON CONFLICT`.

4. Revisa y aplica manualmente `supabase/migrations/20260827101000_seed_real_editorial_guides.sql`. El primer `UPDATE` solo archiva el slug demo conocido `articulo-de-demostracion` cuando todavía está marcado `is_demo = true`; no archiva todas las filas demo. El `ON CONFLICT` actualiza solo filas demo o filas con el mismo slug ya marcadas por `Equipo editorial`. No borres artículos existentes.

5. Comprueba las Guías:

```sql
SELECT count(*) AS guides_published
FROM public.editorial_articles
WHERE status = 'published' AND is_demo = false;

SELECT c.key, count(a.id) AS articles
FROM public.editorial_categories c
LEFT JOIN public.editorial_articles a
  ON a.category_id = c.id AND a.status = 'published' AND a.is_demo = false
GROUP BY c.key
ORDER BY c.key;

SELECT slug, status, is_demo, published_at
FROM public.editorial_articles
WHERE is_demo = false
ORDER BY published_at DESC;
```

El catálogo preparado contiene 12 Guías, dos por cada clave `astrology`, `tarot`, `moon`, `compatibility`, `horoscope` y `editorial`. Si ya existen artículos legítimos con los mismos slugs, no aceptes el update sin revisarlos.

6. La migración opcional `supabase/migrations/20260827102000_astrology_birth_profile.sql` añade campos privados para una futura persistencia de datos natales del propio usuario. **No es necesaria para usar la carta natal actual**, porque el cálculo vigente es local y no guarda datos por defecto. Solo aplícala si se decide activar guardado autenticado y después de revisar las políticas RLS.

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
  AND column_name IN ('birth_date', 'birth_time', 'birth_timezone',
                      'birth_place_label', 'birth_latitude', 'birth_longitude');
```

La función `public.get_public_profile(TEXT)` debe continuar devolviendo únicamente los campos públicos definidos en su firma. No añadas fecha, hora, zona horaria ni coordenadas a esa función sin una decisión explícita de privacidad.

## Reglas de seguridad y reversión

Haz una copia o exportación antes de aplicar seeds en un proyecto con datos reales. Ejecuta cada archivo como una operación revisable y conserva el resultado de los queries de comprobación. Estos seeds no borran filas; aun así, un upsert puede reemplazar el contenido de una fila si existe una colisión de slug y cumple la condición del `DO UPDATE`. Una colisión inesperada debe resolverse renombrando el slug o ajustando el seed, no forzando la aplicación.

La aplicación local ya funciona con fallback para Tarot y Guías, por lo que **no es necesario aplicar SQL para validar las rutas locales**. La verificación remota social sigue pendiente porque el entorno de trabajo no pudo alcanzar Supabase; no debe interpretarse como prueba de que Comunidad está activada.

## Archivos preparados

| Archivo | Propósito | Riesgo de datos |
|---|---|---|
| `supabase/migrations/20260827100000_seed_full_tarot_catalog.sql` | Upsert idempotente de 78 cartas | Revisa colisiones de `slug`; no borra filas |
| `supabase/migrations/20260827101000_seed_real_editorial_guides.sql` | Upsert idempotente de 12 Guías y archivo acotado del demo conocido | Revisa colisiones de `slug`; no borra artículos |
| `supabase/migrations/20260827102000_astrology_birth_profile.sql` | Columnas privadas opcionales en `profiles` | Cambia esquema, no datos existentes |

## Estado de la aplicación antes de Supabase

Tarot y Guías tienen fallback local para funcionar en desarrollo sin red. Astrología personal calcula en el navegador con Astronomy Engine, posiciones tropicales de referencia, ascendente derivado del horizonte oriental y casas iguales. No se presenta como carta profesional ni como evidencia científica. La persistencia de perfiles natales todavía no está conectada a la UI y no debe declararse activa solo por aplicar las columnas.
