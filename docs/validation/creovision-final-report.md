# Informe de implementación y validación — Creovision

**Fecha:** 27 de agosto de 2026  
**Rama de trabajo:** `redesign/fases-1-5`  
**HEAD local validado:** `170cc2a`  
**`origin/main`:** `93e6b28`  
**Estado de Supabase remoto:** sin escrituras ni migraciones aplicadas

## Resumen ejecutivo

Se completó el grupo adicional de tareas autorizado sobre la rama de trabajo, sin fusionar ni modificar `main`, sin desplegar y sin escribir en Supabase remoto. Además de las capacidades ya implementadas en fases anteriores, la rama ahora contiene una capa privada para guardar, recuperar, actualizar y eliminar datos natales; un formulario público de newsletter separado de la preferencia autenticada; una ruta de baja preparada para doble opt-in; paginación incremental acotada del feed comunitario; guardias contra doble envío en publicaciones, likes, republicaciones y reportes; y estados diferenciados para backend inaccesible en perfiles públicos.

La distinción entre **funcional**, **preparado** y **pendiente** es esencial. El cálculo astrológico local y el Tarot se comprobaron ejecutándose en el navegador. La persistencia natal está implementada en código, pero no puede declararse operativa contra datos reales hasta que el usuario revise y aplique la migración correspondiente y se pruebe con una cuenta autenticada. El newsletter público tiene contrato, UI y ruta de baja, pero no envía emails porque deliberadamente no se configuró proveedor, tabla ni credenciales. Comunidad, métricas y moderación siguen dependiendo de las migraciones y permisos remotos.

> **Regla de veracidad:** una ruta, un tipo, una migración o una configuración no se considera capacidad activa por sí sola. Este informe llama funcional únicamente a lo que se ejecutó localmente o quedó cubierto por una comprobación automatizada explícita.

## Estado actual por módulo

| Área | Estado real en la rama | Qué está implementado | Qué no debe afirmarse todavía |
|---|---|---|---|
| Tarot | **Funcional local** | Catálogo de 78 cartas, 22 Mayores, 56 Menores, fichas, significados al derecho e invertidos, Carta del Día, tiradas únicas y persistencia local de orientación | No se ha verificado el seed contra Supabase remoto ni producción |
| Astrología personal | **Cálculo funcional local; persistencia preparada** | Carta natal, Ascendente, Signo lunar, casas iguales, validación de fecha/hora/zona/coordenadas y panel privado de datos natales | No es Placidus ni carta profesional; la persistencia requiere migración y prueba autenticada; no está desplegada |
| Guías | **Funcional local** | 12 piezas editoriales originales, portada, detalle, categorías y fallback resiliente | No se ha aplicado el seed editorial remoto |
| Horóscopo | **Congelado y verificado** | Motor, contexto editorial, pregunta reflexiva y rutas existentes preservados | No se reescribió su lógica |
| Luna | **Congelado y verificado** | Fase, iluminación, edad, próximas fases y fichas existentes preservadas | No se reescribió su motor |
| Newsletter público | **UI y contrato preparados; envío no funcional** | Email, consentimiento obligatorio, doble envío bloqueado, estados de proveedor, duplicado y baja preparados | No guarda correos, no envía emails y no tiene proveedor conectado |
| Preferencia newsletter de cuenta | **Preservada** | `newsletter_opt_in` sigue siendo una preferencia de usuario autenticado | No es equivalente a suscripción pública anónima |
| Perfil público | **Estados de UI endurecidos** | Distingue backend inaccesible de perfil privado/inexistente y nunca muestra datos natales | No se verificó contra Supabase remoto |
| Comunidad | **Preparada, no activada remotamente** | Feed, compositor, likes, republicaciones, reportes, paginación incremental 30→50 y guardias contra doble acción | No se verificaron RLS, RPC ni acciones con cuentas reales |
| Métricas administrativas | **UI existente revisada** | Carga, error, valores agregados y estado protegido por ruta admin | No hay datos comprobados si el RPC no está aplicado |
| Moderación | **UI existente revisada** | Bandeja de reportes, roles, confirmación para ocultar, nota interna, error, vacío y bloqueo durante acción | No se verificó una operación real contra Supabase |
| Producción pública | **Sin cambios por esta tarea** | Los cambios están en la rama de trabajo | El público todavía no ve estas modificaciones hasta desplegar |

## Persistencia privada de astrología

