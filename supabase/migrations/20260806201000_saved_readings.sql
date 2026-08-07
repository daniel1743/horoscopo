-- Migration: Create saved_readings table
-- Description: Almacena lecturas guardadas por los usuarios (ej: lunares)

CREATE TABLE IF NOT EXISTS public.saved_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reading_type TEXT NOT NULL DEFAULT 'lunar',
    title TEXT NOT NULL,
    source_date DATE NOT NULL,
    natal_moon_sign TEXT NOT NULL,
    current_moon_sign TEXT NOT NULL,
    aspect_name TEXT NOT NULL,
    aspect_type TEXT NOT NULL,
    birth_time_known BOOLEAN NOT NULL DEFAULT true,
    uncertainty_message TEXT,
    interpretation TEXT NOT NULL,
    focus_text TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, reading_type, source_date)
);

-- Habilitar RLS
ALTER TABLE public.saved_readings ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "owner select saved_readings" 
ON public.saved_readings FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "owner insert saved_readings" 
ON public.saved_readings FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner delete saved_readings" 
ON public.saved_readings FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS saved_readings_user_idx ON public.saved_readings(user_id, created_at DESC);
