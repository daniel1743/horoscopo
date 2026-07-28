
-- ============================================================
-- YAML 09: Auth & Mi espacio
-- ============================================================

-- ---------- profiles ----------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  preferred_sign TEXT,
  city TEXT,
  birth_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles public read" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "profiles owner insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles owner update" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles owner delete" ON public.profiles
  FOR DELETE TO authenticated USING (auth.uid() = id);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- user_privacy_settings ----------
CREATE TABLE IF NOT EXISTS public.user_privacy_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_tracking_enabled BOOLEAN NOT NULL DEFAULT true,
  save_readings_allowed BOOLEAN NOT NULL DEFAULT true,
  ai_personalization_enabled BOOLEAN NOT NULL DEFAULT true,
  newsletter_opt_in BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_privacy_settings TO authenticated;
GRANT ALL ON public.user_privacy_settings TO service_role;
ALTER TABLE public.user_privacy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "privacy owner select" ON public.user_privacy_settings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "privacy owner insert" ON public.user_privacy_settings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "privacy owner update" ON public.user_privacy_settings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "privacy owner delete" ON public.user_privacy_settings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER privacy_set_updated_at
  BEFORE UPDATE ON public.user_privacy_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- user_favorites ----------
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('article','tarot_card','zodiac_sign','guide','horoscope')),
  item_ref TEXT NOT NULL,
  item_title TEXT,
  item_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_ref)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_favorites TO authenticated;
GRANT ALL ON public.user_favorites TO service_role;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites owner all" ON public.user_favorites
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS user_favorites_user_idx ON public.user_favorites(user_id, created_at DESC);

-- ---------- saved_tarot_readings ----------
CREATE TABLE IF NOT EXISTS public.saved_tarot_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spread_type TEXT NOT NULL CHECK (spread_type IN ('daily','yes_no','three_cards')),
  cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  interpretation TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_tarot_readings TO authenticated;
GRANT ALL ON public.saved_tarot_readings TO service_role;
ALTER TABLE public.saved_tarot_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved readings owner all" ON public.saved_tarot_readings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS saved_readings_user_idx ON public.saved_tarot_readings(user_id, created_at DESC);

-- ---------- user_activity_history ----------
CREATE TABLE IF NOT EXISTS public.user_activity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'view_horoscope','view_tarot_card','view_article','view_guide',
    'tarot_reading','favorite_added','favorite_removed','reading_saved','profile_updated'
  )),
  ref_type TEXT,
  ref_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.user_activity_history TO authenticated;
GRANT ALL ON public.user_activity_history TO service_role;
ALTER TABLE public.user_activity_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity owner select" ON public.user_activity_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "activity owner insert" ON public.user_activity_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "activity owner delete" ON public.user_activity_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS activity_user_idx ON public.user_activity_history(user_id, created_at DESC);

-- ---------- Trigger: create profile + privacy on signup ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_privacy_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
