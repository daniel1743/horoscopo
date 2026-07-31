# CONTRATO ORIGINAL — PROYECTO ASTRAL

**Versión:** v-21.000.001
**Estado:** CONTRATO ORIGINAL VIGENTE
**Tipo:** Documento normativo
**Idioma oficial:** Español
**Fecha de creación:** 2026-07-30
**Rama de creación:** feature/fase-2c-general-transit-engine
**Commit base de referencia:** 067536f

> **Declaración de alcance:** Este documento no representa el estado actual completo de implementación. Representa el contrato original y la dirección obligatoria del proyecto. La implementación podrá encontrarse parcial, pero ninguna fase futura debe contradecir este contrato sin una modificación formal de versión.

---

## 1. IDENTIFICACIÓN

| Campo | Valor |
|---|---|
| Nombre oficial | Proyecto Astral |
| Dominio actual | https://www.creovision.io |
| Repositorio | horoscopo |
| Versión del contrato | v-21.000.001 |
| Estado | CONTRATO ORIGINAL VIGENTE |
| Tipo | Documento normativo |
| Idioma oficial | Español |
| Propietario del producto | Daniel |
| Fecha de creación | 2026-07-30 |
| Rama en la que se creó | feature/fase-2c-general-transit-engine |
| Commit base actual | 067536f |

---

## 2. VISIÓN DEL PRODUCTO

Proyecto Astral es una plataforma de:

- Astrología
- Horóscopos
- Tarot
- Compatibilidad
- Información lunar
- Perfiles astrales
- Lecturas personalizadas
- Contenido editorial
- Herramientas de autoconocimiento

La plataforma no se reduce a mensajes genéricos diarios.

**Diferenciación principal:**

- Cálculos astronómicos deterministas
- Reglas astrológicas documentadas
- Trazabilidad
- Contenidos personalizados
- IA restringida a redacción
- Validaciones
- Fallbacks
- Automatización
- Experiencia premium
- Protección de datos

---

## 3. PRINCIPIOS NO NEGOCIABLES

1. La astronomía se calcula de forma determinista.
2. La IA no inventa posiciones planetarias.
3. La IA no inventa aspectos.
4. La IA no calcula astronomía.
5. La IA no sustituye reglas astrológicas.
6. La IA solo redacta a partir de datos estructurados.
7. Toda salida importante debe ser validable.
8. Debe existir fallback cuando falle la IA.
9. Los IDs relevantes deben ser estables.
10. Los resultados deben ser trazables.
11. La automatización debe poder operar sin intervención diaria.
12. Ninguna clave secreta puede llegar al cliente.
13. Los datos del usuario deben protegerse mediante sesión y RLS.
14. Los cambios críticos requieren auditoría.
15. No se mezcla una fase con cambios ajenos.
16. No se hacen commits masivos sin revisar staging.
17. Los agentes no pueden hacer push sin autorización explícita de Daniel.
18. Las migraciones deben estar versionadas.
19. No se ejecuta SQL remoto sin auditoría previa.
20. La interfaz debe evitar jerga técnica visible al usuario.

---

## 4. ARQUITECTURA OBLIGATORIA

### Flujo de datos

```
astronomía determinista
  → eventos temporales estructurados
    → contexto astrológico
      → reglas astrológicas
        → generación de contenido restringida
          → validación editorial y factual
            → fallback
              → persistencia
                → publicación
                  → monitoreo
```

### Responsabilidades por capa

| Capa | Responsabilidad |
|---|---|
| Astronomía determinista | Calcular posiciones planetarias, fases lunares, aspectos, tránsitos con engine local |
| Eventos temporales estructurados | Derivar ventanas de tiempo, eventos, hitos a partir de cálculos |
| Contexto astrológico | Construir contexto por signo, casa, elemento y modalidad |
| Reglas astrológicas | Aplicar reglas documentadas para interpretar configuraciones |
| Generación de contenido restringida | Redactar contenido con IA a partir de datos estructurados, sin inventar |
| Validación editorial y factual | Verificar que el contenido cumple restricciones, no contiene alucinaciones |
| Fallback | Proveer contenido de respaldo cuando la generación falle |
| Persistencia | Almacenar contenido generado, validado y publicado |
| Publicación | Exponer contenido con estado controlado y trazabilidad |
| Monitoreo | Alertar sobre fallos, omisiones, errores en la pipeline |

