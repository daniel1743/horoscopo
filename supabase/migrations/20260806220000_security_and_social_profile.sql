-- 1. Asegurar la extensión CITEXT para usernames insensibles a mayúsculas
CREATE EXTENSION IF NOT EXISTS citext;

-- 2. Añadir campos públicos a perfiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS username CITEXT UNIQUE CHECK (username ~ '^[a-z0-9._]{3,30}$'),
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS sun_sign TEXT,
  ADD COLUMN IF NOT EXISTS moon_sign TEXT;

CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- 3. Crear tabla separada para datos natales PRIVADOS
CREATE TABLE IF NOT EXISTS public.natal_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date DATE,
  birth_time TIME,
  birth_time_status TEXT CHECK (birth_time_status IN ('exact', 'approximate', 'unknown')),
  birth_place_label TEXT,
  birth_city TEXT,
  birth_region TEXT,
  birth_country TEXT,
  birth_country_code TEXT,
  birth_timezone TEXT,
  birth_latitude DOUBLE PRECISION,
  birth_longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Migrar datos existentes
INSERT INTO public.natal_profiles (
  user_id, birth_date, birth_time, birth_time_status, 
  birth_place_label, birth_city, birth_region, birth_country, 
  birth_country_code, birth_timezone, birth_latitude, birth_longitude
)
SELECT 
  id, birth_date, birth_time, birth_time_status, 
  birth_place_label, birth_city, birth_region, birth_country, 
  birth_country_code, birth_timezone, birth_latitude, birth_longitude
FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- 5. Eliminar columnas sensibles de la tabla pública
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS birth_date,
  DROP COLUMN IF EXISTS birth_time,
  DROP COLUMN IF EXISTS birth_time_status,
  DROP COLUMN IF EXISTS birth_place_label,
  DROP COLUMN IF EXISTS birth_city,
  DROP COLUMN IF EXISTS birth_region,
  DROP COLUMN IF EXISTS birth_country,
  DROP COLUMN IF EXISTS birth_country_code,
  DROP COLUMN IF EXISTS birth_timezone,
  DROP COLUMN IF EXISTS birth_latitude,
  DROP COLUMN IF EXISTS birth_longitude,
  DROP COLUMN IF EXISTS profile_completed_at;

-- 6. RLS Estricto para la nueva tabla privada
ALTER TABLE public.natal_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "natal_profiles owner select" ON public.natal_profiles;
CREATE POLICY "natal_profiles owner select" ON public.natal_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "natal_profiles owner insert" ON public.natal_profiles;
CREATE POLICY "natal_profiles owner insert" ON public.natal_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "natal_profiles owner update" ON public.natal_profiles;
CREATE POLICY "natal_profiles owner update" ON public.natal_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at en natal_profiles
DROP TRIGGER IF EXISTS natal_profiles_set_updated_at ON public.natal_profiles;
CREATE TRIGGER natal_profiles_set_updated_at
  BEFORE UPDATE ON public.natal_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. Restaurar permiso de lectura pública para perfiles sociales
DROP POLICY IF EXISTS "profiles public read" ON public.profiles;
CREATE POLICY "profiles public read" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- 8. Configurar Storage para Avatares y Portadas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  2097152, -- 2MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]
) ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas de Storage para profile-images
-- Lectura pública
DROP POLICY IF EXISTS "Avatar and cover images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar and cover images are publicly accessible." 
  ON storage.objects FOR SELECT 
  USING ( bucket_id = 'profile-images' );

-- Inserción (solo el dueño puede subir a su propia carpeta)
DROP POLICY IF EXISTS "Users can upload their own profile images." ON storage.objects;
CREATE POLICY "Users can upload their own profile images." 
  ON storage.objects FOR INSERT 
  TO authenticated 
  WITH CHECK (
    bucket_id = 'profile-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Actualización
DROP POLICY IF EXISTS "Users can update their own profile images." ON storage.objects;
CREATE POLICY "Users can update their own profile images." 
  ON storage.objects FOR UPDATE 
  TO authenticated 
  USING (
    bucket_id = 'profile-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Eliminación
DROP POLICY IF EXISTS "Users can delete their own profile images." ON storage.objects;
CREATE POLICY "Users can delete their own profile images." 
  ON storage.objects FOR DELETE 
  TO authenticated 
  USING (
    bucket_id = 'profile-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );
