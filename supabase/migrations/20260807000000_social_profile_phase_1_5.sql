-- Migration: Phase 1.5 - Configuración del Perfil Astral Social
-- Descripción: Agrega columnas para signos favoritos y configuraciones de privacidad para el perfil social.
-- También ajusta el límite de tamaño del bucket de profile-images a 8MB.

-- 1. Agregar 'favorite_signs' a la tabla profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS favorite_signs TEXT[] DEFAULT '{}'::TEXT[];

-- 2. Agregar preferencias de privacidad a user_privacy_settings
ALTER TABLE public.user_privacy_settings
  ADD COLUMN IF NOT EXISTS show_sun_sign BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_moon_sign BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_favorite_signs BOOLEAN DEFAULT true;

-- 3. Actualizar límite de tamaño del bucket profile-images (a 8MB)
UPDATE storage.buckets
SET file_size_limit = 8388608
WHERE id = 'profile-images';

-- 4. Asegurarnos que existan las policies de Storage de insert/update por si la migración anterior no las dejó bien (Idempotente)
-- (La migración 2024... las creaba, pero esto es solo para estar 100% seguros)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Avatar and cover images are publicly accessible.'
  ) THEN
    CREATE POLICY "Avatar and cover images are publicly accessible." 
      ON storage.objects FOR SELECT 
      USING ( bucket_id = 'profile-images' );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload their own profile images.'
  ) THEN
    CREATE POLICY "Users can upload their own profile images." 
      ON storage.objects FOR INSERT 
      TO authenticated 
      WITH CHECK (
        bucket_id = 'profile-images' AND 
        (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their own profile images.'
  ) THEN
    CREATE POLICY "Users can update their own profile images." 
      ON storage.objects FOR UPDATE 
      TO authenticated 
      USING (
        bucket_id = 'profile-images' AND 
        (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their own profile images.'
  ) THEN
    CREATE POLICY "Users can delete their own profile images." 
      ON storage.objects FOR DELETE 
      TO authenticated 
      USING (
        bucket_id = 'profile-images' AND 
        (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END
$$;