### Dependencias prohibidas

- **PlanetaryEngine** no depende de IA.
- **AspectEngine** no depende de contenido editorial.
- **RuleEngine** no consulta red.
- **Generador editorial** no altera cálculos astronómicos.
- **Persistencia** no decide interpretaciones.
- **UI** no calcula lógica astronómica crítica.

---

## 5. MÓDULOS FUNDAMENTALES

### PlanetaryEngine
- **Propósito:** Calcular posiciones planetarias heliocéntricas y geocéntricas.
- **Entradas:** Fecha UTC.
- **Salidas:** Posiciones planetarias (longitud, latitud, distancia, velocidad).
- **Dependencias permitidas:** astronomy-engine (npm).
- **Dependencias prohibidas:** IA, red, Supabase.
- **Invariantes:** Resultados deterministas para misma fecha.
- **Errores esperados:** Datos fuera de rango de JPL ephemeris.
- **Pruebas mínimas:** Comparación contra fixtures canónicos JPL.

### AspectEngine
- **Propósito:** Calcular aspectos entre planetas (conjunción, sextil, cuadratura, trígono, oposición).
- **Entradas:** Posiciones planetarias, fecha, orbes configurables.
- **Salidas:** Lista de aspectos con fase, orbe exacto, dirección.
- **Dependencias permitidas:** PlanetaryEngine.
- **Dependencias prohibidas:** IA, red.
- **Invariantes:** Fase de aspecto correcta (aplicando/separando).
- **Errores esperados:** Planetas sin posición calculada.
- **Pruebas mínimas:** Verificación de dirección de fase, orbes.

### GeneralTransitEngine
- **Propósito:** Calcular tránsitos generales para un período dado.
- **Entradas:** Fecha inicio, fecha fin o período único.
- **Salidas:** Lista de tránsitos activos con planetas, aspectos, orbes.
- **Dependencias permitidas:** PlanetaryEngine, AspectEngine.
- **Dependencias prohibidas:** IA, red.
- **Invariantes:** Transitividad correcta entre planetas.
- **Errores esperados:** Período sin tránsitos significativos.
- **Pruebas mínimas:** Verificación de tránsitos conocidos.

### TimeWindowEventResolver
- **Propósito:** Resolver eventos en ventanas temporales deterministas.
- **Entradas:** Ventana de tiempo, configuración planetaria.
- **Salidas:** Eventos resueltos con timestamp, tipo, intensidad.
- **Dependencias permitidas:** GeneralTransitEngine.
- **Dependencias prohibidas:** IA.
- **Invariantes:** Misma ventana produce mismos eventos.
- **Errores esperados:** Ventana sin eventos significativos.
- **Pruebas mínimas:** Idempotencia, precisión temporal.

### RuleEngine
- **Propósito:** Aplicar reglas astrológicas documentadas.
- **Entradas:** Configuración planetaria, eventos, contexto.
- **Salidas:** Interpretaciones estructuradas con puntuación y prioridad.
- **Dependencias permitidas:** AspectEngine, TransitEngine.
- **Dependencias prohibidas:** IA, red.
- **Invariantes:** Mismas entradas producen mismas reglas activadas.
- **Errores esperados:** Sin reglas aplicables para configuración.
- **Pruebas mínimas:** Cobertura de todas las reglas documentadas.

### SignContextBuilder
- **Propósito:** Construir contexto astrológico por signo zodiacal.
- **Entradas:** Signo, fecha, configuraciones planetarias.
- **Salidas:** Contexto estructurado con elemento, modalidad, regente, casa natural.
- **Dependencias permitidas:** Datos estáticos de signos.
- **Dependencias prohibidas:** IA.
- **Invariantes:** Contexto inmutable para mismo signo en misma fecha.
- **Errores esperados:** Signo no reconocido.
- **Pruebas mínimas:** 12 signos con contexto verificado.

