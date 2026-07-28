-- Zodiac sign position helper (canonical order)
CREATE OR REPLACE FUNCTION public.zodiac_sign_position(sign text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE sign
    WHEN 'aries' THEN 1
    WHEN 'tauro' THEN 2
    WHEN 'geminis' THEN 3
    WHEN 'cancer' THEN 4
    WHEN 'leo' THEN 5
    WHEN 'virgo' THEN 6
    WHEN 'libra' THEN 7
    WHEN 'escorpio' THEN 8
    WHEN 'sagitario' THEN 9
    WHEN 'capricornio' THEN 10
    WHEN 'acuario' THEN 11
    WHEN 'piscis' THEN 12
    ELSE NULL
  END;
$$;

CREATE TABLE public.compatibility_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_key text NOT NULL UNIQUE,
  sign_a text NOT NULL,
  sign_b text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  dynamic_label text,
  relationship_dynamic text NOT NULL,
  dimensions jsonb NOT NULL DEFAULT '{}'::jsonb,
  strengths jsonb NOT NULL DEFAULT '[]'::jsonb,
  challenges jsonb NOT NULL DEFAULT '[]'::jsonb,
  communication_tips jsonb NOT NULL DEFAULT '[]'::jsonb,
  contexts jsonb NOT NULL DEFAULT '{}'::jsonb,
  reflection_questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  misconceptions jsonb NOT NULL DEFAULT '[]'::jsonb,
  disclaimer_key text NOT NULL DEFAULT 'compatibility',
  author_id uuid REFERENCES public.editorial_authors(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',
  is_demo boolean NOT NULL DEFAULT false,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT compatibility_profiles_sign_a_valid CHECK (
    sign_a IN ('aries','tauro','geminis','cancer','leo','virgo','libra','escorpio','sagitario','capricornio','acuario','piscis')
  ),
  CONSTRAINT compatibility_profiles_sign_b_valid CHECK (
    sign_b IN ('aries','tauro','geminis','cancer','leo','virgo','libra','escorpio','sagitario','capricornio','acuario','piscis')
  ),
  CONSTRAINT compatibility_profiles_status_valid CHECK (status IN ('draft','published','archived')),
  CONSTRAINT compatibility_profiles_canonical_order CHECK (
    public.zodiac_sign_position(sign_a) <= public.zodiac_sign_position(sign_b)
  ),
  CONSTRAINT compatibility_profiles_pair_key_shape CHECK (
    pair_key = sign_a || '__' || sign_b
  ),
  CONSTRAINT compatibility_profiles_published_requires_date CHECK (
    status <> 'published' OR published_at IS NOT NULL
  )
);

CREATE INDEX compatibility_profiles_pair_key_idx ON public.compatibility_profiles (pair_key);
CREATE INDEX compatibility_profiles_sign_a_idx ON public.compatibility_profiles (sign_a, status);
CREATE INDEX compatibility_profiles_sign_b_idx ON public.compatibility_profiles (sign_b, status);
CREATE INDEX compatibility_profiles_published_idx ON public.compatibility_profiles (status, published_at DESC);

GRANT SELECT ON public.compatibility_profiles TO anon;
GRANT SELECT ON public.compatibility_profiles TO authenticated;
GRANT ALL ON public.compatibility_profiles TO service_role;

ALTER TABLE public.compatibility_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published compatibility profiles"
  ON public.compatibility_profiles
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'
    AND published_at IS NOT NULL
    AND published_at <= now()
  );

CREATE TRIGGER compatibility_profiles_set_updated_at
  BEFORE UPDATE ON public.compatibility_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();