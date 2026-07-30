-- Amplia el perfil existente para datos natales sin crear tablas duplicadas.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_time time,
  ADD COLUMN IF NOT EXISTS birth_time_status text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS birth_place_label text,
  ADD COLUMN IF NOT EXISTS birth_city text,
  ADD COLUMN IF NOT EXISTS birth_region text,
  ADD COLUMN IF NOT EXISTS birth_country text,
  ADD COLUMN IF NOT EXISTS birth_country_code text,
  ADD COLUMN IF NOT EXISTS birth_timezone text,
  ADD COLUMN IF NOT EXISTS birth_latitude double precision,
  ADD COLUMN IF NOT EXISTS birth_longitude double precision,
  ADD COLUMN IF NOT EXISTS profile_completed_at timestamptz;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_birth_time_status_check,
  ADD CONSTRAINT profiles_birth_time_status_check
    CHECK (birth_time_status IN ('exact', 'approximate', 'unknown'));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_birth_time_known_check,
  ADD CONSTRAINT profiles_birth_time_known_check
    CHECK (
      (birth_time_status = 'unknown' AND birth_time IS NULL)
      OR (birth_time_status IN ('exact', 'approximate') AND birth_time IS NOT NULL)
    );

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_birth_date_range_check,
  ADD CONSTRAINT profiles_birth_date_range_check
    CHECK (birth_date IS NULL OR (birth_date >= DATE '1900-01-01' AND birth_date <= CURRENT_DATE));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_birth_latitude_check,
  ADD CONSTRAINT profiles_birth_latitude_check
    CHECK (birth_latitude IS NULL OR (birth_latitude >= -90 AND birth_latitude <= 90));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_birth_longitude_check,
  ADD CONSTRAINT profiles_birth_longitude_check
    CHECK (birth_longitude IS NULL OR (birth_longitude >= -180 AND birth_longitude <= 180));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_birth_country_code_check,
  ADD CONSTRAINT profiles_birth_country_code_check
    CHECK (birth_country_code IS NULL OR birth_country_code ~ '^[A-Z]{2}$');

CREATE INDEX IF NOT EXISTS profiles_completed_idx
  ON public.profiles (id, profile_completed_at)
  WHERE profile_completed_at IS NOT NULL;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles public read" ON public.profiles;
DROP POLICY IF EXISTS "profiles owner read" ON public.profiles;
DROP POLICY IF EXISTS "profiles owner insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles owner update" ON public.profiles;
DROP POLICY IF EXISTS "profiles owner delete" ON public.profiles;

CREATE POLICY "profiles owner read"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles owner insert"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles owner update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'display_name', ''),
      NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
      NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
      split_part(NEW.email, '@', 1)
    ),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
    SET display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
        updated_at = now();

  INSERT INTO public.user_privacy_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN others THEN
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role, supabase_auth_admin;