### PromptBuilder
- **Propósito:** Construir prompts estructurados para IA a partir de datos astrológicos.
- **Entradas:** Contexto, reglas activadas, eventos, plantilla.
- **Salidas:** Prompt completo con instrucciones, restricciones y schema esperado.
- **Dependencias permitidas:** RuleEngine, SignContextBuilder.
- **Dependencias prohibidas:** Ejecución directa de IA.
- **Invariantes:** Prompt no contiene instrucciones para inventar datos.
- **Errores esperados:** Prompt excede límite de tokens.
- **Pruebas mínimas:** Validación de schema incluido en prompt.

### Strict JSON Parser
- **Propósito:** Parsear salida de IA con validación estricta de schema.
- **Entradas:** Texto crudo de IA, schema esperado.
- **Salidas:** Objeto validado o error estructurado.
- **Dependencias permitidas:** Zod.
- **Dependencias prohibidas:** Ninguna.
- **Invariantes:** Nunca devuelve datos que no cumplen el schema.
- **Errores esperados:** JSON malformado, campos faltantes, tipos incorrectos.
- **Pruebas mínimas:** Casos de error, edge cases de parsing.

### Horoscope Generator
- **Propósito:** Orquestar la generación completa de un horóscopo.
- **Entradas:** Signo, período, fecha.
- **Salidas:** Horóscopo completo con trazabilidad.
- **Dependencias permitidas:** Toda la pipeline anterior.
- **Dependencias prohibidas:** UI directa.
- **Invariantes:** Mismas entradas producen mismo horóscopo (seed determinista).
- **Errores esperados:** Fallo de IA activa fallback.
- **Pruebas mínimas:** Generación completa con verificación de trazabilidad.

### Editorial Validator
- **Propósito:** Validar contenido editorial contra restricciones.
- **Entradas:** Contenido generado, reglas editoriales.
- **Salidas:** Contenido aprobado, rechazado o con advertencias.
- **Dependencias permitidas:** Strict JSON Parser.
- **Dependencias prohibidas:** Modificación de contenido astronómico.
- **Invariantes:** No altera datos astronómicos en la validación.
- **Errores esperados:** Contenido con alucinaciones, fuera de tono, factualmente incorrecto.
- **Pruebas mínimas:** Casos de alucinación, tono, restricciones de contenido.

### Hallucination Controls
- **Propósito:** Detectar y prevenir alucinaciones en salida de IA.
- **Entradas:** Contenido generado, datos astronómicos de referencia.
- **Salidas:** Indicadores de alucinación, contenido marcado.
- **Dependencias permitidas:** PlanetaryEngine (datos de referencia).
- **Dependencias prohibidas:** Ninguna.
- **Invariantes:** No modifica contenido, solo marca.
- **Errores esperados:** Falsos positivos en expresiones poéticas.
- **Pruebas mínimas:** Alucinaciones conocidas detectadas.

### Fallback Generator
- **Propósito:** Generar contenido de respaldo cuando la IA falla.
- **Entradas:** Signo, período, contexto.
- **Salidas:** Horóscopo de fallback con marca de origen.
- **Dependencias permitidas:** Datos estáticos, plantillas.
- **Dependencias prohibidas:** IA.
- **Invariantes:** Siempre produce contenido publicable.
- **Errores esperados:** Ninguno (debe ser infalible).
- **Pruebas mínimas:** Disponibilidad para todos los signos y períodos.

### Persistence Layer
- **Propósito:** Almacenar y recuperar contenido generado.
- **Entradas:** Contenido validado, metadatos.
- **Salidas:** Contenido persistido con ID.
- **Dependencias permitidas:** Supabase.
- **Dependencias prohibidas:** Alteración de contenido.
- **Invariantes:** Nunca pierde contenido validado sin registro.
- **Errores esperados:** Conflictos de duplicados, errores de conexión.
- **Pruebas mínimas:** CRUD, idempotencia, recuperación.

### Scheduler / Cron
- **Propósito:** Disparar generación automática en horarios definidos.
- **Entradas:** Configuración de schedule.
- **Salidas:** Ejecuciones registradas.
- **Dependencias permitidas:** Horoscope Generator, Persistence Layer.
- **Dependencias prohibidas:** UI.
- **Invariantes:** Ejecuciones idempotentes, sin duplicados.
- **Errores esperados:** Timeout, fallo de generación.
- **Pruebas mínimas:** Simulación de ejecución programada.

