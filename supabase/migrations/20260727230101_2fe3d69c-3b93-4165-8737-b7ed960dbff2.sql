
CREATE TYPE public.horoscope_period AS ENUM ('daily', 'weekly', 'monthly');

CREATE TABLE public.horoscopes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sign_slug TEXT NOT NULL,
  period public.horoscope_period NOT NULL,
  date_for DATE NOT NULL,
  summary TEXT NOT NULL,
  focus TEXT NOT NULL,
  mood TEXT NOT NULL,
  energy SMALLINT NOT NULL DEFAULT 3 CHECK (energy BETWEEN 1 AND 5),
  love TEXT,
  work TEXT,
  wellbeing TEXT,
  lucky_number SMALLINT,
  lucky_color TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT horoscopes_sign_period_date_unique UNIQUE (sign_slug, period, date_for)
);

CREATE INDEX horoscopes_sign_period_date_idx
  ON public.horoscopes (sign_slug, period, date_for DESC);
CREATE INDEX horoscopes_period_date_idx
  ON public.horoscopes (period, date_for DESC);
CREATE INDEX horoscopes_published_at_idx
  ON public.horoscopes (published_at DESC);

GRANT SELECT ON public.horoscopes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.horoscopes TO authenticated;
GRANT ALL ON public.horoscopes TO service_role;

ALTER TABLE public.horoscopes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "horoscopes public read published"
  ON public.horoscopes
  FOR SELECT
  TO anon, authenticated
  USING (published_at IS NOT NULL AND published_at <= now());

CREATE POLICY "horoscopes editors read all"
  ON public.horoscopes
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "horoscopes editors write"
  ON public.horoscopes
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'editor'::app_role));

CREATE TRIGGER set_horoscopes_updated_at
  BEFORE UPDATE ON public.horoscopes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