Se añadió `src/lib/astrology/profile-repository.ts` como una capa aislada que lee exclusivamente los campos natales del propio usuario en `profiles`: fecha, hora, zona horaria IANA, etiqueta de lugar, latitud y longitud. La capa expone lectura, guardado/actualización y limpieza. La conversión a `BirthData` del motor local exige los campos mínimos necesarios y no persiste resultados calculados.

El perfil privado incorpora `AstrologyProfileSection`, con precarga al abrir la cuenta, edición, validación de zona horaria y límites geográficos, guardado, eliminación confirmada y mensajes diferenciados. Si no existe sesión, se informa que el usuario puede seguir usando el cálculo local sin guardar datos. Si el backend o las columnas aún no están disponibles, la UI no muestra un éxito falso y explica que el dato no fue confirmado como guardado.

El RPC de perfil público sigue utilizando una lista explícita de columnas públicas y no incluye hora, zona, coordenadas ni lugar natal. Esta separación evita que la persistencia privada se convierta accidentalmente en exposición pública.

La migración `20260827102000_astrology_birth_profile.sql` sigue siendo opcional y no aplicada. La persistencia natal, por tanto, se clasifica como **implementada en código y preparada para activación**, no como almacenamiento remoto ya operativo.

## Newsletter público, doble opt-in y baja

La portada y el footer ya no presentan la preferencia autenticada de cuenta como si fuera una suscripción pública. Ambos consumen `PublicNewsletterForm`, que exige correo válido y consentimiento explícito, bloquea el doble envío, anuncia estados mediante `aria-live`, enlaza al aviso de privacidad y muestra una ruta de gestión o baja.

`public-newsletter.functions.ts` define un contrato de proveedor futuro con estados para solicitud pendiente, confirmación, duplicado, baja, token inválido, backend no configurado, backend inaccesible y error. El proveedor actual es deliberadamente nulo: al probar con `persona@example.com`, la respuesta visible fue «La suscripción pública todavía no está conectada. No se guardó tu correo ni se envió ningún mensaje.» Por ello, **no se afirma que exista newsletter real ni doble opt-in activo**; existe la arquitectura de interfaz y el punto de extensión seguro para conectarlo después.

La ruta `/newsletter/unsubscribe` es `noindex,nofollow`. Sin token muestra un estado inválido; con un token sintético muestra el botón de proceso y, al ejecutarlo sin proveedor, informa que no se modificó ninguna suscripción. El token no se imprime en la página.

## Comunidad, perfil público y moderación

El feed comunitario conserva los estados de carga, error y vacío, y ahora puede aumentar el límite solicitado al RPC existente de 30 a 50 mediante «Cargar más publicaciones». Esta implementación respeta la firma remota disponible, que limita el resultado a 50; no pretende ser paginación ilimitada ni se presenta como cursor real. Las acciones de like, republicación, publicación y reporte tienen guardias adicionales contra doble envío y rollback cuando una operación optimista falla.

El perfil público diferencia un fallo del backend de los casos neutros de perfil privado o inexistente. Cuando la consulta no puede conectar, se muestra «Perfil temporalmente no disponible», se evita indexar la ruta y no se exponen datos. Cuando el RPC responde sin perfil, se conserva el mensaje neutro para no revelar si existe una cuenta privada.

La revisión del dashboard de métricas y la bandeja de moderación no encontró una carencia directa que justificara reescritura. Ambos ya tenían carga, error y vacío; moderación además exige rol en el guard de ruta y utiliza confirmación para ocultar publicaciones. Las acciones reales continúan pendientes de Supabase, roles y cuentas de prueba.

## Tarot, Guías y módulos congelados

El catálogo Tarot local contiene 78 registros únicos, con 22 Arcanos Mayores y 56 Arcanos Menores. Carta del Día mantiene carta y orientación mediante `localStorage`; la tirada de tres cartas mantiene extracciones únicas y transmite la orientación a cada resultado. La ficha del As de Bastos confirmó que un Arcano Menor tiene detalle propio y ambos significados. El contenido se presenta como lenguaje simbólico de reflexión, no como predicción determinista ni asesoramiento médico, legal o financiero. La división editorial entre Mayores y Menores está documentada por fuentes de referencia.[1] [2]

Las Guías locales contienen doce piezas originales, dos por categoría, con portada, filtros, detalle, autor, índice, referencias y aviso editorial global. El fallback local permite leerlas aunque Supabase no responda. El Tarot, las Guías, Horóscopo y Luna quedaron fuera de los cambios nuevos salvo adaptadores y enlaces ya validados.