### Publication Layer
- **Propósito:** Controlar qué contenido está visible públicamente.
- **Entradas:** Contenido persistido, fecha de publicación.
- **Salidas:** Contenido marcado con estado de publicación.
- **Dependencias permitidas:** Persistence Layer.
- **Dependencias prohibidas:** IA.
- **Invariantes:** Solo contenido validado puede publicarse.
- **Errores esperados:** Contenido sin validación intentando publicarse.
- **Pruebas mínimas:** Transiciones de estado.

### Moon Engine
- **Propósito:** Calcular fases lunares, salida, puesta, altura, azimut.
- **Entradas:** Fecha, ubicación (lat/lon), timezone.
- **Salidas:** Fase lunar, iluminación, horarios de salida/puesta, posición.
- **Dependencias permitidas:** astronomy-engine.
- **Dependencias prohibidas:** IA.
- **Invariantes:** Cálculos deterministas para misma fecha y ubicación.
- **Errores esperados:** Ubicación no disponible (usa UTC por defecto).
- **Pruebas mínimas:** Comparación contra efemérides conocidas.

### Tarot Engine
- **Propósito:** Gestionar mazo, tiradas, interpretaciones.
- **Entradas:** Tipo de tirada, seed opcional.
- **Salidas:** Cartas seleccionadas, posiciones, interpretaciones.
- **Dependencias permitidas:** Datos estáticos de mazo.
- **Dependencias prohibidas:** IA para selección de cartas.
- **Invariantes:** Misma seed produce misma tirada.
- **Errores esperados:** Mazo no inicializado.
- **Pruebas mínimas:** Reproducibilidad con seed, 78 cartas disponibles.

### Compatibility Engine
- **Propósito:** Calcular compatibilidad entre signos zodiacales.
- **Entradas:** Par de signos.
- **Salidas:** Puntuación de compatibilidad, dinámicas, fortalezas, desafíos.
- **Dependencias permitidas:** Datos estáticos, RuleEngine.
- **Dependencias prohibidas:** IA.
- **Invariantes:** Par (A,B) = Par (B,A).
- **Errores esperados:** Signo no reconocido.
- **Pruebas mínimas:** 78 pares únicos, normalización.

### Search
- **Propósito:** Indexar y buscar contenido editorial y astrológico.
- **Entradas:** Query de búsqueda, filtros.
- **Salidas:** Resultados ordenados por relevancia.
- **Dependencias permitidas:** Supabase (search_index).
- **Dependencias prohibidas:** IA.
- **Invariantes:** Resultados consistentes para misma query.
- **Errores esperados:** Índice vacío, query sin resultados.
- **Pruebas mínimas:** Relevancia, paginación, filtros.

### Editorial CMS
- **Propósito:** Gestionar artículos, autores, categorías.
- **Entradas:** Contenido editorial, metadatos.
- **Salidas:** Artículos publicados con slug canónico.
- **Dependencias permitidas:** Supabase.
- **Dependencias prohibidas:** Ninguna.
- **Invariantes:** Slugs únicos.
- **Errores esperados:** Slug duplicado, autor no existente.
- **Pruebas mínimas:** CRUD, validación de slugs.

### Authentication
- **Propósito:** Autenticar usuarios, gestionar sesiones.
- **Entradas:** Credenciales, tokens OAuth.
- **Salidas:** Sesión validada, usuario autenticado.
- **Dependencias permitidas:** Supabase Auth.
- **Dependencias prohibidas:** Exposición de service_role al cliente.
- **Invariantes:** Nunca confía en user_id enviado por cliente.
- **Errores esperados:** Token expirado, credenciales inválidas.
- **Pruebas mínimas:** Login, registro, callback, logout, recuperación.

### Profile System
- **Propósito:** Gestionar datos básicos de usuario.
- **Entradas:** Datos de perfil.
- **Salidas:** Perfil actualizado.
- **Dependencias permitidas:** Authentication, Supabase.
- **Dependencias prohibidas:** Ninguna.
- **Invariantes:** Un perfil por usuario.
- **Errores esperados:** Usuario no autenticado.
- **Pruebas mínimas:** CRUD con RLS.

