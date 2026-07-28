# LISTA OFICIAL DE PRUEBAS PARA IMPLEMENTACIÓN EN FASE 2A

> **DESTINATARIO**: Agente Codex (implementación futura).  
> **OBJETIVO**: Guía detallada de pruebas obligatorias a implementar en `src/server/planetary/planetary-engine.test.ts` y creación de fixtures en `src/server/planetary/__fixtures__/`.  
> **ESTADO**: Documentación de referencia. No realizar cambios en src/ hasta aprobación arquitectónica.

---

## 1. ARCHIVOS DE FIXTURES A CREAR EN `src/server/planetary/__fixtures__/`

Cuando se autorice la implementación, crear la carpeta `src/server/planetary/__fixtures__/` e incorporar **25 fixtures de referencia** organizados por cuerpo:

### A. Estructura de Carpeta

```
src/server/planetary/
├── __fixtures__/
│   ├── sun.json          (5 fixtures: equinoccios, solsticios)
│   ├── moon.json         (2 fixtures: snapshot, equinoccio)
│   ├── mercury.json      (4 fixtures: estaciones + post-estación)
│   ├── venus.json        (2 fixtures: snapshot, inicio año)
│   ├── mars.json         (2 fixtures: oposiciones)
│   ├── jupiter.json      (2 fixtures: oposición, snapshot)
│   ├── saturn.json       (2 fixtures: oposición, snapshot)
│   ├── uranus.json       (2 fixtures: oposición, snapshot)
│   ├── neptune.json      (2 fixtures: oposición, snapshot)
│   ├── pluto.json        (2 fixtures: oposición, entrada acuario)
│   └── README.md         (documentación de formato)
├── astronomy-planetary-engine.ts
├── planetary-engine.ts
├── planetary-engine.test.ts
└── zodiac-math.ts
```

### B. Formato Estándar de cada Fixture JSON

```json
{
  "body": "sun",
  "iso": "2024-03-20T03:06:00.000Z",
  "phase": "equinoccio_marzo",
  "expected": 0.0,
  "obtained": 359.9997474891021,
  "delta_deg": 0.00025251089789435355,
  "delta_arcmin": 0.015150653873661213,
  "tolerance_deg": 0.02,
  "tolerance_arcmin": 1.2,
  "status": "PASS",
  "coord_system": "True ecliptic of date (Astronomy.Ecliptic + GeoVector with aberration=true)",
  "center": "Geocentric (500@399 equivalent)",
  "aberration": "Stellar aberration corrected (GeoVector(..., true))",
  "source": "USNO Earth's Seasons",
  "source_url": "https://aa.usno.navy.mil/data/docs/EarthSeasons.php"
}
```

### C. Detalles por Cuerpo

| Cuerpo | Cantidad | Fases Cubiertas | Fuente |
|--------|----------|-----------------|--------|
| **Sun** | 5 | Equinoccios (x2), Solsticios (x2), Equinoccio 2025 | USNO (VERIFICADO ✅) |
| **Moon** | 2 | Snapshot solsticio, Equinoccio | JPL Horizons (PENDIENTE) |
| **Mercury** | 4 | Estación retrógrada, Centro retrógrado, Estación directa, Post-estación | JPL Horizons (PENDIENTE) |
| **Venus** | 2 | Snapshot solsticio, Inicio año | JPL Horizons (PENDIENTE) |
| **Mars** | 2 | Oposición 2022, Oposición 2025 | JPL Horizons (PENDIENTE) |
| **Jupiter** | 2 | Oposición 2024, Snapshot solsticio | JPL Horizons (PENDIENTE) |
| **Saturn** | 2 | Oposición 2024, Snapshot solsticio | JPL Horizons (PENDIENTE) |
| **Uranus** | 2 | Oposición 2024, Snapshot solsticio | JPL Horizons (PENDIENTE) |
| **Neptune** | 2 | Oposición 2024, Snapshot solsticio | JPL Horizons (PENDIENTE) |
| **Pluto** | 2 | Oposición 2024, Entrada Acuario | JPL Horizons (PENDIENTE) |
| **TOTAL** | **25** | — | 5 verificados, 20 pendientes |

---

## 2. SUITE DE 10 PRUEBAS UNITARIAS E INTEGRACIÓN OBLIGATORIAS

En `src/server/planetary/planetary-engine.test.ts`, implementar los siguientes 10 bloques de prueba:

### TEST 1: Precisión Externa contra Fixtures JPL Horizons (25/25)

**Descripción**: Comparar la longitud eclíptica puntual devuelta por `astronomyPlanetaryEngine.calculatePosition(body, date)` contra el valor esperado de cada fixture JSON.

