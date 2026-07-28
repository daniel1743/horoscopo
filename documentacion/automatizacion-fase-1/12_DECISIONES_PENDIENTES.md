# 12_DECISIONES_PENDIENTES.md — DECISIONES PENDIENTES DE ARQUITECTURA Y NEGOCIO

Este documento lista de forma explícita las decisiones estratégicas que no pueden resolverse analizando la base de código actual y que requieren definición por parte del equipo del proyecto.

---

## 1. Decisiones Astrológicas y Astronómicas

1. **Zodiaco de Referencia (Tropical vs. Sideral)**:
   * *Evidencia*: `src/data/zodiac-signs.ts` usa las fechas del zodíaco tropical tradicional (ej: Aries 21 Mar - 19 Abr).
   * *Decisión requerida*: Confirmar si el `PlanetaryEngine` debe calcular las longitudes eclípticas bajo el sistema Tropical (estándar occidental) o si se requiere soporte para Sideral/Védico.
2. **Coordenadas Geográficas de Referencia**:
   * *Evidencia*: `src/config/moon.ts` define `MOON_SITE_TIMEZONE = "Europe/Madrid"`.
   * *Decisión requerida*: Confirmar si las efemérides planetarias se calcularán para coordenadas geocéntricas globales o topocéntricas referenciadas a Madrid (`Lat: 40.4168, Lon: -3.7038`).
3. **Matriz de Orbes Astrológicos Oficiales**:
   * *Decisión requerida*: Definir la tolerancia en grados para cada aspecto. (Propuesta: Conjunción 8°, Trígono/Cuadratura 6°, Sextil 4°).

---

## 2. Decisiones de IA y Orquestación

1. **Proveedor y Modelo de IA para Redacción Masiva**:
   * *Evidencia*: `src/routes/api/ai/respond.ts` utiliza un adaptador genérico.
   * *Decisión requerida*: Seleccionar el proveedor principal para la generación autónoma diaria de 12 horóscopos (OpenAI `gpt-4o-mini` vs. Gemini `gemini-1.5-flash`).
2. **Límite Mensual de Presupuesto de Tokens**:
   * *Decisión requerida*: Definir el tope máximo de costo en USD permitido antes de que el sistema detenga las llamadas a la API de IA y active el `FallbackEngine`.
3. **Hora Local de Publicación Diaria**:
   * *Decisión requerida*: Fijar la hora oficial de disparo del Cron (ej: 00:01 UTC) para que los horóscopos estén disponibles antes del amanecer en Europa y América.