### Astral Profile
- **Propósito:** Almacenar datos natales del usuario para personalización.
- **Entradas:** Fecha, hora, lugar de nacimiento.
- **Salidas:** Perfil astral con carta natal calculada.
- **Dependencias permitidas:** PlanetaryEngine, Profile System.
- **Dependencias prohibidas:** IA.
- **Invariantes:** No inventa hora cuando es desconocida.
- **Errores esperados:** Hora desconocida, ubicación no geolocalizable.
- **Pruebas mínimas:** Validación de campos obligatorios/opcionales.

### Admin
- **Propósito:** Panel de administración para contenido y usuarios.
- **Entradas:** Acciones administrativas.
- **Salidas:** Operaciones confirmadas con registro.
- **Dependencias permitidas:** Supabase (service_role en servidor).
- **Dependencias prohibidas:** Exposición de service_role al cliente.
- **Invariantes:** Solo usuarios con rol admin acceden.
- **Errores esperados:** Acceso no autorizado, operación no permitida.
- **Pruebas mínimas:** Control de acceso, CRUD, auditoría.

### Monitoring
- **Propósito:** Supervisar salud del sistema, pipeline de generación.
- **Entradas:** Logs, métricas, alertas.
- **Salidas:** Estado del sistema, notificaciones.
- **Dependencias permitidas:** Sistema de logging.
- **Dependencias prohibidas:** Datos sensibles en logs.
- **Invariantes:** No expone datos de usuario en logs.
- **Errores esperados:** Servicio de monitoreo no disponible.
- **Pruebas mínimas:** Alertas, recuperación.

---

## 6. HORÓSCOPOS

Deben existir:

- Diario
- Semanal
- Mensual
- Por signo
- General
- Personalizado (cuando haya perfil natal)

Los horóscopos no deben construirse únicamente con frases aleatorias.

**El contenido debe originarse en:**

- Posiciones calculadas
- Aspectos
- Eventos temporales
- Contexto por signo
- Reglas astrológicas
- Restricciones editoriales

**Debe existir:**

- Fecha de vigencia
- Período
- Trazabilidad
- Versión del generador
- Estado editorial
- Fallback
- Control de duplicados
- Publicación programada

---

## 7. LUNA

- Fases calculadas con motor astronómico
- Instante base en UTC
- Conversión a zona horaria del usuario
- Localización futura para salida, puesta, altura y azimut
- No inventar precisión geográfica
- Diferenciar fase global de observación local

**Pendiente oficial:**

- Detección de timezone
- Ubicación opcional con permiso
- Selector manual de ciudad
- Cálculos lunares locales

---

## 8. TAROT

El tarot debe manejar:

- Mazo documentado
- Identificadores estables
- Cartas derechas e invertidas si aplica
- Tiradas reproducibles cuando exista seed
- Interpretación separada de selección
- Historial del usuario
- Límites o créditos cuando se implementen
- Fallback sin IA
- IA restringida a interpretación estructurada

La selección de cartas no debe depender de una respuesta inventada por IA.

---

## 9. PERFIL ASTRAL

### Datos previstos

| Dato | Requerido | Notas |
|---|---|---|
| Nombre visible | Sí | |
| Fecha de nacimiento | Sí | |
| Hora de nacimiento | No | Estado: exact / approximate / unknown |
| Lugar de nacimiento | No | Ciudad, región, país |
| Código de país | No | |
| Zona horaria | No | Derivada o manual |
| Latitud | No | |
| Longitud | No | |
| Fecha de completado | Auto | |
| Fecha de actualización | Auto | |

### Reglas

- No inventar 12:00 cuando la hora es desconocida
- No confundir lugar de nacimiento con ubicación actual
- Explicar por qué se solicita cada dato
- Registro básico separado del perfil astral
- No exigir todos los datos en la creación inicial de cuenta
- Indicar limitaciones de precisión cuando falte hora
- No guardar dirección residencial

---

## 10. AUTENTICACIÓN

### Funcionalidades

- Login por correo
- Registro
- Confirmación de correo
- Recuperación de contraseña
- Cambio de contraseña
- Logout
- Google OAuth
- Callback seguro
- Sesión SSR
- Protección de rutas
- Onboarding posterior

### Principios

- No guardar contraseñas
- No exponer tokens
- No revelar existencia de cuentas
- No confiar en user_id enviado por cliente
- Usar sesión validada
- Service role solo en servidor
- Mensajes en español
- Interfaz premium
- Errores comprensibles
- Sin jerga como Supabase, callback, RLS, PKCE o SSR visible al usuario