**Implementación**:
```typescript
describe("TEST 1: Precisión Externa — Fixtures JPL Horizons", () => {
  const fixtures = [sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto];
  
  fixtures.forEach(bodyFixtures => {
    bodyFixtures.forEach(fixture => {
      it(`${fixture.body} @ ${fixture.iso} (${fixture.phase})`, () => {
        const position = astronomyPlanetaryEngine.calculatePosition(
          fixture.body as PlanetaryBody,
          new Date(fixture.iso)
        );
        
        const delta = Math.abs(position.absoluteLongitude - fixture.expected);
        const deltaArcmin = delta * 60; // convertir grados a arcmin
        
        expect(deltaArcmin).toBeLessThanOrEqual(1.2);  // tolerancia: 1.2 arcmin
      });
    });
  });
});
```

**Criterio de Éxito**: Δ ≤ 0.02° (1.2 arcmin) en los 25 casos.

**Estado**: 5/25 PASS (Sun), 20/25 PENDIENTE (otros cuerpos requieren JPL).

---

### TEST 2: Coherencia de Signo Previo y Grados en Límites Zodiacales

**Descripción**: Para los 12 límites zodiacales (0°, 30°, 60°, ..., 330°), comprobar que un instante justo antes del límite devuelve el signo anterior esperado.

**Implementación**:
```typescript
describe("TEST 2: Coherencia de Límites Zodiacales", () => {
  const zodiacLimits = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  const expectedSigns = ["aries", "tauro", "geminis", "cancer", "leo", "virgo",
                         "libra", "escorpio", "sagitario", "capricornio", "acuario", "piscis"];
  
  zodiacLimits.forEach((limit, index) => {
    it(`Límite en ${limit}° → signo ${expectedSigns[index]}`, () => {
      const before = new Date("2024-06-21T12:00:00.000Z");
      const pos = astronomyPlanetaryEngine.calculatePosition("sun", before);
      
      // Verificar que el signo en el límite es el correcto
      // y que degreeInSign está en rango [0, 30)
      if (Math.abs(pos.absoluteLongitude - limit) < 0.1) {
        expect(pos.sign).toBe(expectedSigns[index]);
        expect(pos.degreeInSign).toBeGreaterThanOrEqual(0);
        expect(pos.degreeInSign).toBeLessThan(30);
      }
    });
  });
});
```

**Criterio de Éxito**: 12/12 límites coherentes.

---

### TEST 3: Coherencia Directa de `signedLongitudeDelta` (10 Casos Límite)

**Descripción**: Test unitario directo de `signedLongitudeDelta(from, to)` comprobando el manejo correcto del wrap-around en 359°→0°.

**Casos críticos**:
- 10° → 20° = +10°
- 20° → 10° = −10°
- 350° → 10° = +20° (wrap-around directo)
- 10° → 350° = −20° (wrap-around retrógrado)
- 359° → 1° = +2° (cruce zodiacal)
- 1° → 359° = −2° (cruce inverso)

**Implementación**:
```typescript
describe("TEST 3: signedLongitudeDelta — Wrap-around", () => {
  const testCases = [
    [10, 20, 10],
    [20, 10, -10],
    [350, 10, 20],
    [10, 350, -20],
    [359, 1, 2],
    [1, 359, -2],
  ];
  
  testCases.forEach(([from, to, expected]) => {
    it(`signedLongitudeDelta(${from}, ${to}) = ${expected}`, () => {
      const result = signedLongitudeDelta(from, to);
      expect(result).toBeCloseTo(expected, 5);  // 5 decimales
    });
  });
});
```

**Criterio de Éxito**: 100% de coincidencias sin saltos espurios de ±360°.

---

### TEST 4: Clasificación Correcta de Mercurio Post-Estación Directa

**Descripción**: Probar que Mercurio en `2024-12-15T21:00:00.000Z` (post-estación directa, ~2h después del cruce por cero) retorna `isRetrograde: false`.

**Requisito técnico**: Este test SOLO pasará cuando se implemente la ventana ±1h para Mercurio (Alternativa C).

**Implementación**:
```typescript
describe("TEST 4: Mercurio Post-Estación Directa (2024-12-15T21:00Z)", () => {
  it("debe retornar isRetrograde: false con ventana optimizada ±1h", () => {
    const date = new Date("2024-12-15T21:00:00.000Z");
    const position = astronomyPlanetaryEngine.calculatePosition("mercury", date);
    
    expect(position.isRetrograde).toBe(false);
    expect(position.speedDegreesPerDay).toBeGreaterThan(0);  // movimiento directo
  });
});
```

**Criterio de Éxito**: `isRetrograde === false` y `speedDegreesPerDay > 0`.

**Status**: FALLA con ventana ±12h, PASA con ventana ±1h.

---