## SEO y navegación

La rama conserva la marca Creovision, canonical `https://www.creovision.io`, metadata de Tarot, Astrología y Guías, y sitemap local con 53 URLs únicas. Las nuevas rutas de astrología, doce detalles de Guías y seis categorías se incorporan únicamente porque existen y pasaron la matriz local previa. El sitemap local no equivale al sitemap público; la paridad debe volver a comprobarse después del despliegue.

## Validaciones ejecutadas

La matriz local previa verificó 14 rutas de Tarot, Astrología, Guías, Horóscopo y Luna con HTTP 200, título no vacío y sin patrones de 404. Después se verificaron manualmente la portada pública del newsletter, la ruta de baja sin token, la ruta de baja con token sintético y un perfil público sintético con backend inaccesible. Las evidencias están en los archivos de notas adjuntos.

La comprobación nueva `npm run pending:check` terminó con **11 comprobaciones, 11 aprobadas y 0 fallos**. Cubre contratos de persistencia natal, separación del newsletter, consentimiento, baja `noindex`, paginación acotada, guardias comunitarias, perfil público, métricas y moderación.

La build `npm run build` terminó correctamente después de los cambios nuevos. También pasaron `git diff --check`, Prettier y lint focalizado sobre los archivos modificados. El lint global continúa teniendo deuda histórica ajena a este alcance; no se usó esa deuda para afirmar un fallo de los cambios nuevos.

La prueba visual del newsletter confirmó que el formulario anónimo no exige sesión y que, sin proveedor, no afirma guardar ni enviar. La prueba de baja confirmó token inválido y backend no configurado sin simulación de cancelación. La prueba de perfil confirmó que una falla de backend no se presenta como perfil privado ni expone información.

## Commits de este alcance

| Commit | Contenido |
|---|---|
| `32c3f2a` | Auditoría del alcance y persistencia privada de datos natales |
| `2dcfff3` | Formulario público newsletter, contrato de proveedor y ruta de baja |
| `ce82337` | Robustez de Comunidad y estados diferenciados de perfil público |
| `170cc2a` | Comprobación reproducible `pending:check` |

No se hizo merge, rebase, amend, squash ni force-push. `main` permanece en `93e6b28`. La rama de trabajo debe publicarse únicamente en `origin/redesign/fases-1-5` tras la revisión local final.

## Supabase: qué está preparado y qué falta

Los seeds Tarot y Guías, la migración natal y el runbook están en `supabase/migrations/` y `docs/supabase-activation/README.md`. No se aplicó ninguno. El orden recomendado continúa siendo revisar esquema, ejecutar manualmente cada bloque SQL en el proyecto correcto, verificar recuentos y probar con una cuenta de prueba antes de declarar persistencia o Comunidad operativas.

Para la persistencia natal, el usuario debe revisar `20260827102000_astrology_birth_profile.sql`, aplicar la migración y probar cargar, guardar, recargar y eliminar datos desde una cuenta autenticada. Para Comunidad debe revisar las migraciones sociales existentes, ejecutar el chequeo en un entorno con conectividad y probar publicación pública, like, republicación, reporte, ocultación y perfil público.

Para newsletter no existe todavía SQL ni proveedor real en esta rama. Antes de activar el envío se necesita elegir proveedor, definir tabla privada de suscripciones, confirmar token de doble opt-in, endpoint de confirmación, token de baja, rate limiting, política de retención, consentimiento y manejo de duplicados. Hasta entonces la UI debe permanecer en el estado honesto de backend no configurado.

> **No se aplicó ninguna migración ni se ejecutó ninguna escritura remota en Supabase.**

## Referencias

[1]: https://www.britannica.com/topic/tarot "Encyclopaedia Britannica — Tarot"

[2]: https://www.britannica.com/topic/Major-Arcana "Encyclopaedia Britannica — Major Arcana"

[3]: https://github.com/cosinekitty/astronomy "Astronomy Engine — documentación y código"

[4]: https://www.astro.com/swisseph/swephinfo_e.htm "Swiss Ephemeris — información técnica de referencia"

[5]: https://science.nasa.gov/moon/moon-phases/ "NASA Science — Moon Phases"

[6]: https://aa.usno.navy.mil/data/MoonPhases "U.S. Naval Observatory — Moon Phases"
