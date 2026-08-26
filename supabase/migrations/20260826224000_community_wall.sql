-- Fase 13: muro público de publicaciones y controles básicos de moderación.
-- Las publicaciones son privadas en la base hasta que el usuario elige publicarlas.

CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL CHECK (post_type IN ('reflection','horoscope','moon','tarot','compatibility','birth_chart','other')),
  title TEXT,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  source_ref TEXT,
  source_title TEXT,
  source_url TEXT CHECK (source_url IS NULL OR source_url LIKE '/%'),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','public')),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','hidden','deleted','pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_posts_feed_idx
  ON public.community_posts (status, visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS community_posts_user_idx
  ON public.community_posts (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT ALL ON public.community_posts TO service_role;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community posts owner select" ON public.community_posts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "community posts owner insert" ON public.community_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community posts owner update" ON public.community_posts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community posts owner delete" ON public.community_posts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER community_posts_set_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.list_public_community_posts(p_limit INTEGER DEFAULT 30)
RETURNS TABLE (
  id UUID,
  post_type TEXT,
  title TEXT,
  body TEXT,
  source_ref TEXT,
  source_title TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ,
  author_username TEXT,
  author_display_name TEXT,
  author_avatar_url TEXT,
  author_aura_style TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    post.id,
    post.post_type,
    post.title,
    post.body,
    post.source_ref,
    post.source_title,
    post.source_url,
    post.created_at,
    profile.username,
    profile.display_name,
    profile.avatar_url,
    profile.aura_style
  FROM public.community_posts AS post
  INNER JOIN public.profiles AS profile ON profile.id = post.user_id
  WHERE post.visibility = 'public'
    AND post.status = 'published'
    AND profile.profile_visibility = 'public'
    AND profile.username IS NOT NULL
  ORDER BY post.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 30), 1), 50);
$$;

REVOKE ALL ON FUNCTION public.list_public_community_posts(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_public_community_posts(INTEGER) TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.community_post_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam','harassment','sensitive','misleading','other')),
  details TEXT CHECK (details IS NULL OR char_length(details) <= 500),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, reporter_id)
);

GRANT INSERT, SELECT ON public.community_post_reports TO authenticated;
GRANT ALL ON public.community_post_reports TO service_role;
ALTER TABLE public.community_post_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community reports own insert" ON public.community_post_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "community reports own select" ON public.community_post_reports
  FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
