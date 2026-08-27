# Activación del backend social

## Propósito

Este documento guía la activación del perfil público, el muro, los reportes, los likes y las republicaciones de Creovision. La interfaz ya está versionada; la activación productiva debe hacerse de forma controlada y verificable.

> **Regla de seguridad:** las publicaciones y los datos de perfil son privados por defecto. Ninguna lectura debe pasar al muro público sin una acción explícita de la persona.

## Orden de migraciones

| Orden | Archivo                                      | Resultado                                                             |
| ----: | -------------------------------------------- | --------------------------------------------------------------------- |
|     1 | `20260826223000_profile_social_identity.sql` | Añade username, aura, visibilidad y función segura de perfil público. |
|     2 | `20260826224000_community_wall.sql`          | Añade publicaciones, reportes, RLS y feed público inicial.            |
|     3 | `20260826225000_community_interactions.sql`  | Añade likes, republicaciones y contadores.                            |
|     4 | `20260826225500_public_profile_feed.sql`     | Añade publicaciones y republicaciones dentro del perfil público.      |

Las migraciones deben aplicarse con el flujo habitual del proyecto Supabase. No se deben ejecutar copiando fragmentos aislados, porque las funciones de las migraciones posteriores reemplazan las firmas iniciales del feed.

## Preflight local

Con las variables públicas ya configuradas en el entorno, ejecutar:

```bash
npm run social:check
```

El comando comprueba la respuesta de `community_posts`, `list_public_community_posts`, `list_public_community_reposts` y `get_public_profile`. No crea registros ni modifica la base de datos. Si no puede alcanzar el host, devuelve un error y declara explícitamente que no se hicieron cambios remotos.

En la sesión de desarrollo del 26 de agosto de 2026, el preflight devolvió `fetch failed` para las cuatro comprobaciones porque el host remoto no era alcanzable desde la sandbox. Esto no demuestra que la migración haya fallado; significa que debe repetirse desde un entorno con conectividad al proyecto Supabase.

## Prueba de aceptación autenticada

La prueba debe ejecutarse con una cuenta de prueba, nunca con datos reales de una persona. El recorrido esperado es el siguiente:

| Paso | Verificación                                                                |
| ---: | --------------------------------------------------------------------------- |
|    1 | Crear o editar username y seleccionar una aura.                             |
|    2 | Confirmar que la visibilidad inicial es privada.                            |
|    3 | Activar perfil público y comprobar `/perfil/{username}`.                    |
|    4 | Verificar que ciudad y signo solo aparecen si sus controles están activos.  |
|    5 | Crear una publicación de prueba desde `/comunidad`.                         |
|    6 | Confirmar que una publicación privada no aparece en el feed público.        |
|    7 | Hacerla pública y verificar que aparece con el autor y aura correctos.      |
|    8 | Ocultarla y confirmar que desaparece del feed sin borrarse accidentalmente. |
|    9 | Marcar y retirar un me gusta desde otra cuenta.                             |
|   10 | Republicar y retirar la republicación desde otra cuenta.                    |
|   11 | Reportar la publicación una sola vez y comprobar el estado del reporte.     |
|   12 | Eliminar la publicación y verificar que deja de estar disponible.           |

## Revisión de privacidad y RLS

La función `get_public_profile` no devuelve fecha de nacimiento. Las funciones del feed solo devuelven contenido con `visibility = 'public'`, `status = 'published'` y perfil público. Las operaciones de escritura usan el usuario autenticado como dueño de la fila mediante RLS.

Los likes y republicaciones tienen una clave primaria compuesta por publicación y usuario. Por ello, una misma cuenta no puede crear reacciones duplicadas. Los reportes son visibles únicamente para quien los creó; la revisión administrativa requerirá una superficie posterior con rol protegido.

## Señales de bloqueo

La activación debe detenerse si la consulta pública devuelve perfiles privados, si una cuenta puede leer publicaciones privadas, si una cuenta puede modificar una publicación ajena o si el feed devuelve contenido después de eliminarlo. También debe detenerse ante errores de política RLS, funciones con firma diferente o discrepancias entre los tipos locales y el esquema remoto.

## Después de activar

Repetir `npm run social:check`, ejecutar la prueba autenticada y guardar una captura o registro de cada resultado. Después revisar logs de errores durante las primeras publicaciones y configurar límites anti-spam antes de abrir el muro a una audiencia amplia.
