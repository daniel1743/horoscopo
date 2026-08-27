# Auditoría de pendientes de código autorizados

## Persistencia de astrología personal

La calculadora local ya existe y no se modifica. El esquema preparado añade `birth_time`, `birth_timezone`, `birth_place_label`, `birth_latitude` y `birth_longitude` a `profiles`, pero el tipo `Profile`, el repositorio y `ProfilePage` todavía solo manejan `birth_date`. Falta una capa específica que lea, guarde, actualice y elimine exclusivamente esos campos, y que traduzca el caso de migración ausente o backend inaccesible a un estado controlado. La persistencia debe permanecer privada; el RPC público de perfil ya tiene una lista explícita de columnas y no incluye datos natales.

## Newsletter público

`useNewsletterSubscription` implementa solamente `newsletter_opt_in` para una persona autenticada cuyo email coincide con la cuenta. Home y footer están acoplados a ese hook y presentan el formulario como si fuera una suscripción pública. Falta separar el flujo anónimo: contrato de email + consentimiento, estados controlados, protección contra doble submit, servicio/server function sin proveedor, respuesta `backend_not_configured`, estado de duplicado y ruta de baja. No se debe introducir un proveedor ni afirmar envío.

## Métricas

El repositorio ya expone `fetchAdminProductMetrics` vía RPC y el dashboard admin consume la consulta con carga, error y estado vacío. No hay evidencia en esta auditoría de que falte UI; se conserva sin refactor hasta revisar el contrato de tipos y la tolerancia a RPC ausente.

## Perfil público

El repositorio ya tiene `fetchPublicProfile`, `listPublicProfilePosts` y `listPublicProfileReposts`, y el RPC devuelve solo columnas públicas. La página evita renderizar datos natales, pero colapsa perfil inexistente, perfil privado, error de red y RPC no disponible en un estado genérico. Falta distinguir esos estados sin exponer información privada y mantener vacíos de publicaciones/republicaciones como estados normales.

## Comunidad

El repositorio ya contiene creación, ocultación, eliminación, likes, republicaciones y reportes. La UI contempla login requerido, carga, error y vacío, pero usa límites fijos de 30 sin paginación visible y la robustez de acciones duplicadas/errores depende de cada componente. Se revisarán y corregirán únicamente huecos concretos, sin intentar validar RLS ni Supabase remoto.

## Moderación

La página de moderación ya tiene consulta, carga, error, vacío, acciones hide/dismiss no optimistas y botones deshabilitados durante la acción. Solo se cambiará si la revisión encuentra una carencia directa en el alcance.

## Límites operativos

No se aplican migraciones, no se escribe en Supabase remoto, no se despliega, no se toca `main`, no se rehacen Tarot, Guías, Astrología, Horóscopo ni Luna y no se agregan dependencias grandes solo para probar.
