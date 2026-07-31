# ADR-001: Ubicación del Motor Planetario (PlanetaryEngine)

> **Estado**: PROPUESTA PENDIENTE DE APROBACIÓN
> **Autor**: Auditor Opus (propuesta técnica)
> **Fecha**: 2026-07-28
> **Aprobado por**: Daniel (pendiente)

---

## CONTEXTO

El proyecto Astral tiene una restricción en su Constitución: todos los cálculos astronómicos deben residir en `src/server/moon/`.

Actualmente:
- `PlanetaryEngine` está en `src/server/planetary/`
- `MoonEngine` está en `src/server/moon/`
- Se ha propuesto `src/server/astronomy/` como ubicación alternativa

## OPCIONES

### Opción A: Mantener `src/server/planetary/`
**Estado actual.**

Ventajas:
- Nombre descriptivo y específico (motor planetario)
- Patrón adaptador claro: `astronomy-planetary-engine.ts`
- No requiere migración de archivos
- Compatible con consumo futuro por múltiples consumidores

Desventajas:
- Potencial conflicto con la regla de "cálculos en moon/"

### Opción B: Mover a `src/server/astronomy/`
**Propuesta alternativa.**

Ventajas:
- Semántica amplia (incluye lunares, solsticios, etc.)

Desventajas:
- Nombre demasiado vago
- Requiere migración de archivos
- Añade una capa adicional de indirección

### Opción C: Mover a `src/server/moon/`
**Opción constitucional.**

Ventajas:
- Cumple literalmente la regla de la Constitución

Desventajas:
- `PlanetaryEngine` no es específico de la Luna
- Mezcla responsabilidades (motor planetario genérico + motor lunar)
- Incoherencia semántica

## DECISIÓN

**Seleccionar Opción A: Mantener `src/server/planetary/`**

### Justificación

1. **Nombre correcto**: `planetary` describe con precisión el dominio (cuerpos planetarios, no astrología ni astronomía general).

2. **Patrón adaptador**: La estructura `src/server/planetary/` con `astronomy-planetary-engine.ts` ya implementa el patrón adaptador establecido en el proyecto (ver `src/server/moon/moon-engine.ts` + `astronomy-moon-engine.ts`).

3. **Consumo compartido**: `PlanetaryEngine` será consumido por AspectEngine, TransitEngine, y posiblemente otros módulos futuros. No pertenece a ningún módulo específico.

4. **Inercia de refactorización**: Migrar ahora introduce riesgo innecesario sin beneficio tangible.

### Impacto

- No se mueven archivos
- No se alteran imports existentes
- El contrato `PlanetaryEngine` permanece inalterado
- La regla de la Constitución se interpreta como "cálculos astronómicos del módulo lunar deben estar en moon/", no "todo cálculo astronómico del proyecto"

### Si se requiere migración futura

Mover todo `src/server/planetary/` a `src/server/astronomy/planetary/`. No mover individualmente.

---

## DECISIÓN PENDIENTE DE APROBACIÓN

Esta ADR es una **propuesta técnica**. Requiere aprobación explícita de Daniel antes de aplicarse.

Si se rechaza, las opciones de respaldo son:
1. B: Mover a `src/server/astronomy/`
2. C: Mover a `src/server/moon/`

---

**DECISIÓN**: PROPUESTA PENDIENTE DE APROBACIÓN POR DANIEL.