---

## 11. SUPABASE

### Usos

- Autenticación
- Base de datos
- RLS
- Migraciones
- Perfiles
- Artículos
- Búsqueda
- Admin
- Persistencia

### Reglas

- Toda modificación estructural mediante migración
- No SQL manual sin registrar
- No duplicar tablas
- No duplicar triggers
- No duplicar políticas
- Mantener RLS
- Service role solo servidor
- Políticas de usuario propio
- Auditoría antes de producción
- Backups antes de migraciones destructivas
- No hacer cambios destructivos salvo aprobación explícita

---

## 12. IA

### La IA puede:

- Redactar
- Resumir
- Adaptar tono
- Estructurar
- Generar variantes controladas
- Explicar datos ya calculados

### La IA no puede:

- Inventar astronomía
- Inventar tránsitos
- Modificar cálculos
- Generar identificadores arbitrarios
- Omitir datos obligatorios
- Saltarse validaciones
- Publicar directamente sin controles
- Sustituir fallback
- Ejecutar SQL
- Tomar decisiones de seguridad

### Toda salida de IA debe:

- Cumplir schema
- Pasar parser estricto
- Pasar validador
- Incluir trazabilidad
- Tener límites de tokens
- Tener timeout
- Tener reintentos controlados
- Tener fallback

---

## 13. AUTOMATIZACIÓN

### Visión obligatoria

- Generación diaria
- Generación semanal
- Generación mensual
- Persistencia
- Publicación automática
- Cron
- Reintentos
- Bloqueo de duplicados
- Idempotencia
- Logs
- Alertas
- Recuperación ante fallos
- Mínima intervención manual

### Flujo completo

```
cálculo → reglas → generación → validación → persistencia → publicación → monitoreo
```

---

## 14. PUBLICACIÓN

### Estados

- `draft`
- `generated`
- `validated`
- `rejected`
- `fallback`
- `scheduled`
- `published`
- `archived`

### Cada publicación debe registrar

- Tipo
- Período
- Signo
- Fecha
- Versión
- Fuente
- Estado
- Timestamps
- Errores
- Trazabilidad

---

## 15. DISEÑO Y UX

### Incluye

- Diseño premium
- Responsive
- Accesible
- Mobile-first
- Consistencia visual
- Tokens centralizados
- Iconografía coherente
- Focus visible
- Teclado
- Labels persistentes
- Errores junto al campo
- Toasts con moderación
- Loading
- Prevención de doble submit
- prefers-reduced-motion

### No mostrar

- Nombres de tecnologías
- Mensajes de consola
- Errores internos
- Términos técnicos innecesarios
- Placeholders de desarrollo
- Rutas de infraestructura

---

## 16. SEGURIDAD

- Secretos solo servidor
- Prohibido prefijo VITE_ para secretos
- RLS obligatorio
- Validación de sesión
- No confiar en IDs del cliente
- Sanitización
- Límites de entrada
- Rate limiting
- Headers
- Protección de admin
- noindex en rutas privadas
- Logs sin datos sensibles
- Auditoría de dependencias
- Control de permisos

---

## 17. DESPLIEGUE

### Entorno

| Aspecto | Valor |
|---|---|
| Plataforma | Vercel |
| Framework | TanStack Start |
| Preset Nitro | vercel |
| SSR | Sí |
| Server functions | Sí |
| API routes | Sí |
| Streaming | Sí |
| Backend | Supabase |
| Dominio | www.creovision.io |

### Reglas

- Build debe pasar
- SSR debe mantenerse
- No convertir en SPA estática
- Variables de entorno separadas cliente/servidor
- Rama de producción controlada
- Preview antes de producción cuando corresponda
- Rollback disponible
- No desplegar con secretos en Git

---

## 18. SEO

### Debe contemplar

- Sitemap
- Robots
- Canonical
- Titles
- Descriptions
- Open Graph
- Twitter Cards
- Schema.org
- noindex para:
  - Admin
  - Mi espacio
  - Autenticación
  - Design system
  - Rutas privadas

---

## 19. PRUEBAS

### Niveles