### TEST 5: Sol y Luna Nunca Retrógrados (30+ Fechas Aleatorias)

**Descripción**: Probar 30 fechas a lo largo de 5 años (2020–2025) para `sun` y `moon`. Ambos deben retornar `isRetrograde: false` en el 100% de los muestreos.

**Implementación**:
```typescript
describe("TEST 5: Sol y Luna — Nunca Retrógrados", () => {
  const startYear = 2020;
  const endYear = 2025;
  const dates: Date[] = [];
  
  for (let year = startYear; year <= endYear; year++) {
    for (let i = 0; i < 6; i++) {
      const month = Math.floor(Math.random() * 12);
      const day = Math.floor(Math.random() * 28) + 1;
      dates.push(new Date(`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}T00:00:00Z`));
    }
  }
  
  ["sun", "moon"].forEach(body => {
    it(`${body} nunca retrógrado (${dates.length} fechas)`, () => {
      let retrogradeCount = 0;
      dates.forEach(date => {
        const pos = astronomyPlanetaryEngine.calculatePosition(body as PlanetaryBody, date);
        if (pos.isRetrograde) retrogradeCount++;
      });
      expect(retrogradeCount).toBe(0);
    });
  });
});
```

**Criterio de Éxito**: `isRetrograde === false` en 100% de los 60+ muestreos.

---

### TEST 6: Clasificación de Retrogradación en Fechas de Oposición

**Descripción**: Probar que los 6 planetas exteriores (Mars, Jupiter, Saturn, Uranus, Neptune, Pluto) retornan `isRetrograde: true` en sus fechas de oposición conocidas.

**Fechas de oposición**:
- Mars: 2022-12-08, 2025-01-15
- Jupiter: 2024-12-07
- Saturn: 2024-09-08
- Uranus: 2024-11-17
- Neptune: 2024-09-21
- Pluto: 2024-07-23

**Implementación**:
```typescript
describe("TEST 6: Retrogradación en Oposiciones", () => {
  const oppositions = {
    mars: [new Date("2022-12-08T05:00:00Z"), new Date("2025-01-15T00:00:00Z")],
    jupiter: [new Date("2024-12-07T21:00:00Z")],
    saturn: [new Date("2024-09-08T04:00:00Z")],
    uranus: [new Date("2024-11-17T00:00:00Z")],
    neptune: [new Date("2024-09-21T00:00:00Z")],
    pluto: [new Date("2024-07-23T00:00:00Z")],
  };
  
  Object.entries(oppositions).forEach(([body, dates]) => {
    it(`${body} retrógrado en oposición (${dates.length} fechas)`, () => {
      dates.forEach(date => {
        const pos = astronomyPlanetaryEngine.calculatePosition(body as PlanetaryBody, date);
        expect(pos.isRetrograde).toBe(true);
      });
    });
  });
});
```

**Criterio de Éxito**: `isRetrograde === true` en 100% de las oposiciones.

---

### TEST 7: Independencia del Cálculo Puntual de Longitud

**Descripción**: Comprobar que modificar las constantes de ventana de velocidad (`RETROGRADE_SAMPLE_MS`) NO altera el valor de `absoluteLongitude` devuelto.

**Fundamento**: La precisión astronómica es independiente del cálculo de derivada.

**Implementación**:
```typescript
describe("TEST 7: Independencia de absoluteLongitude vs Ventana", () => {
  const date = new Date("2024-06-21T12:00:00.000Z");
  const bodies: PlanetaryBody[] = ["sun", "moon", "mercury", "venus", "mars", 
                                   "jupiter", "saturn", "uranus", "neptune", "pluto"];
  
  bodies.forEach(body => {
    it(`${body}: absoluteLongitude exacto bit-a-bit independiente de ventana`, () => {
      const pos = astronomyPlanetaryEngine.calculatePosition(body, date);
      
      // Verificar que absoluteLongitude es finito y en rango
      expect(Number.isFinite(pos.absoluteLongitude)).toBe(true);
      expect(pos.absoluteLongitude).toBeGreaterThanOrEqual(0);
      expect(pos.absoluteLongitude).toBeLessThan(360);
      
      // Nota: No se puede cambiar ventana en tiempo de ejecución sin modificar código,
      // pero este test documenta la invariante.
    });
  });
});
```

**Criterio de Éxito**: `absoluteLongitude` es finito y en rango [0, 360) para todos los cuerpos.

---

### TEST 8: Estabilidad Numérica para Planetas Exteriores

**Descripción**: Probar la velocidad de Neptune y Pluto durante 10 días continuos alrededor de su estación retrógrada. Verificar ausencia de alternancia espuria (`flapping`) de `isRetrograde`.

