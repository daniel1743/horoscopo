# 🔍 Informe de Auditoría Adversarial - Fase 2B (AspectEngine)

## 1. Resumen Ejecutivo
Se ha llevado a cabo una auditoría independiente y adversarial de la implementación del `AspectEngine` en la fase 2B. El enfoque no asumió corrección previa, validando estrictamente el código base, los contratos, la matemática, las pruebas unitarias y el marco documental.
**Resultado:** Se ha detectado un fallo matemático de tipo **BLOCKER** en el cálculo de la fase de los aspectos y debilidades importantes en los tests que enmascaraban este problema.

## 2. Metadatos de la Auditoría
- **Rama observada:** `feature/fase-2b-aspect-engine`
- **Comandos ejecutados:**
  - `git branch --show-current` (Exit 0)
  - `git status --short` (Exit 0)
  - `npx --yes tsx scripts/check-aspect-engine.ts` (Exit 0)
  - `npx --yes tsx scripts/check-planetary-engine.ts` (Exit 0)
  - `npx eslint src/server/aspects/aspect-engine.ts src/server/aspects/aspect-engine.test.ts scripts/check-aspect-engine.ts` (Exit 0)
  - `npx tsc --noEmit` (Exit 0)
  - `npm run build` (Exit 0)
- **Archivos Inspeccionados:**
  - `src/server/aspects/aspect-engine.ts`
  - `src/server/aspects/aspect-engine.test.ts`
  - `scripts/check-aspect-engine.ts`
  - `documentacion/automatizacion-fase-1/12_DECISIONES_PENDIENTES.md`
  - `documentacion/gobierno-y-roadmap/10_MASTER_DECISION_LOG.md`

## 3. Hallazgos

### 🔴 [BLOCKER] Fallo Matemático Crítico en el Cálculo de Fase (Phase Calculation)
- **Descripción:** La función `calculateAspectPhase` clasifica incorrectamente aspectos que están "aplicando" (applying) como "separándose" (separating) o "estacionarios" (stationary) si los planetas cruzan el ángulo exacto durante la ventana de proyección de 1 hora (`ASPECT_PHASE_PROJECTION_DAYS = 1 / 24`).
- **Causa Raíz:** El algoritmo actual calcula la desviación absoluta proyectada (`projectedDeviation`) 1 hora en el futuro y la compara con la actual (`currentDeviation`). Si un planeta rápido a 359.85° (velocidad 14.4°/día) se dirige al 0° (Sol estacionario), en una hora estará en 0.45°.
  - `currentDeviation` = 0.15° (no es exacto porque la tolerancia es 0.1°).
  - `projectedDeviation` = 0.45°.
  - `deviationChange` = 0.45 - 0.15 = 0.3° (> 0).
  El código asume erróneamente que la desviación creció y devuelve `"separating"`, cuando físicamente el planeta está aplicando (yendo hacia el punto exacto) en este instante, cruzará en los siguientes minutos, y luego comenzará a separarse.
- **Caso Adversarial Exacto (Fallo de nuevo código de Fase 2B):**
  - Planeta A (Luna): `absoluteLongitude`: 359.85, `speedDegreesPerDay`: 14.4
  - Planeta B (Sol): `absoluteLongitude`: 0, `speedDegreesPerDay`: 0
  - Tipo de aspecto: `conjunction`
  - Resultado de la implementación real: `"separating"`
  - Resultado Esperado Físicamente: `"applying"` (se está acercando hacia 0° en el instante actual antes de cruzarlo).

### 🟠 [HIGH] Pruebas Unitarias Incompletas y Tautológicas (Pruebas preexistentes)
- **Descripción:** Los tests en `aspect-engine.test.ts` (específicamente "aplicacion cruzando 359 a 0") están diseñados a la medida de la fórmula fallida y no detectan el problema de cruce de límite de exactitud dentro del lapso de proyección.
- **Causa Raíz:** Se usan velocidades (`1` o `-1`) y posiciones iniciales (`359`, `2`) de forma muy discreta, en las que los cuerpos no cruzan el aspecto exacto en esa ínfima proyección de una hora. Esto enmascara la regresión lógica del motor bajo velocidades reales de cuerpos rápidos como la Luna. Las pruebas pasan (Exit 0) dando un falso positivo de robustez.

### 🟡 [MEDIUM] Manejo de Políticas Inválidas (Null o Arrays)
- **Descripción:** Si se pasa un `Array` a la función como política, la validación `typeof orbPolicy !== "object"` no lo ataja (los arreglos son objetos), pero la validación subsecuente arroja un error adecuado al no encontrar las propiedades numéricas. Funciona bien, pero debería validarse explícitamente `!Array.isArray(orbPolicy)`.

## 4. Verificación Documental
- **ADR-008:** Documentado correctamente en `10_MASTER_DECISION_LOG.md`. Cierra la discusión de orbes, marcándola explícitamente como "convención astrológica y editorial configurable" sin aclamar rigor científico estricto. (Aprobado ✅)
- **12_DECISIONES_PENDIENTES.md:** El estado fue marcado como RESUELTA sin eliminar el historial de las otras. (Aprobado ✅)

## 5. Verificación de Alcance (Scope Check)
Se verificó el estado de Git, confirmando que:
- `src/server/planetary/` NO fue modificado.
- `src/server/moon/` NO fue modificado.
- Ningún archivo ajeno a `src/server/aspects/` o `documentacion/` ha sido modificado.
- El contrato del `AspectEngine` es puro, no importa `astronomy-engine` y emite objetos de dominio simples (Aprobado ✅).

## 6. Veredicto Final

**VEREDICTO:** ❌ CORRECCION_REQUERIDA

Se requiere refactorizar el cálculo `calculateAspectPhase` para soportar de manera matemáticamente correcta los tránsitos cruzados (crossings). La proyección constante de 1 hora es adecuada para obtener la posición futura, pero el cálculo del delta no puede ser un simple valor absoluto de la desviación final menos inicial, porque la separación angular no es monótona cuando se cruza el ángulo exacto.

**Confirmación obligatoria:** Durante esta auditoría adversarial no se ha ejecutado `git add`, `commit` ni se ha modificado ningún archivo de código productivo o de pruebas. Este informe de auditoría es la única salida entregada, cumpliendo con la directiva estricta de no intervenir el código frente a fallos.
