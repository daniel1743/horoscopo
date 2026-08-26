-- Fase 12: identidad esotérica y perfiles públicos opt-in.
-- La visibilidad es privada por defecto; la exposición pública pasa por una función
-- que devuelve únicamente campos no sensibles.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS aura_style TEXT NOT NULL DEFAULT 'lunar-violet',
  ADD COLUMN IF NOT EXISTS profile_visibility TEXT NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS show_preferred_sign BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_city BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_format'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_username_format
      CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,24}$');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_aura_style_valid'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_aura_style_valid
      CHECK (aura_style IN ('lunar-violet', 'solar-gold', 'forest-emerald', 'cosmic-blue'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_visibility_valid'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_visibility_valid
      CHECK (profile_visibility IN ('private', 'public'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_idx
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

-- La tabla de perfiles deja de estar abierta a SELECT directo. Las pantallas
-- autenticadas siguen leyendo el perfil propio; los perfiles públicos pasan por
-- get_public_profile(), que omite fecha de nacimiento y preferencias privadas.
DROP POLICY IF EXISTS "profiles public read" ON public.profiles;
CREATE POLICY "profiles owner select" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.get_public_profile(p_username TEXT)
RETURNS TABLE (
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  preferred_sign TEXT,
  city TEXT,
  aura_style TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.username,
    p.display_name,
    p.avatar_url,
    p.bio,
    CASE WHEN p.show_preferred_sign THEN p.preferred_sign ELSE NULL END,
    CASE WHEN p.show_city THEN p.city ELSE NULL END,
    p.aura_style
  FROM public.profiles AS p
  WHERE p.profile_visibility = 'public'
    AND p.username IS NOT NULL
    AND lower(p.username) = lower(trim(p_username))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_profile(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_profile(TEXT) TO anon, authenticated;
