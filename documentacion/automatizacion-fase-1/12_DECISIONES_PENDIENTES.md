# 12_DECISIONES_PENDIENTES.md — DECISIONES PENDIENTES DE ARQUITECTURA Y NEGOCIO

Este documento lista de forma explícita las decisiones estratégicas que no pueden resolverse analizando la base de código actual y que requieren definición por parte del equipo del proyecto.

---

## 1. Decisiones Astrológicas y Astronómicas

1. **Zodiaco de Referencia (Tropical vs. Sideral)**:
   - _Evidencia_: `src/data/zodiac-signs.ts` usa las fechas del zodíaco tropical tradicional (ej: Aries 21 Mar - 19 Abr).
   - _Decisión requerida_: Confirmar si el `PlanetaryEngine` debe calcular las longitudes eclípticas bajo el sistema Tropical (estándar occidental) o si se requiere soporte para Sideral/Védico.
2. **Coordenadas Geográficas de Referencia**:
   - _Evidencia_: `src/config/moon.ts` define `MOON_SITE_TIMEZONE = "Europe/Madrid"`.
   - _Decisión requerida_: Confirmar si las efemérides planetarias se calcularán para coordenadas geocéntricas globales o topocéntricas referenciadas a Madrid (`Lat: 40.4168, Lon: -3.7038`).
3. **Matriz de Orbes Astrológicos Oficiales**:
   - _Decisión requerida_: Definir la tolerancia en grados para cada aspecto. (Propuesta: Conjunción 8°, Trígono/Cuadratura 6°, Sextil 4°).
   - _Estado_: RESUELTA.
   - _Fecha de resolución_: 2026-07-28.
   - _Decisor_: Daniel.
   - _Decisión aprobada_: Política oficial de orbes de Proyecto Astral como convención astrológica y editorial configurable: Conjunción 8°, Sextil 4°, Cuadratura 6°, Trígono 6°, Oposición 8°.
   - _Nota de alcance_: La política no se declara constante científica universal y puede reemplazarse mediante política personalizada inyectada en AspectEngine.

---

## 2. Decisiones de IA y Orquestación

1. **Proveedor y Modelo de IA para Redacción Masiva**:
   - _Evidencia_: `src/routes/api/ai/respond.ts` utiliza un adaptador genérico.
   - _Decisión requerida_: Seleccionar el proveedor principal para la generación autónoma diaria de 12 horóscopos (OpenAI `gpt-4o-mini` vs. Gemini `gemini-1.5-flash`).
2. **Límite Mensual de Presupuesto de Tokens**:
   - _Decisión requerida_: Definir el tope máximo de costo en USD permitido antes de que el sistema detenga las llamadas a la API de IA y active el `FallbackEngine`.
3. **Hora Local de Publicación Diaria**:
   - _Decisión requerida_: Fijar la hora oficial de disparo del Cron (ej: 00:01 UTC) para que los horóscopos estén disponibles antes del amanecer en Europa y América.
