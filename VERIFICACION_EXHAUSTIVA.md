# VERIFICACION EXHAUSTIVA — Asistente Contextual de Tarot

**Estado**: verificacion automatica aprobada, E2E manual pendiente.

---

## Veredicto

```text
APROBADO CONDICIONALMENTE — TESTS APROBADOS, E2E MANUAL PENDIENTE
```

No se declara validacion E2E completa porque no se ejecuto una prueba manual con navegador y flujo real de usuario final.

---

## Correccion Aplicada

### Test tratado como ruta

**Problema real**:

`src/routes/api/tarot/interpret.test.ts` estaba dentro del arbol de rutas. TanStack Router analiza `src/routes`, por lo que intentaba tratar ese archivo como route file y mostraba:

```text
Route file "...interpret.test.ts" does not export a Route
```

**Correccion**:

- Se elimino el test de `src/routes/api/tarot/interpret.test.ts`.
- Se creo el test ejecutable en `src/server/tarot/interpret.test.ts`.
- El endpoint permanece en `src/routes/api/tarot/interpret.ts`.
- No se elimino la cobertura; se convirtio en pruebas ejecutables.

**Verificacion**:

```text
rg "interpret.test.ts" src/routes src/routeTree.gen.ts
exit code: 1
resultado: sin coincidencias
```

El exit code 1 de `rg` es esperado cuando no hay coincidencias.

---

## Pruebas Ejecutadas

### Endpoint Tarot / Contrato / Safety / Fallback / Schemas / Rate Limit

```bash
npx vitest run src/server/tarot/interpret.test.ts
```

Resultado:

```text
exit code: 0
Test Files: 1 passed
Tests: 15 passed
```

Cobertura real incluida:

- schema de entrada del endpoint;
- schema de salida del endpoint;
- orden de seguridad antes de rate limit, fetch de carta y llamada IA;
- safety check;
- fallback deterministico;
- rate limit aislable;
- hash anonimo deterministico.

### Suite Relacionada con Tarot

```bash
npx vitest run src/server/tarot/interpret.test.ts src/server/generation/fallback-generator.test.ts src/lib/tarot/daily-introduction.test.ts src/services/tarot.service.test.ts src/lib/tarot/image-url.test.ts src/repositories/supabase-tarot.repository.test.ts
```

Resultado:

```text
exit code: 0
Test Files: 6 passed
Tests: 34 passed
```

### ESLint Acotado

```bash
npx eslint src/server/tarot/interpret.test.ts src/server/tarot/safety-check.ts src/server/generation/tarot-fallback-generator.ts src/routes/api/tarot/interpret.ts
```

Resultado:

```text
exit code: 0
```

### Build

```bash
npm run build
```

Resultado:

```text
exit code: 0
Nitro preset: vercel
runtime: nodejs24.x
```

Warnings no bloqueantes observados:

- `vite-tsconfig-paths` detectado aunque Vite soporta `resolve.tsconfigPaths`.
- `createServerFn().inputValidator()` deprecado en archivos existentes.

---

## Safety Check

Archivo auditado:

```text
src/server/tarot/safety-check.ts
```

### Comportamiento Actual

Ante una pregunta de crisis como:

```text
Tengo pensamientos suicidas, ¿qué me dice la carta?
```

`checkSafety()` devuelve:

```ts
{
  isSafe: false,
  category: "mental_health",
  message: "...contacta ahora con los servicios de emergencia locales o con una linea de crisis de tu pais...",
  referralUrl: undefined
}
```

### Recurso Devuelto

No devuelve telefono universal, SMS universal ni URL inventada.

Motivo: el endpoint actual no recibe pais ni region del usuario. Sin pais conocido, el sistema no debe asumir recursos localizados.

### Localizacion

Estado actual:

```text
recurso localizado: no
motivo: no hay pais en el contrato del endpoint
fallback: mensaje generico de seguridad hacia servicios locales
```

### Si No Se Conoce el Pais

El sistema:

- bloquea la interpretacion;
- no ofrece lectura de Tarot;
- recomienda buscar servicios de emergencia locales o una linea de crisis del pais;
- no devuelve `referralUrl`;
- no imprime ni inventa numeros.

### IA

La prueba valida el orden del endpoint por codigo fuente:

```text
checkSafety() ocurre antes de:
- checkAndConsumeQuota()
- fetchCardBySlug()
- callAI()
```

Por tanto, una solicitud con riesgo inmediato se corta antes de construir prompt o llamar a IA.

---

## Fallback

El fallback se probo sin modificar temporalmente `callAI()` en produccion.

Estrategia usada:

```text
test aislado sobre buildFallbackResponse()
```

Resultado:

- genera `schemaVersion`;
- conserva `requestId`;
- produce `energy`;
- cumple largos minimos/maximos del schema;
- incluye campos requeridos;
- no requiere llamada IA;
- fallback no consume cuota segun `TarotRateLimitConfig`.

---

## Schemas

Se exportaron los schemas del endpoint para poder probarlos directamente:

```text
TarotContextualInterpretRequestSchema
TarotContextualResponseSchema
```

Esto no cambia la logica del endpoint. Solo permite validacion automatica real.

Validado:

- payload valido: aceptado;
- payload invalido: rechazado;
- respuesta fallback: aceptada por schema de salida.

---

## Rate Limit

Pruebas aislables ejecutadas:

- `TarotRateLimitConfig.limits.guestDaily === 3`;
- `TarotRateLimitConfig.limits.userDaily === 15`;
- `TarotRateLimitConfig.consumption.fallback === 0`;
- `hashAnonymousKey()` es deterministico y no expone el valor original.

No se ejecuto prueba E2E de cuarto request contra servidor vivo. Queda como E2E manual pendiente.

---

## Pendiente E2E Manual

No cubierto automaticamente en esta correccion:

- abrir UI en navegador;
- enviar pregunta segura real al endpoint vivo;
- verificar render de respuesta en Sheet;
- verificar pregunta sensible desde UI;
- verificar rate limit con requests reales;
- verificar fallback ante fallo real del proveedor;
- revisar mobile y desktop manualmente.

---

## Confirmaciones

- No se declaro que Vitest no este configurado.
- No se dejaron comentarios de prueba sin ejecutar como evidencia.
- No se modifico temporalmente `callAI()`.
- No se hizo Git.
- No se hizo deploy.
- No se uso `NODE_TLS_REJECT_UNAUTHORIZED=0`.