- Unitarias
- Integración
- Migraciones
- RLS
- SSR
- Rutas
- Autenticación
- Callback
- Recuperación
- Generación
- Validación
- Persistencia
- Publicación
- End-to-end

### No se acepta como prueba

- Archivo vacío
- Test sin assertions
- Test que siempre pasa
- Mock que sustituye toda la lógica real

---

## 20. AGENTES Y RESPONSABILIDADES

| Agente | Responsabilidades |
|---|---|
| **Antigravity** | Documentación masiva, inventarios, tareas extensas, investigación interna |
| **Cline** | Auditoría, regresiones, seguridad, revisión de cambios, validación |
| **Codex** | Implementación concreta, corrección de código, pruebas, migraciones, cambios controlados |
| **Claude** | Arquitectura profunda, lógica crítica, decisiones complejas, revisión superior |
| **ChatGPT** | Arquitectura, dirección, contratos, prompts, revisión de entregas, coordinación de agentes |
| **Daniel** | Aprobación final, ejecución de Git, secretos, configuración externa, despliegues, decisiones de producto |

---

## 21. CONTROL DE GIT

### Obligatorio

- Revisar `git status`
- Revisar staging
- No incluir `.env`
- No incluir archivos ajenos
- Commits por alcance
- No mezclar fases
- No push automático
- Daniel ejecuta commit y push
- Confirmar branch
- Confirmar diff
- Confirmar archivos no rastreados
- Restaurar archivos generados cuando corresponda

---

## 22. CONTROL DE VERSIONES DEL CONTRATO

**Versión actual:** v-21.000.001

**Formato:** `v-MAYOR.MENOR.REVISIÓN`

| Tipo de cambio | Cuándo |
|---|---|
| **MAYOR** | Cambia arquitectura, visión, fuente de verdad, modelo de seguridad o automatización |
| **MENOR** | Se añade un módulo, se amplía alcance, se añaden nuevas obligaciones |
| **REVISIÓN** | Se aclara texto, se corrige contradicción, se mejora documentación sin alterar alcance |

Nunca sobrescribir silenciosamente esta versión.

Las futuras versiones deben crear un documento nuevo o un historial explícito de cambios.

---

## 23. GOBERNANZA

- Ningún agente puede modificar el contrato sin instrucción explícita
- Ningún hallazgo técnico invalida el contrato automáticamente
- Si implementación y contrato difieren, debe documentarse la brecha
- Los cambios de contrato requieren motivo
- Deben registrar impacto
- Deben registrar fecha
- Deben registrar autor
- Deben registrar aprobación de Daniel

---

## 24. ESTADO DE IMPLEMENTACIÓN

**Estado conocido al crear v-21.000.001 (2026-07-30)**

### Implementado

| Módulo | Evidencia |
|---|---|
| PlanetaryEngine | `src/server/planetary/` — Código fuente presente |
| AspectEngine | `src/server/aspects/` — Código fuente presente, test suite vacía |
| GeneralTransitEngine | `src/server/transits/` — Código fuente presente, test suite vacía |
| TimeWindowEventResolver | `src/server/transits/` — 20 tests ✅ |
| RuleEngine | `src/server/rules/` — 21 tests ✅ |
| SignContextBuilder | `src/server/rules/` — 30 tests ✅ |
| PromptBuilder | `src/server/generation/` — 6 tests ✅ |
| Strict JSON Parser | `src/server/generation/` — 29 tests ✅ |
| Horoscope Generator | `src/server/generation/` — 9 tests ✅ |
| Editorial Validator | `src/server/validation/` — 51 tests ✅ |
| Fallback Generator | `src/server/generation/` — 7 tests ✅ |
| Persistence Layer | `src/server/persistence/` — 18 tests ✅ |
| Moon Engine | `src/server/moon/` — Código fuente presente, test suite vacía |
| Search | `src/server/search/` — Código fuente presente |
| Editorial CMS | `src/routes/_authenticated/admin/` — CRUD implementado |
| Authentication | `src/integrations/supabase/auth-middleware.ts` — SSR + callback |
| Tarot (estático) | `src/data/tarot.ts` — 78 cartas, `src/routes/tarot.*` |
| Compatibility | `src/services/compatibility.service.ts` — Normalización implementada |
| Admin | `src/routes/_authenticated/admin/` — Panel con CRUD |
| SEO (robots) | `public/robots.txt` |
| Despliegue (build) | `npm run build` exit 0, preset vercel configurado |
| Supabase (migraciones) | 15 migraciones en `supabase/migrations/` |

