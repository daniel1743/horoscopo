# Registro Maestro de Pendientes (No Bloqueantes)

## Propósito del registro

Permitir que el proyecto continúe cuando un hallazgo no bloquea la fase siguiente. Conservar especificaciones completas para resolverlo obligatoriamente antes del despliegue.

## Reglas para determinar BLOQUEANTE o NO_BLOQUEANTE

### BLOQUEANTE

- **Definición**: Impide que la siguiente fase funcione correctamente, introduce riesgo de seguridad o datos, rompe contratos o imposibilita validar el cambio.
- **Acción**: Detener únicamente el flujo afectado y corregir antes de continuar.

### NO_BLOQUEANTE

- **Definición**: No afecta el funcionamiento de la fase siguiente y puede resolverse posteriormente sin invalidar el trabajo que se continuará realizando.
- **Acción**: Registrar con especificación completa y continuar.

## Reglas para Agentes

- Antes de detener una fase, demostrar por qué el hallazgo bloquea la siguiente.
- No llamar BLOQUEANTE a una mejora, certificación adicional o limpieza documental.
- Todo pendiente no bloqueante debe registrarse con especificación suficiente.
- No registrar frases vagas como revisar después.
- Cada pendiente debe incluir solución y criterios de aceptación.
- Los pendientes no pueden desaparecer silenciosamente.
- Antes de desplegar, todos los pendientes de puerta despliegue deben estar RESUELTOS o descartados con aprobación de Daniel.
- Un bloqueo debe detener solo el flujo afectado, no todo el proyecto.

## Estados Permitidos

- ABIERTO
- EN_PROGRESO
- BLOQUEADO_EXTERNAMENTE
- RESUELTO
- DESCARTADO_CON_JUSTIFICACION

---

## Puerta obligatoria antes del despliegue

Todos los pendientes en estado ABIERTO o EN_PROGRESO cuya puerta de cierre indique "Antes del despliegue" o "Antes del despliegue público" deben estar RESUELTOS o DESCARTADOS_CON_JUSTIFICACION (con aprobación del usuario) antes de que el código llegue a producción.

---

## Pendientes Abiertos

### PEND-ASTRAL-001

- **Título**: Certificación externa de posiciones planetarias contra JPL Horizons
- **Estado**: ABIERTO
- **Clasificación**: NO_BLOQUEANTE
- **Severidad**: ALTA antes del despliegue
- **Fase donde fue encontrado**: Fase 2A
- **Descripción**: Falta certificación rigurosa de exactitud matemática del engine mediante una muestra contundente de datos reales de JPL Horizons.
- **Evidencia**:
  - Solo existen cinco fixtures externos USNO defendibles para el Sol.
  - Los fixtures de los otros nueve cuerpos no tienen respuestas originales verificables de JPL.
  - Existe al menos un fixture contaminado por validación circular.
- **Por qué no bloquea el avance actual**: Astronomy Engine declara precisión aproximada de un arcminute y está validado oficialmente contra NOVAS y JPL. El defecto inmediato está en la ventana utilizada para la derivada, no en absoluteLongitude.
- **Riesgo de aplazarlo**: Alto riesgo de liberar funciones basadas en posiciones incorrectas y de perder confiabilidad técnica del proyecto.
- **Archivos relacionados**: Documentación de pruebas y configuración de la Fase 2A.
- **Solución requerida**:
  - Ejecutar al menos 20 consultas oficiales de JPL con fixtures JPL reales.
  - Guardar respuestas crudas y SHA-256 de cada respuesta.
  - Verificar compatibilidad de coordenadas.
  - Comparar expected externo contra Astronomy Engine.
  - Eliminar definitivamente fixtures contaminados.
- **Criterios de aceptación**: Múltiples fixtures verificados rigurosamente contra JPL sin divergencias superiores a los márgenes tolerables.
- **Comandos de validación**: N/A
- **Responsable recomendado**: N/A
- **Fecha límite o puerta de cierre**: Obligatorio antes del despliegue.
- **Dependencias**: N/A
- **Fecha de creación**: 2026-07-28
- **Fecha de resolución**: N/A

### PEND-ASTRAL-002

- **Título**: ADR de ubicación canónica de PlanetaryEngine
- **Estado**: ABIERTO
- **Clasificación**: NO_BLOQUEANTE
- **Severidad**: MEDIA
- **Fase donde fue encontrado**: Fase 2A
- **Descripción**: La ubicación final de PlanetaryEngine debe alinearse con la arquitectura deseada a largo plazo.
- **Evidencia**: El componente se ubicó temporalmente bajo src/server/planetary.
- **Por qué no bloquea el avance actual**: PlanetaryEngine puede permanecer provisionalmente en src/server/planetary/ sin mover archivos ni romper imports.
- **Riesgo de aplazarlo**: Potencial deuda técnica si los imports crecen extensamente atados a una ruta no canónica.
- **Archivos relacionados**: `src/server/planetary/`
- **Solución requerida**:
  - Aprobar ADR.
  - Aclarar o enmendar la Constitución.
  - Registrar la decisión en MASTER_DECISION_LOG.
- **Criterios de aceptación**: ADR redactado y aprobado formalmente.
- **Comandos de validación**: N/A
- **Responsable recomendado**: N/A
- **Fecha límite o puerta de cierre**: Antes del despliegue o antes de una reorganización astronómica.
- **Dependencias**: Ninguna
- **Fecha de creación**: 2026-07-28
- **Fecha de resolución**: N/A

### PEND-ASTRAL-003

- **Título**: Depuración de documentos Fase 2A contradictorios
- **Estado**: ABIERTO
- **Clasificación**: NO_BLOQUEANTE
- **Severidad**: MEDIA
- **Fase donde fue encontrado**: Fase 2A
- **Descripción**: Documentación antigua podría contener información desactualizada, instrucciones inválidas o conclusiones superadas que confundan a agentes futuros.
- **Evidencia**: Hallazgos continuos iterativos generaron versiones iterativas de guías.
- **Por qué no bloquea el avance actual**: Los agentes actuales están en contexto sobre cuál es la verdad técnica actual.
- **Riesgo de aplazarlo**: Riesgo de que en siguientes etapas un LLM extraiga reglas viejas (alucinaciones) de docs no depurados.
- **Archivos relacionados**: Todos los `.md` en `documentacion/fase-2a/`
- **Solución requerida**:
  - Identificar documentos canónicos.
  - Marcar versiones contaminadas como OBSOLETAS.
  - Evitar que agentes futuros las utilicen como fuente.
- **Criterios de aceptación**: Todos los `.md` de la fase antigua están limpios, organizados o rotulados adecuadamente.
- **Comandos de validación**: N/A
- **Responsable recomendado**: N/A
- **Fecha límite o puerta de cierre**: Antes de la auditoría final del proyecto.
- **Dependencias**: Ninguna
- **Fecha de creación**: 2026-07-28
- **Fecha de resolución**: N/A

---

## Pendientes Resueltos

_(No hay registros por el momento)_

---

## Historial de cambios

- **2026-07-28**: Creación del archivo `PENDIENTES_ANTES_DE_DESPLEGAR.md` e inicialización de PEND-ASTRAL-001, PEND-ASTRAL-002, PEND-ASTRAL-003.
