-- Creovision: campos opcionales para guardar datos de nacimiento del propio usuario.
-- Esta migración NO calcula cartas ni guarda resultados astrológicos.
-- La interfaz actual calcula en el navegador y no requiere ejecutar esta migración.
-- Aplicar solo después de revisar el esquema de perfiles y las políticas RLS existentes.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_time TIME,
  ADD COLUMN IF NOT EXISTS birth_timezone TEXT,
  ADD COLUMN IF NOT EXISTS birth_place_label TEXT,
  ADD COLUMN IF NOT EXISTS birth_latitude NUMERIC(8, 5),
  ADD COLUMN IF NOT EXISTS birth_longitude NUMERIC(8, 5);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_birth_latitude_valid'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_birth_latitude_valid
      CHECK (birth_latitude IS NULL OR birth_latitude BETWEEN -90 AND 90);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_birth_longitude_valid'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_birth_longitude_valid
      CHECK (birth_longitude IS NULL OR birth_longitude BETWEEN -180 AND 180);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_birth_timezone_length'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_birth_timezone_length
      CHECK (birth_timezone IS NULL OR char_length(birth_timezone) BETWEEN 3 AND 64);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_birth_place_label_length'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_birth_place_label_length
      CHECK (birth_place_label IS NULL OR char_length(birth_place_label) BETWEEN 1 AND 160);
  END IF;
END $$;

COMMENT ON COLUMN public.profiles.birth_date IS
  'Dato privado opcional; no debe exponerse por get_public_profile.';
COMMENT ON COLUMN public.profiles.birth_time IS
  'Hora local privada opcional; interpretar junto con birth_timezone.';
COMMENT ON COLUMN public.profiles.birth_timezone IS
  'Identificador IANA privado opcional, por ejemplo America/Bogota.';
COMMENT ON COLUMN public.profiles.birth_place_label IS
  'Etiqueta de lugar proporcionada por el usuario; no es geocodificación automática.';
COMMENT ON COLUMN public.profiles.birth_latitude IS
  'Latitud privada opcional del lugar de nacimiento o referencia.';
COMMENT ON COLUMN public.profiles.birth_longitude IS
  'Longitud privada opcional del lugar de nacimiento o referencia.';

-- Verificación manual antes de activar persistencia desde la aplicación:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'profiles'
--   AND column_name IN ('birth_date', 'birth_time', 'birth_timezone', 'birth_place_label', 'birth_latitude', 'birth_longitude');
-- Confirmar que get_public_profile(TEXT) continúa omitiendo todos estos campos.