### Parcial

| Módulo | Estado |
|---|---|
| IA Gateway | `src/lib/ai/gateway.server.ts` — Código presente. Sin `LOVABLE_API_KEY` no opera |
| Scheduler / Cron | Sin implementación de trigger automático |
| Publication Layer | Pipeline de estados definida, no conectada a cron |
| Perfil Astral | `src/lib/ai/account.functions.ts` — Parcialmente implementado |
| SEO (sitemap) | No generado |
| SEO (meta tags) | Parcial — SSR renderiza pero requiere revisión ruta por ruta |
| Luna (localización) | astronomy-engine integrado, sin geolocalización de usuario |

### Pendiente

| Módulo | Estado |
|---|---|
| Google OAuth | No verificado en código actual |
| Monitoring | Sin implementación visible |
| Rate Limiting (producción) | Sin implementación verificada |
| Hallucination Controls | Sin archivo dedicado visible (lógica integrada en Editorial Validator) |

### No auditado

| Módulo | Motivo |
|---|---|
| RLS en producción | Sin acceso a Supabase |
| Storage (Supabase) | Sin referencias en código auditado |
| Schema.org | No verificado en templates SSR |
| End-to-end tests | Sin script de test E2E en package.json |

### Bloqueado

| Módulo | Bloqueante |
|---|---|
| Generación automática completa | Requiere `LOVABLE_API_KEY` + cron |
| Publicación automática | Requiere pipeline de generación activa |

---

## 25. MATRIZ DE CUMPLIMIENTO

| Área | Obligación | Estado | Evidencia | Pendiente |
|---|---|---|---|---|
| Astronomía | Cálculos deterministas | Implementado | `src/server/planetary/` + astronomy-engine | Test suite vacía |
| Aspectos | Cálculo de aspectos con fase | Implementado | `src/server/aspects/` | Test suite vacía |
| Tránsitos | Tránsitos generales | Implementado | `src/server/transits/` | Test suite vacía |
| Reglas | RuleEngine con reglas documentadas | Implementado | 21 tests ✅ | — |
| Generación | Horoscope Generator | Implementado | 9 tests ✅ | Sin IA conectada |
| Validación | Editorial Validator | Implementado | 51 tests ✅ | — |
| Fallback | Fallback Generator | Implementado | 7 tests ✅ | — |
| Persistencia | Persistence Layer | Implementado | 18 tests ✅ | Sin cron conectado |
| Publicación | Estados y trazabilidad | Parcial | Código en `src/server/` | Sin pipeline automática |
| Cron | Scheduler | Pendiente | — | Requiere implementación |
| Autenticación | Login, registro, SSR | Implementado | `auth-middleware.ts` | Google OAuth no verificado |
| Perfil astral | Datos natales | Parcial | `account.functions.ts` | Geolocalización pendiente |
| Google OAuth | Login social | No auditado | — | No verificado en código |
| Supabase | DB, Auth, RLS | Implementado | 15 migraciones | Sin verificar en producción |
| RLS | Row Level Security | Implementado (migraciones) | Migraciones SQL | Sin verificar aplicadas |
| Despliegue | Vercel + SSR | Implementado | Build exit 0, preset vercel | `vercel.json` pendiente |
| SEO | Sitemap, robots, meta | Parcial | robots.txt ✅ | Sitemap, meta tags, noindex |
| Monitoreo | Logs, alertas | Pendiente | — | Requiere implementación |
| Pruebas | Unitarias | Parcial | 191 tests ✅, 4 suites vacías | Integration, E2E |
| Localización lunar | Geolocalización usuario | Pendiente | astronomy-engine integrado | UI de ubicación |

---

## 26. DECLARACIÓN FINAL

Este contrato constituye la referencia original obligatoria de Proyecto Astral en su versión v-21.000.001. Toda implementación, auditoría, migración, despliegue o ampliación futura debe revisarse contra sus principios. Las excepciones requieren documentación expresa y aprobación de Daniel.