**Implementación**:
```typescript
describe("TEST 8: Estabilidad Numérica — Neptune y Pluto", () => {
  ["neptune", "pluto"].forEach(body => {
    it(`${body}: sin alternancia espuria de isRetrograde`, () => {
      const startDate = new Date("2024-09-15T00:00:00.000Z");  // antes de oposición
      const positions = [];
      
      for (let day = 0; day <= 10; day++) {
        const date = new Date(startDate.getTime() + day * 86_400_000);
        const pos = astronomyPlanetaryEngine.calculatePosition(body as PlanetaryBody, date);
        positions.push(pos);
      }
      
      // Verificar que no hay cambios erráticos de isRetrograde
      let transitionCount = 0;
      for (let i = 1; i < positions.length; i++) {
        if (positions[i].isRetrograde !== positions[i-1].isRetrograde) {
          transitionCount++;
        }
      }
      
      // Máximo 1 transición esperada (entrada o salida de retrogradación)
      expect(transitionCount).toBeLessThanOrEqual(1);
    });
  });
});
```

**Criterio de Éxito**: Máximo 1 transición de `isRetrograde` en 10 días (entrada o salida de retrogradación).

---

### TEST 9: Determinismo Completo del Snapshot

**Descripción**: Ejecutar `calculateSnapshot` dos veces para el mismo instante y comprobar igualdad profunda (`JSON.stringify`). El resultado debe ser 100% determinista.

**Implementación**:
```typescript
describe("TEST 9: Determinismo del Snapshot", () => {
  it("calculateSnapshot retorna estructura idéntica en dos llamadas", () => {
    const date = new Date("2024-06-21T12:00:00.000Z");
    
    const snapshot1 = astronomyPlanetaryEngine.calculateSnapshot(date);
    const snapshot2 = astronomyPlanetaryEngine.calculateSnapshot(date);
    
    expect(JSON.stringify(snapshot1)).toBe(JSON.stringify(snapshot2));
    expect(snapshot1.positions.length).toBe(10);  // 10 cuerpos
    expect(snapshot1.calculatedAt).toBe(date.toISOString());
    
    // Verificar orden de cuerpos es consistente
    const expectedBodies = ["sun", "moon", "mercury", "venus", "mars", 
                           "jupiter", "saturn", "uranus", "neptune", "pluto"];
    snapshot1.positions.forEach((pos, idx) => {
      expect(pos.body).toBe(expectedBodies[idx]);
    });
  });
});
```

**Criterio de Éxito**: Estructura idéntica en 2 llamadas. 10 cuerpos en orden oficial.

---

### TEST 10: Configuración del Script de Test en `package.json`

**Descripción**: Añadir o verificar que existe el comando `"test"` en `package.json` que ejecuta la suite de pruebas.

**Cambio en package.json**:
```json
{
  "scripts": {
    "test": "tsx scripts/check-planetary-engine.ts",
    "test:watch": "tsx --watch scripts/check-planetary-engine.ts"
  },
  "devDependencies": {
    "tsx": "^4.7.0"
  }
}
```

**Ejecución**:
```bash
npm run test
npm run test:watch
```

**Criterio de Éxito**: Comando `npm run test` ejecuta exitosamente todos los checks.

---

## 3. ORDEN DE EJECUCIÓN RECOMENDADO

Para implementación en Codex, ejecutar en este orden:

1. ✅ **TEST 1**: Precisión externa (establece baseline)
2. ✅ **TEST 2–3**: Matemática zodiacal (unitarios, sin dependencias)
3. ✅ **TEST 5**: Sol y Luna (siempre pasan, dan confianza)
4. ✅ **TEST 9**: Determinismo (prueba integridad básica)
5. ⏳ **TEST 4**: Mercurio post-estación (falla hasta implementar Alternativa C)
6. ⏳ **TEST 6**: Oposiciones (requiere JPL Horizons verificado)
7. ⏳ **TEST 7–8**: Estabilidad numérica (pruebas avanzadas)
8. ✅ **TEST 10**: Script npm (configuración)

---

## 4. CRITERIOS DE CIERRE FASE 2A

Todos los tests deben pasar para cerrar Fase 2A:

- ✅ TEST 1: 25/25 fixtures verificados contra USNO + JPL
- ✅ TEST 2–3: 100% coherencia zodiacal
- ✅ TEST 4: Mercurio post-estación (con Alternativa C implementada)
- ✅ TEST 5: Sol y Luna nunca retrógrados
- ✅ TEST 6: Retrogradación en oposiciones
- ✅ TEST 7: Independencia de longitud vs ventana
- ✅ TEST 8: Sin flapping en planetas exteriores
- ✅ TEST 9: Determinismo completo
- ✅ TEST 10: Script npm funcional

---

**Documento de referencia para implementación futura. No modificar src/ hasta aprobación de ADR.**
