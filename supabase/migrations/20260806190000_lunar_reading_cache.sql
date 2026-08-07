-- Migration: Create lunar_reading_cache table
-- Description: Almacena lecturas generadas por la IA para "Tu Luna de Hoy"

CREATE TABLE IF NOT EXISTS public.lunar_reading_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint TEXT NOT NULL UNIQUE, -- ej: date:YYYY-MM-DD|moon:sign|natal:sign|aspect:type
    reading TEXT NOT NULL,
    is_fallback BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.lunar_reading_cache ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- Permitir lectura anónima o autenticada (ya que es contenido público basado en un fingerprint)
CREATE POLICY "Permitir lectura publica de cache lunar"
ON public.lunar_reading_cache FOR SELECT
TO public
USING (true);

-- Insert solo desde funciones de servicio/backend (service_role)
-- No se permite insert directo desde el cliente web.
